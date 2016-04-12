var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   * @param {AMTHREE.Image} image - An image to map to the texture.
   */
  AMTHREE.ImageTexture = function(image) {
    THREE.Texture.call(this);

    this.image = new Image();
    this.image.addEventListener('load', function(texture) {
      return function() {
        texture.needsUpdate = true;
      };
    }(this));

    this.set(image);
  };

  AMTHREE.ImageTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.ImageTexture.prototype.constructor = AMTHREE.ImageTexture;

  /*
  *
  */
  AMTHREE.ImageTexture.prototype.set = function(image) {
    this.image_ref = image;
    this.image.src = image.url;
  };

  /**
  * Returns the json representation of the texture
  * @param {object} [meta] - an object holding json ressources. If provided, the result of this function will be added to it.
  * @returns {object} A json object
  */
  AMTHREE.ImageTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.image = this.image_ref.uuid;

    this.image_ref.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.ImageTexture = function() {
    console.warn('ImageTexture.js: THREE undefined');
  };
}
