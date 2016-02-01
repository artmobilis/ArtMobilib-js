// todo license???

/******************

Corners matching
naive brute-force matching, each on screen point is compared to all pattern points
to find the closest match

Properties

maxMatches: maximum number of matches ()
match_threshold: number of bit in Hamming distance

nb_matches_valid: minimum number of matches to accept detection
nb_homograpy_valid: minimum number of matches after homograpy check to accept detection

Methods

matching: compare descriptors, then check repartition using homography estimation for matching 

Todo
- always sort corner? needed if we put a progressive matching method
- do we separate matching and homograpy validation

Dependency

ImageMarkers.js
CornerDetector.js

******************/


match_t = (function () {
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


var MarkerMatcher = function () {

  /// private data
  var that = this;

  /// public data
  this.nb_homograpy_valid = 8;
  this.nb_matches_valid = 20;
  this.maxMatches = 2000;
  this.match_threshold = 48; // 16 to 128

  // matching result
  this.matches = [];
  this.num_matches;

  // homography coherence validation
  this.homo3x3;
  this.match_mask;
  this.corners;

  // debugging
  this.debug = true;
  this.log = ""; // output log

  var Init = function () {
    // alloc matches
    that.matches = [];
    var i = that.maxMatches;
    while (--i >= 0) {
      that.matches[i] = new match_t();
    }

    // transform matrix
    that.homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
    that.match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);
  }

  // non zero bits count
  function popcnt32(n) {
    n -= ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0xF0F0F0F) * 0x1010101) >> 24;
  }


  // estimate homography transform between matched points
  function find_transform(screen_corners, pattern_marker) {
    var pattern_corners = pattern_marker.pattern_corners;
    // motion kernel
    var mm_kernel = new jsfeat.motion_model.homography2d();
    // ransac params
    var num_model_points = 4;
    var reproj_threshold = 3;
    var ransac_param = new jsfeat.ransac_params_t(num_model_points,
        reproj_threshold, 0.5, 0.99);

    var pattern_xy = [];
    var screen_xy = [];

    // construct correspondences
    for (var i = 0; i < that.num_matches; ++i) {
      var m = that.matches[i];
      var s_kp = screen_corners[m.screen_idx];
      var p_kp = pattern_corners[m.pattern_lev][m.pattern_idx];
      pattern_xy[i] = { "x": p_kp.x, "y": p_kp.y };
      screen_xy[i] = { "x": s_kp.x, "y": s_kp.y };
    }

    // estimate motion
    var ok = false;
    ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
        pattern_xy, screen_xy, that.num_matches, that.homo3x3, that.match_mask, 1000);

    // extract good matches and re-estimate
    var good_cnt = 0;
    if (ok) {
      for (var i = 0; i < that.num_matches; ++i) {
        if (that.match_mask.data[i]) {
          pattern_xy[good_cnt].x = pattern_xy[i].x;
          pattern_xy[good_cnt].y = pattern_xy[i].y;
          screen_xy[good_cnt].x = screen_xy[i].x;
          screen_xy[good_cnt].y = screen_xy[i].y;
          good_cnt++;
        }
      }
      // run kernel directly with inliers only
      mm_kernel.run(pattern_xy, screen_xy, that.homo3x3, good_cnt);
    } else {
      jsfeat.matmath.identity_3x3(that.homo3x3, 1.0);
    }

    return good_cnt;
  }

  // naive brute-force matching.
  // each on screen point is compared to all pattern points
  // to find the closest match
  function match_pattern(screen_descriptors, pattern_marker) {
    var pattern_descriptors = pattern_marker.pattern_descriptors;
    var q_cnt = screen_descriptors.rows;
    var query_du8 = screen_descriptors.data;
    var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
    var qd_off = 0;
    var qidx = 0, lev = 0, pidx = 0, k = 0;
    that.num_matches = 0;

    stat.start("match_pattern");

    for (qidx = 0; qidx < q_cnt; ++qidx) {
      var best_dist = 256;
      var best_dist2 = 256;
      var best_idx = -1;
      var best_lev = -1;

      for (lev = 0; lev < pattern_marker.num_train_levels; ++lev) {
        var lev_descr = pattern_descriptors[lev];
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
      if (best_dist < that.match_threshold) {
        that.matches[that.num_matches].screen_idx = qidx;
        that.matches[that.num_matches].pattern_lev = best_lev;
        that.matches[that.num_matches].pattern_idx = best_idx;
        that.num_matches++;
      }
      //

      /* filter using the ratio between 2 closest matches
      if(best_dist < 0.8*best_dist2) {
          that.matches[that.num_matches].screen_idx = qidx;
          that.matches[that.].pattern_lev = best_lev;
          that.matches[that.].pattern_idx = best_idx;
          that.num_matches++;
      }
      */

      qd_off += 8; // next query descriptor
    }

    stat.stop("match_pattern");

    return that.num_matches;
  }


  // project/transform rectangle corners with 3x3 Matrix
  function tCorners(M, w, h) {
    var pt = [{ 'x': 0, 'y': 0 }, { 'x': w, 'y': 0 }, { 'x': w, 'y': h }, { 'x': 0, 'y': h }];
    var z = 0.0, i = 0, px = 0.0, py = 0.0;

    for (; i < 4; ++i) {
      px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
      py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
      z = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
      pt[i].x = px / z;
      pt[i].y = py / z;
    }

    return pt;
  }

  this.ComputePatternCorners = function (pattern_marker) {
    // get the projected pattern corners
    that.corners = tCorners(that.homo3x3.data, pattern_marker.sx, pattern_marker.sy);
  }

  // match with the pattern and test if enough corresponding data trough planar homography
  this.matching = function (screen_corners, screen_descriptors, pattern_marker) {
    var good_matches = 0;

    // wait for ImageMarkers loaded
    if (!pattern_marker.corners_num) return false;

    // search for the right pattern
    that.log = ""
    that.num_matches = match_pattern(screen_descriptors, pattern_marker);
    that.log += pattern_marker.name + " nbMatches : " + that.num_matches;
    if (that.debug) console.log(pattern_marker.name + " nbMatches : " + that.num_matches);
    if (that.num_matches < that.nb_matches_valid)
      return false;

    stat.start("find_transform");
    that.good_matches = find_transform(screen_corners, pattern_marker);
    stat.stop("find_transform");
    that.log += " nbGood : " + that.good_matches + "\n";
    if (that.debug) console.log(" nbGood : " + that.good_matches + "\n");
    if (that.good_matches > that.nb_homograpy_valid) {
      that.ComputePatternCorners(pattern_marker);
      return true;
    }
    else
      return false;

  };

  Init();
};
