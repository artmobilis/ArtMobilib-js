// todo license???
// acceleration done : Brut force matcig so redce mber of corners (500 -> 150 in live ad 100/level wit 3 levels in training), can maybe be more reduced
// detection improvement by reducing nb good corers for acceptance from 20 to 10
// todo acceleration: use one marker to search par image to keep good frame rate
// todo acceleration: after recogition, use a fast corner tracking/registration or Gyro+Gps
// todo improve detection: I suspect it is because using most dominant angle, we should use 2 bests with diff more than 30°
// todo freezing every 5s: I suspect garbage collector because bad memory management

/////////////////////
// Corners detection
/////////////////////
var CornerDetector = function () {
    var that = this;
    var testCorner='4';

    function init() {
    }
};

function detect_keypoints(img, corners, max_allowed) {
    // detect features
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

// non zero bits count
function popcnt32(n) {
    n -= ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0xF0F0F0F) * 0x1010101) >> 24;
}

// naive brute-force matching.
// each on screen point is compared to all pattern points
// to find the closest match
function match_pattern(id) {
    var q_cnt = screen_descriptors.rows;
    var query_du8 = screen_descriptors.data;
    var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
    var qd_off = 0;
    var qidx = 0, lev = 0, pidx = 0, k = 0;
    var num_matches = 0;

    stat.start("match_pattern");

    for (qidx = 0; qidx < q_cnt; ++qidx) {
        var best_dist = 256;
        var best_dist2 = 256;
        var best_idx = -1;
        var best_lev = -1;

        for (lev = 0; lev < num_train_levels; ++lev) {
            var lev_descr = pattern_descriptors[id][lev];
            var ld_cnt = lev_descr.rows;
            var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
            var ld_off = 0;

            for (pidx = 0; pidx < ld_cnt; ++pidx) {

                var curr_d = 0;
                // our descriptor is 32 bytes so we have 8 Integers
                for (k = 0; k < 8; ++k) {
                    curr_d += popcnt32(query_u32[qd_off + k] ^ ld_i32[ld_off + k]);
                }

                if (curr_d < best_dist) {
                    best_dist2 = best_dist;
                    best_dist = curr_d;
                    best_lev = lev;
                    best_idx = pidx;
                } else if (curr_d < best_dist2) {
                    best_dist2 = curr_d;
                }

                ld_off += 8; // next descriptor
            }
        }

        // filter out by some threshold
        if (best_dist < options.match_threshold) {
            matches[id][num_matches].screen_idx = qidx;
            matches[id][num_matches].pattern_lev = best_lev;
            matches[id][num_matches].pattern_idx = best_idx;
            num_matches++;
        }
        //

        /* filter using the ratio between 2 closest matches
        if(best_dist < 0.8*best_dist2) {
            matches[id][num_matches].screen_idx = qidx;
            matches[id][num_matches].pattern_lev = best_lev;
            matches[id][num_matches].pattern_idx = best_idx;
            num_matches++;
        }
        */

        qd_off += 8; // next query descriptor
    }

    stat.stop("match_pattern");

    return num_matches;
}

// match with all recorded pattern and select the best if enough corresponding data
function matching() {
    var good_matches = 0;

// search for the right pattern
    var id = 0;
    var str = "", found = false;
    for (id = 0; id < nb_trained; ++id) {
        num_matches[id] = match_pattern(id);
        str += "<br>Id : " + id + " nbMatches : " + num_matches[id];
        if (num_matches[id] < 10 || found)
            continue;

        stat.start("find_transform");
        good_matches = find_transform(matches[id], num_matches[id], id);
        stat.stop("find_transform");
        str += " nbGood : " + good_matches;
        if (good_matches > 8) {
            current_pattern = id;
            found = true;
        }
    }
    matchingresult.innerHTML = str;
    return found;
};

/////////////////////
// Pattern Training
/////////////////////

train_pattern = function () {
    trainpattern(img_u8);
};

// train a pattern: extract corners multiscale, compute descriptor, store result
trainpattern = function (img) {
    var lev = 0, i = 0;
    var sc = 1.0;
    var max_pattern_size = 512;
    var max_per_level = 100;
    var sc_inc = Math.sqrt(2.0); // magic number ;)
    var lev0_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
    var lev_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
    var new_width = 0, new_height = 0;
    var lev_corners, lev_descr;
    var corners_num = 0;

    var sc0 = Math.min(max_pattern_size / img.cols, max_pattern_size / img.rows);
    new_width = (img.cols * sc0) | 0;
    new_height = (img.rows * sc0) | 0;

    // alloc matches
    matches[nb_trained] = [];
    var i = maxMatches;
    while (--i >= 0) {
        matches[nb_trained][i] = new ArtMobilib.match_t();
    }

    // transform matrix
    homo3x3[nb_trained] = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
    match_mask[nb_trained] = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);

    // be carefull nothing done if size <512
    jsfeat.imgproc.resample(img, lev0_img, new_width, new_height);

    // prepare preview
    pattern_preview[nb_trained] = new jsfeat.matrix_t(new_width >> 1, new_height >> 1, jsfeat.U8_t | jsfeat.C1_t);
    jsfeat.imgproc.pyrdown(lev0_img, pattern_preview[nb_trained]);

    pattern_corners[nb_trained] = [];
    pattern_descriptors[nb_trained] = [];

    for (lev = 0; lev < num_train_levels; ++lev) {
        pattern_corners[nb_trained][lev] = [];
        lev_corners = pattern_corners[nb_trained][lev];

        // preallocate corners array
        i = (new_width * new_height) >> lev;
        while (--i >= 0) {
            lev_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);
        }

        pattern_descriptors[nb_trained][lev] = new jsfeat.matrix_t(32, max_per_level, jsfeat.U8_t | jsfeat.C1_t);
    }

    // do the first level
    lev_corners = pattern_corners[nb_trained][0];
    lev_descr = pattern_descriptors[nb_trained][0];

    jsfeat.imgproc.gaussian_blur(lev0_img, lev_img, options.blur_size | 0); // this is more robust
    corners_num = detect_keypoints(lev_img, lev_corners, max_per_level);
    jsfeat.orb.describe(lev_img, lev_corners, corners_num, lev_descr);

    console.log("train " + lev_img.cols + "x" + lev_img.rows + " points: " + corners_num);

    sc /= sc_inc;

    // lets do multiple scale levels
    // we can use Canvas context draw method for faster resize
    // but its nice to demonstrate that you can do everything with jsfeat
    for (lev = 1; lev < num_train_levels; ++lev) {
        lev_corners = pattern_corners[nb_trained][lev];
        lev_descr = pattern_descriptors[nb_trained][lev];

        new_width = (lev0_img.cols * sc) | 0;
        new_height = (lev0_img.rows * sc) | 0;

        jsfeat.imgproc.resample(lev0_img, lev_img, new_width, new_height);
        jsfeat.imgproc.gaussian_blur(lev_img, lev_img, options.blur_size | 0);
        corners_num = detect_keypoints(lev_img, lev_corners, max_per_level);
        jsfeat.orb.describe(lev_img, lev_corners, corners_num, lev_descr);

        // fix the coordinates due to scale level
        for (i = 0; i < corners_num; ++i) {
            lev_corners[i].x *= 1. / sc;
            lev_corners[i].y *= 1. / sc;
        }

        console.log("train " + lev_img.cols + "x" + lev_img.rows + " points: " + corners_num);

        sc /= sc_inc;
    }

    nb_trained++;
};
