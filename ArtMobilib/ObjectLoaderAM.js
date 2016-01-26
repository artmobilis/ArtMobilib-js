/**
 * @author mrdoob / http://mrdoob.com/
 */
//

/*********************

Edited for ArtMobilis


ObjectLoaderAM

A loader for loading a JSON resource
A THREE.ObjectLoader edited to support .GIF, .MP4 as textures,
and can load OBJ models and Collada models.


Dependency:

three.js,
ColladaLoader.js,
OBJLoader.js,
OBJMTLLoader.js,
libgif.js


*********************/


ObjectLoaderAM = function ( manager ) {

  var that = this;

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

  this.constants = {};

  this.geometries = {};
  this.materials = {};
  this.animations = [];
  this.images = {};
  this.videos = {};
  this.textures = {};

  this.json = {};


  var _on_update_callbacks = [];


  this.Load = function ( url, on_load_object ) {

    var loader = new THREE.XHRLoader( that.manager );

    loader.load( url, function( on_load_object ) {

      return function ( text ) {

        that.json = JSON.parse( text );

        on_load_object(that.Parse( that.json ));

      };
    }(on_load_object));
  };

  this.Parse = function ( json ) {
    that.json = json;

    that.ParseConstants( json.constants );
    that.ParseGeometries( json.geometries );
    that.ParseImages( json.images );
    that.ParseVideos( json.videos );
    that.ParseTextures( json.textures );
    that.ParseMaterials( json.materials );
    that.ParseAnimations( json.animations );

    var object = that.ParseObject( json.object );

    object.animations = that.animations;

    return object;
  };

  this.ParseConstants = function ( json ) {
    data = (json !== undefined) ? json : {};

    that.constants.asset_path = (data.asset_path !== undefined) ? data.asset_path : ".";
    that.constants.image_path = that.constants.asset_path + '/' + ((data.image_path !== undefined) ? data.image_path : "");
    that.constants.video_path = that.constants.asset_path + '/' + ((data.video_path !== undefined) ? data.video_path : "");
    that.constants.model_path = that.constants.asset_path + '/' + ((data.model_path !== undefined) ? data.model_path : "");
  };

  this.ParseMaterials = function ( json ) {

    if ( json !== undefined ) {

      var loader = new THREE.MaterialLoader();
      loader.setTextures( that.textures );

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var material = loader.parse( json[ i ] );
        that.materials[ material.uuid ] = material;

      }

    }
  };

  this.ParseAnimations = function ( json ) {
    if (json === undefined) return;

    that.animations = [];

    for ( var i = 0; i < json.length; i ++ ) {

      var clip = THREE.AnimationClip.parse( json[i] );

      that.animations.push( clip );

    }
  };

  this.ParseImages = function ( json ) {

    function LoadImage( url ) {

      that.manager.itemStart( url );

      return loader.load( url, function () {

       that.manager.itemEnd( url );

     } );

    }

    if ( json !== undefined && json.length > 0 ) {

      var manager = new THREE.LoadingManager();

      var loader = new THREE.ImageLoader( manager );

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var image = json[ i ];

        if (image.url === undefined)
          console.warn('ObjectLoaderAM: no "url" specified for image ' + i);
        else if (image.uuid === undefined)
          console.warn('ObjectLoaderAM: no "uuid" specified for image ' + i);
        else {

          var url = that.constants.image_path + '/' + image.url;

          that.images[ image.uuid ] = LoadImage( url );
        }
      }
    }
  };

  this.ParseVideos = function ( json ) {

    if ( json !== undefined ) {

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var video = json[ i ];

        if (video.url === undefined)
          console.warn('ObjectLoaderAM: no "url" specified for video ' + i);
        else if (video.uuid === undefined)
          console.warn('ObjectLoaderAM: no "uuid" specified for video ' + i);
        else {

          var data =
          {
            url: that.constants.video_path + '/' + video.url,
            uuid: video.uuid,
            width: video.width || 640,
            height: video.height || 480
          };

          that.videos[ video.uuid ] = data;
        }
      }
    }
  };

  this.ParseTextures = function ( json ) {

    if (typeof SuperGif == 'undefined')
      console.warn('ObjectLoaderAM: SuperGif is undefined');

    function ParseConstant( value ) {

      if ( typeof( value ) === 'number' ) return value;

      console.warn( 'ObjectLoaderAM.parseTexture: Constant should be in numeric form.', value );

      return THREE[ value ];

    }

    if ( json !== undefined ) {

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var data = json[ i ];

        if ( data.image === undefined && data.video === undefined ) {
          console.warn( 'ObjectLoaderAM: No "image" nor "video" specified for', data.uuid );
          continue;
        }


        if ( data.image !== undefined ) {

          if ( that.images[ data.image ] === undefined ) {
            console.warn( 'ObjectLoaderAM: Undefined image', data.image );
            continue;
          }

          var image = that.images[ data.image ];

          if (data.animated !== undefined && data.animated) {

            if (typeof SuperGif == 'undefined')
              continue;

            var img = document.createElement('img');
            var script_tag = document.getElementsByTagName('script');
            script_tag = script_tag[script_tag.length - 1];
            script_tag.parentNode.appendChild(img);

            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            img.src = image.src;

            var anim = new SuperGif( { gif: img, auto_play: true } );
            anim.load();

            var gif_canvas = anim.get_canvas();

            gif_canvas.style.display = 'none';
            
            var texture = new THREE.Texture(gif_canvas);
            texture.needsUpdate = true;

            var updateTexture = function(texture_cpy) {
              return function() {
                texture_cpy.needsUpdate = true;
              }
            }(texture);

            _on_update_callbacks.push(updateTexture);

          } else {
            var texture = new THREE.Texture( image );
            texture.needsUpdate = true;
          }
        }
        else {

          if ( that.videos[ data.video ] === undefined ) {
            console.warn( 'ObjectLoaderAM: Undefined video', data.video );
            continue;
          }

          var video_data = that.videos [ data.video ];

          var video_element = document.createElement('video');
          video_element.width	= video_data.width;
          video_element.height = video_data.height;
          video_element.autoplay = (data.autoplay !== undefined) ? data.autoplay : true;
          video_element.loop = (data.loop !== undefined) ? data.loop : true;
          video_element.src = video_data.url;

          var texture = new THREE.Texture( video_element );

          var UpdateVideoTexture = function(video_element_cpy, texture_cpy) {
            return function() {
              if ( video_element_cpy.readyState == video_element_cpy.HAVE_ENOUGH_DATA )
                texture_cpy.needsUpdate = true;
            }
          }(video_element, texture);

          _on_update_callbacks.push(UpdateVideoTexture);
        }

        texture.uuid = data.uuid;

        if ( data.name !== undefined ) texture.name = data.name;
        if ( data.mapping !== undefined ) texture.mapping = ParseConstant( data.mapping );
        if ( data.offset !== undefined ) texture.offset = new THREE.Vector2( data.offset[ 0 ], data.offset[ 1 ] );
        if ( data.repeat !== undefined ) texture.repeat = new THREE.Vector2( data.repeat[ 0 ], data.repeat[ 1 ] );
        if ( data.minFilter !== undefined ) texture.minFilter = ParseConstant( data.minFilter );
        else texture.minFilter = THREE.LinearFilter;
        if ( data.magFilter !== undefined ) texture.magFilter = ParseConstant( data.magFilter );
        if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;
        if ( Array.isArray( data.wrap ) ) {

          texture.wrapS = ParseConstant( data.wrap[ 0 ] );
          texture.wrapT = ParseConstant( data.wrap[ 1 ] );

        }

        that.textures[ data.uuid ] = texture;

      }

    }
  };

  this.ParseGeometries = function ( json ) {

    if ( json !== undefined ) {

      var geometry_loader = new THREE.JSONLoader();
      var buffer_geometry_loader = new THREE.BufferGeometryLoader();

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var data = json[ i ];

        var geometry;

        switch ( data.type ) {

          case 'PlaneGeometry':
          case 'PlaneBufferGeometry':

          geometry = new THREE[ data.type ](
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

          geometry = buffer_geometry_loader.parse( data );

          break;

          case 'Geometry':

          geometry = geometry_loader.parse( data.data, this.texturePath ).geometry;

          break;

          default:

          console.warn( 'ObjectLoaderAM: Unsupported geometry type "' + data.type + '"' );

          continue;

        }

        geometry.uuid = data.uuid;

        if ( data.name !== undefined ) geometry.name = data.name;

        that.geometries[ data.uuid ] = geometry;

      }

    }
  };

  this.ParseObject = function () {

    if (THREE.ColladaLoader) {
      var collada_loader = new THREE.ColladaLoader();
      collada_loader.options.convertUpAxis = true;
    }
    else
      console.warn('ObjectLoaderAM: THREE.ColladaLoader undefined');
    if (THREE.OBJLoader)
      var obj_loader = new THREE.OBJLoader();
    else
      console.warn('ObjectLoaderAM: THREE.OBJLoader undefined');
    if (THREE.OBJMTLLoader)
      var obj_mtl_loader = new THREE.OBJMTLLoader();
    else
      console.warn('ObjectLoaderAM: THREE.OBJMTLLoader undefined');

    function SetAttributes( object, data ) {

      var matrix = new THREE.Matrix4();

      object.uuid = data.uuid;

      if ( data.name !== undefined ) object.name = data.name;
      if ( data.matrix !== undefined ) {

        matrix.fromArray( data.matrix );
        matrix.decompose( object.position, object.quaternion, object.scale );

      } else {

        if ( data.position !== undefined ) object.position.fromArray( data.position );
        if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
        if ( data.scale !== undefined ) object.scale.fromArray( data.scale );
        if ( data.scaleXYZ !== undefined ) {
          object.scale.x *= data.scaleXYZ;
          object.scale.y *= data.scaleXYZ;
          object.scale.z *= data.scaleXYZ;
        }
      }

      if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
      if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

      if ( data.visible !== undefined ) object.visible = data.visible;
      if ( data.userData !== undefined ) object.userData = data.userData;
    }

    return function ( data, parent ) {

      var object;

      function getGeometry( name ) {
        if ( name === undefined ) return undefined;
        if ( that.geometries[ name ] === undefined ) {
          console.warn( 'ObjectLoaderAM: Undefined geometry', name );
        }
        return that.geometries[ name ];
      }

      function getMaterial( name ) {
        if ( name === undefined ) return undefined;
        if ( that.materials[ name ] === undefined ) {
          console.warn( 'ObjectLoaderAM: Undefined material', name );
        }
        return that.materials[ name ];
      }

      function getModel( name ) {
        if ( name === undefined ) return undefined;
        if ( that.models[ name ] === undefined ) {
          console.warn( 'ObjectLoaderAM: Undefined model', name );
        }
        return that.models[ name ];
      }

      switch ( data.type ) {

        case 'Scene':

        object = new THREE.Scene();

        break;

        case 'PerspectiveCamera':

        object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

        break;

        case 'OrthographicCamera':

        object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

        break;

        case 'AmbientLight':

        object = new THREE.AmbientLight( data.color );

        break;

        case 'DirectionalLight':

        object = new THREE.DirectionalLight( data.color, data.intensity );

        break;

        case 'PointLight':

        object = new THREE.PointLight( data.color, data.intensity, data.distance, data.decay );

        break;

        case 'SpotLight':

        object = new THREE.SpotLight( data.color, data.intensity, data.distance, data.angle, data.exponent, data.decay );

        break;

        case 'HemisphereLight':

        object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );

        break;

        case 'Mesh':

        object = new THREE.Mesh( getGeometry( data.geometry ), getMaterial( data.material ) );

        break;

        case 'LOD':

        object = new THREE.LOD();

        break;

        case 'Line':

        object = new THREE.Line( getGeometry( data.geometry ), getMaterial( data.material ), data.mode );

        break;

        case 'PointCloud':
        case 'Points':

        object = new THREE.Points( getGeometry( data.geometry ), getMaterial( data.material ) );

        break;

        case 'Sprite':

        object = new THREE.Sprite( getMaterial( data.material ) );

        break;

        case 'Group':

        object = new THREE.Group();

        break;

        case 'OBJ':

        if (typeof obj_loader == 'undefined') {
          console.warn('ObjectLoaderAM: failed to load ' + data.uuid + ': THREE.OBJLoader is undefined');
          return undefined;
        }

        object = new THREE.Object3D();

        var url = that.constants.model_path + '/' + data.url;

        that.manager.itemStart(url);

        obj_loader.load( url, function ( object, data, manager, url ) {
          return function ( model ) {

            object.copy(model);

            object.traverse(function(child) {
              if (child.geometry)
                child.geometry.computeBoundingSphere();
            });

            SetAttributes(object, data);

            manager.itemEnd(url);

          };
        }( object, data, that.manager, url ));

        return object;

        break;

        case 'OBJMTL':

        if (typeof obj_mtl_loader == 'undefined') {
          console.warn('ObjectLoaderAM: failed to load ' + data.uuid + ': THREE.OBJMTLLoader is undefined');
          return undefined;
        }

        object = new THREE.Group();

        var obj_url = that.constants.model_path + '/' + data.objUrl;
        var mtl_url = that.constants.model_path + '/' + data.mtlUrl;

        that.manager.itemStart(obj_url);
        that.manager.itemStart(mtl_url);

        obj_mtl_loader.load( obj_url, mtl_url,
          function ( object, data, manager, obj_url, mtl_url ) {
            return function ( model ) {

              object.copy(model);

              object.traverse(function(child) {
                if (child.geometry)
                  child.geometry.computeBoundingSphere();
              });

              SetAttributes(object, data);

              manager.itemEnd(obj_url);
              manager.itemEnd(mtl_url);

            };
          }( object, data, that.manager, obj_url, mtl_url ));

        return object;

        break;

        case 'Collada':

        if (typeof collada_loader === 'undefined') {
          console.warn('ObjectLoaderAM: failed to load ' + data.uuid + ': THREE.ColladaLoader is undefined');
          return undefined;
        }

        object = new THREE.Group();

        var url = that.constants.model_path + '/' + data.url;

        that.manager.itemStart(url);

        collada_loader.load( url, function ( object, data, manager, url ) {
          return function ( collada ) {

            var dae = collada.scene;

            object.copy(dae);

            if (typeof(THREE.Animation) !== 'undefined') {
              object.traverse( function ( child ) {
                if ( child instanceof THREE.SkinnedMesh ) {
                  var animation = new THREE.Animation( child, child.geometry.animation );
                  animation.play();
                }
              } );
            }

            SetAttributes(object, data);

            manager.itemEnd(url);
          }
        }( object, data, manager, url ));

        return object;

        default:

        object = new THREE.Object3D();

      }

      SetAttributes( object, data );

      if ( data.children !== undefined ) {

        for ( var child in data.children ) {

          var o = that.ParseObject( data.children[ child ], object );
          if (o !== undefined) {
            object.add( o );
          }

        }

      }

      if ( data.type === 'LOD' ) {

        var levels = data.levels;

        for ( var l = 0; l < levels.length; l ++ ) {

          var level = levels[ l ];
          var child = object.getObjectByProperty( 'uuid', level.object );

          if ( child !== undefined ) {

            object.addLevel( child, level.distance );

          }

        }

      }
      if (parent !== undefined)
        parent.add(object);
      return object;
    }
  }();

  this.GetOnUpdateCallbacks = function() {
    return _on_update_callbacks;
  }
};