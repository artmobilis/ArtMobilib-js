var AM = AM || {};


/**
 * Holds the corners and the descriptors of an image, at different levels of zoom.
 * @class
 * @param {string} [uuid] - An unique identifier
 */
AM.TrainedImage = function(uuid) {

  var _empty = true;

  var _corners_levels = [];
  var _descriptors_levels = [];

  var _width = 0;
  var _height = 0;

  var _uuid = uuid;

  var _active = true;
  

  /**
   * Returns the corners of a specified level.
   * @inner
   * @param {number} level - The level of the corners to be returned.
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetCorners = function(level) {
    return _corners_levels[level];
  };

  /**
   * Returns the descriptors of a specified level.
   * @inner
   * @param {number} level - The level of the descriptors to be returned.
   * @returns {jsfeat.matrix_t}
   */
  this.GetDescriptors = function(level) {
    return _descriptors_levels[level];
  };

  /**
   * Returns the number of level.
   * @inner
   * @return {number}
   */
  this.GetLevelNbr = function() {
    return Math.min(_descriptors_levels.length, _corners_levels.length);
  };

  /**
   * Returns all the corners.
   * @inner
   * @return {jsfeat.keypoint_t[][]}
   */
  this.GetCornersLevels = function() {
    return _corners_levels;
  };

  /**
   * Returns all the descriptors.
   * @inner
   * @return {jsfeat.matrix_t[]}
   */
  this.GetDescriptorsLevels = function() {
    return _descriptors_levels;
  };

  /**
   * Returns the width of the trained image at level 0.
   * @inner
   * @return {number}
   */
  this.GetWidth = function() {
    return _width;
  };

  /**
   * Returns the height of the trained image at level 0.
   * @inner
   * @return {number}
   */
  this.GetHeight = function() {
    return _height;
  };

  /**
   * Sets the trained image.
   * @inner
   * @param {jsfeat.keypoint_t[][]} corners_levels
   * @param {jsfeat.matrix_t[]} descriptors_levels
   * @param {number} width - width of the image at level 0
   * @param {number} height - height of the image at level 0
   */
  this.Set = function(corners_levels, descriptors_levels, width, height) {
    _empty = false;
    _corners_levels = corners_levels;
    _descriptors_levels = descriptors_levels;
    _width = width;
    _height = height;
  };

  /**
   * Returns wether the object is set or not.
   * @inner
   * @returns {bool}
   */
  this.IsEmpty = function() {
    return _empty;
  };

  /**
   * Empty the object.
   * @inner
   */
  this.Empty = function() {
    _empty = true;
    _corners_levels = [];
    _descriptors_levels = [];
  };

  /**
   * Sets the unique identifier of this object.
   * @inner
   * @param {value} uuid
   */
  this.SetUuid = function(uuid) {
    _uuid = uuid;
  };

  /**
   * Returns the unique identifier of this object.
   * @inner
   * @returns {value}
   */
  this.GetUuid = function() {
    return _uuid;
  };

  /** Sets this object active or inactive
   * @inner
   * param {bool} bool
   */
  this.Active = function(bool) {
    _active = (bool === true);
  };

  /**
   * Returns the state of this object
   * @inner
   * @returns {bool}
   */
  this.IsActive = function() {
    return _active;
  };

  
};