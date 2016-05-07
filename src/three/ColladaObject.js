var AMTHREE = AMTHREE || {};


(function() {

  if (typeof THREE === 'undefined')
    return;

  var SELECT_BOX_GEOMETRY = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  SELECT_BOX_GEOMETRY.uuid = '71EB1490-B411-48E3-B187-D4A9B1836ACA';
  SELECT_BOX_GEOMETRY.name = 'SELECT_BOX_GEOMETRY';

  var SELECT_BOX_MATERIAL = new THREE.MeshBasicMaterial( {
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false
  } );
  SELECT_BOX_MATERIAL.uuid = '0DD7A775-4B05-487D-845B-A10A2A224A55';
  SELECT_BOX_MATERIAL.name = 'SELECT_BOX_MATERIAL';
  SELECT_BOX_MATERIAL.transparent = true;
  SELECT_BOX_MATERIAL.opacity = 0;


  /**
  * Class to load and hold a Collada model, and to ease its serialization.
  * @class
  * @memberof AMTHREE
  * @augments THREE.Object3D
  */
  var ColladaObject = function() {
    THREE.Object3D.call(this);

    this.model_url = '';

    this.model_object = new THREE.Object3D();

    this.add(this.model_object);
  };

  ColladaObject.prototype = Object.create(THREE.Object3D.prototype);
  ColladaObject.prototype.constructor = ColladaObject;

  /**
  * Loads a Collada model into this, erasing the inner model, if it wasnt empty.
  * @param {string} url
  * @param {string} texture_path
  * @returns {Promise<this, string>} A promise that resolves when the model is loaded.
  */
  ColladaObject.prototype.load = function(url, texture_path) {
    var scope = this;

    return new Promise(function(resolve, reject) {
      var loader = new AMTHREE.ColladaLoader();
      loader.options.convertUpAxis = true;

      loader.load(url, texture_path,
        function(collada) {
        var box = new THREE.Box3();
        var center = new THREE.Vector3();
        var object = collada.scene;
        var mesh = new THREE.Mesh(SELECT_BOX_GEOMETRY, SELECT_BOX_MATERIAL);


        mesh.add(object);

        scope.model_url = url;
        scope.model_object.remove.apply(scope.model_object, scope.model_object.children);
        scope.model_object.add(mesh);


        box.setFromObject(object);
        box.size(mesh.scale);
        scope.updateMatrix();

        box.center(center);
        object.scale.divide(mesh.scale);
        object.position.sub(center.divide(mesh.scale));

        object.updateMatrix();
        AMTHREE.ObjectConvert(scope.model_object);
        resolve(scope);
      },
      undefined,
      reject);
    });
  };
  
  /**
  * Returns the json representation of this.
  * @param {object} meta
  * @returns {object}
  */
  ColladaObject.prototype.toJSON = function(meta) {
    var json = {
      uuid: this.uuid,
      type: 'Collada',
      name: this.name,
      url: AMTHREE.GetFilename(this.model_url),
      matrix: this.matrix.toArray()
    };

    if (JSON.stringify(this.userData) !== '{}') json.userData = this.userData;
    if (this.castShadow === true) json.castShadow = true;
    if (this.receiveShadow === true) json.receiveShadow = true;
    if (this.visible === false) json.visible = false;

    var children = [];

    for (var i = 0; i < this.children.length; ++i) {
      if (this.children[i] !== this.model_object)
        children.push(this.children[i].toJSON(meta).object);
    }

    if (children.length > 0)
      json.children = children;

    return { object: json };
  };


  AMTHREE.ColladaObject = ColladaObject;


})();