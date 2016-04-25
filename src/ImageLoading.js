var AM = AM || {};

(function() {


  /**
  * Loads an image.
  * @param {string} url
  * @param {Image} [image] - An image element in which to load the image.
  * @returns {Promise<Image, string>} A promise that resolves when the image is loaded.
  */
  AM.LoadImage = function(url, image) {
    return new Promise(function(resolve, reject) {
      image = image || new Image();

      image.src = null;
      image.onload = function() {
        resolve(image);
      };
      image.onerror = function(e) {
        reject(e);
      };
      image.src = url;
    });
  };

  /**
  * Returns the ImageData of an image element.
  * @param {Image} img
  * @param {bool} square - if true, the image will be copied inside a square matrix.
  * @returns {ImageData}
  */
  AM.ImageToImageData = (function() {

    var _canvas;
    var _ctx;

    if (typeof document !== 'undefined') {
      _canvas = document.createElement('canvas');
      _ctx = _canvas.getContext('2d');
    }

    return function(img, square) {
      if (square) {
        var size = Math.max(img.width, img.height);
        var x = (size - img.width)  / 2;
        var y = (size - img.height) / 2;

        _canvas.width = size;
        _canvas.height = size;

        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        _ctx.drawImage(img, x, y);
      }
      else {
        _canvas.width = img.width;
        _canvas.height = img.height;

        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        _ctx.drawImage(img, 0, 0, _canvas.width, _canvas.height);
      }

      return _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
    };

  })();


})();