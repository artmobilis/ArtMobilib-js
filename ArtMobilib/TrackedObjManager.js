/******************

TrackedObjManager
A class that moves objects on the scene relatively to the camera,
smoothly using linear interpolation


Constructor

TrackedObjManager(parameters)

parameters: an object holding the parameters 'camera', 'lerp_factor', and 'timeout'
to set their respectives properties


Properties

camera: the origin, a 'THREE.Object3D'. Tracked objects are set has children of this object.

lerp_factor: a number in [0, 1], 0.2 by default.
The higher, the faster tracked objects will converge toward the camera.

timeout: time in seconds, 3 by default.
If an object isn't tracked for 'timeout' seconds, on_disable() is called,
and the object is disabled.


Methods

Add(object, uuid, on_enable, on_disable)
Add an object to track, and set the optionnal callbacks.
The object is disabled until Track() or TrackCompose() are called.

Remove(uuid)
Remove an object. If the object is enabled, on_disable is called before removal.

Update()

Track(uuid, matrix)
Sets a new position for a previously added object.
If the object is disabled, on_enable() is called and the object is enabled

TrackCompose(uuid, position, quaternion, scale)
For convenience. Calls Track().

TrackComposePosit(uuid, translation_pose, rotation_pose, model_size)
For convenience. Calls TrackCompose().

GetObject(uuid)


Dependency

three.js


******************/



TrackedObjManager = function(parameters) {
  parameters = parameters || {};

  var that = this;

  var _clock = new THREE.Clock(true);

  var _holder = new this.Holder();


  this.camera = parameters.camera;

  this.lerp_factor = parameters.lerp_factor || 0.2;

  this.timeout = parameters.timeout || 3;

  this.UpdateLerpMethod = function() {
    _holder.ForEach(function(elem) {

      var obj = elem.object;
      var target = elem.target;

      obj.position.lerp(target.position, that.lerp_factor);
      obj.quaternion.slerp(target.quaternion, that.lerp_factor);
      obj.scale.lerp(target.scale, that.lerp_factor);

    });
  };

  this.update_method = this.UpdateLerpMethod;

  this.Add = function(object, uuid, on_enable, on_disable) {
    _holder.Add(object, uuid, on_enable, on_disable);
  };

  this.Remove = function(uuid) {
    _holder.Remove(uuid);
  };

  this.Update = function() {

    _holder.UpdateElapsed(_clock.getDelta());
    _holder.CheckTimeout(that.timeout);

    that.update_method();
  };

  this.Track = function() {

    var new_matrix = new THREE.Matrix4();

    return function(uuid, matrix) {

      if (that.camera) {

        var elem = _holder.Get(uuid);
        if (elem) {
          var target = elem.target;

          new_matrix.copy(that.camera.matrixWorld);
          new_matrix.multiply(matrix);

          new_matrix.decompose(target.position, target.quaternion, target.scale);


          _holder.Track(uuid);

          return true;

        }
        else
          console.warn('TrackedObjManager: object ' + uuid + ' not found');
      }
      else
        console.warn('TrackedObjManager: camera is undefined');

      return false;
    };
  }();

  this.TrackCompose = function() {

    var matrix = new THREE.Matrix4();

    return function(uuid, position, quaternion, scale) {

      matrix.compose(position, quaternion, scale);

      return that.Track(uuid, matrix);
    }
  }();

  this.TrackComposePosit = function() {

    var position = new THREE.Vector3();
    var euler = new THREE.Euler();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    return function(uuid, translation_pose, rotation_pose, model_size) {

      position.x = translation_pose[0];
      position.y = translation_pose[1];
      position.z = -translation_pose[2];

      euler.x = -Math.asin(-rotation_pose[1][2]);
      euler.y = -Math.atan2(rotation_pose[0][2], rotation_pose[2][2]);
      euler.z = Math.atan2(rotation_pose[1][0], rotation_pose[1][1]);

      scale.x = model_size;
      scale.y = model_size;
      scale.z = model_size;

      quaternion.setFromEuler(euler);

      return that.TrackCompose(uuid, position, quaternion, scale);
    };
  }();

  this.GetObject = function(uuid) {
    var elem = _holder.get(uuid);
    if (elem) {
      return elem.object;
    }
    return undefined;
  };
}


TrackedObjManager.prototype.Holder = function() {

  var _objects = {};

  this.Add = function(object, uuid, on_enable, on_disable) {

    _objects[uuid] =
    {
      object: object,
      target:
      {
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      },
      elapsed: 0,
      on_enable: on_enable,
      on_disable: on_disable,
      enabled: false
    };
  };

  this.Remove = function(uuid) {
    var elem = _objects[uuid];

    if (elem.enabled) {
      elem.on_disable(elem.object);
    }
    delete _objects[uuid];
  };

  this.Track = function(uuid) {

    var elem = _objects[uuid];

    elem.elapsed = 0;

    if (!elem.enabled) {
      elem.enabled = true;
      if (elem.on_enable)
        elem.on_enable(elem.object);
    }
  };

  this.UpdateElapsed = function(elapsed) {
    for (uuid in _objects) {

      _objects[uuid].elapsed += elapsed;
    }
  };

  this.CheckTimeout = function(timeout) {

    for (uuid in _objects) {

      var elem = _objects[uuid];

      if (elem.elapsed > timeout) {
        if (elem.on_disable)
          elem.on_disable(elem.object);
        elem.enabled = false;
      }
    }
  };

  this.ForEach = function(fun) {
    for (uuid in _objects) {
      fun(_objects[uuid]);
    }
  };

  this.Get = function(uuid) {
    return _objects[uuid];
  };
};