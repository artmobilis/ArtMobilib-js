var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  /**
   * @class
   * @augments THREE.Texture
   * @param {AMTHREE.Video} [video]
   * @param {string} [uuid]
   * @param {number} [width]
   * @param {number} [height]
   * @param {bool} [loop=true]
   * @param {bool} [autoplay=false]
   */
  AMTHREE.VideoTexture = function(video, uuid, width, height, loop, autoplay) {
    THREE.Texture.call(this);

    this.uuid = (typeof uuid === 'string') ? uuid : THREE.Math.generateUUID();

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.videoElement = document.createElement('video');

    this.needsUpdate = false;

    this.set(video, width, height, loop, autoplay);
  };

  AMTHREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.VideoTexture.prototype.constructor = AMTHREE.VideoTexture;

  /**
   * Plays the animated texture.
   */
  AMTHREE.VideoTexture.prototype.play = function() {
    if (this.videoElement && !this.playing && this.video) {
      this.videoElement.setAttribute('crossorigin', 'anonymous');
      this.videoElement.src = this.video.url;
      this.videoElement.play();
      this.image = this.videoElement;
      this.playing = true;
    }
  };

  /**
   * Updates the animated texture.
   */
  AMTHREE.VideoTexture.prototype.update = function() {
    if (this.videoElement && this.videoElement.readyState == this.videoElement.HAVE_ENOUGH_DATA) {
      this.needsUpdate = true;
    }
  };

  /**
   * Pauses the animated texture.
   */
  AMTHREE.VideoTexture.prototype.pause = function() {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
      this.playing = false;
    }
  };

  /**
   * Stops the animated texture.
   */
  AMTHREE.VideoTexture.prototype.stop = function() {
    if (this.videoElement) {
      this.playing = false;
      this.videoElement.src = '';
      this.image = undefined;
      this.needsUpdate = true;
    }
  };

  /**
   * Sets the texture.
   * @param {AMTHREE.Video} [video]
   * @param {number} [width]
   * @param {number} [height]
   * @param {bool} [loop=true]
   * @param {bool} [autoplay=false]
   */
  AMTHREE.VideoTexture.prototype.set = function(video, width, height, loop, autoplay) {
    var playing = this.playing;

    this.stop();

    this.video = video;

    this.videoElement.width = (typeof width === 'number') ? width : undefined;
    this.videoElement.height = (typeof height === 'number') ? height : undefined;
    this.videoElement.autoplay = (typeof autoplay === 'boolean') ? autoplay : false;
    this.videoElement.loop = (typeof loop === 'boolean') ? loop : true;

    this.playing = false;

    if (this.videoElement.autoplay || playing)
      this.play();
  };

  /**
  * Returns a json object.
  * {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  */
  AMTHREE.VideoTexture.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      video: this.video.uuid,
      width: this.videoElement.width,
      height: this.videoElement.height,
      loop: this.videoElement.loop,
      autoplay: this.videoElement.autoplay
    };

    this.video.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.VideoTexture = function() {
    console.warn('VideoTexture.js: THREE undefined');
  };
}