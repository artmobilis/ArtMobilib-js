/*************************


GifTexture
A class helper to use a gif image as a Threejs texture
inherit THREE.texture

Constructor

GifTexture(src: string = '')


Methods

play()
update()
pause()
stop()
setGif(src: string)


Dependency

Threejs

libgif: https://github.com/buzzfeed/libgif-js


*************************/

/** @namespace */
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
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
      this.image = image;

      this.imageElement.src = image.url;

      this.anim = new SuperGif( { gif: this.imageElement, auto_play: false } );
      this.anim.load();

      this.gifCanvas = this.anim.get_canvas();

      this.gifCanvas.style.display = 'none';
    }
  };

  AMTHREE.GifTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    if (this.image)
      output.image = this.image.uuid;
    output.animated = true;

    this.image.toJSON(meta);

    meta.textures[output.uuid] = output;

    return output;
  }


}
else {
  AMTHREE.GifTexture = function() {
    console.warn('GifTexture.js: THREE undefined');
  };
}
