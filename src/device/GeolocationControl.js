/*****************


GeolocationControl
place a THREE.Object3D using the gyroscope


Constructor

GeolocationControl( object, geoConverter )
sets the THREE.Object3D to move, and the Math.GeoToCoordsConverter
to convert GPS coordinates to flat coordinates


Properties

object
The target object

interpolation_coefficient
number in [0, 1]. The object is moved to the target position
using linear interpolation and this coefficient

retry_connexion_ms
Time in milliseconds
If Connect() fails, wait for this time before trying again.


Methods

Connect() 
listen to the geolocation events

Update()
move smoothly the object towards the last known position

Disconnect()
remove the listeners


Dependency

Threejs

GeographicCoordinatesConverter


******************/


var AM = AM || {};


/**
 * Place a THREE.Object3D using the gyroscope.
 * @class
 * @param {THREE.Object3D} object
 * @param {AM.GeographicCoordinatesConverter} geoConverter
 */
AM.GeolocationControl = function(object, geoConverter) {

	var that = this;

	var _to_update = false;
	var _target_position = new THREE.Vector3();
	var _watch_id = 0;
	var _coordinates_converter = geoConverter;
  var _accuracy = 0.1;

  this.object = object;
	this.interpolation_coefficient = 0.02;
  this.retry_connection_ms = 1000;

	function OnSuccess(pos) {
		_target_position.copy(_coordinates_converter.GetLocalCoordinatesFromDegres(
      pos.coords.latitude, pos.coords.longitude));
		_to_update = true;
	}

	function OnError(error) {
		console.warn('geolocation failed: ' + error.message);
    window.setTimeout(that.Connect, that.retry_connection_ms);
	}

  /**
  * Listen to the geolocation events.
  * @inner
  */
	this.Connect = function() {
		_watch_id = navigator.geolocation.watchPosition(OnSuccess, OnError);
	};

  /**
  * Remove the listeners.
  * @inner
  */
	this.Disconnect = function() {
		navigator.geolocation.clearWatch(_watch_id);
    _to_update = false;
	};

  /**
  * Move smoothly the object towards the last known position.
  * @inner
  */
	this.Update = function() {
		if (_to_update) {

			var diffX = _target_position.x - that.object.position.x;
			var diffZ = _target_position.z - that.object.position.z;

      var distance_sq = diffX * diffX + diffZ * diffZ;

			if (distance_sq < _accuracy * _accuracy) {
				_to_update = false;
			}
			else {
				diffX *= that.interpolation_coefficient;
				diffZ *= that.interpolation_coefficient;
				that.object.position.x += diffX;
				that.object.position.z += diffZ;
			}

		};
	};

};