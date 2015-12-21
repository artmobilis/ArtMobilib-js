// todo license???

/******************

Marker manager is the main interface for Artmobilib
Add patterns to be detected, then call ProcessVideo() to capture current live image for detection
The logic to select marker is inside: one different for each image, then loop on the last if detected
(to be done) 2D Homography or 3D pose of detected pattern is computed


Properties

imWidth,imHeight: internal pipeline processing size

allocation_corner : number of corners detected in the full image (should be large)
max_corner : number of selected corners

Methods

ProcessVideo : Capture and search for markers
ProcessGrayImage : search for markers in the gray image

Todo
- class design
- 2D Homography or 3D pose of detected pattern is computed
- freezing every 5s in firefox: I suspect garbage collector because bad memory management
- todo acceleration: after recogition, use a fast corner tracking/registration or Gyro+Gps

// acceleration done : Brut force matching so reduce number of corners (500 -> 150 in live and 100/level wit 3 levels in training), can maybe be more reduced
// detection improvement by reducing nb good corners for acceptance from 20 to 10

Dependency

MarkerContainer.js
MarkerMatcher.js
CornerDetector.js

******************/

var stat;

InitProfiler = function () {
    stat = new profiler();
    stat.add("grayscale");
    stat.add("gauss blur");
    stat.add("keypoints");
    stat.add("orb descriptors");
    stat.add("matching");
    stat.add("match_pattern");
    stat.add("find_transform");
    stat.add("Posit");
    stat.add("update");
}

InitProfiler();


var MarkerManager = function (video, canvas2d) {

    var that = this;

    // internal pipeline size
    this.imWidth = 640;
    this.imHeight = 480;

    // detection output
    this.found = 0;
    this.nbFocussingMarker = 10;

    this.markers = new MarkerContainer();
    this.matcher = new MarkerMatcher();
    this.cornerdetector = new CornerDetector();
    this.webcamconv;

    // corner in screen: we will limit to 150 strongest points
    this.max_corner = 150;
    this.allocation_corner = 2000; // we need to allocate a sufficient number of corners to cover corners of the full image
    this.screen_corners = [];
    this.num_corners;

    // JSfeat Orb detection+matching alloc
    var img_u8 = new jsfeat.matrix_t(that.imWidth, that.imHeight, jsfeat.U8_t | jsfeat.C1_t);
    var img_u8_smooth = new jsfeat.matrix_t(that.imWidth, that.imHeight, jsfeat.U8_t | jsfeat.C1_t);
    this.screen_descriptors = new jsfeat.matrix_t(32, that.max_corner, jsfeat.U8_t | jsfeat.C1_t);

    // live displayed corners
    var i = this.allocation_corner;
    while (--i >= 0)
        this.screen_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);

    /// public methods
    this.AttachVideo = function (video, canvas) {
        that.webcamconv = new WebcamConverter(video, canvas);
    }

    // extract corners ad descriptors and add it to the container
    this.AddMarker = function (image) {
        var marker = new ImageMarkers(image);
        that.markers.Add(marker);
    }

    // process a color Html image
    this.ProcessHtmlImage = function (htmlImage) {
        jsfeat.imgproc.grayscale(HtmlImage.data, that.imWidth, that.imHeight, img_u8);
        return that.Process();
    }

    // process a color Html image
    this.ProcessVideo = function () {
        var image = that.webcamconv.GetNewImage();
        if (image) {
            jsfeat.imgproc.grayscale(image.data, that.imWidth, that.imHeight, img_u8);
            return that.Process();
        }
        return that.found > 0;
    }

    // process a jsfeat gray image
    this.ProcessGrayImage = function (image) {
        img_u8 = image;
        return that.Process();
    }

    this.Process = function () {
        // depending on status search for a specific or a marker
        that.num_corners = that.cornerdetector.DetectCorners(img_u8, that.screen_corners, that.screen_descriptors);
        //console.log("Screen: " + img_u8.cols + "x" + img_u8.rows + " points: " + that.num_corners);

        if (!that.markers.markerContainer.length || !that.num_corners) return 0;

        // search the same marker while it is detected or one different at each image
        stat.start("matching");
        if (that.found > 0) { // if one has already been detected
            if (that.matcher.matching(that.screen_corners, that.screen_descriptors, that.markers.GetCurrent()))
                that.found = that.nbFocussingMarker;
            else
                that.found--;
        }
        else { // no detection before, search for new marker
            if (that.matcher.matching(that.screen_corners, that.screen_descriptors, that.markers.GetNext()))
                that.found = that.nbFocussingMarker;
            else
                that.found--;
        }

        stat.stop("matching");
        return that.found > 0; // or that.found == that.nbFocussingMarker for instantaneous detection
    }

    this.reset = function () {
        that.markerContainer = [];
        currentId = -1;
    }

    that.AttachVideo(video, canvas2d);
};

