var AM = AM || {};


/**
 * Detects corners in an image using FAST, and descriptors using ORB.
 * @class
 */
AM.Detection = function() {

  var _params = {
    laplacian_threshold: 30,
    eigen_threshold: 25,
    detection_corners_max: 500,
    border_size: 15,
    fast_threshold: 20
  };

  var _debug =false;

  var _screen_corners = [];
  var _num_corners = 0;

  var _screen_descriptors = new jsfeat.matrix_t(32, _params.detection_corners_max, jsfeat.U8_t | jsfeat.C1_t);

  function AllocateCorners(width, height) {
    var i = width * height;

    if (i > _screen_corners.length) {
      while (--i >= 0) {
        _screen_corners[i] = new jsfeat.keypoint_t();
      }
    }
  }

  /**
   * Computes the image corners and descriptors and saves them internally.
   * <br>Use {@link ImageFilter} first to filter an Image.
   * @inner
   * @param {jsfeat.matrix_t} img
   */
  this.Detect = function(img) {
    AllocateCorners(img.cols, img.rows);

    _num_corners = AM.DetectKeypointsYape06(img, _screen_corners, _params.detection_corners_max,
      _params.laplacian_threshold, _params.eigen_threshold, _params.border_size);
    
    // _num_corners = AM.DetectKeypointsFast(img, _screen_corners, _params.detection_corners_max,
    //   _params.fast_threshold, _params.border_size);

    jsfeat.orb.describe(img, _screen_corners, _num_corners, _screen_descriptors);

    if (_debug) console.log("Learn : " + _num_corners + " corners");
  };

  /**
   * Sets the params used during the detection
   * @inner
   * @param {object} params
   * @param {number} [params.laplacian_threshold] - 0 - 100 default 30
   * @param {number} [params.eigen_threshold] - 0 - 100 default 25
   * @param {number} [params.detection_corners_max] - 100 - 1000 default 500
   * @param {number} [params.border_size] default 3
   * @param {number} [params.fast_threshold] - 0 - 10 default 48
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };

  /**
   * Returns the last computed descriptors
   * @inner
   * @returns {jsfeat.matrix_t} Descriptors
   */
  this.GetDescriptors = function() {
    return _screen_descriptors;
  };

  /**
   * Returns the count of the last computed corners
   * @inner
   * @returns {number}
   */
  this.GetNumCorners = function() {
    return _num_corners;
  };

  /**
   * Returns the last computed corners
   * @inner
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetCorners = function() {
    return _screen_corners;
  };


};

AM.IcAngle = (function() {
  var u_max = new Int32Array( [ 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0 ] );
  var half_pi = Math.PI / 2;
  
  function DiamondAngle(y, x) {
    if (y >= 0)
      return (x >= 0 ? y / (x + y) : 1 - x / (-x + y)); 
    else
      return (x < 0 ? 2 - y / (-x - y) : 3 + x / (x - y));
  }

  return function(img, px, py) {
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

    // return Math.atan2(m_01, m_10);
    DiamondAngle(m_01, m_10) * half_pi;
  };
})();

AM.DetectKeypointsPostProc = (function() {

  function Comp(a, b) {
    return b.score < a.score;
  }

  return function(img, corners, count, max_allowed) {

    // sort by score and reduce the count if needed
    if(count > max_allowed) {
      jsfeat.math.qsort(corners, 0, count - 1, Comp);
      count = max_allowed;
    }

    // calculate dominant orientation for each keypoint
    for(var i = 0; i < count; ++i) {
      corners[i].angle = AM.IcAngle(img, corners[i].x, corners[i].y);
    }

    return count;
  };
})();

AM.DetectKeypointsYape06 = function(img, corners, max_allowed,
  laplacian_threshold, eigen_threshold, border_size) {

  jsfeat.yape06.laplacian_threshold = laplacian_threshold;
  jsfeat.yape06.min_eigen_value_threshold = eigen_threshold;

  // detect features
  var count = jsfeat.yape06.detect(img, corners, border_size);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed);

  return count;
};

AM.DetectKeypointsFast = function(img, corners, max_allowed, threshold, border_size) {
  jsfeat.fast_corners.set_threshold(threshold);

  var count = jsfeat.fast_corners.detect(img, corners, border_size || 3);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed);

  return count;
};