var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {

  /**
   * 
   * @class
   * @augments {THREE.Object3D}
   * @param {string} src - url of the sound
   */
  AMTHREE.Sound = function(src) {
    THREE.Object3D.call(this);

    this.src = src;
    this.audio = new Audio();
    this.audio.loop = true;
    this.playing = false;
  };

  AMTHREE.Sound.prototype = Object.create(THREE.Object3D.prototype);
  AMTHREE.Sound.prototype.constructor = AMTHREE.Sound;

  /**
   * Plays the sound.
   * @inner
   */
  AMTHREE.Sound.prototype.play = function() {
    this.playing = true;
    this.audio.src = this.src;
    this.audio.play();
  };

  /**
   * Stops the sound.
   * @inner
   */
  AMTHREE.Sound.prototype.stop = function() {
    this.audio.src = '';
    this.playing = false;
  };

  /**
   * Pauses the sound.
   * @inner
   */
  AMTHREE.Sound.prototype.pause = function() {
    this.audio.pause();
    this.playing = false;
  };

  /**
   * Sets the sound's url.
   * @inner
   * @param {string} src
   */
  AMTHREE.Sound.prototype.setSrc = function(src) {
    this.src = src;
    if (this.isPlaying())
      this.play();
  };

  /**
   * Returns whether the sound is played.
   * @inner
   * @returns {bool}
   */
  AMTHREE.Sound.prototype.isPlaying = function() {
    return this.playing;
  };

  /**
   * Returns a clone of this.
   * @inner
   * @returns {AMTHREE.Sound}
   */
  AMTHREE.Sound.prototype.clone = function() {
    return new AMTHREE.Sound(this.src);
  };

  /**
   * Copies the parameter.
   * @inner
   * @param {AMTHREE.Sound}
   */
  AMTHREE.Sound.prototype.copy = function(sound) {
    this.setSrc(sound.src)
  };


  AMTHREE.SoundsCall = function(object, fun) {
    object.traverse(function(s) {
      if (s instanceof AMTHREE.Sound && s[fun])
        s[fun]();
    });
  };

  /**
  * Recursively plays the sounds of this object and all his children
  * @function
  * @param {THREE.Object3D} object
  */
  AMTHREE.PlaySounds = function(object) {
    AMTHREE.SoundsCall(object, 'play');
  };

  /**
  * Recursively pauses the sounds of this object and all his children
  * @function
  * @param {THREE.Object3D} object
  */
  AMTHREE.PauseSounds = function(object) {
    AMTHREE.SoundsCall(object, 'pause');
  };

  /**
  * Recursively stops the sounds of this object and all his children
  * @function
  * @param {THREE.Object3D} object
  */
  AMTHREE.StopSounds = function(object) {
    AMTHREE.SoundsCall(object, 'stop');
  };

  AMTHREE.Sound.prototype.toJSON = function(meta) {
    var output = THREE.Object3D.prototype.toJSON.call(this, meta);

    output.object.type = 'Sound';
    output.object.url = this.src;

    return output;
  }


}
else {
  AMTHREE.Sound = function() {
    console.warn('Sound.js: THREE undefined');
  };
}