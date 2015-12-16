/*********************

Scene

A class to handle a THREE.Scene, with a unique camera,
and that can load a scene from a JSON file,
and place objects according to geographic coordinates.


Constructor

Scene(parameters)


Methods

init()
Init event listerners

stop()
Clear event listeners

render()

update()
Update animations and textures (video, gif)

addObject(object)
Add an object to the scene. If possible, place the object occordingly to the geographic coordinates

removeObject()

clear()
Clear the scene.

parse(json)
Load a scene from a JSON structure. no-op if ObjectLoaderAM is unavailable.

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

  var m_renderer = new THREE.WebGLRenderer( { alpha: true, canvas: parameters.canvas } );
  var m_threeScene = new THREE.Scene();
  var m_camera = new THREE.PerspectiveCamera(parameters.fov || 80,
    m_renderer.domElement.width / m_renderer.domElement.height, 0.1, 10000);
  var m_cameraBody = new THREE.Object3D();
  var m_updateFctns = [];
  var m_geoConverter;


  m_cameraBody.add(m_camera);

  m_threeScene.add(m_cameraBody);

  if (!parameters.canvas)
    m_renderer.setSize(window.innerWidth, window.innerHeight);
  m_renderer.setClearColor(0x9999cf, 0);
  document.body.appendChild(m_renderer.domElement);

  if (typeof Math.GeoToCoordsConverter != 'undefined')
    m_geoConverter = new Math.GeoToCoordsConverter(43.7141516, 7.2889739);
  else
    console.warn('Scene: GeoToCoordsConverter undefined');


  this.clear = function() {
    m_threeScene.children = [];
    m_threeScene.copy(new THREE.Scene(), false);
  };

  this.init = function() {
    function onWindowResize() {
      m_camera.aspect = window.innerWidth / window.innerHeight;
      m_camera.updateProjectionMatrix();

      m_renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);
  };

  this.stop = function() {
    window.removeEventListener('resize', onWindowResize, false);
  }

  this.render = function() {
    m_renderer.render(m_threeScene, m_camera);
  };

  this.update = function() {

    var clock = new THREE.Clock();

    return function() {
      for (i = 0, c = m_updateFctns.length; i < c; ++i) {
        m_updateFctns[i]();
      }
      if (THREE.AnimationHandler)
        THREE.AnimationHandler.update(clock.getDelta());
    }
  }();

  this.addObject = function(object) {
    if (m_geoConverter) {
      if (object.userData !== undefined && object.position !== undefined) {
        var data = object.userData;

        if (data.latitude !== undefined && data.longitude !== undefined) {
          object.position.copy(m_geoConverter.getCoords(data.latitude, data.longitude));
        }
        if (data.altitude !== undefined) {
          object.position.y = data.altitude;
        }
      }
    }
    m_threeScene.add(object);
  };

  this.removeObject = function(object) {
    m_threeScene.remove(object);
  };


  this.parse = function() {

    if (typeof ObjectLoaderAM != 'undefined') {
      var objLoader = new ObjectLoaderAM(onUpdate);
      objLoader.onAdd(that.addObject);
    }
    else
      console.warn('Scene: ObjectLoaderAM undefined');

    return function(json) {

      if (objLoader) {
        var newScene = objLoader.parse(json);
        m_threeScene.copy(newScene, false);
      }
    }
  }();


  this.getCamera = function() {
    return m_camera;
  };

  this.getCameraBody = function() {
    return m_cameraBody;
  };

  this.getScene = function() {
    return m_threeScene;
  }

  this.getCanvas = function() {
    return m_renderer.domElement;
  };

  function onUpdate(fctn) {
    m_updateFctns.push(fctn);
  }
};