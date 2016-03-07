var AM = AM || {};

AM.ImageFilter = function() {

  var _img_u8;
  var _img_u8_smooth;

  var _params = {
    blur_size: 3,
    blur: true
  }


  this.Filter = function(image_data) {
    var width = image_data.width;
    var height = image_data.height;

    if (_img_u8) _img_u8.resize(width, height, jsfeat.U8_t | jsfeat.C1_t);
    else _img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
    if (_img_u8_smooth) _img_u8_smooth.resize(width, height, jsfeat.U8_t | jsfeat.C1_t);
    else _img_u8_smooth = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);


    jsfeat.imgproc.grayscale(image_data.data, width, height, _img_u8);

    if (_params.blur)
      jsfeat.imgproc.gaussian_blur(_img_u8, _img_u8_smooth, _params.blur_size);
  };

  this.SetMaxImageSize = function(value) {
    _image_size_max = value;
  };

  this.SetBlurSize = function(value) {
    _blur_size = value;
  };

  this.GetFilteredImage = function() {
    if (_params.blur)
      return _img_u8_smooth;
    else
      return _img_u8;
  };

  this.SetParameters = function(params) {
    for (name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};