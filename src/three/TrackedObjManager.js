var AMTHREE = AMTHREE || {};

(function() {

  if (typeof THREE === 'undefined') {
    AMTHREE.TrackedObjManager = function() {
      console.warn('TrackedObjManager.js: THREE undefined');
    };
    return;
  }


  /**
  * A class that moves objects on the scene relatively to the camera,
  *  smoothly by interpolation of successives positions and updates.
  * @class
  * @param {object} parameters - An object holding parameters
  * @param {THREE.Camera} parameters.camera
  * @param {number} [parameters.lerp_track_factor] - Sets the lerp_track_factor property.
  * @param {number} [parameters.lerp_update_factor] - Sets the lerp_update_factor property.
  * @param {number} [parameters.damping_factor] - Sets the damping_factor property.
  * @param {number} [parameters.timeout] - Sets the timeout property.
  */
  AMTHREE.TrackedObjManager = function(parameters) {
    parameters = parameters || {};

    var that = this;

    var _clock = new THREE.Clock(true);

    var _holder = new Holder();


    function LerpObjectsTransforms(src, dst, factor) {
      src.position.lerp(dst.position, factor);
      src.quaternion.slerp(dst.quaternion, factor);
      src.scale.lerp(dst.scale, factor);
    }

    function UpdateLerpMethod() {
      _holder.ForEach(function(elem) {

        if (elem.enabled)
          LerpObjectsTransforms(elem.object, elem.target, that.lerp_update_factor);

      });
    }

    var _update_method = UpdateLerpMethod;

    /**
     * @property {THREE.Camera} camera
     * @property {number} lerp_track_factor - [0-1] - 0.01 by default. Helps filter out bad poses. The new target tranform is an interpolation by this factor of the last tranform and the tranform given by a 'Track' call.
     * @property {number} lerp_update_factor - [0-1] - 0.3 by default. The object's transform gets closer to the target transform, by this factor, at each 'Update' call.
     * @property {number} damping_factor - [0-1] - 0.9 by default. Successive calls of 'Track' creates a momentum, that needs to be damped, otherwise it creates a yoyo effect.
     * @property {number} timeout - 6 by default. Time before an object enabled gets disabled, in seconds.
     */
    this.camera = parameters.camera;

    this.lerp_track_factor = parameters.lerp_track_factor || 0.01;
    this.lerp_update_factor = parameters.lerp_update_factor || 0.3;
    this.damping_factor = parameters.damping_factor || 0.9;

    this.timeout = parameters.timeout || 6;

    /**
     * Adds an object
     * @param {THREE.Object3D} object - Starts disabled.
     * @param {value} uuid
     * @param {function} [on_enable] - Function called when the object is tracked and was disabled before.
     * @param {function} [on_disable] - Function called when the object isnt tracked for "timeout" seconds.
     */
    this.Add = function(object, uuid, on_enable, on_disable) {
      _holder.Add(object, uuid, on_enable, on_disable);
    };

    /**
     * Remove an object
     * @param {value}
     */
    this.Remove = function(uuid) {
      _holder.Remove(uuid);
    };

    /**
     * Clear all the objects
     */
    this.Clear = function() {
      _holder.Clear();
    };

    /**
     * Updates the objects tranforms
     */
    this.Update = function() {

      _holder.UpdateElapsed(_clock.getDelta());
      _holder.CheckTimeout(that.timeout);

      _update_method();
    };

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {THREE.Matrix4} matrix
     */
    this.Track = function() {

      var new_matrix = new THREE.Matrix4();
      var tmp_pos = new THREE.Vector3();
      var tmp_qtn = new THREE.Quaternion();
      var tmp_scl = new THREE.Vector3();

      return function(uuid, matrix) {

        if (that.camera) {

          var elem = _holder.Get(uuid);
          if (elem) {
            var target = elem.target;

            new_matrix.copy(that.camera.matrixWorld);
            new_matrix.multiply(matrix);

            if (elem.enabled) {
              new_matrix.decompose(tmp_pos, tmp_qtn, tmp_scl);
              elem.inter_track.Update(tmp_pos, tmp_qtn, tmp_scl, that.lerp_track_factor, that.damping_factor);
            }
            else {
              new_matrix.decompose(target.position, target.quaternion, target.scale);
              new_matrix.decompose(elem.object.position, elem.object.quaternion, elem.object.scale);
              elem.inter_track.Init(target.position, target.quaternion, target.scale);
            }

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

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {THREE.Vector3} position
     * @param {THREE.Quaternion} quaternion
     * @param {THREE.Vector3} scale
     */
    this.TrackCompose = function() {

      var matrix = new THREE.Matrix4();

      return function(uuid, position, quaternion, scale) {

        matrix.compose(position, quaternion, scale);

        return that.Track(uuid, matrix);
      };
    }();

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {number[]} translation_pose
     * @param {number[][]} rotation_pose
     * @param {number} model_size
     */
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

    /**
     * Returns an object held by this
     * @param {value} uuid
     */
    this.GetObject = function(uuid) {
      var elem = _holder.get(uuid);
      if (elem) {
        return elem.object;
      }
      return undefined;
    };

    /**
    * Moves all enabled objects
    * @param {THREE.Vector3} vec
    */
    this.MoveEnabledObjects = function(vec) {
      _holder.ForEach(function(elem) {
        if (elem.enabled) {
          elem.target.position.add(vec);
          elem.object.position.add(vec);
        }
      });
    };


  };


  function Holder() {
    this._objects = {};
  }

  Holder.prototype.Add = function(object, uuid, on_enable, on_disable) {

    var obj =
    {
      object: object,
      target:
      {
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      },
      inter_track: new TransformInterpolationComputer(),
      elapsed: 0,
      on_enable: on_enable,
      on_disable: on_disable,
      enabled: false
    };

    obj.inter_track.Init(object.position, object.quaternion, object.scale);

    this._objects[uuid] = obj;
  };

  Holder.prototype.Remove = function(uuid) {
    var elem = this._objects[uuid];

    if (elem.enabled) {
      if (elem.on_disable)
        elem.on_disable(elem.object);
    }
    delete this._objects[uuid];
  };

  Holder.prototype.Clear = function() {
    for (var uuid in this._objects)
      this.Remove(uuid);
  };

  Holder.prototype.Track = function(uuid) {

    var elem = this._objects[uuid];

    elem.elapsed = 0;

    if (!elem.enabled) {
      elem.enabled = true;
      if (elem.on_enable)
        elem.on_enable(elem.object);
    }
  };

  Holder.prototype.UpdateElapsed = function(elapsed) {
    for (var uuid in this._objects) {

      this._objects[uuid].elapsed += elapsed;
    }
  };

  Holder.prototype.CheckTimeout = function(timeout) {

    for (var uuid in this._objects) {

      var elem = this._objects[uuid];

      if (elem.enabled && elem.elapsed > timeout) {
        if (elem.on_disable)
          elem.on_disable(elem.object);
        elem.enabled = false;
      }
    }
  };

  Holder.prototype.ForEach = function(fun) {
    for (var uuid in this._objects) {
      fun(this._objects[uuid]);
    }
  };

  Holder.prototype.Get = function(uuid) {
    return this._objects[uuid];
  };


  var qtn_zero = new THREE.Quaternion();
  var tmp_pos = new THREE.Vector3();
  var tmp_qtn = new THREE.Quaternion();
  var tmp_scl = new THREE.Vector3();

  function TransformInterpolationComputer() {
    this.pos = null;
    this.d_pos = new THREE.Vector3();
    this.qtn = null;
    this.d_qtn = new THREE.Quaternion();
    this.scl = null;
    this.d_scl = new THREE.Vector3();
  }

  TransformInterpolationComputer.prototype.Init = function(position, quaternion, scale) {
    this.pos = position;
    this.d_pos.set(0, 0, 0);
    this.qtn = quaternion;
    this.d_qtn.set(0, 0, 0, 1);
    this.scl = scale;
    this.d_scl.set(0, 0, 0);
  };

  TransformInterpolationComputer.prototype.Update = function(position, quaternion, scale, interpolation, damping) {
    tmp_pos.subVectors(position, this.pos);
    tmp_pos.multiplyScalar(interpolation);
    this.d_pos.add(tmp_pos);

    tmp_qtn.copy(this.qtn);
    tmp_qtn.inverse();
    tmp_qtn.multiply(quaternion);
    tmp_qtn.slerp(qtn_zero, 1 - interpolation);
    this.d_qtn.multiply(tmp_qtn);

    tmp_scl.subVectors(scale, this.scl);
    tmp_scl.multiplyScalar(interpolation);
    this.d_scl.add(tmp_scl);

    this.pos.add(this.d_pos);
    this.qtn.multiply(this.d_qtn);
    this.scl.add(this.d_scl);

    this.d_pos.multiplyScalar(damping);
    this.d_qtn.slerp(qtn_zero, 1 - damping);
    this.d_scl.multiplyScalar(damping);
  };


})();