var AM = AM || {};

AM.TrainedImage = function(uuid) {

  var _empty = true;

  var _corners_levels = [];
  var _descriptors_levels = [];

  var _width = 0;
  var _height = 0;

  var _uuid = uuid;

  var _active = true;
  

  this.GetCorners = function(level) {
    return _corners_levels[level];
  };

  this.GetDescriptors = function(level) {
    return _corners_levels[level];
  };

  this.GetLevelNbr = function() {
    return Math.min(_descriptors_levels.length, _corners_levels.length);
  };

  this.GetCornersLevels = function() {
    return _corners_levels;
  };

  this.GetDescriptorsLevels = function() {
    return _descriptors_levels;
  };

  this.GetWidth = function() {
    return _width;
  };

  this.GetHeight = function() {
    return _height;
  };

  this.Set = function(corners_levels, descriptors_levels, width, height) {
    _empty = false;
    _corners_levels = corners_levels;
    _descriptors_levels = descriptors_levels;
    _width = width;
    _height = height;
  };

  this.IsEmpty = function() {
    return _empty;
  };

  this.Empty = function() {
    _empty = true;
    _corners_levels = [];
    _descriptors_levels = [];
  };

  this.SetUuid = function(uuid) {
    _uuid = uuid;
  };

  this.GetUuid = function() {
    return _uuid;
  };

  this.Active = function(bool) {
    _active = (bool === true);
  };

  this.IsActive = function(bool) {
    return _active;
  };

  
};