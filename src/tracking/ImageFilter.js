var AM = AM || {};


/**
 * Filters images so the result can be used by {@link Detection}
 * @class
 */
AM.ImageFilter = function() {

  var _img_u8;

  var _params = {
    blur_size: 3,
    blur: true
  };

  /**
   * Filters the image and saves the result internally
   * @inner
   * @param {ImageData} image_data
   */
  this.Filter = function(image_data) {
    var width = image_data.width;
    var height = image_data.height;

    if (_img_u8) _img_u8.resize(width, height, jsfeat.U8_t | jsfeat.C1_t);
    else _img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);

    jsfeat.imgproc.grayscale(image_data.data, width, height, _img_u8);

    if (_params.blur)
      jsfeat.imgproc.gaussian_blur(_img_u8, _img_u8, _params.blur_size);
  };

  /**
   * Returns the last filtered image
   * @inner
   * @returns {jsfeat.matrix_t}
   */
  this.GetFilteredImage = function() {
    return _img_u8;
  };

  /**
   * Sets parameters, all optionnal
   * @inner
   * @param {object} params
   * @param {number} [params.blur_size=3]
   * @param {bool} [params.blur=true] - compute blur ?
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};