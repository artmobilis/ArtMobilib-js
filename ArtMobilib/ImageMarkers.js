// todo license???
// acceleration done : Brut force matcig so redce mber of corners (500 -> 150 in live ad 100/level wit 3 levels in training), can maybe be more reduced
// detection improvement by reducing nb good corers for acceptance from 20 to 10
// todo acceleration: use one marker to search par image to keep good frame rate
// todo acceleration: after recogition, use a fast corner tracking/registration or Gyro+Gps
// todo improve detection: I suspect it is because using most dominant angle, we should use 2 bests with diff more than 30°
// todo freezing every 5s: I suspect garbage collector because bad memory management


// Multilevel Image marker
var ImageMarkers = function (image) {

    /// private data
    var that = this;
    var _max_pattern_size = 512;
    var _max_per_level = 150;
    var _num_train_levels = 3;

    // image size resizing (image size should be over 512 in one dimension and below 1280*20)
    var _resizing_canvas = document.createElement('canvas');
    //var _resizing_canvas = document.getElementById('container'); // for debugging
    _resizing_canvas.width = 1280;
    _resizing_canvas.height = 1280;
    var _ctx = _resizing_canvas.getContext('2d');
    var _internalMaxWidth = 1280;
    var _internalMinWidth = 512;
    var _sx, _sy;
    var _gray; // gray intermediate image

    /// public data
    this.blur_size = 5;        // 3 to 9
    this.lap_thres = 30;       // 1 to 100
    this.eigen_thres = 25;     // 1 to 100

    /// public data
    // descriptors (should we keep level separated?)
    this.pattern_corners = [];
    this.pattern_descriptors = [];
    this.corners_num = 0;

    this.name = image;
    this.pattern_preview;


    /// private methods
    function DetectKeypoints(img, corners, max_allowed) {
        // detect features
        var count = jsfeat.yape06.detect(img, corners, 17);

        // sort by score and reduce the count if needed
        if (count > max_allowed) {
            jsfeat.math.qsort(corners, 0, count - 1, function (a, b) { return (b.score < a.score); });
            count = max_allowed;
        }

        // calculate dominant orientation for each keypoint
        for (var i = 0; i < count; ++i) {
            corners[i].angle = IC_Angle(img, corners[i].x, corners[i].y);
        }

        return count;
    }

    // central difference using image moments to find dominant orientation
    var u_max = new Int32Array([15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0]);
    function IC_Angle(img, px, py) {
        var half_k = 15; // half patch size
        var m_01 = 0, m_10 = 0;
        var src = img.data, step = img.cols;
        var u = 0, v = 0, center_off = (py * step + px) | 0;
        var v_sum = 0, d = 0, val_plus = 0, val_minus = 0;

        // Treat the center line differently, v=0
        for (u = -half_k; u <= half_k; ++u)
            m_10 += u * src[center_off + u];

        // Go line by line in the circular patch
        for (v = 1; v <= half_k; ++v) {
            // Proceed over the two lines
            v_sum = 0;
            d = u_max[v];
            for (u = -d; u <= d; ++u) {
                val_plus = src[center_off + u + v * step];
                val_minus = src[center_off + u - v * step];
                v_sum += (val_plus - val_minus);
                m_10 += u * (val_plus + val_minus);
            }
            m_01 += v * v_sum;
        }

        return Math.atan2(m_01, m_10);
    }



    this.ComputeImageSize = function (img) {
        var x_is_dominant = img.width > img.height; // landscape/portrait
        var ratio = img.width / img.height;
        var need_resize_up = false;
        var need_resize_down = false;
        _sx = img.width;
        _sy = img.height;

        if (x_is_dominant) {
            need_resize_up = img.width < _internalMaxWidth;
            need_resize_down = img.width > _internalMinWidth;
        }
        else {
            need_resize_up = img.height < _internalMinWidth;
            need_resize_down = img.height > _internalMaxWidth;
        }

        if (need_resize_up) {
            if (x_is_dominant) {
                _sx = _internalMinWidth;
                _sy = Math.round(_internalMinWidth / ratio);
            }
            else {
                _sx = Math.round(_internalMinWidth * ratio);
                _sy = _internalMinWidth;
            }
        }

        if (need_resize_down) {
            if (x_is_dominant) {
                _sx = _internalMaxWidth;
                _sy = Math.round(_internalMaxWidth / ratio);
            }
            else {
                _sx = Math.round(_internalMaxWidth * ratio);
                _sy = _internalMaxWidth;
            }
        }

        // allocate gray image
        _gray = new jsfeat.matrix_t(_sx, _sy, jsfeat.U8_t | jsfeat.C1_t);
    }

    this.ResizeImage = function (img) {

        _ctx.drawImage(img, 0, 0, _sx, _sy);
        return _ctx.getImageData(0, 0, _sx, _sy);
    }

    IMload_image = function (name) {
        var img = new Image();
        img.onload = function () {
            console.debug("load " + that.name);
            that.ComputeImageSize(img);
            var imageData = that.ResizeImage(img);
            jsfeat.imgproc.grayscale(imageData.data, _sx, _sy, _gray);
            that.IMtrainpattern(_gray); // le pattern doit etre plus grand que 512*512 dans au moins une dimension (sinon pas de rescale et rien ne se passe)
        }
        img.src = name;
    };


    /////////////////////
    // Pattern Training
    /////////////////////

    // train a pattern: extract corners multiscale, compute descriptor, store result
    this.IMtrainpattern = function (img) {
        var lev = 0, i = 0;
        var sc = 1.0;
        var sc_inc = Math.sqrt(2.0); // magic number ;)
        var lev0_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
        var lev_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
        var new_width = 0, new_height = 0;
        var lev_corners, lev_descr;
        //var corners_num = 0;

        console.debug("Train " + that.name);

        var sc0 = Math.min(_max_pattern_size / img.cols, _max_pattern_size / img.rows);
        new_width = (img.cols * sc0) | 0;
        new_height = (img.rows * sc0) | 0;

        // be carefull nothing done if size <512
        if (sc0 == 1.0)
            lev0_img = img;
        else
            jsfeat.imgproc.resample(img, lev0_img, new_width, new_height);

        // prepare preview
        that.pattern_preview = new jsfeat.matrix_t(new_width >> 1, new_height >> 1, jsfeat.U8_t | jsfeat.C1_t);
        jsfeat.imgproc.pyrdown(lev0_img, that.pattern_preview);

        //pattern_corners[nb_trained] = []; c'est fait à l'init
        //pattern_descriptors[nb_trained] = [];

        for (lev = 0; lev < _num_train_levels; ++lev) {
            that.pattern_corners[lev] = [];
            lev_corners = that.pattern_corners[lev];

            // preallocate corners array
            i = (new_width * new_height) >> lev;
            while (--i >= 0) {
                lev_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);
            }

            that.pattern_descriptors[lev] = new jsfeat.matrix_t(32, _max_per_level, jsfeat.U8_t | jsfeat.C1_t);
        }

        // do the first level
        lev_corners = that.pattern_corners[0];
        lev_descr = that.pattern_descriptors[0];

        jsfeat.imgproc.gaussian_blur(lev0_img, lev_img, that.blur_size); // this is more robust
        jsfeat.yape06.laplacian_threshold = that.lap_thres;
        jsfeat.yape06.min_eigen_value_threshold = that.eigen_thres;

        that.corners_num = detect_keypoints(lev_img, lev_corners, _max_per_level);
        jsfeat.orb.describe(lev_img, lev_corners, that.corners_num, lev_descr);

        console.log("IMtrain " + lev_img.cols + "x" + lev_img.rows + " points: " + that.corners_num);

        sc /= sc_inc;

        // lets do multiple scale levels
        // we can use Canvas context draw method for faster resize
        // but its nice to demonstrate that you can do everything with jsfeat
        for (lev = 1; lev < _num_train_levels; ++lev) {
            lev_corners = that.pattern_corners[lev];
            lev_descr = that.pattern_descriptors[lev];

            new_width = (lev0_img.cols * sc) | 0;
            new_height = (lev0_img.rows * sc) | 0;

            jsfeat.imgproc.resample(lev0_img, lev_img, new_width, new_height);
            jsfeat.imgproc.gaussian_blur(lev_img, lev_img, that.blur_size | 0);
            that.corners_num = detect_keypoints(lev_img, lev_corners, _max_per_level);
            jsfeat.orb.describe(lev_img, lev_corners, that.corners_num, lev_descr);

            // fix the coordinates due to scale level
            for (i = 0; i < that.corners_num; ++i) {
                lev_corners[i].x *= 1. / sc;
                lev_corners[i].y *= 1. / sc;
            }

            console.log("IMtrain " + lev_img.cols + "x" + lev_img.rows + " points: " + that.corners_num);

            sc /= sc_inc;
        }

        // nb_trained++;
    };

    IMload_image(image);
};
