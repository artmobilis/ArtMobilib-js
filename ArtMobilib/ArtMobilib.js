
function include(fileName){
    document.write("<script type='text/javascript' src='"+fileName+"'></script>" );
}


// jsfeat
include('ArtMobilib/jsfeat/jsfeat.js');
include('ArtMobilib/jsfeat/compatibility.js');
include('ArtMobilib/jsfeat/profiler.js');

// aruco
include('ArtMobilib/aruco/cv.js');
include('ArtMobilib/aruco/aruco.js');
include('ArtMobilib/aruco/svd.js');
include('ArtMobilib/aruco/posit1.js');

// Three
include('ArtMobilib/three/three72.js');

// ArtMobilib
include('ArtMobilib/Loading.js');
include('ArtMobilib/Corners.js');
include('ArtMobilib/3DPose.js');
include('ArtMobilib/Display.js');


/////////////////////
// global data
/////////////////////

// point match structure
var match_t = (function () {
    function match_t(screen_idx, pattern_lev, pattern_idx, distance) {
        if (typeof screen_idx === "undefined") { screen_idx = 0; }
        if (typeof pattern_lev === "undefined") { pattern_lev = 0; }
        if (typeof pattern_idx === "undefined") { pattern_idx = 0; }
        if (typeof distance === "undefined") { distance = 0; }

        this.screen_idx = screen_idx;
        this.pattern_lev = pattern_lev;
        this.pattern_idx = pattern_idx;
        this.distance = distance;
    }
    return match_t;
})();

// JSfeat
var gui, options, ctx;
var img_u8_smooth, screen_corners, num_corners, screen_descriptors;
var pattern_corners, pattern_descriptors, pattern_preview;
var matches, homo3x3, match_mask;
var num_train_levels = 4;
var maxCorners = 2000, maxMatches = 2000;
var nb_trained = 0, current_pattern = -1;

// ARuco
var posit;
var renderer3d;
var scene1, scene2;
var camera1, camera2;
var plane, model1, model2, model3, texture;
var step = 0.0;
var modelSize = 35.0; //millimeters

// shared data
var shape_pts;

var stat;

var demo_opt = function () {
    this.blur_size = 5;        // 3 to 9
    this.lap_thres = 30;       // 1 to 100
    this.eigen_thres = 25;     // 1 to 100
    this.match_threshold = 48; // 16 to 128
}

function initArtMobilib() {
    stat = new profiler();
    initVideo(); // a test to load video

}