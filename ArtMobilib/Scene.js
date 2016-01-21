/*********************

Scene

A class to handle a THREE.Scene, with a unique camera,
and that can Load a scene from a JSON file,
and place objects according to geographic coordinates.


Constructor

Scene(parameters)
parameters: holds optionnal parameters
parameters.canvas: canvas used for rendering
parameters.fov: sets the fov of the camera
parameters.gps_converter: a GeographicCoordinatesConverter used to import objects with gps coordinates


Methods

SetFullWindow()
Resizes the canvas when the window resizes

StopFullWindow()
Stops resizing the canvas

Render()

Update()
Updates animations and textures (video, gif)

AddObject(object)
Adds an object to the scene. If possible, places the object occordingly to the geographic coordinates

RemoveObject(object)

Clear()
Clears the scene.

Parse(json, on_load_assets)
Loads a scene from a JSON structure. no-op if ObjectLoaderAM is unavailable.
When every asset is loaded and added to the scene, 'on_load_assets' is called.

Load(url, on_load_assets)
Loads a scene from json file. no-op if ObjectLoaderAM is unavailable.
When every asset is loaded and added to the scene, 'on_load_assets' is called.

GetCamera()
Returns the camera, a THREE.PerspectiveCamera, and a child of cameraBody.

GetCameraBody()
Returns the cameraBody, a THREE.Object3D, parent of the camera, and on the scene.

GetScene()

GetRenderer()

ResizeRenderer()
Resizes the renderer, and updates the camera

Dependency

three.js

Optionnal: GeographicCoordinatesConverter, ObjectLoaderAM

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
  var _obj_loader;
  var _loading_manager = new THREE.LoadingManager();


  _camera_body.add(_camera);

  _three_scene.add(_camera_body);

  if (!parameters.canvas) {
    _renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(_renderer.domElement);
  }
  _renderer.setClearColor(0x9999cf, 0);

  if (typeof ObjectLoaderAM != 'undefined')
    _obj_loader = new ObjectLoaderAM(_loading_manager);


  this.gps_converter = parameters.gps_converter;


  this.Clear = function() {
    _three_scene.children = [];
    _three_scene.copy(new THREE.Scene(), false);
  };

  this.SetFullWindow = function() {
    function onWindowResize() {
      _camera.aspect = window.innerWidth / window.innerHeight;
      _camera.updateProjectionMatrix();

      _renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);
  };

  this.StopFullWindow = function() {
    window.removeEventListener('resize', onWindowResize, false);
  };

  this.Render = function() {
    _renderer.render(_three_scene, _camera);
  };

  this.Update = function() {

    var clock = new THREE.Clock();

    return function() {

      var update_callbacks = _obj_loader.GetOnUpdateCallbacks();

      for (callback of update_callbacks) {
        callback();
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

  var OnLoadThreeScene = function(on_load_assets) {
    return function(new_scene) {

      function OnLoadAssets() {
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

        if (on_load_assets)
          on_load_assets();
      }

      _loading_manager.onLoad = OnLoadAssets;

    };
  };

  this.Parse = function(json, on_load_assets) {
    if (_obj_loader) {

      var on_load_scene = new OnLoadThreeScene(on_load_assets);

      var new_scene = _obj_loader.parse(json);

      on_load_scene(new_scene);
    }
    else
      console.warn('Scene: Parse failed: ObjectLoaderAM undefined');
  };

  this.Load = function(url, on_load_assets) {
    if (_obj_loader) {

      _obj_loader.Load(url, new OnLoadThreeScene(on_load_assets));

    }
    else
      console.warn('Scene: Load failed: ObjectLoaderAM undefined');
  };


  this.GetCamera = function() {
    return _camera;
  };

  this.GetCameraBody = function() {
    return _camera_body;
  };

  this.GetScene = function() {
    return _three_scene;
  };

  this.GetRenderer = function() {
    return _renderer;
  };

  this.ResizeRenderer = function(width, height) {
    _renderer.setSize(width, height);
    _camera.aspect = _renderer.domElement.width / _renderer.domElement.height;
    _camera.updateProjectionMatrix();
  }

  function MoveObjectToGPSCoords(object) {
    if (that.gps_converter) {

      if (object.userData !== undefined && object.position !== undefined) {
        var data = object.userData;

        if (data.latitude !== undefined && data.longitude !== undefined) {
          object.position.copy(that.gps_converter.GetLocalCoordinatesFromDegres(data.latitude, data.longitude));
        }
        if (data.altitude !== undefined) {
          object.position.y = data.altitude;
        }
      }

    }
  }
  
};


if (typeof(ObjectLoaderAM) == 'undefined')
  console.warn('Scene: ObjectLoaderAM undefined');