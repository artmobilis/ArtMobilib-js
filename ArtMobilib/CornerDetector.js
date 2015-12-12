// todo license???

// Corners detection
// detect corners and compute ORB descriptors

var CornerDetector = function () {

    /// private data
    var that = this;
    var smoothed_img;

    /// public data
    this.max_per_level = 100;
    this.blur_size;
    this.lap_thresh;
    this.eigen_thres;

    /// private methods
    function detect_keypoints(img, corners, max_allowed) {
        // detect features
        jsfeat.yape06.laplacian_threshold = that.lap_thres | 0;
        jsfeat.yape06.min_eigen_value_threshold = that.eigen_thres | 0;

        var count = jsfeat.yape06.detect(img, corners, 17);

        // sort by score and reduce the count if needed
        if (count > max_allowed) {
            jsfeat.math.qsort(corners, 0, count - 1, function (a, b) { return (b.score < a.score); });
            count = max_allowed;
        }

        // calculate dominant orientation for each keypoint
        for (var i = 0; i < count; ++i) {
            corners[i].angle = ic_angle(img, corners[i].x, corners[i].y);
        }

        return count;
    }

    // central difference using image moments to find dominant orientation
    var u_max = new Int32Array([15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0]);
    function ic_angle(img, px, py) {
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
    
    init_image = function(img) {
        if (smoothed_img || smoothed_img.cols != img.cols || smoothed_img.rows != img.rows)
            smoothed_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
    }

    /// public methods
    this.init = function (options) {
        that.blur_size = options.blur_size;
        that.lap_thresh = options.blur_size;
        that.eigen_thres = options.blur_size;

    }

    // train a pattern: extract corners multiscale, compute descriptor, store result
    // input is greyscale image
    this.detectCorners = function (img, corners_num, corners, descriptors, options) {
        init_image(img);

        jsfeat.imgproc.gaussian_blur(img, smoothed_img, options.blur_size | 0); // this is more robust
        that.corners_num = detect_keypoints(smoothed_img, corners, max_per_level);
        jsfeat.orb.describe(smoothed_img, corners, corners_num, descriptors);

        console.log("IMtrain " + smoothed_img.cols + "x" + smoothed_img.rows + " points: " + that.corners_num);

    };
};
