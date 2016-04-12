var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {

  /**
   * 
   * @class
   * @augments {THREE.Object3D}
   * @param {string} url - url of the sound
   */
  AMTHREE.SoundObject = function(sound) {
    THREE.Object3D.call(this);

    this.sound = sound;
    this.audio = new Audio();
    this.audio.loop = true;
    this.playing = false;
  };

  AMTHREE.SoundObject.prototype = Object.create(THREE.Object3D.prototype);
  AMTHREE.SoundObject.prototype.constructor = AMTHREE.SoundObject;

  /**
   * Plays the sound.
   * @inner
   */
  AMTHREE.SoundObject.prototype.play = function() {
    this.playing = true;
    this.audio.src = this.sound.url;
    this.audio.play();
  };

  /**
   * Stops the sound.
   * @inner
   */
  AMTHREE.SoundObject.prototype.stop = function() {
    this.audio.src = '';
    this.playing = false;
  };

  /**
   * Pauses the sound.
   * @inner
   */
  AMTHREE.SoundObject.prototype.pause = function() {
    this.audio.pause();
    this.playing = false;
  };

  /**
   * Sets the sound's url.
   * @inner
   * @param {string} url
   */
  AMTHREE.SoundObject.prototype.setSound = function(sound) {
    this.sound = sound;
    if (this.isPlaying())
      this.play();
  };

  /**
   * Returns whether the sound is played.
   * @inner
   * @returns {bool}
   */
  AMTHREE.SoundObject.prototype.isPlaying = function() {
    return this.playing;
  };

  /**
   * Returns a clone of this.
   * @inner
   * @returns {AMTHREE.SoundObject}
   */
  AMTHREE.SoundObject.prototype.clone = function() {
    return (new AMTHREE.SoundObject()).copy(this);
  };

  /**
   * Copies the parameter.
   * @inner
   * @param {AMTHREE.SoundObject}
   */
  AMTHREE.SoundObject.prototype.copy = function(src) {
    this.setSound(src.sound);
    return this;
  };


  AMTHREE.SoundsCall = function(object, fun) {
    object.traverse(function(s) {
      if (s instanceof AMTHREE.SoundObject && s[fun])
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

  AMTHREE.SoundObject.prototype.toJSON = function(meta) {
    var output = THREE.Object3D.prototype.toJSON.call(this, meta);

    output.object.type = 'SoundObject';
    output.object.sound = this.sound.uuid;

    return output;
  };


}
else {
  AMTHREE.SoundObject = function() {
    console.warn('SoundObject.js: THREE undefined');
  };
}