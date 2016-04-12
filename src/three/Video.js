/** @namespace */
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   * @param {string} [uuid] - genrated if not provided
   * @param {string} [url] - The url of the video.
   */
  AMTHREE.Video = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = (typeof url === 'string') ? url : undefined;
  };

  /**
  * Returns an object that can be serialized using JSON.stringify.
  * @param {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  * @returns {object} A json object
  */
  AMTHREE.Video.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      url: AMTHREE.GetFilename(this.url)
    };

    if (typeof meta === 'object') {
      if (!meta.videos) meta.videos = {};
      meta.videos[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.Video = function() {
    console.warn('Video.js: THREE undefined');
  };
}
