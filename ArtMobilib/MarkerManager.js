// todo license???

// Marker manager is the main interface for Artmobilib
// it process the image to (1) recognise markers (and (2) track it ---to be done if necessary)
// it ensures imape processing time
// it produces marker output for ArtMobilis application: 2D Homography or 3D pose of detected pattern
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
    this.status = new MarkerStatus(); // needed??

    // corer in screen: we will limit to 100 strongest points
    this.max_corner = 100;
    this.num_corners;

    // JSfeat Orb detection+matching part
    this.img_u8        = new jsfeat.matrix_t(that.imWidth, that.imHeight, jsfeat.U8_t | jsfeat.C1_t);
    var  img_u8_smooth = new jsfeat.matrix_t(that.imWidth, that.imHeight, jsfeat.U8_t | jsfeat.C1_t);
    this.screen_descriptors = new jsfeat.matrix_t(32, that.max_corner, jsfeat.U8_t | jsfeat.C1_t);

    /// public methods
    // extract corners ad descriptors and add it to the container
    this.AddMarker = function (image) {
        var marker = new ImageMaker(image);
        markers.add(marker);
    }

    // process a color Html image
    this.ProcessHtmlImage = function (htmlImage) {
        jsfeat.imgproc.grayscale(HtmlImage.data, that.imWidth, that.imHeight, that.img_u8);
    }

    // process a jsfeat gray image
    this.ProcessGrayImage = function (image) {
        that.img_u8 = image;
        that.Process();
    }

    this.Process = function () {
        // depending on status search for a specific or a marker
        jsfeat.imgproc.gaussian_blur(that.img_u8, that.img_u8_smooth, options.blur_size | 0);

        jsfeat.yape06.laplacian_threshold = options.lap_thres | 0;
        jsfeat.yape06.min_eigen_value_threshold = options.eigen_thres | 0;

        stat.start("orb descriptors");
        that.num_corners = detect_keypoints(that.img_u8_smooth, that.screen_corners, this.max_corner);

        jsfeat.orb.describe(that.img_u8_smooth, that.screen_corners, that.num_corners, that.screen_descriptors);
        stat.stop("orb descriptors");

        // search the same marker while it is detected or one different at each image
        stat.start("matching");
        if (that.found > 0) { // if one has already been detected
            if (matching(that.screen_descriptors, markers.GetCurrent()))
                that.found = that.nbFocussingMarker;
            else
                that.found--;
        }
        else { // no detection before, search for new marker
            if (matching(screen_descriptors, markers.GetNext()))
                that.found = that.nbFocussingMarker;
            else
                that.found--;
        }


        stat.stop("matching");
    }

    this.reset = function () {
        that.markerContainer = [];
        currentId = -1;
    }
};


