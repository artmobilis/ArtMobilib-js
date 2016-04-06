var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   * @param {AMTHREE.Image} image - An image to map to the texture.
   */
  AMTHREE.ImageTexture = function(image) {
    THREE.Texture.call(this);

    this.minFilter = THREE.NearestMipMapNearestFilter;
    this.image = image;
  };

  AMTHREE.ImageTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.ImageTexture.prototype.constructor = AMTHREE.ImageTexture;

  /**
  * Returns the json representation of the texture
  * @param {object} meta - an object holding json ressources. The result of this function will be added to it.
  * @returns {object} A json object
  */
  AMTHREE.ImageTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.image = this.image.uuid;

    this.image.toJSON(meta);

    meta.textures[output.uuid] = output;

    return output;
  }


}
else {
  AMTHREE.ImageTexture = function() {
    console.warn('ImageTexture.js: THREE undefined');
  };
}
