var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @param {string} [uuid] - generated if not provided
   * @param {string} [url] - The url of the image
   */
  AMTHREE.Image = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = url;
  };

  /**
  * Returns an json object.
  * @param {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  * @returns {object} A json object
  */
  AMTHREE.Image.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.url = AMTHREE.GetFilename(this.url);

    if (typeof meta === 'object') {
      if (!meta.images) meta.images = {};
      meta.images[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.Image = function() {
    console.warn('Image.js: THREE undefined');
  };
}
