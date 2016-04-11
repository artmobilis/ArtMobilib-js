var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {


  AMTHREE.Sound = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = url;
  };

  AMTHREE.Sound.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      url: AMTHREE.GetFilename(this.url)
    }

    if (!meta.sounds)
      meta.sounds = {};
    if (!meta.sounds[this.uuid])
      meta.sounds[this.uuid] = output;

    return output;
  }


}
else {
  AMTHREE.Sound = function() {
    console.warn('Sound.js: THREE undefined');
  };
}