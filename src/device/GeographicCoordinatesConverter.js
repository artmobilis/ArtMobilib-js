/********************


GeographicCoordinatesConverter
A class to convert GPS coordinates to flat (x, z) coordinates.


Constructor

GeographicCoordinatesConverter(latitude, longitude)
Sets the origin. The coordinates should be in radiants.


Methods

GetLocalCoordinates(latitude, longitude)
Returns a THREE.Vector3 containing the new coordinates in 'x' and 'z' properties.
'latitude' and 'longitude' should be in radiants.

GetLocalCoordinatesFromDegres(latitude, longitude)
Same as above, with coordinates in degres.

SetOrigin(latitude, longitude)
Sets the origin. The coordinates should be in radiants.

SetOriginFromDegres(latitude, longitude)
Same as above, with coordinates in degres.

GetOrigin()
Returns the origin as object with the properties 'latitude' and 'longitude' in radiant.


Dependency

Threejs


********************/



var AM = AM || {};


AM.GeographicCoordinatesConverter = function(latitude, longitude) {
  var that = this;

  var _origin = { latitude: 0, longitude: 0 };

  this.GetLocalCoordinates = function(latitude, longitude) {

    var medium_latitude = (_origin.latitude + latitude) / 2;

    var pos = { x: 0, y: 0 };

    pos.x = (longitude - _origin.longitude) * that.EARTH_RADIUS * Math.cos(medium_latitude);
    pos.y = (latitude - _origin.latitude) * -that.EARTH_RADIUS;

    return pos;
  };

  this.GetLocalCoordinatesFromDegres = function(latitude, longitude) {
    return that.GetLocalCoordinates(THREE.Math.degToRad(latitude), THREE.Math.degToRad(longitude));
  }

  this.SetOrigin = function(latitude, longitude) {
    _origin.latitude = latitude;
    _origin.longitude = longitude;
  }

  this.SetOriginFromDegres = function(latitude, longitude) {
    _origin.latitude = THREE.Math.degToRad(latitude);
    _origin.longitude = THREE.Math.degToRad(longitude);
  }

  this.GetOrigin = function() {
    return _origin;
  }

  this.SetOrigin(latitude || 0, longitude || 0);

};

AM.GeographicCoordinatesConverter.prototype.EARTH_RADIUS = 6371000;