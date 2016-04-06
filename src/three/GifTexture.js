/*************************

Dependency

Threejs

libgif: https://github.com/buzzfeed/libgif-js

*************************/


/** @namespace */
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * A helper class to use a gif image as a Threejs texture
   * @class
   * @augments THREE.Texture
   */
  AMTHREE.GifTexture = function(image) {
    THREE.Texture.call(this);

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.imageElement = document.createElement('img');
    var scriptTag = document.getElementsByTagName('script');
    scriptTag = scriptTag[scriptTag.length - 1];
    scriptTag.parentNode.appendChild(this.imageElement);

    this.imageElement.width = this.imageElement.naturalWidth;
    this.imageElement.height = this.imageElement.naturalHeight;

    if (image)
      this.setGif(image);
  };

  AMTHREE.GifTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.GifTexture.prototype.constructor = AMTHREE.GifTexture;

  /**
   * Plays the animated texture.
   */
  AMTHREE.GifTexture.prototype.play = function() {
    this.anim.play();
    this.image = this.gifCanvas;
  };

  /**
   * Updates the animated texture.
   */
  AMTHREE.GifTexture.prototype.update = function() {
    this.needsUpdate = true;
  };

  /**
   * Stops the animated texture.
   */
  AMTHREE.GifTexture.prototype.stop = function() {
    this.anim.move_to(0);
    this.image = undefined;
  };

  /**
   * Pauses the animated texture.
   */
  AMTHREE.GifTexture.prototype.pause = function() {
    this.anim.pause();
  };

  /**
   * Sets the source gif of the texture.
   */
  AMTHREE.GifTexture.prototype.setGif = function(image) {
    if (image.url) {
      this.image_ref = image;

      this.imageElement.src = image.url;

      this.anim = new SuperGif( { gif: this.imageElement, auto_play: false } );
      this.anim.load();

      this.gifCanvas = this.anim.get_canvas();

      this.gifCanvas.style.display = 'none';
    }
  };

  /**
  * Returns the json representation of the texture
  * @param {object} [meta] - an object holding json ressources. If provided, the result of this function will be added to it.
  * @returns {object} A json object
  */
  AMTHREE.GifTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    if (this.image_ref)
      output.image = this.image_ref.uuid;
    output.animated = true;

    this.image_ref.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  }


}
else {
  AMTHREE.GifTexture = function() {
    console.warn('GifTexture.js: THREE undefined');
  };
}
