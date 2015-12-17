/*********************

Scene

A class to handle a THREE.Scene, with a unique camera,
and that can Load a scene from a JSON file,
and place objects according to geographic coordinates.


Constructor

Scene(parameters)


Methods

Init()
Init event listerners

Stop()
Clear event listeners

Render()

Update()
Update animations and textures (video, gif)

AddObject(object)
Add an object to the scene. If possible, place the object occordingly to the geographic coordinates

RemoveObject()

Clear()
Clear the scene.

Parse(json)
Load a scene from a JSON structure. no-op if ObjectLoaderAM is unavailable.

Load(url)
Load a json file then call Parse on the generated JSON structure.

getCamera()
Returns the camera, a THREE.PerspectiveCamera, and a child of cameraBody.

getCameraBody()
Returns the cameraBody, a THREE.Object3D, parent of the camera, and on the scene.

getScene()

getCanvas()


Dependency

three.js

Optionnal: Math.GeoToCoordsConverter, ObjectLoaderAM

**********************/


Scene = function(parameters) {
  parameters = parameters || {};

  var that = this;

  var _renderer = new THREE.WebGLRenderer( { alpha: true, canvas: parameters.canvas } );
  var _three_scene = new THREE.Scene();
  var _camera = new THREE.PerspectiveCamera(parameters.fov || 80,
    _renderer.domElement.width / _renderer.domElement.height, 0.1, 10000);
  var _camera_body = new THREE.Object3D();
  var _update_callbacks = [];
  var _geo_converter;
  var _obj_loader;
  var _loading_manager = new THREE.LoadingManager();


  _camera_body.add(_camera);

  _three_scene.add(_camera_body);

  if (!parameters.canvas)
    _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.setClearColor(0x9999cf, 0);
  document.body.appendChild(_renderer.domElement);

  if (typeof Math.GeoToCoordsConverter != 'undefined')
    _geo_converter = new Math.GeoToCoordsConverter(43.7141516, 7.2889739);
  else
    console.warn('Scene: GeoToCoordsConverter undefined');

  if (typeof ObjectLoaderAM != 'undefined')
    _obj_loader = new ObjectLoaderAM(_loading_manager);
  else
    console.warn('Scene: ObjectLoaderAM undefined');



  this.Clear = function() {
    _three_scene.children = [];
    _three_scene.copy(new THREE.Scene(), false);
  };

  this.Init = function() {
    function onWindowResize() {
      _camera.aspect = window.innerWidth / window.innerHeight;
      _camera.updateProjectionMatrix();

      _renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);
  };

  this.Stop = function() {
    window.removeEventListener('resize', onWindowResize, false);
  }

  this.Render = function() {
    _renderer.render(_three_scene, _camera);
  };

  this.Update = function() {

    var clock = new THREE.Clock();

    return function() {

      var update_callbacks = _obj_loader.GetOnUpdateCallbacks();

      for (i = 0, c = update_callbacks.length; i < c; ++i) {
        update_callbacks[i]();
      }
      if (THREE.AnimationHandler)
        THREE.AnimationHandler.update(clock.getDelta());
    }
  }();

  this.AddObject = function(object) {
    MoveObjectToGPSCoords(object);
    _three_scene.add(object);
  };

  this.RemoveObject = function(object) {
    _three_scene.remove(object);
  };


  this.Parse = function(json) {

    if (_obj_loader) {
      var new_scene = _obj_loader.parse(json);
      _three_scene.copy(new_scene, false);
    }
  };

  this.Load = function(url, on_load) {
    if (_obj_loader) {

      var on_load_three_scene = function(on_load_cpy) {
        return function(new_scene) {

          _loading_manager.onLoad = function() {
            for(child of new_scene.children) {
              that.AddObject(child);
            }

            _three_scene.copy(new_scene, false);

            _three_scene.traverse( function ( child ) {
              if ( child instanceof THREE.SkinnedMesh ) {
                var animation = new THREE.Animation( child, child.geometry.animation );
                animation.play();
              }
            } );

            if (on_load_cpy)
              on_load_cpy();

          };
        }
      }(on_load);

      _obj_loader.Load(url, on_load_three_scene);

    }
  }


  this.GetCamera = function() {
    return _camera;
  };

  this.GetCameraBody = function() {
    return _camera_body;
  };

  this.GetScene = function() {
    return _three_scene;
  }

  this.GetCanvas = function() {
    return _renderer.domElement;
  };

  function MoveObjectToGPSCoords() {
    if (_geo_converter) {
      if (object.userData !== undefined && object.position !== undefined) {
        var data = object.userData;

        if (data.latitude !== undefined && data.longitude !== undefined) {
          object.position.copy(_geo_converter.getCoords(data.latitude, data.longitude));
        }
        if (data.altitude !== undefined) {
          object.position.y = data.altitude;
        }
      }
    }
  }
};