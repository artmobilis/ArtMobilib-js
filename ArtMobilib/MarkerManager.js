// todo license???

// Marker manager is the main interface for Artmobilib
// it process the image to (1) recognise markers (and (2) track it ---to be done if necessary)
// it ensures imape processing time
// it produces marker output for ArtMobilis application: 2D Homography or 3D pose of detected pattern

// todo use CornerDetector
// simplify and use c++ naming convention


var MarkerManager = function () {

    /// private data
    var that = this;

    /// public data
    // intern pipeline size
    this.imWidth = 640;
    this.imHeight = 480;

    // output
    this.found = 0;
    this.nbFocussingMarker = 10;

    // private or public? what is needed for display (matches, corners) and for application
    this.markers = new MarkerContainer();
    this.matcher = new MarkerMatcher();
    this.webcamconv;

    // corner in screen: we will limit to 150 strongest points
    this.max_corner = 150;
    this.allocation_corner = 2000; // we eed to allocate a large mber to detect corners in the full image
    this.screen_corners = [];
    this.num_corners;

    // some parameters
    this.blur_size = 5;        // 3 to 9
    this.lap_thres = 30;       // 1 to 100
    this.eigen_thres = 25;     // 1 to 100

    // JSfeat Orb detection+matching part
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
        var image = that.webcamconv.getNewImage();
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
        jsfeat.imgproc.gaussian_blur(img_u8, img_u8_smooth, that.blur_size);

        jsfeat.yape06.laplacian_threshold = that.lap_thres ;
        jsfeat.yape06.min_eigen_value_threshold = that.eigen_thres;

        stat.start("orb descriptors");
        that.num_corners = detect_keypoints(img_u8_smooth, that.screen_corners, that.max_corner);

        jsfeat.orb.describe(img_u8_smooth, that.screen_corners, that.num_corners, that.screen_descriptors);
        stat.stop("orb descriptors");

        //console.log("Screen: " + img_u8_smooth.cols + "x" + img_u8_smooth.rows + " points: " + that.num_corners);

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
        return that.found>0;
    }

    this.reset = function () {
        that.markerContainer = [];
        currentId = -1;
    }
};


AMmarkerManager = new MarkerManager();
