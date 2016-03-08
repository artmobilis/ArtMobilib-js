/********************


GeographicCoordinatesConverter
A class to convert GPS coordinates to flat (x, z) coordinates.


Constructor

GeographicCoordinatesConverter(latitude: float, longitude: float)
Sets the origin. The coordinates should be in radiants.


Methods

GetLocalCoordinates(latitude: float, longitude: float) -> THREE.Vector3
Returns a THREE.Vector3 containing the new coordinates in 'x' and 'z' properties.
'latitude' and 'longitude' should be in radiants.

GetLocalCoordinatesFromDegres(latitude: float, longitude: float) -> THREE.Vector3
Same as above, with coordinates in degres.

SetOrigin(latitude: float, longitude: float)
Sets the origin. The coordinates should be in radiants.

SetOriginFromDegres(latitude: float, longitude: float)
Same as above, with coordinates in degres.

GetOrigin()
Returns the origin as object with the properties 'latitude' and 'longitude' in radiant.


Dependency

Threejs


********************/


var AM = AM || {};


/**
 * This class converts GPS coordinates to flat (x, z) coordinates.
 * @class
 * @param {number} latitude - latitude of the origin
 * @param {number} longitude - longitude of the origin
 */
AM.GeographicCoordinatesConverter = function(latitude, longitude) {
  var that = this;

  var _origin = { latitude: 0, longitude: 0 };

  /**
   * @typedef Point2D
   * @type {Object}
   * @property {number} x
   * @property {number} y
   */

  /**
   * @typedef Coordinates
   * @type {Object}
   * @property {number} longitude
   * @property {number} latitude
   */

  /**
   * @inner
   * @param {number} latitude - latitude in radians
   * @param {number} longitude - longitude in radians
   * @returns {Point2D}
   */
  this.GetLocalCoordinates = function(latitude, longitude) {

    var medium_latitude = (_origin.latitude + latitude) / 2;

    var pos = { x: 0, y: 0 };

    pos.x = (longitude - _origin.longitude) * that.EARTH_RADIUS * Math.cos(medium_latitude);
    pos.y = (latitude - _origin.latitude) * -that.EARTH_RADIUS;

    return pos;
  };

  /**
   * @inner
   * @param {number} latitude - latitude in degres
   * @param {number} longitude - longitude in degres
   * @returns {Point2D}
   */
  this.GetLocalCoordinatesFromDegres = function(latitude, longitude) {
    return that.GetLocalCoordinates(THREE.Math.degToRad(latitude), THREE.Math.degToRad(longitude));
  }

  /**
   * @inner
   * @param {number} latitude - latitude in radians
   * @param {number} longitude - longitude in radians
   */
  this.SetOrigin = function(latitude, longitude) {
    _origin.latitude = latitude;
    _origin.longitude = longitude;
  }

  /**
   * @inner
   * @param {number} latitude - latitude in degres
   * @param {number} longitude - longitude in degres
   */
  this.SetOriginFromDegres = function(latitude, longitude) {
    _origin.latitude = THREE.Math.degToRad(latitude);
    _origin.longitude = THREE.Math.degToRad(longitude);
  }

  /**
   * @inner
   * @returns {Coordinates} The origin in radians
   */
  this.GetOrigin = function() {
    return _origin;
  }

  this.SetOrigin(latitude || 0, longitude || 0);

};

AM.GeographicCoordinatesConverter.prototype.EARTH_RADIUS = 6371000;