/** @namespace */
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   */
  AMTHREE.Image = function(uuid) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.image = new Image();
    this.url;
  };

  /**
  * Loads an image
  * @param {string} url
  * @returns {Promise.<undefined, string>} A promise that resolves when the image is loaded.
  */
  AMTHREE.Image.prototype.Load = function(url) {
    this.url = url;
    var scope = this;
    return new Promise(function(resolve, reject) {
      scope.image.src = url;
    });
  }

  /**
  * Returns an object that can be serialized using JSON.stringify.
  * @param {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  * @returns {object} A json object
  */
  AMTHREE.Image.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.url = this.url;

    if (typeof meta === 'object') {
      if (!meta.images) meta.images = {};
      meta.images[output.uuid] = output;
    }

    return output;
  }


}
else {
  AMTHREE.ImageTexture = function() {
    console.warn('ImageTexture.js: THREE undefined');
  };
}
