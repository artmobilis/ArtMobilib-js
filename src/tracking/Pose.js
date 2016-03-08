var AM = AM || {};


/**
 * Computes the pose and remove bad matches using RANSAC
 * @class
 */
AM.Pose = function() {

  var _good_count = 0;
  var _homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
  var _match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);


  // estimate homography transform between matched points
  function find_transform(matches, count, homo3x3, match_mask, screen_corners, pattern_corners) {
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
    for(var i = 0; i < count; ++i) {
      var m = matches[i];
      var s_kp = screen_corners[m.screen_idx];
      var p_kp = pattern_corners[m.pattern_lev][m.pattern_idx];
      pattern_xy[i] = { x: p_kp.x, y: p_kp.y };
      screen_xy[i] =  { x: s_kp.x, y: s_kp.y };
    }

    // estimate motion
    var ok = false;
    ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
                                        pattern_xy, screen_xy, count, homo3x3, match_mask, 1000);

    // extract good matches and re-estimate
    var good_cnt = 0;
    if (ok) {
      for(var i = 0; i < count; ++i) {
        if(match_mask.data[i]) {
          pattern_xy[good_cnt].x = pattern_xy[i].x;
          pattern_xy[good_cnt].y = pattern_xy[i].y;
          screen_xy[good_cnt].x = screen_xy[i].x;
          screen_xy[good_cnt].y = screen_xy[i].y;
          good_cnt++;
        }
      }
      // run kernel directly with inliers only
      mm_kernel.run(pattern_xy, screen_xy, homo3x3, good_cnt);
    } else {
      jsfeat.matmath.identity_3x3(homo3x3, 1.0);
    }

    return good_cnt;
  }

  // project/transform rectangle corners with 3x3 Matrix
  function tCorners(M, w, h) {
    var pt = [ { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h } ];
    var z = 0.0, px = 0.0, py = 0.0;

    for (var i = 0; i < 4; ++i) {
      px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
      py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
      z  = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
      pt[i].x = px / z;
      pt[i].y = py / z;
    }

    return pt;
  }

  /**
   *
   * @inner
   * @param {AM.match_t[]} matches
   * @param {number} count - The matches count.
   * @param {jsfeat.keypoint_t[]} screen_corners
   * @param {jsfeat.keypoint_t[][]} pattern_corners
   */
  this.Pose = function(matches, count, screen_corners, pattern_corners) {
    _good_count = find_transform(matches, count, _homo3x3, _match_mask, screen_corners, pattern_corners);
    return _good_count;
  };

  /**
   * Returns the count of good matches, computed using RANSAC by {@link AM.Pose#Pose}
   * @inner
   * @returns {number}
   */
  this.GetGoodCount = function() {
    return _good_count;
  };

  /**
   * Computes the 4 corners of the pose
   * @inner
   * @param {number} marker_width
   * @param {number} marker_height
   * @returns {Point2D[]} The corners
   */
  this.GetPoseCorners = function(marker_width, marker_height) {
    return tCorners(_homo3x3.data, marker_width, marker_height);
  };


};


/**
 * Computes the posit pose, based on the corners
 * @class
 */
AM.PosePosit = function() {

  /**
   * @typedef {object} PositPose
   * @property {number[]} pose.bestTranslation
   * @property {number[][]} pose.bestRotation
   */

  /**
   * @property {PositPose} pose
   */

  this.posit = new POS.Posit(10, 1);
  this.pose;
};

/**
 * Computes the pose
 * @inner
 * @param {Point2D[]} corners
 * @param {number} [model_size=35] The size of the real model.
 * @param {number} image_width
 * @param {number} image_height
 */
AM.PosePosit.prototype.Set = function(corners, model_size, image_width, image_height) {
  model_size = model_size || 35;

  var corners2 = [];
  for (var i = 0; i < corners.length; ++i) {
    var x = corners[i].x - (image_width / 2);
    var y = (image_height / 2) - corners[i].y;

    corners2.push( { x: x, y: y } );
  }

  this.pose = this.posit.pose(corners2);
};

/**
 * Sets the focal's length
 * @inner
 * @param {number} value
 */
AM.PosePosit.prototype.SetFocalLength = function(value) {
  this.posit.focalLength = value;
};


/**
 * Computes the threejs pose, based on the posit pose
 * @class
 */
AM.PoseThree = function() {
  this.position = new THREE.Vector3();
  this.rotation = new THREE.Euler();
  this.quaternion = new THREE.Quaternion();
  this.scale = new THREE.Vector3();
};

/**
 * Computes the pose
 * @inner
 * @param {PositPose} posit_pose
 * @param {number} model_size
 */
AM.PoseThree.prototype.Set = function(posit_pose, model_size) {
  model_size = model_size || 35;

  var rot = posit_pose.bestRotation;
  var translation = posit_pose.bestTranslation;

  this.scale.x = model_size;
  this.scale.y = model_size;
  this.scale.z = model_size;

  this.rotation.x = -Math.asin(-rot[1][2]);
  this.rotation.y = -Math.atan2(rot[0][2], rot[2][2]);
  this.rotation.z = Math.atan2(rot[1][0], rot[1][1]);

  this.position.x = translation[0];
  this.position.y = translation[1];
  this.position.z = -translation[2];

  this.quaternion.setFromEuler(this.rotation);
};