// todo license???
/******************

Pattern learning b corner detection (Yape) and comptation of descriptors (ORB).
Image is first resized in 512-1280 range for robustness and processing time
Multilevel corner computation for scale robustness

Properties

_max_pattern_size: max image size after resizing
_min_pattern_size: min image size after resizing
 max_per_level: number of corners for each level
 num_train_levels: multiscale depth

Methods

LoadImage : Load image and search 

Todo
- corners of each level in the same array?

Dependency

CornerDetector.js

******************/


// Multilevel Image marker
var ImageMarkers = function (image, id) {

    /// private data
    var that = this;

    this.debug = false;

    // image size resizing use a canvas (image size should be over 512 in one dimension and below 1280)
    var _resizing_canvas = document.createElement('canvas');
    _resizing_canvas.width = 1280;
    _resizing_canvas.height = 1280;

    var _ctx = _resizing_canvas.getContext('2d');
    var _max_pattern_size = 1280;
    var _min_pattern_size = 512;
    var _gray; // gray intermediate image

  /// public data
    this.id = id;
    this.sx;
    this.sy;
    this.max_per_level = 150;
    this.num_train_levels = 3;

    /// public data
    // descriptors (should we keep level separated?)
    this.cornerdetector = new CornerDetector();
    this.pattern_corners = [];
    this.pattern_descriptors = [];
    this.corners_num = 0;

    this.name = image;
    this.pattern_preview; // a record of the learn pattern

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
        that.sx = img.width;
        that.sy = img.height;

        if (x_is_dominant) {
            need_resize_up = img.width < _max_pattern_size;
            need_resize_down = img.width > _min_pattern_size;
        }
        else {
            need_resize_up = img.height < _min_pattern_size;
            need_resize_down = img.height > _max_pattern_size;
        }

        if (need_resize_up) {
            if (x_is_dominant) {
                that.sx = _min_pattern_size;
                that.sy = Math.round(_min_pattern_size / ratio);
            }
            else {
                that.sx = Math.round(_min_pattern_size * ratio);
                that.sy = _min_pattern_size;
            }
        }

        if (need_resize_down) {
            if (x_is_dominant) {
                that.sx = _max_pattern_size;
                that.sy = Math.round(_max_pattern_size / ratio);
            }
            else {
                that.sx = Math.round(_max_pattern_size * ratio);
                that.sy = _max_pattern_size;
            }
        }

        // allocate gray image
        _gray = new jsfeat.matrix_t(that.sx, that.sy, jsfeat.U8_t | jsfeat.C1_t);
    }

    this.ResizeImage = function (img) {

        _ctx.drawImage(img, 0, 0, that.sx, that.sy);
        return _ctx.getImageData(0, 0, that.sx, that.sy);
    }

    LoadImage = function (name) {
        var img = new Image();
        img.onload = function () {
            if (that.debug) console.debug("load " + that.name);
            that.ComputeImageSize(img);
            var imageData = that.ResizeImage(img);
            jsfeat.imgproc.grayscale(imageData.data, that.sx, that.sy, _gray);
            that.IMtrainpattern(_gray); // le pattern doit etre plus grand que 512*512 dans au moins une dimension (sinon pas de rescale et rien ne se passe)
        }
        img.src = name;
    };

    // train a pattern: extract corners multiscale, compute descriptor, store result
    this.IMtrainpattern = function (img) {
        var lev = 0, i = 0;
        var sc = 1.0;
        var sc_inc = Math.sqrt(2.0); // magic number ;)
        var lev0_img = img;
        var lev_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
        var new_width = img.cols, new_height = img.rows;
        var lev_corners, lev_descr;

        if (that.debug) console.debug("Train " + that.name);

        // prepare preview
        that.pattern_preview = new jsfeat.matrix_t(new_width >> 1, new_height >> 1, jsfeat.U8_t | jsfeat.C1_t);
        jsfeat.imgproc.pyrdown(lev0_img, that.pattern_preview);

        for (lev = 0; lev < that.num_train_levels; ++lev) {
            that.pattern_corners[lev] = [];
            lev_corners = that.pattern_corners[lev];

            // preallocate corners array
            i = (new_width * new_height) >> lev;
            while (--i >= 0) {
                lev_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);
            }

            that.pattern_descriptors[lev] = new jsfeat.matrix_t(32, that.max_per_level, jsfeat.U8_t | jsfeat.C1_t);
        }

        // do the first level
        lev_corners = that.pattern_corners[0];
        lev_descr = that.pattern_descriptors[0];

        that.corners_num = that.cornerdetector.DetectCorners(lev0_img, lev_corners, lev_descr);
        if (that.debug) console.log("IMtrain " + lev_img.cols + "x" + lev_img.rows + " points: " + that.corners_num);

        sc /= sc_inc;

        // lets do multiple scale levels
        // we can use Canvas context draw method for faster resize
        // but its nice to demonstrate that you can do everything with jsfeat
        for (lev = 1; lev < that.num_train_levels; ++lev) {
            lev_corners = that.pattern_corners[lev];
            lev_descr = that.pattern_descriptors[lev];

            new_width = (lev0_img.cols * sc) | 0;
            new_height = (lev0_img.rows * sc) | 0;

            jsfeat.imgproc.resample(lev0_img, lev_img, new_width, new_height);
            that.corners_num = that.cornerdetector.DetectCorners(lev_img, lev_corners, lev_descr);

            // fix the coordinates due to scale level
            for (i = 0; i < that.corners_num; ++i) {
                lev_corners[i].x *= 1. / sc;
                lev_corners[i].y *= 1. / sc;
            }

            if (that.debug) console.log("IMtrain " + lev_img.cols + "x" + lev_img.rows + " points: " + that.corners_num);

            sc /= sc_inc;
        }
    };

    LoadImage(image);
};
