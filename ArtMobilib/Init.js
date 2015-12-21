
/////////////////////
// global data
/////////////////////

// size of internal pipeline processing
ArtMobilib.imWidth = 640;
ArtMobilib.imHeight = 480;
ArtMobilib.debugging = false;

// DOM elements
ArtMobilib.posit;

ArtMobilib.cdetector = new CornerDetector();

// point match structure
ArtMobilib.match_t = (function () {
    function match_t(screen_idx, pattern_lev, pattern_idx, distance) {
        if (typeof screen_idx === "undefined") {
            screen_idx = 0;
        }
        if (typeof pattern_lev === "undefined") {
            pattern_lev = 0;
        }
        if (typeof pattern_idx === "undefined") {
            pattern_idx = 0;
        }
        if (typeof distance === "undefined") {
            distance = 0;
        }

        this.screen_idx = screen_idx;
        this.pattern_lev = pattern_lev;
        this.pattern_idx = pattern_idx;
        this.distance = distance;
    }

    return match_t;
})();

// list of learned images
var pattern_corners, pattern_descriptors, pattern_preview;
var match_mask, matches, num_matches, homo3x3;
var nb_trained = 0, current_pattern = -1;

// global parameters
var num_train_levels = 3;
var maxCorners = 2000, maxMatches = 2000;



// todo put those global data in objects
// JSfeat
var options, ctx;
var img_u8_smooth, screen_corners, num_corners, screen_descriptors;

// ARuco
var scene1, scene2;
var camera1, camera2;
var plane, model, model1, model2, model3, model4, texture;
var step = 0.0;
var modelSize = 35; //millimeters

// shared data
var shape_pts;


var demo_opt = function () {
    this.blur_size = 5;        // 3 to 9
    this.lap_thres = 30;       // 1 to 100
    this.eigen_thres = 25;     // 1 to 100
    this.match_threshold = 48; // 16 to 128
}


ArtMobilib.initArtMobilib = function (video, canvas2d, canvas3d, debug) {
    InitProfiler();
    this.debugging = debug;
    this.video = document.getElementById(video);
    this.canvas2d = document.getElementById(canvas2d);
    this.canvas3d = document.getElementById(canvas3d);

    //pb canvas is 300*150 by default
    // here we will need to make something clever to resize canvas so that
    // 1. it fulfill screen
    // 2. it keeps capture proportion
    // certainly: rescale to fit border and center in other coord
    this.canvas2d.width = this.canvas3d.width = window.innerWidth;
    this.canvas2d.height = this.canvas3d.height = window.innerHeight;
    if (this.debugging) {
        this.canvas2d.width = this.canvas3d.width = this.imWidth;
        this.canvas2d.height = this.canvas3d.height = this.imHeight;
    }

    ctx = this.canvas2d.getContext('2d');

    ctx.fillStyle = "rgb(0,255,0)";
    ctx.strokeStyle = "rgb(0,255,0)";

    // JSfeat Orb detection+matching part
    img_u8 = new jsfeat.matrix_t(this.imWidth, this.imHeight, jsfeat.U8_t | jsfeat.C1_t);
    img_u8_smooth = new jsfeat.matrix_t(this.imWidth, this.imHeight, jsfeat.U8_t | jsfeat.C1_t);            // after blur

    // we will limit to 500 strongest points
    screen_descriptors = new jsfeat.matrix_t(32, 500, jsfeat.U8_t | jsfeat.C1_t);

    // recorded detection results for each pattern
    pattern_descriptors = [];
    pattern_preview = [];
    screen_corners = [];
    pattern_corners = [];
    matches = [];
    num_matches = [];

    // transform matrix
    homo3x3 = [];
    match_mask = [];

    // live displayed corners
    var i = maxCorners; // 2000 corners maximum
    while (--i >= 0)
        screen_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);

    // Aruco part
    this.posit = new POS.Posit(modelSize, this.canvas2d.width);

    // threejs renderers
    this.createRenderers();

    options = new demo_opt();
}


/////////////////////
// video live Processing
/////////////////////
var hiddenCanvas = document.createElement('canvas');
ArtMobilib.getVideoData = function getVideoData(x, y, w, h) {
    hiddenCanvas.width = video.videoWidth;
    hiddenCanvas.height = video.videoHeight;
    var hctx = hiddenCanvas.getContext('2d');
    hctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    var videoData = hctx.getImageData(x, y, w, h);
    ctx.putImageData(videoData, 0, 0);
    return ctx.getImageData(0, 0, this.imWidth, this.imHeight);
};

// put ImgData in a hidden canvas to then write it with resizing on canvas
ArtMobilib.resizeImDataonCanvas = function (imgData) {
    hiddenCanvas.width = this.imWidth;
    hiddenCanvas.height = this.imHeight;
    var hctx = hiddenCanvas.getContext('2d');
    var cctx = this.canvas2d.getContext('2d');
    hctx.putImageData(imgData, 0, 0);
    cctx.drawImage(hiddenCanvas, 0, 0, this.canvas2d.width, this.canvas2d.height);
};

ArtMobilib.tick = function () {
    stat.new_frame();

    if (this.video) {
        if (this.video.videoWidth > 0) {
            var imageData = ArtMobilib.getVideoData(0, 0, this.imWidth, this.imHeight);

            stat.start("grayscale");
            jsfeat.imgproc.grayscale(imageData.data, this.imWidth, this.imHeight, img_u8);
            stat.stop("grayscale");

            stat.start("gauss blur");
            jsfeat.imgproc.gaussian_blur(img_u8, img_u8_smooth, options.blur_size | 0);
            stat.stop("gauss blur");

            jsfeat.yape06.laplacian_threshold = options.lap_thres | 0;
            jsfeat.yape06.min_eigen_value_threshold = options.eigen_thres | 0;

            stat.start("keypoints");
            num_corners = detect_keypoints(img_u8_smooth, screen_corners, 150);
            stat.stop("keypoints");

            stat.start("orb descriptors");
            jsfeat.orb.describe(img_u8_smooth, screen_corners, num_corners, screen_descriptors);
            stat.stop("orb descriptors");

            console.log("AMScreen: " + img_u8_smooth.cols + "x" + img_u8_smooth.rows + " points: " + num_corners);

            // render result in ImageData
            var data_u32 = new Uint32Array(imageData.data.buffer);
            render_corners(screen_corners, num_corners, data_u32, this.imWidth);

            // render pattern and matches
            stat.start("matching");
            var found = matching();
            stat.stop("matching");

            // display last detected pattern
            if (pattern_preview[current_pattern]) {
                render_mono_image(pattern_preview[current_pattern].data, data_u32, pattern_preview[current_pattern].cols, pattern_preview[current_pattern].rows, this.imWidth);
            }

            // render result back to canvas
            this.resizeImDataonCanvas(imageData);

            // display matching result and 3d when detection
            if (num_matches[current_pattern]) { // last detected
                render_matches(ctx, matches[current_pattern], num_matches[current_pattern]);
                if (found) {
                    render_pattern_shape(ctx);
                    updateScenes(shape_pts);
                    this.render();
                }
                else
                    this.renderer3d.clear();
            }

            timeproc.innerHTML = stat.log();
        }
    }
}

