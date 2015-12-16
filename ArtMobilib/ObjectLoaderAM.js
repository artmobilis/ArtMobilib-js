/**
 * @author mrdoob / http://mrdoob.com/
 */
//

/** Edited for ArtMobilis
 *
 * ObjectLoaderAM
 * A loader for loading a JSON resource
 * A THREE.ObjectLoader edited to support .GIF, .MP4 as textures,
 * and can load OBJ models and Collada models.
 *
 *
 * Dependency:
 *  three.js,
 * 	ColladaLoader.js,
 * 	OBJLoader.js,
 * 	OBJMTLLoader.js,
 * 	libgif.js
 **/
//

ObjectLoaderAM = function ( onUpdate, manager ) {

  var that = this;

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

  this.constants = {};

  this.geometries = {};
  this.materials = {};
  this.animations = [];
  this.images = {};
  this.videos = {};
  this.textures = {};

  this.onUpdate = onUpdate;

  var onAddFctns = [];


  this.onAdd = function ( fctn ) {
    onAddFctns.push(fctn);
  }

  function applyOnAdd( obj ) {
    for(fun of onAddFctns) {
      fun(obj);
    }
  }

  this.load = function ( url, onLoad, onProgress, onError ) {

    var loader = new THREE.XHRLoader( that.manager );
    loader.setCrossOrigin( this.crossOrigin );

    that.onLoad = onLoad;

    loader.load( url, function( onLoad ) {

      return function ( text ) {

        that.json = JSON.parse( text );

        onLoad(that.parse( that.json ));

      };
    }(onLoad), onProgress, onError );
  };

  this.setCrossOrigin = function ( value ) {

    this.crossOrigin = value;
  };

  this.parse = function ( json ) {
    that.json = json;

    that.parseConstants( json.constants );
    that.parseGeometries( json.geometries );
    that.parseImages( json.images );
    that.parseVideos( json.videos );
    that.parseTextures( json.textures );
    that.parseMaterials( json.materials );
    that.parseAnimations( json.animations );

    var object = that.parseObject( json.object );

    object.animations = that.animations;

    return object;
  };

  this.parseConstants = function ( json ) {
    data = (json !== undefined) ? json : {};

    that.constants.assets = (data.assetPath !== undefined) ? data.assetPath : ".";
    that.constants.imagePath = that.constants.assets + '/' + ((data.imagePath !== undefined) ? data.imagePath : "");
    that.constants.videoPath = that.constants.assets + '/' + ((data.videoPath !== undefined) ? data.videoPath : "");
    that.constants.modelPath = that.constants.assets + '/' + ((data.modelPath !== undefined) ? data.modelPath : "");
  };

  this.parseMaterials = function ( json ) {

    if ( json !== undefined ) {

      var loader = new THREE.MaterialLoader();
      loader.setTextures( that.textures );

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var material = loader.parse( json[ i ] );
        that.materials[ material.uuid ] = material;

      }

    }
  };

  this.parseAnimations = function ( json ) {
    if (json === undefined) return;

    that.animations = [];

    for ( var i = 0; i < json.length; i ++ ) {

      var clip = THREE.AnimationClip.parse( json[i] );

      that.animations.push( clip );

    }
  };

  this.parseImages = function ( json ) {

    function loadImage( url ) {

      that.manager.itemStart( url );

      return loader.load( url, function () {

       that.manager.itemEnd( url );

     } );

    }

    if ( json !== undefined && json.length > 0 ) {

      var manager = new THREE.LoadingManager();

      var loader = new THREE.ImageLoader( manager );
      loader.setCrossOrigin( that.crossOrigin );

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var image = json[ i ];

        if (image.url === undefined)
          console.warn('THREE.ObjectLoaderAM: no "url" specified for image ' + i);
        else if (image.uuid === undefined)
          console.warn('THREE.ObjectLoaderAM: no "uuid" specified for image ' + i);
        else {

          var url = that.constants.imagePath + '/' + image.url;

          that.images[ image.uuid ] = loadImage( url );
        }
      }
    }
  };

  this.parseVideos = function ( json ) {

    if ( json !== undefined ) {

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var video = json[ i ];

        if (video.url === undefined)
          console.warn('THREE.ObjectLoaderAM: no "url" specified for video ' + i);
        else if (video.uuid === undefined)
          console.warn('THREE.ObjectLoaderAM: no "uuid" specified for video ' + i);
        else {

          var data = new THREEx.Video(that.constants.videoPath + '/' + video.url, video.uuid);
          if (video.width !== undefined)
            data.width = video.width;
          if (video.height !== undefined)
            data.height = video.height;

          that.videos[ video.uuid ] = data;
        }
      }
    }
  };

  this.parseTextures = function ( json ) {

    function parseConstant( value ) {

      if ( typeof( value ) === 'number' ) return value;

      console.warn( 'THREE.ObjectLoaderAM.parseTexture: Constant should be in numeric form.', value );

      return THREE[ value ];

    }

    if ( json !== undefined ) {

      for ( var i = 0, l = json.length; i < l; i ++ ) {

        var data = json[ i ];

        if ( data.image === undefined && data.video === undefined ) {
          console.warn( 'THREE.ObjectLoaderAM: No "image" nor "video" specified for', data.uuid );
          continue;
        }


        if ( data.image !== undefined ) {

          if ( that.images[ data.image ] === undefined ) {
            console.warn( 'THREE.ObjectLoaderAM: Undefined image', data.image );
            continue;
          }

          var image = that.images[ data.image ];

          if (data.animated !== undefined && data.animated) {
            var img = document.createElement('img');
            var scriptTag = document.getElementsByTagName('script');
            scriptTag = scriptTag[scriptTag.length - 1];
            scriptTag.parentNode.appendChild(img);

            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            img.src = image.src;

            var anim = new SuperGif( { gif: img, auto_play: true } );
            anim.load();

            var texture = new THREE.Texture(anim.get_canvas());
            texture.needsUpdate = true;

            var updateTexture = function(text) {
              return function() {
                text.needsUpdate = true;
              }
            }(texture);

            that.onUpdate(updateTexture);

          } else {
            var texture = new THREE.Texture( image );
            texture.needsUpdate = true;
          }
        }
        else {

          if ( that.videos[ data.video ] === undefined ) {
            console.warn( 'THREE.ObjectLoaderAM: Undefined video', data.video );
            continue;
          }

          var video = that.videos [ data.video ];

          var vid = document.createElement('video');
          vid.width	= video.width;
          vid.height = video.height;
          vid.autoplay = (data.autoplay !== undefined) ? data.autoplay : true;
          vid.loop = (data.loop !== undefined) ? data.loop : true;
          vid.src = video.url;

          var texture = new THREE.Texture( vid );

          that.onUpdate(function() {
            if ( vid.readyState == vid.HAVE_ENOUGH_DATA )
              texture.needsUpdate	= true;
          });
        }

        texture.uuid = data.uuid;

        if ( data.name !== undefined ) texture.name = data.name;
        if ( data.mapping !== undefined ) texture.mapping = parseConstant( data.mapping );
        if ( data.offset !== undefined ) texture.offset = new THREE.Vector2( data.offset[ 0 ], data.offset[ 1 ] );
        if ( data.repeat !== undefined ) texture.repeat = new THREE.Vector2( data.repeat[ 0 ], data.repeat[ 1 ] );
        if ( data.minFilter !== undefined ) texture.minFilter = parseConstant( data.minFilter );
        if ( data.magFilter !== undefined ) texture.magFilter = parseConstant( data.magFilter );
        if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;
        if ( Array.isArray( data.wrap ) ) {

          texture.wrapS = parseConstant( data.wrap[ 0 ] );
          texture.wrapT = parseConstant( data.wrap[ 1 ] );

        }


        that.textures[ data.uuid ] = texture;

      }

    }
  };

  this.parseGeometries = function ( json ) {

    if ( json !== undefined ) {

      var geometryLoader = new THREE.JSONLoader();
      var bufferGeometryLoader = new THREE.BufferGeometryLoader();

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

          geometry = bufferGeometryLoader.parse( data );

          break;

          case 'Geometry':

          geometry = geometryLoader.parse( data.data, this.texturePath ).geometry;

          break;

          default:

          console.warn( 'THREE.ObjectLoaderAM: Unsupported geometry type "' + data.type + '"' );

          continue;

        }

        geometry.uuid = data.uuid;

        if ( data.name !== undefined ) geometry.name = data.name;

        that.geometries[ data.uuid ] = geometry;

      }

    }
  };

  this.parseObject = function () {

    var colladaLoader = new THREE.ColladaLoader();
    colladaLoader.options.convertUpAxis = true;
    var objLoader = new THREE.OBJLoader();
    var objMtlLoader = new THREE.OBJMTLLoader();

    function setAttributes( object, data ) {

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
          console.warn( 'THREE.ObjectLoaderAM: Undefined geometry', name );
        }
        return that.geometries[ name ];
      }

      function getMaterial( name ) {
        if ( name === undefined ) return undefined;
        if ( that.materials[ name ] === undefined ) {
          console.warn( 'THREE.ObjectLoaderAM: Undefined material', name );
        }
        return that.materials[ name ];
      }

      function getModel( name ) {
        if ( name === undefined ) return undefined;
        if ( that.models[ name ] === undefined ) {
          console.warn( 'THREE.ObjectLoaderAM: Undefined model', name );
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

        objLoader.load( that.constants.modelPath + '/' + data.url, function ( par, dat ) {
          return function ( model ) {

            model.traverse(function(child) {
              if (child.geometry)
                child.geometry.computeBoundingSphere();
            });

            setAttributes(model, dat);

            par.add(model);
            that.onAdd(model);

          };
        }( parent, data ));

        return undefined;

        break;

        case 'OBJMTL':

        objMtlLoader.load( that.constants.modelPath + '/' + data.objUrl,
          that.constants.modelPath + '/' + data.mtlUrl, function ( par, dat ) {
            return function ( model ) {

              model.traverse(function(child) {
                if (child.geometry)
                  child.geometry.computeBoundingSphere();
              });

              setAttributes(model, dat);

              par.add(model);
              applyOnAdd(model);

            };
          }( parent, data ));

        return undefined;

        break;

        case 'Collada':

        object = new THREE.Object3D();

        colladaLoader.load( that.constants.modelPath + '/' + data.url, function ( par, dat ) {
          return function ( collada ) {

            var dae = collada.scene;

            dae.traverse( function ( child ) {
              if ( child instanceof THREE.SkinnedMesh ) {
                var animation = new THREE.Animation( child, child.geometry.animation );
                animation.play();
              }
            } );

            setAttributes(dae, dat);
            par.add(dae);
            applyOnAdd(dae);
          }
        }( parent, data ));

        return undefined;

        default:

        object = new THREE.Object3D();

      }

      setAttributes( object, data );

      if ( data.children !== undefined ) {

        for ( var child in data.children ) {

          var o = that.parseObject( data.children[ child ], object );
          if (o !== undefined) {
            object.add( o );
            applyOnAdd( o );
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
};