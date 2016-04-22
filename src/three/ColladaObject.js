var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


(function() {


  var ColladaObject = function() {
    THREE.Object3D.call(this);

    this.model_url = '';
  }

  ColladaObject.prototype = Object.create(THREE.Object3D.prototype);
  ColladaObject.prototype.constructor = ColladaObject;

  ColladaObject.prototype.load = function(url, texture_path) {
    var scope = this;

    return new Promise(function(resolve, reject) {
      var loader = new AMTHREE.ColladaLoader();
      loader.options.convertUpAxis = true;

      loader.load(url, texture_path,
        function(collada) {
        scope.model_url = url;
        scope.add(collada.scene);
        AMTHREE.ObjectConvert(scope);
        resolve(scope);
      },
      undefined,
      reject);
    });
  };
  
  ColladaObject.prototype.toJSON = function(meta) {
    var json = {
      uuid: this.uuid,
      type: 'Collada',
      name: this.name,
      url: AMTHREE.GetFilename(this.model_url),
      matrix: this.matrix.toArray(),
      children: []
    };

    if (JSON.stringify(this.userData) !== '{}') json.userData = this.userData;
    if (this.castShadow === true) json.castShadow = true;
    if (this.receiveShadow === true) json.receiveShadow = true;
    if (this.visible === false) json.visible = false;

    for ( var i = 0; i < this.children.length; ++i ) {
      json.children.push(this.children[i].toJSON(meta).object);
    }

    return { object: json };
  };


  AMTHREE.ColladaObject = ColladaObject;


})();


}