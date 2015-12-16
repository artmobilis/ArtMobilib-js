/******************

TrackedObjManager
A class that moves objects on the scene relatively to the camera,
smoothly using linear interpolation


Constructor

TrackedObjManager(parameters)

parameters: an object holding the parameters 'camera', 'lerpFactor', and 'timeout'
to set their respectives properties


Properties

camera: the origin, a 'THREE.Object3D'. Tracked objects are set has children of this object.

lerpFactor: a number in [0, 1], 0.2 by default.
The higher, the faster tracked objects will converge toward the camera.

timeout: time in seconds, 3 by default.
If an object isn't tracked for 'timeout' seconds, onDisable() is called,
and the object is disabled.


Methods

add(object, uuid, onEnable, onDisable)
Add an object to track, and set the optionnal callbacks.
The object is disabled until track() or trackCompose() are called.

remove(uuid)
Remove an object. If the object is enabled, onDisable is called before removal.

update()

track(uuid, matrix)
Sets a new position for a previously added object.
If the object is disabled, onEnable() is called and the object is enabled

trackCompose(uuid, position, quaternion, scale)
For convenience. Calls track().

getObject(uuid)


Dependency

three.js


******************/



TrackedObjManager = function(parameters) {
  parameters = parameters || {};

  var that = this;

  var clock = new THREE.Clock(true);

  var holder = new this.Holder();


  this.camera = parameters.camera;

  this.lerpFactor = parameters.lerpFactor || 0.2;

  this.timeout = parameters.timeout || 3;

  this.updateLerpMethod = function() {
    holder.forEach( function(elem) {

      var obj = elem.object;
      var target = elem.target;

      obj.position.lerp(target.position, that.lerpFactor);
      obj.quaternion.slerp(target.quaternion, that.lerpFactor);
      obj.scale.lerp(target.scale, that.lerpFactor);

    } );
  };

  this.updateMethod = this.updateLerpMethod;

  this.add = function(object, uuid, onEnable, onDisable) {
    holder.add(object, uuid, onEnable, onDisable);
  };

  this.remove = function(uuid) {
    holder.remove(uuid);
  };

  this.update = function() {

    holder.updateElapsed(clock.getDelta());
    holder.checkTimeout(that.timeout);

    that.updateMethod();
  };

  this.track = function() {

    var new_matrix = new THREE.Matrix4();

    return function(uuid, matrix) {

      if (that.camera) {

        var elem = holder.get(uuid);
        if (elem) {
          var target = elem.target;

          new_matrix.copy(that.camera.matrixWorld);
          new_matrix.multiply(matrix);

          new_matrix.decompose(target.position, target.quaternion, target.scale);


          holder.track(uuid);

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

  this.trackCompose = function() {

    var matrix = new THREE.Matrix4();

    return function(uuid, position, quaternion, scale) {

      matrix.compose(position, quaternion, scale);

      return that.track(uuid, matrix);
    }
  }();

  this.getObject = function(uuid) {
    var elem = holder.get(uuid);
    if (elem) {
      return elem.object;
    }
    return undefined;
  };
}


TrackedObjManager.prototype.Holder = function() {

  var m_objects = {};

  this.add = function(object, uuid, onEnable, onDisable) {

    m_objects[uuid] =
    {
      object: object,
      target:
      {
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      },
      elapsed: 0,
      onEnable: onEnable,
      onDisable: onDisable,
      enabled: false
    };
  };

  this.remove = function(uuid) {
    var elem = m_objects[uuid];

    if (elem.enabled) {
      elem.onDisable(elem.object);
    }
    delete m_objects[uuid];
  };

  this.track = function(uuid) {

    var elem = m_objects[uuid];

    elem.elapsed = 0;

    if (!elem.enabled) {
      elem.enabled = true;
      if (elem.onEnable)
        elem.onEnable(elem.object);
    }
  };

  this.updateElapsed = function(elapsed) {
    for (uuid in m_objects) {

      m_objects[uuid].elapsed += elapsed;
    }
  };

  this.checkTimeout = function(timeout) {

    for (uuid in m_objects) {

      var elem = m_objects[uuid];

      if (elem.elapsed > timeout) {
        if (elem.onDisable)
          elem.onDisable(elem.object);
        elem.enabled = false;
      }
    }
  };

  this.forEach = function(fun) {
    for (uuid in m_objects) {
      fun(m_objects[uuid]);
    }
  };

  this.get = function(uuid) {
    return m_objects[uuid];
  };
};