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

var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {


  AMTHREE.Scene = function(parameters) {
    if (typeof AMTHREE.ObjectLoader === 'undefined')
      console.warn('AMTHREE.Scene: AMTHREE.ObjectLoader undefined');

    parameters = parameters || {};

    var that = this;

    var _renderer = new THREE.WebGLRenderer( { alpha: true, canvas: parameters.canvas } );
    var _three_scene = new THREE.Scene();
    var _camera = new THREE.PerspectiveCamera(parameters.fov || 80,
      _renderer.domElement.width / _renderer.domElement.height, 0.0001, 10000);
    var _camera_body = new THREE.Object3D();
    var _obj_loader;
    var _loading_manager = new THREE.LoadingManager();


    _camera_body.add(_camera);

    _three_scene.add(_camera_body);

    if (!parameters.canvas) {
      _renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(_renderer.domElement);
    }
    _renderer.setClearColor(0x9999cf, 0);

    if (typeof AMTHREE.ObjectLoader !== 'undefined')
      _obj_loader = new AMTHREE.ObjectLoader(_loading_manager);


    this.gps_converter = parameters.gps_converter;


    this.Clear = function() {
      _three_scene.children = [];
      _three_scene.copy(new THREE.Scene(), false);
    };

    function OnWindowResize() {
      _camera.aspect = window.innerWidth / window.innerHeight;
      _camera.updateProjectionMatrix();

      _renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.SetFullWindow = function() {
      window.addEventListener('resize', OnWindowResize, false);
      OnWindowResize();
    };

    this.StopFullWindow = function() {
      window.removeEventListener('resize', OnWindowResize, false);
    };

    this.Render = function() {
      _renderer.render(_three_scene, _camera);
    };

    this.Update = function() {

      var clock = new THREE.Clock();

      return function() {

        var update_callbacks = _obj_loader.GetOnUpdateCallbacks();
        for (var i = 0, c = update_callbacks.length; i < c; ++i)
          update_callbacks[i]();

        if (THREE.AnimationHandler)
          THREE.AnimationHandler.update(clock.getDelta());

        _three_scene.traverse(function(o) {
          if (o instanceof THREE.Mesh) {
            if (o.material && o.material.map && o.material.map.update) {
              o.material.map.update();
            }
          }
        });
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

        var OnLoadAssets = function(new_scene) {
          return function() {
            while(new_scene.children.length) {
              var child = new_scene.children[0];
              new_scene.remove(child);
              that.AddObject(child);
            }
            _three_scene.copy(new_scene, false);


            AMTHREE.PlayAnimations(_three_scene);

            if (on_load_assets)
              on_load_assets();

          }
        }(new_scene);

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
        console.warn('AMTHREE.Scene: Parse failed: AMTHREE.ObjectLoader undefined');
    };

    this.Load = function(url, on_load_assets) {
      if (_obj_loader)
        _obj_loader.Load(url, new OnLoadThreeScene(on_load_assets));
      else
        console.warn('AMTHREE.Scene: Load failed: AMTHREE.ObjectLoader undefined');
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
    };

    function MoveObjectToGPSCoords(object) {
      if (that.gps_converter) {

        if (object.userData !== undefined && object.position !== undefined) {
          var data = object.userData;

          if (data.latitude !== undefined && data.longitude !== undefined) {
            var pos = that.gps_converter(data.latitude, data.longitude);
            object.position.z = pos.y;
            object.position.x = pos.x;
          }
          if (data.altitude !== undefined) {
            object.position.y = data.altitude;
          }
        }

      }
    }


  };


}
else
  console.warn('Scene.js: THREE undefined');