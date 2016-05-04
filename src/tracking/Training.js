var AM = AM || {};


/**
 * Trains an image, by computing its corners and descriptors on multiple scales
 * @class
*/
AM.Training = function() {

  var _descriptors_levels;
  var _corners_levels;

  var _width = 0;
  var _height = 0;

  var _params = {
    num_train_levels: 3,
    blur_size: 3,
    image_size_max: 512,
    training_corners_max: 200,
    laplacian_threshold: 30,
    eigen_threshold: 25
  };

  var _scale_increment = Math.sqrt(2.0); // magic number ;)

  var _gray_image;
  var _blured_images = [];

  var _use_fixed_angle = false;

  function TrainLevel(img, level_img, level, scale) {
    var corners = _corners_levels[level];
    var descriptors = _descriptors_levels[level];

    if (level !== 0) {
      RescaleDown(img, level_img, scale);
      jsfeat.imgproc.gaussian_blur(level_img, level_img, _params.blur_size);
    }
    else {
      jsfeat.imgproc.gaussian_blur(img, level_img, _params.blur_size);
    }

    var corners_num = 0;
    if (_use_fixed_angle)
      corners_num = AM.DetectKeypointsYape06(level_img, corners, _params.training_corners_max,
        _params.laplacian_threshold, _params.eigen_threshold, undefined, 0);
    else
      corners_num = AM.DetectKeypointsYape06(level_img, corners, _params.training_corners_max,
        _params.laplacian_threshold, _params.eigen_threshold);
    corners.length = corners_num;
    jsfeat.orb.describe(level_img, corners, corners_num, descriptors);

    if (level !== 0) {
      // fix the coordinates due to scale level
      for(i = 0; i < corners_num; ++i) {
        corners[i].x *= 1 / scale;
        corners[i].y *= 1 / scale;
      }
    }

    console.log('train ' + level_img.cols + 'x' + level_img.rows + ' points: ' + corners_num);
  }

  function RescaleDown(src, dst, scale) {
    if (scale < 1) {
      var new_width = Math.round(src.cols * scale);
      var new_height = Math.round(src.rows * scale);

      jsfeat.imgproc.resample(src, dst, new_width, new_height);
    }
    else {
      dst.resize(src.cols, src.rows);
      src.copy_to(dst);
    }
  }

  function AllocateCornersDescriptors(width, height) {
    for (var level = 0; level < _params.num_train_levels; ++level) {
      _corners_levels[level] = [];
      var corners = _corners_levels[level];

      // preallocate corners array
      var i = (width * height) >> level;
      while (--i >= 0) {
        corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0, -1);
      }

      _descriptors_levels[level] = new jsfeat.matrix_t(32, _params.training_corners_max, jsfeat.U8_t | jsfeat.C1_t);
    }
  }

  /**
   * Trains an image, saves the result internally
   * @inner
   * @param {ImageData} image_data
   */
  this.Train = function(image_data) {
    var level = 0;
    var scale = 1.0;

    _descriptors_levels = [];
    _corners_levels = [];

    var gray =  new jsfeat.matrix_t(image_data.width, image_data.height, jsfeat.U8_t | jsfeat.C1_t);

    jsfeat.imgproc.grayscale(image_data.data, image_data.width, image_data.height, gray, jsfeat.COLOR_RGBA2GRAY);

    var scale_0 = Math.min(_params.image_size_max / image_data.width, _params.image_size_max / image_data.height);
    var img = new jsfeat.matrix_t(image_data.width * scale_0, image_data.height * scale_0, jsfeat.U8_t | jsfeat.C1_t);

    _width = img.cols;
    _height = img.rows;

    RescaleDown(gray, img, scale_0);

    AllocateCornersDescriptors(img.cols, img.rows);


    var level_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);

    TrainLevel(img, level_img, 0, scale);

    // lets do multiple scale levels
    for(level = 1; level < _params.num_train_levels; ++level) {
      scale /= _scale_increment;

      TrainLevel(img, level_img, level, scale);
    }
  };

  cloneImage = function(img){
    var dst = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);
    img.copy_to(dst);
    return dst;
  };

 /**
   * Trains an image, saves the intermediate results and images internally
   * @inner
   * @param {ImageData} image_data
   */
  this.TrainFull = function(image_data) {
    var level = 0;
    var scale = 1.0;

    _descriptors_levels = [];
    _corners_levels = [];
    _blured_images = [];

    var gray =  new jsfeat.matrix_t(image_data.width, image_data.height, jsfeat.U8_t | jsfeat.C1_t);

    jsfeat.imgproc.grayscale(image_data.data, image_data.width, image_data.height, gray, jsfeat.COLOR_RGBA2GRAY);

    var scale_0 = Math.min(_params.image_size_max / image_data.width, _params.image_size_max / image_data.height);
    var img = new jsfeat.matrix_t(image_data.width * scale_0, image_data.height * scale_0, jsfeat.U8_t | jsfeat.C1_t);

    _width = img.cols;
    _height = img.rows;

    RescaleDown(gray, img, scale_0);

    AllocateCornersDescriptors(img.cols, img.rows);

    var level_img = new jsfeat.matrix_t(img.cols, img.rows, jsfeat.U8_t | jsfeat.C1_t);

    TrainLevel(img, level_img, 0, scale);
    _gray_image=img;
    _blured_images[0] = cloneImage(level_img);

    // lets do multiple scale levels
    for(level = 1; level < _params.num_train_levels; ++level) {
      scale /= _scale_increment;

      TrainLevel(img, level_img, level, scale);
      _blured_images[level] = cloneImage(level_img);
    }
  };

  this.getGrayData = function() {
    return _gray_image;
  };

  this.getBluredImages = function(){
    return _blured_images;
  };

  /**
   * Sets the result of the previous {@link AM.Training#Train} call to a {@link AM.TrainedImage}
   * @param {AM.TrainedImage} trained_image
   */
  this.SetResultToTrainedImage = function(trained_image) {
    trained_image.Set(_corners_levels, _descriptors_levels, _width, _height);
  };

  /**
   * Returns false if this object contains a result
   * @returns {bool}
   */
  this.IsEmpty = function() {
    return (!_descriptors_levels || !_corners_levels);
  };

  /**
   * Empties results stored
   */
  this.Empty = function() {
    _descriptors_levels = undefined;
    _corners_levels = undefined;
    _blured_images = undefined;
  };

  /**
   * Sets parameters of the training
   * @param {object} params
   * @params {number} [params.num_train_levels=3] - default 3
   * @params {number} [params.blur_size=3] - default 3
   * @params {number} [params.image_size_max=512] - default 512
   * @params {number} [params.training_corners_max=200] - default 200
   * @params {number} [params.laplacian_threshold=30] - default 30
   * @params {number} [params.eigen_threshold=25] - default 25
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };

  this.GetScaleIncrement = function(){
    return _scale_increment;
  };

  this.UseFixedAngle = function(bool) {
    _use_fixed_angle = bool;
  };

};