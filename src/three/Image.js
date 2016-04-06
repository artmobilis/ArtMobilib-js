/** @namespace */
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   */
  AMTHREE.Image = function(uuid) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.image = null;
    this.url = null;
  };

  AMTHREE.Image.prototype.Load = function(url) {
    var scope = this;
    this.url = url;
    return new Promise(function(resolve, reject) {
      var loader = new THREE.ImageLoader();
      loader.load(url, function(image) {
        scope.image = image;
      },
      undefined,
      function(xhr) {
        reject('failed to load image ' + url);
      })
    });
  }

  AMTHREE.Image.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.url = this.url;

    meta.images[output.uuid] = output;

    return output;
  }


}
else {
  AMTHREE.ImageTexture = function() {
    console.warn('ImageTexture.js: THREE undefined');
  };
}
