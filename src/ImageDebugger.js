var AM = AM || {};

/**
  * give a color from green (0) to red (max)
  * @param {number} value
  * @param {number} max value
  * @return {hex} color value
  */
getGradientGreenRedColor = function (n, max){

  function intToHex(i) {
    var hex = parseInt(i).toString(16);
    return (hex.length < 2) ? "0" + hex : hex;
  }   

  var red = (255 * n) / max;
  var green = (255 * (max - n)) / max ;
  return "#" + intToHex(red) + intToHex(green) + "00";
};

/**
 * Display images and informations to debug image marker training and matching stages
 * @class
 */
AM.ImageDebugger = function() {
  var that=this;
  var _training = new AM.Training();

  var _internal_canvas = document.createElement("canvas");
  var _internal_ctx = _internal_canvas.getContext("2d");
  var _context2d;
  var _camera_video_element;

  var _trained_image_url;
  var _corners;
  var _trained_corners;
  var _screen_corners;
  var _matches;
  var _matches_mask;
  var _profiler;
  var _image_data;
  var _uuid;

  var _hbands=44; // Height of upper horizontal menu band (44 pixels on my desktop)
  var _ratio;
  var _offsetx;
  var _offsety;
  var _canvas_height;
  var _canvas_width;

  var _template_offsetx;
  var _template_offsety;
  var _offsetLevel = [];
  var _scaleLevel = [];

  var _last_trained_url;
  var _last_trained_image_data;

  var _debugMatches=false;
  var _debugTraining=true;

  drawLargePoint = function (imageData, col, x, y, width, height){
    for(i = -1; i < 2; ++i) {
      ind= (y+i)*4*width+4*x;

      imageData.data[ind+0]=col[0];
      imageData.data[ind+1]=col[1];
      imageData.data[ind+2]=col[2];
      imageData.data[ind+4]=col[0];
      imageData.data[ind+5]=col[1];
      imageData.data[ind+6]=col[2];
      imageData.data[ind+7]=col[3];
      imageData.data[ind+8]=col[0];
      imageData.data[ind+9]=col[1];
      imageData.data[ind+10]=col[2];
      imageData.data[ind+11]=col[3];
    }
  };

  /**
   * Draw corners and timings for each processed image
   * @inner
   * @param {object} corner and matching information
  */
  this.DrawCorners = function(marker_corners) {
    if(!_debugMatches) return;
    if(!marker_corners) return;

    _screen_corners = marker_corners.screen_corners;
    _profiler       = marker_corners.profiles;
    _image_data     = marker_corners.image_data;


    if(!_screen_corners) return;
    if(!_screen_corners.length) return;

    that.DrawCornerswithContext(marker_corners);
  //  that.DrawCornerswithImageData(marker_corners);

    // console
    _context2d.font="30px Arial";
    _context2d.fillStyle = "red";
    _context2d.textAlign = "left";

    var str = "FPS: " + _profiler.fps.toFixed(2) + "  ";
    for (i = 0; i < _profiler.timers.length; ++i) {
      var pair = _profiler.timers[i];
      str += pair[0] + ": " + pair[1].run_time + "ms  ";
    }

    _context2d.fillText(str, 10, _canvas_height-5-_hbands);
  };
 
  this.DrawCornerswithContext = function(marker_corners) {
    var i, sc, x, y;

    _context2d.fillStyle="red";
  
    _context2d.putImageData(_image_data, _canvas_width-_image_data.width, _hbands);
    for(i = 0; i < _screen_corners.length; ++i) {
      sc = _screen_corners[i];
      if (sc.score===0) break;

      x=Math.round(sc.x*_ratio+_offsetx-2);
      y=Math.round(sc.y*_ratio+_offsety-2);
      _context2d.fillRect(x, y, 4, 4);
      _context2d.fillRect(Math.round(sc.x+_canvas_width-_image_data.width-2), Math.round(sc.y+_hbands-2), 4,4);

      // draw angle
      _context2d.strokeStyle="blue";
      _context2d.lineWidth=2;
      _context2d.beginPath();
      _context2d.moveTo(x+2,y+2);
      _context2d.lineTo(x+2+10*Math.cos(sc.angle),y+2+10*Math.sin(sc.angle));
      _context2d.stroke();
    }

  };

  this.DrawCornerswithImageData = function(marker_corners) {
    var i, sc, x, y;
    // to keep image from video element
    //_context2d.drawImage(_camera_video_element, 0, 0, _canvas_width,_canvas_height );
    //var imageData = _internal_ctx.getImageData(0, 0, _camera_video_element.video_width, _camera_video_element.video_height );
    var imageData = _context2d.getImageData(0, 0, _canvas_width, _canvas_height );

    for(i = 0; i < _screen_corners.length; ++i) {
      sc = _screen_corners[i];
      if (sc.score===0) break;
      x=Math.round(sc.x*_ratio+_offsetx);
      y=Math.round(sc.y*_ratio+_offsety);
      drawLargePoint(imageData, [255,0,0,255], x, y, _canvas_width, _canvas_height );
    }
    _context2d.putImageData(imageData, 0, 0);

    // draw image data and corners
    _context2d.putImageData(_image_data, _canvas_width-_image_data.width, _hbands);
    for(i = 0; i < _screen_corners.length; ++i) {
      sc = _screen_corners[i];
       if (sc.score===0) break;
      x=Math.round(sc.x+_canvas_width-_image_data.width);
      y=Math.round(sc.y);
      var ind=y*4*_image_data.width+4*x;

      imageData.data[ind+0]=255;
      imageData.data[ind+1]=0;
      imageData.data[ind+2]=0;
      imageData.data[ind+3]=255;
  }
    //    _internal_ctx.putImageData(imageData, 0, 0);
    //    _context2d.drawImage(_internal_canvas,0,0);
    _context2d.putImageData(imageData, 0, 0);

  };

  /**
   * Input function for debugging image training and matching
   * @inner
   * @param {object} corner and matching information
   * @param {url} url of the image marker that has been detected
   */
  this.DebugMatching = function(marker_corners, trained_image_url) {
    if(!_debugMatches) return;
    if(!marker_corners) return;
    if(!trained_image_url) return;

    _corners          = marker_corners.corners;
    _trained_corners  = marker_corners.trained_corners;       
    _matches          = marker_corners.matches;
    _matches_mask     = marker_corners.matches_mask;
    _trained_image_url = trained_image_url;

    // draw images, its corresponding corners, and matches
    if(_trained_image_url != _last_trained_url) {
      _last_trained_url=_trained_image_url;

      AM.LoadImage(trained_image_url).then(function(image) {
        var image_data = AM.ImageToImageData(image, false);

        // Train the image
        _last_trained_image_data=image_data;
        _training.Empty();
        _training.TrainFull(_last_trained_image_data);

        correctTrainingImageOffsets();
        displayTrainingImages(true);
        drawContour();
        drawMatches();
        if(_debugTraining){
          displayTrainingImages(false);
          drawTrainedCorners();
        }
      });
    }

    if(_last_trained_image_data){
      correctTrainingImageOffsets();
      displayTrainingImages(true);
      drawContour();
      drawMatches();
      if(_debugTraining){
       displayTrainingImages(false);
       drawTrainedCorners();
     }
   }
 };

  /**
   * Trained images are squared for learning. This function corrects the location of corners inside the trained image
   * by computing _template_offsetx and _template_offsety
   * @inner
   */
  correctTrainingImageOffsets = function () {
    var dif;
    // correct position in template image
    if(_last_trained_image_data.width>_last_trained_image_data.height){
      dif= _last_trained_image_data.width-_last_trained_image_data.height;
      _template_offsetx=0;
      _template_offsety=-Math.round(dif/2);
    }
    else{
      dif= _last_trained_image_data.height-_last_trained_image_data.width;
      _template_offsetx=-Math.round(dif/2);
      _template_offsety=0;
    }
  };

  /**
   * Draw the rectangle contour around the detected image pattern in the live image
   * @inner
   */
  drawContour = function(){
    if(_corners===undefined) return;
    // draw Image corners  (Todo: because we squared initial marquer, result is the square, size should be reduced)
    _context2d.strokeStyle="green";
    _context2d.lineWidth=5;
    _context2d.beginPath();
    _context2d.moveTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.lineTo(_corners[1].x*_ratio+_offsetx,  _corners[1].y*_ratio+_offsety);
    _context2d.lineTo(_corners[2].x*_ratio+_offsetx,  _corners[2].y*_ratio+_offsety);
    _context2d.lineTo(_corners[3].x*_ratio+_offsetx,  _corners[3].y*_ratio+_offsety);
    _context2d.lineTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.stroke();
  };

  /**
   * Draw the matches between corners in live image and corners of trained image (consider levels)
   * @inner
   * @param {bool} use all trained levels or all concatene in one image
   */
  drawMatches = function (all_in_first_image) {
    if(_matches===undefined) return;

    if (typeof all_in_first_image === 'undefined')
      all_in_first_image = false;

    // draw matched trained corners    
    _context2d.lineWidth=2;
    for(var i = 0; i < _matches.length; ++i) {
      var m= _matches[i];
      var mm= _matches_mask.data[i];
      var tcl = _trained_corners[m.pattern_lev];
      var tc = tcl[m.pattern_idx];
      var ts = _screen_corners[m.screen_idx];

      if (mm) {
        _context2d.fillStyle="blue";
        _context2d.strokeStyle="blue";
      }
      else {
        _context2d.fillStyle="red";
        _context2d.strokeStyle="red";
      }

      // compute corner location
      var cornerx=tc.x+_template_offsetx;
      var cornery=tc.y+_template_offsety;
      if(!all_in_first_image){
          cornerx=cornerx*_scaleLevel[m.pattern_lev]+_offsetLevel[m.pattern_lev] ;
          cornery=cornery*_scaleLevel[m.pattern_lev];
      }

      _context2d.fillRect(Math.round(cornerx-2), Math.round(cornery+_hbands-2), 4, 4);

      _context2d.beginPath();
      _context2d.moveTo(cornerx, cornery+_hbands);
      _context2d.lineTo(ts.x*_ratio+_offsetx, ts.y*_ratio+_offsety);
      _context2d.stroke();

      _context2d.fillRect(Math.round(ts.x*_ratio+_offsetx-2), Math.round(ts.y*_ratio+_offsety-2), 4, 4);
    }

  };

  /**
   * Convert a jsfeat matrix in imageData for context drawing
   * @inner
   * @param {jsfeat.matrix_t} image
   * @returns {imageData} image
   */
   jsFeat2ImageData = function (src){
    var dst = _context2d.createImageData(src.cols, src.rows);
    var i = src.data.length, j = (i * 4) + 3;

    while(i --){
      dst.data[j -= 4] = 255;
      dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
    }
    return dst;
  };


  /**
   * Display color trained image
   * @inner
   * @param {originx} x location in canvas
   * @param {originy} y location in canvas
   */
   displayColor= function (originx, originy) {
    // display color
    _context2d.putImageData(_last_trained_image_data, originx, originy);
  };

  /**
   * Display all image levels (blured images) 
   * @inner
   * @param {bool} select upperleft or bottomLeft part
  */
   displayTrainingImages = function (upperLeft) {
    // display grey
    /*var imgGray=jsFeat2ImageData(_training.getGrayData());
    _context2d.putImageData(imgGray, 0, _canvas_height-35-_hbands-imgGray.height);*/

    var bluredImages=_training.getBluredImages();
    var originx=0; // or imgGray.width;
    _offsetLevel[0]=0;
    _scaleLevel[0]=1.0;
    for(var i=0; i < bluredImages.length; ++i) {
      originy=_hbands;
      if(!upperLeft) originy =_canvas_height-35-_hbands-bluredImages[i].rows;
      _context2d.putImageData(jsFeat2ImageData(bluredImages[i]), originx, originy);
      originx+=bluredImages[i].cols;
      _offsetLevel[i+1]=_offsetLevel[i]+bluredImages[i].cols;
      _scaleLevel[i+1]= _scaleLevel[i]/_training.GetScaleIncrement();
    }
  };

  /**
   * Draw the corners detected at each level during image training
   * there is too much corners per levels, we only shows the most important (red stronger)
   * @inner
   * @param {number} number of coirners to display for each level
   */
  drawTrainedCorners = function (number_per_level) {
    if (typeof number_per_level === 'undefined')
      number_per_level = 50;

  var bluredImages=_training.getBluredImages();
  var trained_image = new AM.TrainedImage(_uuid);
  _training.SetResultToTrainedImage(trained_image);

  for(var i = 0; i < trained_image.GetLevelNbr(); ++i) {
    var corners = trained_image.GetCorners(i);
    var descriptors = trained_image.GetDescriptors(i); // what to do with that in debug?
    var originy =_canvas_height-35-_hbands-bluredImages[i].rows;
    

    for(var j = 0; j < number_per_level; ++j) {
      var tc=corners[j];
      _context2d.fillStyle=getGradientGreenRedColor(number_per_level-j,number_per_level); // strongest red

      // compute corner location
      var cornerx=tc.x+_template_offsetx;
      var cornery=tc.y+_template_offsety;
      cornerx=Math.round(cornerx*_scaleLevel[i]+_offsetLevel[i]) ;
      cornery=Math.round(cornery*_scaleLevel[i])+originy;

      _context2d.fillRect(cornerx-2, cornery-2, 4, 4);

      // draw angle
      _context2d.strokeStyle="blue";
      _context2d.lineWidth=2;
      _context2d.beginPath();
      _context2d.moveTo(cornerx,cornery);
      _context2d.lineTo(cornerx+10*Math.cos(tc.angle),cornery+10*Math.sin(tc.angle));
      _context2d.stroke();
    }
  }
};

  /**
   * Update the location of live image corners (samall resized image) with respect to canvas and its borders
   * @inner
   * @param {canvas} current canvas 
   * @param {number} target size of the proceesed image (largest of width and height)
   */
  // todo, there is still a small offset, might be: (1) inaccuracy due to corner location in low resolution, (2) misunderstanding of canvas/live image location
  // but corners stay almost at  fixed locations when resizing, so should be correct.
  // Live mage seems drawed in full canvas then menu bars are on top of it
  this.UpdateSize = function (canvas2d, video_size_target){
    _canvas_height=canvas2d.height;
    _canvas_width =canvas2d.width;

    var corrected_height=_canvas_height;//-2*_hbands;
    var ratioVideoWH = _camera_video_element.videoWidth/_camera_video_element.videoHeight;
    var ratioWindowWH = _canvas_width/corrected_height;

    // correct position in live image
    if(ratioWindowWH>ratioVideoWH) { // larger window width, video is bordered by left and right bands
      var liveWidth=Math.round(corrected_height*ratioVideoWH);
      _ratio=liveWidth/video_size_target;
      _offsetx=Math.round((_canvas_width-liveWidth)*0.5);
      _offsety=0;//_hbands;
    } 
    else { // larger window height, video is bordered by upper and lower bands
      var liveHeight=_canvas_width/ratioVideoWH;
      _ratio=_canvas_width/video_size_target;
      _offsetx=0;
      _offsety=/*_hbands+*/Math.round((corrected_height-liveHeight)*0.5);      
    }
  };

  /**
   * Set data at initialisation
   * @inner
   * @param {context2D} current canvas 
   * @param {video element} webcam element to compute initial video size
   * @param {bool} display or not debugging information
   */
  this.SetData = function ( context2d, camera_video_element, debugMatches) {
    _context2d=context2d;
    _camera_video_element= camera_video_element;
    _debugMatches=debugMatches || false;
  };

  this.SetDebug = function ( debugMatches ) {
    _debugMatches=debugMatches || false;
  };


};