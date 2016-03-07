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
  }

  var _profiler = new profiler();
  _profiler.add('filter');
  _profiler.add('detection');
  _profiler.add('matching');
  _profiler.add('pose');

  this.ComputeImage = function(image_data) {
    _profiler.new_frame();
    _profiler.start('filter');
    _image_filter.Filter(image_data);
    _profiler.stop('filter');
    _profiler.start('detection');
    _detection.Detect(_image_filter.GetFilteredImage());
    _profiler.stop('detection');
  };

  this.Match = function() {
    _profiler.start('matching');

    _match_found = false;
    _matching_image = undefined;

    _matching.SetScreenDescriptors(_detection.GetDescriptors());

    for(uuid in _trained_images) {
      var trained_image = _trained_images[uuid];

      if (!trained_image.IsActive())
        continue;

      _matching.Match(trained_image.GetDescriptorsLevels());

      var count = _matching.GetNumMatches();

      _match_found = (count >= _params.match_min);
      if (!_match_found)
        continue;

      var good_count = _pose.Pose(_matching.GetMatches(), count,
        _detection.GetCorners(), trained_image.GetCornersLevels());
      _match_found = (good_count >= _params.match_min);

      if (_match_found) {
        _matching_image = trained_image;
        break;
      }

    }

    _profiler.stop('matching');

    return _match_found;
  };

  this.GetMatchUuid = function() {
    return _matching_image.GetUuid();
  };

  this.GetPose = function() {
    if (_match_found) {
      _profiler.start('pose');
      var pose = _pose.GetPoseCorners(_matching_image.GetWidth(), _matching_image.GetHeight());
      _profiler.stop('pose');
      return pose;
    }
    return undefined;
  };

  this.AddMarker = function(image_data, uuid) {
    _training.Train(image_data);
    var trained_image = new AM.TrainedImage(uuid);
    _training.SetResultToTrainedImage(trained_image);
    _training.Empty();
    _trained_images[uuid] = trained_image;
  };

  this.RemoveMarker = function(uuid) {
    if (_trained_images[uuid]) {
      delete _trained_images[uuid];
    }
  };

  this.ActiveMarker = function(uuid, bool) {
    if (_trained_images[uuid])
      _trained_images[uuid].Active(bool);
  };

  this.ActiveAllMarkers = function(bool) {
    for (uuid in _trained_images) {
      _trained_images[uuid].Active(bool);
    }
  };

  this.ClearMarkers = function() {
    _trained_images = {};
  };

  this.GetScreenCorners = function() {
    return _detection.GetCorners();
  };

  this.GetNumScreenCorners = function() {
    return _detection.GetNumCorners();
  };

  this.Log = function() {
    console.log(_profiler.log());
  };

  this.SetParameters = function(params) {
    for (name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }

    _training.SetParameters(params);
    _image_filter.SetParameters(params);
    _detection.SetParameters(params);
    _matching.SetParameters(params);
  };
};