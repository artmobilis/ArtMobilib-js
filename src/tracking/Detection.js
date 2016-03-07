var AM = AM || {};

AM.Detection = function() {

  var _params = {
    laplacian_threshold: 30,
    eigen_threshold: 25,
    detection_corners_max: 500,
    border_size: 3,
    fast_threshold: 40
  }

  var _screen_corners = [];
  var _num_corners = 0;

  var _width = 0;
  var _height = 0;

  var _screen_descriptors = new jsfeat.matrix_t(32, _params.detection_corners_max, jsfeat.U8_t | jsfeat.C1_t);

  function AllocateCorners(width, height) {
    var i = width * height;

    if (i > _screen_corners.length) {
      while (--i >= 0) {
        _screen_corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);
      }
    }
  }

  this.Detect = function(img) {
    _width = img.cols;
    _height = img.rows;
    AllocateCorners(_width, _height);

    _num_corners = AM.DetectKeypointsYape06(img, _screen_corners, _params.detection_corners_max,
      _params.laplacian_threshold, _params.eigen_threshold);

    jsfeat.orb.describe(img, _screen_corners, _num_corners, _screen_descriptors);
  };

  this.SetParameters = function(params) {
    for (name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };

  this.GetDescriptors = function() {
    return _screen_descriptors;
  };

  this.GetNumCorners = function() {
    return _num_corners;
  };

  this.GetCorners = function() {
    return _screen_corners;
  };

  this.GetImageWidth = function() {
    return _width;
  };

  this.GetImageHeight = function() {
    return _height;
  };


};

AM.IcAngle = (function() {
  var u_max = new Int32Array( [ 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0 ] );

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

    return Math.atan2(m_01, m_10);
  }
})();

AM.DetectKeypointsPostProc = function(img, corners, count, max_allowed) {

  // sort by score and reduce the count if needed
  if(count > max_allowed) {
    jsfeat.math.qsort(corners, 0, count - 1, function(a, b) {
      return (b.score < a.score);
    } );
    count = max_allowed;
  }

  // calculate dominant orientation for each keypoint
  for(var i = 0; i < count; ++i) {
    corners[i].angle = AM.IcAngle(img, corners[i].x, corners[i].y);
  }

  return count;
}

AM.DetectKeypointsYape06 = function(img, corners, max_allowed,
  laplacian_threshold, eigen_threshold) {

  jsfeat.yape06.laplacian_threshold = laplacian_threshold;
  jsfeat.yape06.min_eigen_value_threshold = eigen_threshold;

  // detect features
  var count = jsfeat.yape06.detect(img, corners, 17);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed);

  return count;
};

AM.DetectKeypointsFast = function(img, corners, max_allowed, threshold, border_size) {
  jsfeat.fast_corners.set_threshold(threshold);

  var count = jsfeat.fast_corners.detect(img, corners, border_size || 3);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed);

  return count;
};