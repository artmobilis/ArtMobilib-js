var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  AMTHREE.Sound = function(src) {
    THREE.Object3D.call(this);

    this.src = src;
    this.audio = new Audio();
    this.audio.loop = true;
    this.playing = false;
  };

  AMTHREE.Sound.prototype = Object.create(THREE.Object3D.prototype);
  AMTHREE.Sound.prototype.constructor = AMTHREE.Sound;

  AMTHREE.Sound.prototype.play = function() {
    this.playing = true;
    this.audio.src = this.src;
    this.audio.play();
  };

  AMTHREE.Sound.prototype.stop = function() {
    this.audio.src = '';
    this.playing = false;
  };

  AMTHREE.Sound.prototype.pause = function() {
    this.audio.pause();
    this.playing = false;
  };

  AMTHREE.Sound.prototype.setSrc = function(src) {
    this.src = src;
    if (this.isPlaying())
      this.play();
  };

  AMTHREE.Sound.prototype.isPlaying = function() {
    return this.playing;
  };

  AMTHREE.Sound.prototype.clone = function() {
    return new AMTHREE.Sound(this.src);
  };

  AMTHREE.Sound.prototype.copy = function(sound) {
    this.setSrc(sound.src)
  };


  AMTHREE.SoundsCall = function(object, fun) {
    object.traverse(function(s) {
      if (s instanceof AMTHREE.Sound && s[fun])
        s[fun]();
    });
  };

  AMTHREE.PlaySounds = function(object) {
    AMTHREE.SoundsCall(object, 'play');
  };

  AMTHREE.PauseSounds = function(object) {
    AMTHREE.SoundsCall(object, 'pause');
  };

  AMTHREE.StopSounds = function(object) {
    AMTHREE.SoundsCall(object, 'stop');
  };


}
else
  console.warn('Sound.js: THREE undefined');