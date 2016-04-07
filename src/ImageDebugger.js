var AM = AM || {};


AM.ImageDebugger = function() {

  var _training = new AM.Training;

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

  var _last_trained_uuid;
  var _last_trained_image_data;

  var _image_loader = new AM.ImageLoader();

  var _debugMatches=false;
  var _debugTraining=true;


  this.DrawCorners = function(marker_corners) {
    if(!_debugMatches) return;
    if(!marker_corners) return;

    _screen_corners = marker_corners.screen_corners;
    _profiler       = marker_corners.profiles;
    _image_data     = marker_corners.image_data;


    if(!_screen_corners.length) return;

    _context2d.fillStyle="red";
  
    for(var i = 0; i < _screen_corners.length; ++i) {
      var sc = _screen_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x*_ratio+_offsetx, sc.y*_ratio+_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }

    // draw image data and corners
    _context2d.putImageData(_image_data, _canvas_width-_image_data.width, _hbands);
    for(var i = 0; i < _screen_corners.length; ++i) {
      var sc = _screen_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x+_canvas_width-_image_data.width, sc.y+_hbands, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }

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
    if(marker_corners.uuid != _last_trained_uuid) {
      _last_trained_uuid=marker_corners.uuid;

      _image_loader.GetImageData(trained_image_url, function(image_data) {
            _last_trained_image_data=image_data;
            correctTrainingImageOffsets();
            displayTrainingImages(true);
            if(_debugTraining) displayTrainingImages(false);
            drawContour();
            drawMatches();
          }, false);
    }

    if(_last_trained_image_data){
      correctTrainingImageOffsets();
      displayTrainingImages(true);
      if(_debugTraining) displayTrainingImages(false);
      drawContour();
      drawMatches();
    }
  };

  correctTrainingImageOffsets = function () {
    // correct position in template image
    if(_last_trained_image_data.width>_last_trained_image_data.height){
      var dif= _last_trained_image_data.width-_last_trained_image_data.height;
      _template_offsetx=0;
      _template_offsety=-Math.round(dif/2);
    }
    else{
      var dif= _last_trained_image_data.height-_last_trained_image_data.width;
      _template_offsetx=-Math.round(dif/2);
      _template_offsety=0;
    }
  };

  drawContour = function(){
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

  drawMatches = function (all_in_first_image=false) {
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

      _context2d.beginPath();
      _context2d.arc(cornerx, cornery+_hbands, 3, 0, 2 * Math.PI);
      _context2d.fill();

      _context2d.beginPath();
      _context2d.moveTo(cornerx, cornery+_hbands);
      _context2d.lineTo(ts.x*_ratio+_offsetx, ts.y*_ratio+_offsety);
      _context2d.stroke();

      _context2d.beginPath();
      _context2d.arc(ts.x*_ratio+_offsetx, ts.y*_ratio+_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }

  };

  jsFeat2ImageData = function (src){
    var dst = _context2d.createImageData(src.cols, src.rows);
    var i = src.data.length, j = (i * 4) + 3;

    while(i --){
      dst.data[j -= 4] = 255;
      dst.data[j - 1] = dst.data[j - 2] = dst.data[j - 3] = src.data[i];
    }
    return dst;
  };


  displayColor= function (originx, originy) {
    // display color
    _context2d.putImageData(_last_trained_image_data, originx, originy);
  };

  //todo, there is maybe a better location to put those images
  displayTrainingImages = function (upperLeft) {
    _training.TrainFull(_last_trained_image_data);
    _training.Empty();

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


  this.SetData = function ( context2d, camera_video_element, debugMatches) {
    _context2d=context2d;
    _camera_video_element= camera_video_element;
    _debugMatches=debugMatches || false;
  };

  this.SetDebug = function ( debugMatches ) {
    _debugMatches=debugMatches || false;
  };


};