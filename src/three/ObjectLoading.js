/*********************


AMTHREE.ObjectsLoader

A loader for loading a JSON resource
A THREE.ObjectLoader edited to support .GIF, .MP4 as textures,
and can load OBJ models and Collada models.


Dependency:

three.js,
ColladaLoader.js,
OBJLoader.js,
OBJMTLLoader.js,
libgif.js


Known bugs:

Cant use the same animated texture on two objects


*********************/


var AMTHREE = AMTHREE || {};


(function() {

  function CreateConstants(json, root) {
    json = json || {};

    var constants = {};

    if (root)
      constants.asset_path = root + '/';
    else
      constants.asset_path = '';
    constants.asset_path += (json.asset_path) ? (json.asset_path + '/') : '';
    constants.image_path = constants.asset_path + ((json.image_path) ? json.image_path : '');
    constants.video_path = constants.asset_path + ((json.video_path) ? json.video_path : '');
    constants.model_path = constants.asset_path + ((json.model_path) ? json.model_path : '');
    constants.sound_path = constants.asset_path + ((json.sound_path) ? json.sound_path : '');

    return constants;
  }

  function CreateMaterials(json, textures) {

    var materials = {};

    if (json instanceof Array) {
      var loader = new THREE.MaterialLoader();
      loader.setTextures(textures);

      for (var i = 0, l = json.length; i < l; i++) {
        var material = loader.parse(json[i]);
        materials[material.uuid] = material;
      }
    }
    else {
      console.log('materials parsing failed: json not an array');
    }

    return materials;
  }

  function CreateAnimations(json) {

    var animations = [];

    if (json instanceof Array) {
      for (var i = 0; i < json.length; i++) {
        var clip = THREE.AnimationClip.parse(json[i]);
        animations.push(clip);
      }
    }
    else {
      console.log('animations parsing failed: json not an array');
    }

    return animations;
  }

  function CreateSounds(json, path) {

    var sounds = {};

    if (json instanceof Array) {

      for (var i = 0, c = json.length; i < c; ++i) {
        var sound = json[i];

        if (sound.uuid === undefined)
          console.warn('failed to parse sound: no "uuid" specified for sound ' + i);
        else if (sound.url === undefined)
          console.warn('failed to parse sound: no "url" specified for sound ' + i);
        else {
          var elem = new AMTHREE.Sound(sound.uuid, path + '/' + sound.url);

          sounds[sound.uuid] = elem;
        }
      }

    }
    return sounds;
  }

  function ParseImages(json, path) {
    return new Promise(function(resolve, reject) {
      var images = {};
      if (json instanceof Array) {

        return Promise.all(json.map(function(image_json) {

          return new Promise(function(resolve, reject) {
            if (image_json.url === undefined)
              reject('failed to parse image: no "url" specified for image ' + i);
            else if (image_json.uuid === undefined)
              reject('failed to parse image: no "uuid" specified for image ' + i);
            else {
              var image = new AMTHREE.Image(image_json.uuid, path + '/' + image_json.url);
              images[image.uuid] = image;
              resolve();
            }
          });


        })).then(resolve(images), reject);

      }
      else {
        reject('images parsing failed: json not an array');
      }
    });
  }

  function CreateVideos(json, path) {
    var videos = {};

    if (json instanceof Array) {

      for (var i = 0, c = json.length; i < c; i++) {
        var video = json[i];

        if (video.uuid === undefined)
          console.warn('failed to parse video: no "uuid" specified for video ' + i);
        else if (video.url === undefined)
          console.warn('failed to parse video: no "url" specified for video ' + i);
        else {
          var elem = new AMTHREE.Video(video.uuid, path + '/' + video.url);

          videos[video.uuid] = elem;
        }

      }
    }
    return videos;
  }

  function ParseThreeConstant(value) {
    if (typeof value === 'number') return value;
    console.warn('AMTHREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value);
    return THREE[value];
  }

  function CreateTextures(json, images, videos) {

    var textures = {};

    if (typeof SuperGif === 'undefined')
      console.warn('AMTHREE.ObjectLoading: SuperGif is undefined');


    if (typeof json !== 'undefined') {
      for (var i = 0, l = json.length; i < l; i++) {
        var data = json[i];
        var texture = undefined;

        if (!data.uuid) {
          console.warn('failed to parse texture ' + i + ': no uuid provided');
        }
        if (data.image === undefined && data.video === undefined ) {
          console.warn('failed to parse texture: no "image" nor "video" specified for ' + data.uuid);
          continue;
        }


        if (data.image !== undefined) {
          if (images[data.image] === undefined) {
            console.warn('failed to parse texture ' + data.uuid + ': undefined image', data.image);
            continue;
          }

          var image = images[data.image];

          if (data.animated !== undefined && data.animated) {
            if (typeof SuperGif == 'undefined')
              continue;
            texture = new AMTHREE.GifTexture(image);
          } else {
            texture = new AMTHREE.ImageTexture(image);
            texture.needsUpdate = true;
          }
        }
        else {
          if (videos[data.video] === undefined ) {
            console.warn('failed to parse texture ' + data.uuid + ': undefined video', data.video);
            continue;
          }

          var video = videos[data.video];
          texture = new AMTHREE.VideoTexture(video, data.width, data.height, data.loop, data.autoplay);
        }

        texture.uuid = data.uuid;

        if (data.name !== undefined) texture.name = data.name;
        if (data.mapping !== undefined) texture.mapping = ParseThreeConstant(data.mapping);
        if (data.offset !== undefined) texture.offset = new THREE.Vector2(data.offset[0], data.offset[1]);
        if (data.repeat !== undefined) texture.repeat = new THREE.Vector2(data.repeat[0], data.repeat[1]);
        if (data.minFilter !== undefined) texture.minFilter = ParseThreeConstant(data.minFilter);
        else texture.minFilter = THREE.LinearFilter;
        if (data.magFilter !== undefined) texture.magFilter = ParseThreeConstant(data.magFilter);
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;
        if (Array.isArray(data.wrap)) {

          texture.wrapS = ParseThreeConstant(data.wrap[0]);
          texture.wrapT = ParseThreeConstant(data.wrap[1]);

        }

        textures[data.uuid] = texture;

      }

    }

    return textures;
  }

  function CreateGeometries(json) {
    var geometries = {};

    if (typeof json !== 'undefined') {

      var geometry_loader = new THREE.JSONLoader();
      var buffer_geometry_loader = new THREE.BufferGeometryLoader();

      for (var i = 0, l = json.length; i < l; i++) {

        var data = json[i];

        var geometry;

        switch (data.type) {

          case 'PlaneGeometry':
          case 'PlaneBufferGeometry':

          geometry = new THREE[data.type](
            data.width,
            data.height,
            data.widthSegments,
            data.heightSegments
            );

          break;

          case 'BoxGeometry':
          case 'CubeGeometry':
          geometry = new THREE.BoxGeometry(
            data.width,
            data.height,
            data.depth,
            data.widthSegments,
            data.heightSegments,
            data.depthSegments
            );

          break;

          case 'CircleBufferGeometry':

          geometry = new THREE.CircleBufferGeometry(
            data.radius,
            data.segments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'CircleGeometry':

          geometry = new THREE.CircleGeometry(
            data.radius,
            data.segments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'CylinderGeometry':

          geometry = new THREE.CylinderGeometry(
            data.radiusTop,
            data.radiusBottom,
            data.height,
            data.radialSegments,
            data.heightSegments,
            data.openEnded,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'SphereGeometry':

          geometry = new THREE.SphereGeometry(
            data.radius,
            data.widthSegments,
            data.heightSegments,
            data.phiStart,
            data.phiLength,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'SphereBufferGeometry':

          geometry = new THREE.SphereBufferGeometry(
            data.radius,
            data.widthSegments,
            data.heightSegments,
            data.phiStart,
            data.phiLength,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'DodecahedronGeometry':

          geometry = new THREE.DodecahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'IcosahedronGeometry':

          geometry = new THREE.IcosahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'OctahedronGeometry':

          geometry = new THREE.OctahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'TetrahedronGeometry':

          geometry = new THREE.TetrahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'RingGeometry':

          geometry = new THREE.RingGeometry(
            data.innerRadius,
            data.outerRadius,
            data.thetaSegments,
            data.phiSegments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'TorusGeometry':

          geometry = new THREE.TorusGeometry(
            data.radius,
            data.tube,
            data.radialSegments,
            data.tubularSegments,
            data.arc
            );

          break;

          case 'TorusKnotGeometry':

          geometry = new THREE.TorusKnotGeometry(
            data.radius,
            data.tube,
            data.radialSegments,
            data.tubularSegments,
            data.p,
            data.q,
            data.heightScale
            );

          break;

          case 'BufferGeometry':

          geometry = buffer_geometry_loader.parse(data);

          break;

          case 'Geometry':

          geometry = geometry_loader.parse(data.data, this.texturePath).geometry;

          break;

          default:

          console.warn('AMTHREE.ObjectLoader: Unsupported geometry type "' + data.type + '"');

          continue;

        }

        geometry.uuid = data.uuid;

        if (data.name !== undefined) geometry.name = data.name;

        geometries[data.uuid] = geometry;

      }

    }

    return geometries;
  }

  function LoadFile(url, parser, path) {
    return new Promise(function(resolve, reject) {

      var loader = new AM.JsonLoader();

      loader.Load(url, function() {
        parser(loader.json, path).then(resolve, reject);
      }, function() {
        reject('failed to load object: ' + url);
      });

    });
  }

  function Load(url, path) {
    return LoadFile(url, Parse, path);
  }

  function LoadArray(url, path) {
    return LoadFile(url, ParseArray, path);
  }

  function ParseResources(json, path) {
    var constants = CreateConstants(json.constants, path);

    return ParseImages(json.images || [], constants.image_path).then(function(images) {

      var sounds = CreateSounds(json.sounds || [], constants.sound_path);
      var videos = CreateVideos(json.videos || [], constants.video_path);
      var textures = CreateTextures(json.textures || [], images, videos);
      var animations = CreateAnimations(json.animations || []);
      var materials = CreateMaterials(json.materials || [], textures);
      var geometries = CreateGeometries(json.geometries || []);

      var resources = {
        constants:  constants,
        videos:     videos,
        images:     images,
        sounds:     sounds,
        textures:   textures,
        animations: animations,
        materials:  materials,
        geometries: geometries
      };

      return resources;
    });
  }

  function Parse(json, path) {
    return ParseResources(json, path).then(function(res) {
      return ParseObject(json.object, res.materials, res.geometries, res.sounds, res.constants.model_path)
      .then(function(object) {

        object.animations = res.animations;
        return object;

      });
    });
  }

  function ParseArray(json, path) {
    return ParseResources(json, path).then(function(res) {

      return ParseObjectArray(json.objects, res.materials,
        res.geometries, res.sounds, res.constants.model_path);

    });
  }

  function ParseObjectPostLoading(object, json, materials, geometries, sounds, model_path) {
    var matrix = new THREE.Matrix4();

    object.uuid = json.uuid;

    if (json.name !== undefined) object.name = json.name;
    if (json.matrix !== undefined) {

      matrix.fromArray(json.matrix);
      matrix.decompose(object.position, object.quaternion, object.scale);

    } else {

      if (json.position !== undefined) object.position.fromArray(json.position);
      if (json.rotation !== undefined) object.rotation.fromArray(json.rotation);
      if (json.scale !== undefined) object.scale.fromArray(json.scale);
      if (json.scaleXYZ !== undefined) {
        object.scale.x *= json.scaleXYZ;
        object.scale.y *= json.scaleXYZ;
        object.scale.z *= json.scaleXYZ;
      }
    }

    if (json.castShadow !== undefined) object.castShadow = json.castShadow;
    if (json.receiveShadow !== undefined) object.receiveShadow = json.receiveShadow;

    if (json.visible !== undefined) object.visible = json.visible;
    if (json.userData !== undefined) object.userData = json.userData;

    if (json.type === 'LOD') {

      var levels = json.levels;

      for (var l = 0; l < levels.length; l++) {

        var level = levels[l];
        var child = object.getObjectByProperty('uuid', level.object);

        if (child !== undefined) {
          object.addLevel(child, level.distance);
        }

      }
    }

    if (json.children !== undefined) {
      return ParseObjectArray(json.children, materials, geometries, sounds, model_path).then(function(array) {
        for (var i = 0, c = array.length; i < c; ++i) {
          object.add(array[i]);
        }
        return object;
      });
    }
    else
      return Promise.resolve(object);
  }

  function GetGeometry(name, geometries) {
    if (geometries[name] !== undefined)
      return geometries[name];
    else {
      if (name === undefined)
        console.warn('failed to get geometry: no id provided');
      else
        console.warn('failed to get geometry: no such geometry: ' + name);
    }
    return undefined;
  }

  function GetMaterial(name, materials) {
    if (materials[name] !== undefined)
      return materials[name];
    else {
      if (name === undefined)
        console.warn('failed to get material: no id provided');
      else
        console.warn('failed to get material: no such material: ' + name);
    }
    return undefined;
  }

  function GetSound(name, sounds) {
    if (sounds[name] !== undefined)
      return sounds[name];
    else {
      if (name === undefined)
        console.warn('failed to get sound: no id provided');
      else
        console.warn('failed to get sound: no such sound: ' + name);
    }
    return undefined;
  }

  function ParseObject(json, materials, geometries, sounds, model_path) {
    var object, url;

    switch (json.type) {

      case 'OBJ':
      if (THREE.OBJLoader) {
        var obj_loader = new THREE.OBJLoader();

        url = model_path + '/' + json.url;
        obj_loader.load(url, function(object) {

          object.traverse(function(child) {
            if (child.geometry) child.geometry.computeBoundingSphere();
          });

          ParseObjectPostLoading(object, json, materials, geometries, sounds, model_path).then(resolve, reject);

        });
      }
      else {
        reject('failed to load ' + json.uuid + ': THREE.OBJLoader is undefined');
      }
      return;
      break;

      case 'OBJMTL':
      if (THREE.OBJMTLLoader) {
        var obj_mtl_loader = new THREE.OBJMTLLoader();

        var obj_url = model_path + '/' + json.objUrl;
        var mtl_url = model_path + '/' + json.mtlUrl;
        obj_mtl_loader.load(obj_url, mtl_url, function(object) {

          object.traverse(function(child) {
            if (child.geometry) child.geometry.computeBoundingSphere();
          });

          ParseObjectPostLoading(object, json, materials, geometries, sounds, model_path).then(resolve, reject);

        });
      }
      else {
        reject('failed to load ' + json.uuid + ': THREE.OBJMTLLoader is undefined');
      }
      return;
      break;

      case 'Collada':
      if (THREE.ColladaLoader) {
        var collada_loader = new THREE.ColladaLoader();
        collada_loader.options.convertUpAxis = true;

        url = model_path + '/' + json.url;
        collada_loader.load(url, function(collada) {

          var object = collada.scene;
          ParseObjectPostLoading(object, json, materials, geometries, sounds, model_path).then(resolve, reject);

        });
      }
      else {
        reject('failed to load ' + json.uuid + ': THREE.ColladaLoader is undefined');
      }
      return;
      break;

      case 'SoundObject':
      object = new AMTHREE.SoundObject(GetSound(json.sound, sounds));
      break;

      case 'Scene':
      object = new THREE.Scene();
      break;

      case 'PerspectiveCamera':
      object = new THREE.PerspectiveCamera( json.fov, json.aspect, json.near, json.far );
      break;

      case 'OrthographicCamera':
      object = new THREE.OrthographicCamera( json.left, json.right, json.top, json.bottom, json.near, json.far );
      break;

      case 'AmbientLight':
      object = new THREE.AmbientLight( json.color );
      break;

      case 'DirectionalLight':
      object = new THREE.DirectionalLight( json.color, json.intensity );
      break;

      case 'PointLight':
      object = new THREE.PointLight( json.color, json.intensity, json.distance, json.decay );
      break;

      case 'SpotLight':
      object = new THREE.SpotLight( json.color, json.intensity, json.distance, json.angle, json.exponent, json.decay );
      break;

      case 'HemisphereLight':
      object = new THREE.HemisphereLight( json.color, json.groundColor, json.intensity );
      break;

      case 'Mesh':
      object = new THREE.Mesh( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ) );
      break;

      case 'LOD':
      object = new THREE.LOD();
      break;

      case 'Line':
      object = new THREE.Line( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ), json.mode );
      break;

      case 'PointCloud': case 'Points':
      object = new THREE.Points( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ) );
      break;

      case 'Sprite':
      object = new THREE.Sprite( GetMaterial( json.material, materials ) );
      break;

      case 'Group':
      object = new THREE.Group();
      break;

      default:
      object = new THREE.Object3D();
    }

    return ParseObjectPostLoading(object, json, materials, geometries, sounds, model_path);
  }

  function ParseObjectArray(json, materials, geometries, sounds, model_path) {
    if (json instanceof Array) {
      return Promise.all(json.map(function(elem) {

        return ParseObject(elem, materials, geometries, sounds, model_path);

      }));
    }
    else
      return Promise.reject('failed to parse object array: json not an array');
  }

  function NormalizeObject(object) {
    var box = new THREE.Box3();
    var sphere = new THREE.Sphere();
    var mesh = new THREE.Object3D();

    mesh.add(elem);

    box.setFromObject(elem);
    box.getBoundingSphere(sphere);

    mesh.scale.multiplyScalar(1 / sphere.radius);

    sphere.center.divideScalar(sphere.radius);
    mesh.position.sub(sphere.center);

    var parent = new THREE.Object3D();
    parent.add(mesh);

    return parent;
  }


  if (typeof THREE !== 'undefined') {

    /**
    * @function
    * @description Parses a json into an object.
    * @param {object} json - the json structure
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<THREE.Object3D, string>} a promise
    */
    AMTHREE.ParseObject = Parse;

    /**
    * @function
    * @description Parses a json into an array of objects.
    * @param {object} json - the json structure
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<Array.<THREE.Object3D>, string>} a promise
    */
    AMTHREE.ParseObjectArray = ParseArray;

    /**
    * @function
    * @description Loads a json file describing an object.
    * @param {string} url
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<THREE.Object3D, string>} a promise
    */
    AMTHREE.LoadObject = Load;

    /**
    * @function
    * @description Loads a json file describing an array of objects.
    * @param {string} url
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<Array.<THREE.Object3D>, string>} a promise
    */
    AMTHREE.LoadObjectArray = LoadArray;

    /**
    * @function
    * @description Moves and rescales an object so that it is contained in a sphere of radius 1, centered on the origin.
    * @param {THREE.Object3D} the source object
    * @returns {THREE.Object3D} an object containing the source
    */
    AMTHREE.NormalizeObject = NormalizeObject;

  }
  else {
  }

})();