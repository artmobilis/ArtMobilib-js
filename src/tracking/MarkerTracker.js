/*************************







SetParameters(params)

params.match_min
params.laplacian_threshold
params.eigen_threshold
params.detection_corners_max
params.blur
params.blur_size
params.match_threshold
params.num_train_levels
params.image_size_max
params.training_corners_max



*************************/


var AM = AM || {};


/**
 * @class
 */
AM.MarkerTracker = function() {

  var _training = new AM.Training();
  var _trained_images = {};

  var _image_filter = new AM.ImageFilter();
  var _detection = new AM.Detection();
  var _matching = new AM.Matching();
  var _pose = new AM.Pose();

  var _match_found = false;
  var _matching_image;

  var _params = {
    match_min : 8
  };
  
  var _debug =false; 
  
  var _profiler = new AM.Profiler();
  _profiler.add('filter');
  _profiler.add('detection');
  _profiler.add('matching');
  _profiler.add('pose');


  /**
  * Computes the corners and descriptors
  * @inner
  * @param {ImageData} image_data
  */
  this.ComputeImage = function(image_data, fixed_angle) {
    _profiler.new_frame();
    _profiler.start('filter');
    _image_filter.Filter(image_data);
    _profiler.stop('filter');
    _profiler.start('detection');
    _detection.Detect(_image_filter.GetFilteredImage(), fixed_angle);
    _profiler.stop('detection');
  };

  /**
   * Matches the last computed ImageData and every active trained image.
   * @inner
   * @returns {bool} true if a match if found.
   */
  this.Match = function() {
    _profiler.start('matching');

    _match_found = false;
    _matching_image = undefined;

    _matching.SetScreenDescriptors(_detection.GetDescriptors());

    for(var uuid in _trained_images) {
      var trained_image = _trained_images[uuid];

      if (!trained_image.IsActive())
        continue;

      _matching.Match(trained_image.GetDescriptorsLevels());

      var count = _matching.GetNumMatches();

      // save last test uuid for debugging matching
      _matching_image = trained_image;

      _match_found = (count >= _params.match_min);
      if (_debug) console.log( "image: " + uuid + " nbMatches: " + count);
      if (!_match_found)
        continue;

      var good_count = _pose.Pose(_matching.GetMatches(), count,
        _detection.GetCorners(), trained_image.GetCornersLevels());
      _match_found = (good_count >= _params.match_min);

      if (_debug) console.log(" goodMatches: " + good_count);
      if (_match_found) {
        _matching_image = trained_image;
        break;
      }

    }

    _profiler.stop('matching');
    //if (_debug) console.log(_profiler.log2());

    return _match_found;
  };

  /**
   * Returns the id of the last match
   * @inner
   */
  this.GetMatchUuid = function() {
    return _matching_image.GetUuid();
  };

  /**
   * Computes and returns the pose of the last match
   * @inner
   * @returns {Point2D[]} The corners
   */
  this.GetPose = function() {
    if (_match_found) {
      _profiler.start('pose');
      var pose = _pose.GetPoseCorners(_matching_image.GetWidth(), _matching_image.GetHeight());
      _profiler.stop('pose');
      return pose;
    }
    return undefined;
  };

  /**
   * Trains a marker
   * @inner
   * @param {ImageData} image_data - The marker, has to be a square (same width and height).
   * @param {value} uuid - The identifier of the marker.
   */
  this.AddMarker = function(image_data, uuid) {
    _training.Train(image_data);
    var trained_image = new AM.TrainedImage(uuid);
    _training.SetResultToTrainedImage(trained_image);
    _training.Empty();
    _trained_images[uuid] = trained_image;
  };

  /**
   * Removes a marker
   * @inner
   * @param {value} uuid - The identifier of the marker.
   */
  this.RemoveMarker = function(uuid) {
    if (_trained_images[uuid]) {
      delete _trained_images[uuid];
    }
  };

  /**
   * Activates or desactivates a marker.
   * <br>A marker inactive will be ignored during the matching.
   * @inner
   * @param {value} uuid - The identifier of the marker.
   * @param {bool} bool - Sets active if true, inactive if false.
   */
  this.ActiveMarker = function(uuid, bool) {
    if (_trained_images[uuid])
      _trained_images[uuid].Active(bool);
  };

  /**
   * Sets active or inactive all the markers
   * @inner
   * @param {bool} bool - Sets all active if true, inactive if false.
   */
  this.ActiveAllMarkers = function(bool) {
    for (var uuid in _trained_images) {
      _trained_images[uuid].Active(bool);
    }
  };

  /**
   * Removes all the markers
   * @inner
   */
  this.ClearMarkers = function() {
    _trained_images = {};
  };

  /**
   * Returns the corners of the last computed image
   * @inner
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetScreenCorners = function() {
    return _detection.GetCorners();
  };

  /**
   * Returns the count of corners of the last computed image
   * @inner
   * @returns {number}
   */
  this.GetNumScreenCorners = function() {
    return _detection.GetNumCorners();
  };

 /**
   * Returns the buffer of matches ()
   * @inner
   * @returns {AM.match_t[]}
   */
  this.GetMatches = function () {
    return _matching.GetMatches();
  };

 /**
   * Returns the buffer of matches validated by homography ()
   * @inner
   * @returns {AM.match_t[]}
   */
  this.GetMatchesMask = function () {
    return _pose.GetMatchesMask();
  };

/**
   * Returns the timings of matching function()
   * @inner
   * @returns {pair[]}
   */
  this.GetProfiler = function () {
    return _profiler.GetProfiler();
  };

/**
   * Returns corners of trained image
   * @inner
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetTrainedCorners = function () {
    var trained_image = _trained_images[_matching_image.GetUuid()];
    return trained_image.GetCornersLevels();
  };

  /**
   * Puts the log to the console
   * @inner
   */
  this.Log = function() {
    console.log(_profiler.log() + ((_match_found) ? '<br/>match found' : ''));
  };

  /**
   * Sets optionnals parameters
   * @inner
   * @param {object} params
   * @param {number} [match_min] minimum number of matching corners necessary for a match to be valid. default 8
   * @see AM.ImageFilter
   * @see AM.Detection
   * @see AM.Matching
   * @see AM.Training
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }

    _training.SetParameters(params);
    _image_filter.SetParameters(params);
    _detection.SetParameters(params);
    _matching.SetParameters(params);
  };

  this.UseFixedAngle = function(bool) {
    _training.UseFixedAngle(bool);
  };
};