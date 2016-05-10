/**
* this code is from all around the web :)
* if u want to put some credits u are welcome!
*/
var compatibility = (function() {
        var lastTime = 0,
        isLittleEndian = true,

        URL = window.URL || window.webkitURL|| window.mozURL || window.msURL,

        requestAnimationFrame = function(callback, element) {
            var requestAnimationFrame =
                window.requestAnimationFrame        || 
                window.webkitRequestAnimationFrame  || 
                window.mozRequestAnimationFrame     || 
                window.oRequestAnimationFrame       ||
                window.msRequestAnimationFrame      ||
                function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            return requestAnimationFrame.call(window, callback, element);
        },

        cancelAnimationFrame = function(id) {
            var cancelAnimationFrame = window.cancelAnimationFrame ||
                                        function(id) {
                                            clearTimeout(id);
                                        };
            return cancelAnimationFrame.call(window, id);
        },

        getUserMedia = function(options, success, error) {
            var getUserMedia =
                window.navigator.getUserMedia ||
                window.navigator.mozGetUserMedia ||
                window.navigator.webkitGetUserMedia ||
                window.navigator.msGetUserMedia ||
                function(options, success, error) {
                    error();
                };

            return getUserMedia.call(window.navigator, options, success, error);
        },

        detectEndian = function() {
            var buf = new ArrayBuffer(8);
            var data = new Uint32Array(buf);
            data[0] = 0xff000000;
            isLittleEndian = true;
            if (buf[0] === 0xff) {
                isLittleEndian = false;
            }
            return isLittleEndian;
        };

    return {
        URL: URL,
        requestAnimationFrame: requestAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        getUserMedia: getUserMedia,
        detectEndian: detectEndian,
        isLittleEndian: isLittleEndian
    };
})();
/**
 * @namespace THREE
 */

 /**
 * @namespace AMTHREE
 */

 /**
 * @namespace AM
 */

/**
 * @typedef THREE.Object3D
 * @see {@link http://threejs.org/docs/index.html#Reference/Core/Object3D|Threejs documentation}
 */
(function() {
  AM = AM || {};

  /**
  * A class to manage event.
  * @class
  * @memberof AM
  */
  var EventManager = function() {
    this._listeners = {};
  };

  /**
  * Adds a listener to an event.
  * @param {string} name - The name of the event to listen to.
  * @param {function} fun - The function that will be called every time the event fires.
  * @returns {bool} true if the function has succefully be added, false otherwise, if the name isnt a string or if the function is already bound to this event.
  */
  EventManager.prototype.AddListener = function(name, fun) {
    if (typeof name === 'string') {
      if (typeof this._listeners[name] === 'undefined')
        this._listeners[name] = [];
      
      if (this._listeners[name].indexOf(fun) == -1) {
        this._listeners[name].push(fun);
        return true;
      }
    }
    return false;
  };

  /**
  * Removes a listener to an event.
  * @param {string} name - The name of the event.
  * @param {function} fun - The listener to remove.
  * @returns {bool} true if the function has succefully be removed, false otherwise.
  */
  EventManager.prototype.RemoveListener = function(name, fun) {
    if (typeof name === 'string') {
      var tab = this._listeners[name];

      if (typeof tab !== 'undefined') {

        var index = tab.indexOf(fun);
        if (index != -1) {

          if (tab.length != 1)
            tab.splice(index, 1);
          else
            delete this._listeners[name];

          return true;
        }

      }
    }
    return false;
  };

  /**
  * Fires an event, by calling every function bound to it.
  * @param {string} name - The name of the event.
  * @param {Array.<value>} params - The list of parameters to be passed to the listeners.
  * @returns {bool} true if the event has any listener bound to it, false otherwise.
  */
  EventManager.prototype.Fire = function(name, params) {
    if (typeof name === 'string') {
      var tab = this._listeners[name];

      if (typeof tab !== 'undefined') {
        for (var i = 0, c = tab.length; i < c; ++i) {
          if (typeof tab[i] === 'function')
            tab[i].apply(this, params);
        }
        return true;
      }
    }
    return false;
  };

  AM.EventManager = EventManager;

})();
navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL;


var AM = AM || {};

(function() {
  
  /**
  * Class to start the front camera of the device, or a webcam, on a computer.
  * @param {VideoElement} [video_element] - An html element to play the stream in. Created if not provided.
  */
  function FrontCamGrabbing(video_element) {
    var _dom_element = (video_element && video_element.tagName === 'VIDEO') ? video_element : document.createElement('video');
    var _stream;
    var _loader;
    var _load_promise;
    var _started = false;

    _dom_element.setAttribute('autoplay', true);

    _dom_element.style.position = 'absolute';

    _dom_element.style.top = '0px';
    _dom_element.style.left = '0px';
    _dom_element.style.width = '100%';
    _dom_element.style.height = 'auto';

    this.domElement = _dom_element;

    Stop();

    /**
    * Starts the camera, if not already started.
    * @returns {Promise<undefined, string>} A promise that resolves when the video is loaded.
    */
    function Start() {
      if (!_started) {
        if (_loader) {
          _load_promise.catch(IgnoreReject);
          _loader.Dispose();
        }
        _started = true;

        _loader = new Loader(_dom_element);
        _load_promise = _loader.Load().then(function(stream) {
          _stream = stream;
        });
      }

      return _load_promise;
    }

    /**
    * Stops the camera.
    */
    function Stop() {
      if (_stream) {
        _stream.getTracks()[0].stop();
        _stream = undefined;
      }
      if (_loader) {
        _load_promise.catch(IgnoreReject);
        _loader.Dispose();
        _loader = undefined;
      }
      _started = false;
    }

    /**
    * Pauses or unpauses the video element, if this is active.
    * @param {bool} bool
    * @returns {bool} true if paused, false otherwise.
    */
    function Pause(bool) {
      if (_started && bool !== IsPaused()) {
        if (bool)
          _dom_element.pause();
        else
          _dom_element.play();
      }
      return IsPaused();
    }

    /**
    * Toggle pause.
    * @returns {bool} true if paused, false otherwise.
    */
    function TogglePause() {
      return Pause(!IsPaused());
    }

    /**
    * Returns true if paused, false otherwise.
    * @returns {bool}
    */
    function IsPaused() {
      return _dom_element.paused;
    }

    /**
    * Returns true if the camera is active, or if is being started, false otherwise.
    * @returns {bool}
    */
    function IsActive() {
      return _started;
    }

    function IgnoreReject(e) {
    }

    this.Start = Start;
    this.Stop = Stop;
    this.IsActive = IsActive;
    this.Pause = Pause;
    this.TogglePause = TogglePause;
    this.IsPaused = IsPaused;


  }

  function Loader(dom_element) {
    var _to_destruct = false;


    function WaitHaveEnoughData(video_element) {
      return new Promise(function(resolve, reject) {
        (function Frame() {
          if (_to_destruct)
            reject('loader interrupted');
          if (video_element.readyState === video_element.HAVE_ENOUGH_DATA)
            resolve();
          else
            window.requestAnimationFrame(Frame);
        })();
      });
    }

    function GetStream(source_infos) {
      var p = new Promise(function(resolve, reject) {
        if (_to_destruct)
          reject('loader interrupted');

        var constraints = {
          video: true,
          audio: false
        };

        for (var i = 0; i != source_infos.length; ++i) {
          var sourceInfo = source_infos[i];
          if (sourceInfo.kind == 'video' && sourceInfo.facing == 'environment') {
            constraints.video = {
              optional: [{sourceId: sourceInfo.id}]
            };
          }
        }

        navigator.getUserMedia(constraints, resolve, reject);
      });

      p = p.then(function(stream) {
        dom_element.src = window.URL.createObjectURL(stream);
        return WaitHaveEnoughData(dom_element).then(function() {
          return stream;
        });
      });

      return p;
    }

    function GetSourcesMST() {
      return new Promise(function(resolve, reject) {
        if (_to_destruct)
          reject('loader interrupted');
        return MediaStreamTrack.getSources(resolve);
      });
    }

    function GetSourcesMD() {
      if (_to_destruct)
        return Promise.reject('loader interrupted');
      else if (navigator.mediaDevices)
        return navigator.mediaDevices.enumerateDevices();
      else
        return Promise.reject('navigator.mediaDevices is undefined');
    }

    function Load() {
      if (_to_destruct)
        return Promise.reject('loader interrupted');

      var p = PromiseOr(GetSourcesMST(), GetSourcesMD()).then(GetStream);

      return p;
    }

    function Dispose() {
      _to_destruct = true;
    }

    function PromiseOr(p1, p2) {
      return new Promise(function(resolve, reject) {
        var rejected_once = false;
        var OnReject = function(e) {
          if (rejected_once)
            reject(e);
          else
            rejected_once = true;
        };
        p1.then(resolve, OnReject);
        p2.then(resolve, OnReject);
      });
    }

    this.Load = Load;
    this.Dispose = Dispose;
  }


  AM.FrontCamGrabbing = FrontCamGrabbing;

})();
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
  var _trained_descriptors;
  var _screen_corners;
  var _matches;
  var _matches_mask;
  var _profiler;
  var _image_data;
  var _uuid;
  var _matched;

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
    _trained_descriptors = marker_corners.trained_descriptors;       
    _matches          = marker_corners.matches;
    _matches_mask     = marker_corners.matches_mask;
    _trained_image_url = trained_image_url;
    _matched           = marker_corners.matched;

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

      if (mm && _matched) {
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
      number_per_level = 300;

  var bluredImages=_training.getBluredImages();
  var trained_image = new AM.TrainedImage(_uuid);
  _training.SetResultToTrainedImage(trained_image);
  trained_image.Set(_trained_corners, _trained_descriptors, trained_image.GetWidth(), trained_image.GetHeight());

  for(var i = 0; i < trained_image.GetLevelNbr(); ++i) {
    var corners = trained_image.GetCorners(i);
    var descriptors = trained_image.GetDescriptors(i); // what to do with that in debug?
    var originy =_canvas_height-35-_hbands-bluredImages[i].rows;
    
    var nb_display=Math.min(number_per_level, corners.length);
    for(var j = 0; j < nb_display; ++j) {
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

    var ratioVideoWH = _camera_video_element.videoWidth/_camera_video_element.videoHeight;
    var ratioWindowWH = _canvas_width/_canvas_height;

    // correct position in live image
    if(ratioWindowWH<ratioVideoWH) { 
      // larger window width than video, video is cropped on left and right sides
      var liveWidth=Math.round(_canvas_height*ratioVideoWH);
      _ratio=_canvas_height/video_size_target;
      _offsetx=Math.round((_canvas_width-liveWidth)*0.5);
      _offsety=0;//_hbands;
    } 
    else { 
      // larger window height than video, video is cropped on upper and lower sides
      var liveHeight=_canvas_width/ratioVideoWH;
      _ratio=liveHeight/video_size_target;
      _offsetx=0;
      _offsety=Math.round((_canvas_height-liveHeight)*0.5);      
    }
  };

  /**
   * Set data at initialisation
   * @inner
   * @param {context2D} current canvas 
   * @param {VideoElement} webcam element to compute initial video size
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
var AM = AM || {};


/**
* Utility class to load a json file and convert the string to a json structure. Can load only one file at a time.
* @class
*/
AM.JsonLoader = function() {
  var that = this;

  var _loading = false;
  var _on_load;
  var _on_error;
  var _on_progress;
  var _url;

  var _xhr;

  function OnEnd(callback, param) {
    _loading = false;
    _on_progress = undefined;
    _on_error = undefined;
    _on_load = undefined;
    _xhr = undefined;
    _url = undefined;
    that.progress = 0;
    if (callback)
      callback(param);
  }

  function OnLoad() {
    try
    {
      that.json = JSON.parse(_xhr.responseText);
      OnEnd(_on_load);
    }
    catch(e)
    {
      that.json = {};
      OnEnd(_on_error, 'failed to parse file: ' + _url);
    }
  }

  function OnError(e) {
    var msg = 'JsonLoader failed to open file: ' + _url;

    console.log(msg);
    OnEnd(_on_error, msg);
  }

  function OnProgress(e) {
    that.progress = (e.loaded / e.total) * 100;
    if (_on_progress)
      _on_progress();
  }


  this.json = {};
  this.progress = 0;

  this.IsLoading = function() {
    return _loading;
  };

  /**
  * Loads a file
  * @param {string} url
  * @param {function} on_load
  * @param {function} on_error
  * @param {function} on_progress
  */
  this.Load = function(url, on_load, on_error, on_progress) {
    if (!_loading) {
      _loading = true;

      _on_load = on_load;
      _on_error = on_error;
      _on_progress = on_progress;
      _url = url;

      _xhr = new XMLHttpRequest();
      _xhr.onprogress = OnProgress;
      _xhr.open("GET", url, true);
      _xhr.onload = OnLoad;
      _xhr.onerror = OnError;
      _xhr.send(null);
    }
  };
};

/**
* Loads a json file using AM.JsonLoader.
* @function
* @param {string} url
* @returns {Promise<object, string>}
*/
AM.LoadJson = function(url) {
  return new Promise(function(resolve, reject) {
    var loader = new AM.JsonLoader();
    loader.Load(url, function() {
      resolve(loader.json);
    }, reject);
  });
};
var AM = AM || {};


/**
* Helper class to manager loadings, and bind callbacks.
* @class
*/
AM.LoadingManager = function() {

  var _end_callbacks = [];
  var _progress_callbacks = [];
  var _loading = 0;

  function DoCallbacks(array) {
    for (var i = 0, c = array.length; i < c; ++i)
      array[i]();
  }
  

  /**
  * Registers a number of loading starts.
  * @param {number} nbr
  */
  this.Start = function(nbr) {
    nbr = nbr || 1;
    _loading += nbr;
    DoCallbacks(_progress_callbacks);
  };

  /**
  * Registers a number of loading ends. If there is no loadings left, the listeners are notified, and every listener are removed.
  * @param {number} nbr
  */
  this.End = function(nbr) {
    nbr = nbr || 1;
    if (_loading > 0) {
      _loading -= nbr;
      DoCallbacks(_progress_callbacks);
    }
    if (_loading <= 0) {
      _loading = 0;
      DoCallbacks(_end_callbacks);
      _end_callbacks.length = 0;
      _progress_callbacks.length = 0;
    }
  };

  /**
  * Adds a listener to the event of the end of the loadings.
  * @param {function} callback
  */
  this.OnEnd = function(callback) {
    if (_loading > 0) {
      _end_callbacks.push(callback);
    }
    else
      callback();
  };

  /**
  * Adds a listener to the event of a change.
  * @param {function} callback
  */
  this.OnProgress = function(callback) {
    if (_loading > 0) {
      _progress_callbacks.push(callback);
    }
    else
      callback();
  };

  /**
  * Returns true if there are loadings left.
  * @returns {boolean}
  */
  this.IsLoading = function() {
    return _loading > 0;
  };

  /**
  * Returns the number of loadings left.
  * @returns {number}
  */
  this.GetRemaining = function() {
    return _loading;
  };

};
var AM = AM || {};

(function() {


  var stopwatch = (function() {
    
    function stopwatch() {
      this.start_time = 0;
      this.stop_time = 0;
      this.run_time = 0;
      this.running = false;
    }

    stopwatch.prototype.start = function() {
      this.start_time = new Date().getTime();
      this.running = true;
    };

    stopwatch.prototype.stop = function() {
      this.stop_time = new Date().getTime();
      this.run_time = (this.stop_time - this.start_time);
      this.running = false;
    };

    stopwatch.prototype.get_runtime = function() {
      return this.run_time;
    };

    stopwatch.prototype.reset = function() {
      this.run_time = 0;
    };

    return stopwatch;
  })();

  var ring_buffer = (function() {

    function ring_buffer(size) {
      this.arr = new Int32Array(size);
      this.begin = 0;
      this.end = -1;
      this.num_el = 0;
      this.arr_size = size;
    }

    ring_buffer.prototype.push_back = function(elem) {
      if (this.num_el<this.arr_size) {
        this.end++;
        this.arr[this.end] = elem;
        this.num_el++;
      } else {
        this.end = (this.end+1)%this.arr_size;
        this.begin = (this.begin+1)%this.arr_size;
        this.arr[this.end] = elem;
      }
    };

    ring_buffer.prototype.get = function(i) {
      return this.arr[(this.begin+i)%this.arr_size];
    };

    ring_buffer.prototype.size = function() {
      return this.num_el;
    };

    return ring_buffer;

  })();

  var profiler = (function() {

    var count_frames = 0;
    var ringbuff = new ring_buffer(20);
    function profiler() {
      this.fps = 0;
      this.timers = [];
      this.frame_timer = new stopwatch();
    }

    profiler.prototype.add = function(subj) {
      this.timers.push([subj, new stopwatch()]);
    };

    profiler.prototype.new_frame = function() {
      ++count_frames;
      var i = 0;
      var n = this.timers.length | 0;
      for(i = 0; i < n; ++i) {
        var sw = this.timers[i][1];
        sw.reset();
      }

      if(count_frames >= 1) {
        this.frame_timer.stop();
        ringbuff.push_back(this.frame_timer.get_runtime());
        var size = ringbuff.size();
        var sum = 0;
        for(i = 0; i < size; ++i) {
          sum += ringbuff.get(i);
        }
        this.fps = size / sum * 1000;
        this.frame_timer.start();
      }
    };

    profiler.prototype.find_task = function(subj) {
      var n = this.timers.length | 0;
      var i = 0;
      for(i = 0; i < n; ++i) {
        var pair = this.timers[i];
        if(pair[0] === subj) {
          return pair;
        }
      }
      return null;
    };

    profiler.prototype.start = function(subj) {
      var task = this.find_task(subj);
      task[1].start();
    };

    profiler.prototype.stop = function(subj) {
      var task = this.find_task(subj);
      task[1].stop();
    };

    profiler.prototype.log = function () {
      var n = this.timers.length | 0;
      var i = 0;
      var str = "<strong>FPS: " + this.fps.toFixed(2) + "</strong>";
      for (i = 0; i < n; ++i) {
        var pair = this.timers[i];
        str += "<br/>" + pair[0] + ": " + pair[1].get_runtime() + "ms";
      }
      return str;
    };

    profiler.prototype.log2 = function () {
      var n = this.timers.length | 0;
      var i = 0;
      var str = "FPS: " + this.fps.toFixed(2) + "  ";
      for (i = 0; i < n; ++i) {
        var pair = this.timers[i];
        str += pair[0] + ": " + pair[1].get_runtime() + "ms  ";
      }
      return str;
    };

    profiler.prototype.GetProfiler = function (){
      return { fps: this.fps, timers: this.timers };
    };

    return profiler;
  })();


  AM.Profiler = profiler;

})();

/**************

DeviceLockScreenOrientation
Wrapper class for the Cordova plugin

Constructor

DeviceLockScreenOrientation()
Init variables and add a 'deviceready' listener


Methods

LockLandscape()

LockPortrait()

Unlock()


Dependency

'Cordova Screen Orientation Plugin':
cordova plugin add cordova-plugin-screen-orientation


*************/

var AM = AM || {};


/**
 * Wrapper class for the Cordova plugin
 * <br><br>Requires 'Cordova Screen Orientation Plugin'
 * <br>cordova plugin add cordova-plugin-screen-orientation
 * @class
 */
AM.DeviceLockScreenOrientation = function() {

  var _ready = false;
  var _enabled = true;
  var _pending_commands = [];

  document.addEventListener("deviceready", OnDeviceReady, false);

  function OnDeviceReady() {
    if (window.cordova) {
      ExecPendingCommands();
      _ready = true;
    }
    else
      _enabled = false;
  }

  function ExecPendingCommands() {
    for (var i = 0, c = _pending_commands.length; i < c; ++i) {
      _pending_commands[i]();
    }
    _pending_commands.length = 0;
  }

  function Command(func) {
    if (_enabled) {
      if (_ready)
        func();
      else
        _pending_commands.push(func);
    }
  }

  function LockLandscapeDoit() {
    screen.lockOrientation('landscape-primary');
  }

  function LockPortraitDoit() {
    screen.lockOrientation('portrait-primary');
  }

  function UnlockDoit() {
    screen.unlockOrientation();
  }

  /**
   * @inner
   */
  this.LockLandscape = function() {
    Command(LockLandscapeDoit);
  };

  /**
   * @inner
   */
  this.LockPortrait = function() {
    Command(LockPortraitDoit);
  };

  /**
   * @inner
   */
  this.Unlock = function() {
    Command(UnlockDoit);
  };
};
var AM = AM || {};


(function() {

  /**
   * Wrapper class for the Cordova plugin
   * @class
   * @param {Object3D}
   */
  AM.DeviceOrientationControl = function(object) {
  	var that = this;

    this.object = object;
    this.object.rotation.reorder("YXZ");

    this.alpha = 0;
    this.beta  = 0;
    this.gamma = 0;

    var _first_event_ignored = false;
    var _enabled = false;

    var _screen_orientation = 0;

    var _smooth = new this.CoefMethod();


    var OnDeviceOrientationChangeEvent = function (event) {
      if (_first_event_ignored) {
        _smooth.OnOrientationChange(event);
        _enabled = true;
      }
      else
        _first_event_ignored = true;
    };

    var OnScreenOrientationChangeEvent = function () {
      _screen_orientation = window.orientation || 0;
    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    /**
     * Listen to the orientation events
     * @inner
     */
    this.Connect = function() {
      OnScreenOrientationChangeEvent();

      window.addEventListener('orientationchange', OnScreenOrientationChangeEvent, false);
      window.addEventListener('deviceorientation', OnDeviceOrientationChangeEvent, false);
    };

    /**
     * Listen to the orientation events
     * @inner
     */
    this.Disconnect = function() {
      window.removeEventListener('orientationchange', OnScreenOrientationChangeEvent, false);
      window.removeEventListener('deviceorientation', OnDeviceOrientationChangeEvent, false);

      _enabled = false;
      _first_event_ignored = false;
    };

    /**
     * Sets the rotation of the object accordingly to the last orientation event
     * @inner
     */
    this.Update = function () {

      var SetObjectQuaternion = function () {
        var zee = new THREE.Vector3( 0, 0, 1 );
        var euler = new THREE.Euler();
        var q0 = new THREE.Quaternion();
        var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

        return function (quaternion, alpha, beta, gamma, orient) {
          euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
          quaternion.setFromEuler( euler );                               // orient the device
          quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
          quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
        };
      }();

      if (_enabled) {
        var orient = _screen_orientation ? THREE.Math.degToRad(_screen_orientation) : 0;

        _smooth.Update();

        that.alpha = _smooth.alpha;
        that.beta  = _smooth.beta;
        that.gamma = _smooth.gamma;
        SetObjectQuaternion(that.object.quaternion, _smooth.alpha, _smooth.beta, _smooth.gamma, orient);
      }

    };
  };


  AM.DeviceOrientationControl.prototype.PowerMethod = function() {
    var that = this;

    var _event;

    var _power = 2;


    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    this.OnOrientationChange = function(e) {
      _event = e;
    };

    function power_lerp_rad(a, b, power) {
      var diff = Mod2Pi(b - a);
      var sign = Math.sign(diff);
      var coef = Math.abs(diff / Math.PI);
      coef = Math.pow(coef, power);

      return Mod2Pi(a + coef * Math.PI * sign);
    }

    this.Update = function() {
      that.alpha = power_lerp_rad(that.alpha, THREE.Math.degToRad(_event.alpha), _power);
      that.beta  = power_lerp_rad(that.beta,  THREE.Math.degToRad(_event.beta),  _power);
      that.gamma = power_lerp_rad(that.gamma, THREE.Math.degToRad(_event.gamma), _power);
    };
  };


  AM.DeviceOrientationControl.prototype.CoefMethod = function() {
    var that = this;

    this.coef = 0.2;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    var _events = [];

    this.OnOrientationChange = function(e) {
      _events.push(e);
    };

    function lerp_rad(a, b, coef) {
      return a + Mod2Pi(b - a) * coef;
    }

    this.Update = function() {
      if (_events.length > 0) {
        var alpha = that.alpha;
        var beta  = that.beta;
        var gamma = that.gamma;
        var event;

        for (var i = 0, c = _events.length; i < c; ++i) {
          event = _events[i];
          alpha = Mod2Pi(lerp_rad(alpha, THREE.Math.degToRad(event.alpha), that.coef));
          beta  = Mod2Pi(lerp_rad(beta,  THREE.Math.degToRad(event.beta),  that.coef));
          gamma = Mod2Pi(lerp_rad(gamma, THREE.Math.degToRad(event.gamma), that.coef));
        }

        that.alpha = alpha;
        that.beta = beta;
        that.gamma = gamma;

        _events.length = 0;
      }
    };
  };


  AM.DeviceOrientationControl.prototype.AverageMethod = function() {
    var that = this;

    this.history = [];
    this.history_max = 10;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    this.OnOrientationChange = function(event) {
      if (that.history.length > that.history_max)
        that.history.shift();
      that.history.push(event);
    };

    this.Update = function(alpha, beta, gamma) {
      if (that.history.length !== 0) {
        for (var i = 0, c = that.history.length; i < c; i++) {
          alpha += Mod360(that.history[i].alpha);
          beta += Mod360(that.history[i].beta);
          gamma += Mod360(that.history[i].gamma);
        }
        alpha /= that.history.length;
        beta /= that.history.length;
        gamma /= that.history.length;
        that.alpha = THREE.Math.degToRad(alpha);
        that.beta = THREE.Math.degToRad(beta);
        that.gamma = THREE.Math.degToRad(gamma);
      }
    };
  };


  var Mod2Pi = (function() {
    var n = Math.PI;
    var k = Math.PI * 2;

    return function(val) {
      if (val > n) {
        do {
          val -= k;
        } while (val > n);
      }
      else if (val < -n) {
        do {
          val += k;
        } while (val < -n);
      }
      return val;
    };
  })();


  function Mod360(val) {
    val = val % 360;
    return (val < 180) ? val : val - 360;
  }

})();
/********************


GeographicCoordinatesConverter
A class to convert GPS coordinates to flat (x, z) coordinates.


Constructor

GeographicCoordinatesConverter(latitude: float, longitude: float)
Sets the origin. The coordinates should be in radiants.


Methods

GetLocalCoordinates(latitude: float, longitude: float) -> THREE.Vector3
Returns a THREE.Vector3 containing the new coordinates in 'x' and 'z' properties.
'latitude' and 'longitude' should be in radiants.

GetLocalCoordinatesFromDegres(latitude: float, longitude: float) -> THREE.Vector3
Same as above, with coordinates in degres.

SetOrigin(latitude: float, longitude: float)
Sets the origin. The coordinates should be in radiants.

SetOriginFromDegres(latitude: float, longitude: float)
Same as above, with coordinates in degres.

GetOrigin()
Returns the origin as object with the properties 'latitude' and 'longitude' in radiant.


Dependency

Threejs


********************/


var AM = AM || {};


/**
 * This class converts GPS coordinates to flat (x, z) coordinates.
 * @class
 * @param {number} latitude - latitude of the origin
 * @param {number} longitude - longitude of the origin
 */
AM.GeographicCoordinatesConverter = function(latitude, longitude) {
  var that = this;

  var _origin = { latitude: 0, longitude: 0 };

  /**
   * @typedef Point2D
   * @type {Object}
   * @property {number} x
   * @property {number} y
   */

  /**
   * @typedef Coordinates
   * @type {Object}
   * @property {number} longitude
   * @property {number} latitude
   */

  /**
   * @inner
   * @param {number} latitude - latitude in radians
   * @param {number} longitude - longitude in radians
   * @returns {Point2D}
   */
  this.GetLocalCoordinates = function(latitude, longitude) {

    var medium_latitude = (_origin.latitude + latitude) / 2;

    var pos = { x: 0, y: 0 };

    pos.x = (longitude - _origin.longitude) * that.EARTH_RADIUS * Math.cos(medium_latitude);
    pos.y = (latitude - _origin.latitude) * -that.EARTH_RADIUS;

    return pos;
  };

  /**
   * @inner
   * @param {number} latitude - latitude in degres
   * @param {number} longitude - longitude in degres
   * @returns {Point2D}
   */
  this.GetLocalCoordinatesFromDegres = function(latitude, longitude) {
    return that.GetLocalCoordinates(THREE.Math.degToRad(latitude), THREE.Math.degToRad(longitude));
  };

  /**
   * @inner
   * @param {number} latitude - latitude in radians
   * @param {number} longitude - longitude in radians
   */
  this.SetOrigin = function(latitude, longitude) {
    _origin.latitude = latitude;
    _origin.longitude = longitude;
  };

  /**
   * @inner
   * @param {number} latitude - latitude in degres
   * @param {number} longitude - longitude in degres
   */
  this.SetOriginFromDegres = function(latitude, longitude) {
    _origin.latitude = THREE.Math.degToRad(latitude);
    _origin.longitude = THREE.Math.degToRad(longitude);
  };

  /**
   * @inner
   * @returns {Coordinates} The origin in radians
   */
  this.GetOrigin = function() {
    return _origin;
  };

  this.SetOrigin(latitude || 0, longitude || 0);

};

AM.GeographicCoordinatesConverter.prototype.EARTH_RADIUS = 6371000;
/*****************


GeolocationControl
place a THREE.Object3D using the gyroscope


Constructor

GeolocationControl( object, geoConverter )
sets the THREE.Object3D to move, and the Math.GeoToCoordsConverter
to convert GPS coordinates to flat coordinates


Properties

object
The target object

interpolation_coefficient
number in [0, 1]. The object is moved to the target position
using linear interpolation and this coefficient

retry_connexion_ms
Time in milliseconds
If Connect() fails, wait for this time before trying again.


Methods

Connect() 
listen to the geolocation events

Update()
move smoothly the object towards the last known position

Disconnect()
remove the listeners


Dependency

Threejs

GeographicCoordinatesConverter


******************/


var AM = AM || {};


/**
 * Place a THREE.Object3D using the gyroscope.
 * @class
 * @param {THREE.Object3D} object
 * @param {AM.GeographicCoordinatesConverter} geoConverter
 */
AM.GeolocationControl = function(object, geoConverter) {

	var that = this;

	var _to_update = false;
	var _target_position = new THREE.Vector3();
	var _watch_id = 0;
	var _coordinates_converter = geoConverter;
  var _accuracy = 0.1;

  this.object = object;
	this.interpolation_coefficient = 0.02;
  this.retry_connection_ms = 1000;

	function OnSuccess(pos) {
		_target_position.copy(_coordinates_converter.GetLocalCoordinatesFromDegres(
      pos.coords.latitude, pos.coords.longitude));
		_to_update = true;
	}

	function OnError(error) {
		console.warn('geolocation failed: ' + error.message);
    window.setTimeout(that.Connect, that.retry_connection_ms);
	}

  /**
  * Listen to the geolocation events.
  * @inner
  */
	this.Connect = function() {
		_watch_id = navigator.geolocation.watchPosition(OnSuccess, OnError);
	};

  /**
  * Remove the listeners.
  * @inner
  */
	this.Disconnect = function() {
		navigator.geolocation.clearWatch(_watch_id);
    _to_update = false;
	};

  /**
  * Move smoothly the object towards the last known position.
  * @inner
  */
	this.Update = function() {
		if (_to_update) {

			var diffX = _target_position.x - that.object.position.x;
			var diffZ = _target_position.z - that.object.position.z;

      var distance_sq = diffX * diffX + diffZ * diffZ;

			if (distance_sq < _accuracy * _accuracy) {
				_to_update = false;
			}
			else {
				diffX *= that.interpolation_coefficient;
				diffZ *= that.interpolation_coefficient;
				that.object.position.x += diffX;
				that.object.position.z += diffZ;
			}

		}
	};

};
var AMTHREE = AMTHREE || {};


/**
* @author Tim Knip {@link http://www.floorplanner.com/} tim at floorplanner.com
* @author Tony Parisi {@link http://www.tonyparisi.com/}
* @class
* @description A class to load Collada models, edited to add functionality.
* @memberof AMTHREE
*/

AMTHREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = null;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};
	var lights = {};

	var animData;
	var kinematics;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
  var texturePath;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;


  /**
  * Loads a Collada model
  * @param {string} url
  * @param {string} texture_path
  * @param {function} readyCallback
  * @param {function} progressCallback
  * @param {function} failCallback
  */
	function load ( url, texture_path, readyCallback, progressCallback, failCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {

				if ( request.readyState === 4 ) {

					if ( request.status === 0 || request.status === 200 ) {

						if ( request.response ) {

							readyCallbackFunc = readyCallback;
							parse( request.response, undefined, url, texture_path );

						} else {

							if ( failCallback ) {

								failCallback();

							} else {

								console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

							}

						}

					}

				} else if ( request.readyState === 3 ) {

					if ( progressCallback ) {

						if ( length === 0 ) {

							length = request.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: request.responseText.length } );

					}

				}

			};

			request.open( "GET", url, true );
			request.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	}

	function parse( text, callBack, url, texture_path ) {

    texturePath = texture_path;

		COLLADA = new DOMParser().parseFromString( text, 'text/xml' );
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "library_images image", _Image, "image" );
		materials = parseLib( "library_materials material", Material, "material" );
		effects = parseLib( "library_effects effect", Effect, "effect" );
		geometries = parseLib( "library_geometries geometry", Geometry, "geometry" );
		cameras = parseLib( "library_cameras camera", Camera, "camera" );
		lights = parseLib( "library_lights light", Light, "light" );
		controllers = parseLib( "library_controllers controller", Controller, "controller" );
		animations = parseLib( "library_animations animation", Animation, "animation" );
		visualScenes = parseLib( "library_visual_scenes visual_scene", VisualScene, "visual_scene" );
		kinematicsModels = parseLib( "library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model" );

		morphs = [];
		skins = [];

		visualScene = parseScene();
		scene = new THREE.Group();

		for ( var i = 0; i < visualScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( visualScene.nodes[ i ] ) );

		}

		// unit conversion
		scene.scale.multiplyScalar( colladaUnit );

		createAnimations();

		kinematicsModel = parseKinematicsModel();
		createKinematics();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			kinematics: kinematics,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				lights: lights,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				visualScene: visualScene,
				scene: visualScene,
				kinematicsModels: kinematicsModels,
				kinematicsModel: kinematicsModel
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	}

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	}

	function parseAsset () {

		var elements = COLLADA.querySelectorAll('asset');

		var element = elements[0];

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	}

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.querySelectorAll(q);

		var lib = {};

		var i = 0;

		var elementsLength = elements.length;

		for ( var j = 0; j < elementsLength; j ++ ) {

			var element = elements[j];
			var daeElement = ( new classSpec() ).parse( element );

			if ( !daeElement.id || daeElement.id.length === 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

		}

		return lib;

	}

	function parseScene() {

		var sceneElement = COLLADA.querySelectorAll('scene instance_visual_scene')[0];

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	}

	function parseKinematicsModel() {

		var kinematicsModelElement = COLLADA.querySelectorAll('instance_kinematics_model')[0];

		if ( kinematicsModelElement ) {

			var url = kinematicsModelElement.getAttribute( 'url' ).replace(/^#/, '');
			return kinematicsModels[ url.length > 0 ? url : 'kinematics_model0' ];

		} else {

			return null;

		}

	}

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	}

	function recurseHierarchy( node ) {

		var n = visualScene.getChildById( node.colladaId, true ),
			newData = null;
    var i, il;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( i = 0, il = n.keys.length; i < il; i ++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			};

		}

		for ( i = 0, il = node.children.length; i < il; i ++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	}

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;
		var ID;
		for ( var id in animations ) {

			var animation = animations[ id ];
			ID = ID || animation.id;
			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];

				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames,ID:ID };

	}

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	}

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = visualScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

			}

		}

	}

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.localworld = node.localworld || new THREE.Matrix4();
		node.world.copy( node.matrix );
		node.localworld.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );
				node.localworld.copy(m);
				if (frame === 0)
					node.matrix.copy(m);
			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	}

	function setupSkinningMatrices ( bones, skin ) {
    var j;

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid === skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices(bone.world, inv); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4();

				bone.animatrix.copy(bone.localworld);
				bone.weights = [];

				for ( j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++ ) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint === found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				console.warn( "ColladaLoader: Could not find joint '" + bone.sid + "'." );

				bone.skinningMatrix = new THREE.Matrix4();
				bone.weights = [];

			}
		}

	}

	//Walk the Collada tree and flatten the bones into a list, extract the position, quat and scale from the matrix
	function flattenSkeleton(skeleton) {

		var list = [];
		var walk = function(parentid, node, list) {

			var bone = {};
			bone.name = node.sid;
			bone.parent = parentid;
			bone.matrix = node.matrix;
			var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
			bone.matrix.decompose(data[0], data[1], data[2]);

			bone.pos = [ data[0].x,data[0].y,data[0].z ];

			bone.scl = [ data[2].x,data[2].y,data[2].z ];
			bone.rotq = [ data[1].x,data[1].y,data[1].z,data[1].w ];
			list.push(bone);

			for (var i in node.nodes) {

				walk(node.sid, node.nodes[i], list);

			}

		};

		walk(-1, skeleton, list);
		return list;

	}

	//Move the vertices into the pose that is proper for the start of the animation
	function skinToBindPose(geometry,skeleton,skinController) {

		var bones = [];
		setupSkeleton( skeleton, bones, -1 );
		setupSkinningMatrices( bones, skinController.skin );
		var v = new THREE.Vector3();
		var skinned = [];
    var i;

		for (i = 0; i < geometry.vertices.length; i ++) {

			skinned.push(new THREE.Vector3());

		}

		for ( i = 0; i < bones.length; i ++ ) {

			if ( bones[ i ].type != 'JOINT' ) continue;

			for ( var j = 0; j < bones[ i ].weights.length; j ++ ) {

				var w = bones[ i ].weights[ j ];
				var vidx = w.index;
				var weight = w.weight;

				var o = geometry.vertices[vidx];
				var s = skinned[vidx];

				v.x = o.x;
				v.y = o.y;
				v.z = o.z;

				v.applyMatrix4( bones[i].skinningMatrix );

				s.x += (v.x * weight);
				s.y += (v.y * weight);
				s.z += (v.z * weight);
			}

		}

		for (i = 0; i < geometry.vertices.length; i ++) {

			geometry.vertices[i] = skinned[i];

		}

	}

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];
    var i, j;

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = visualScene.getChildById( instanceCtrl.skeleton[0], true ) || visualScene.getChildBySid( instanceCtrl.skeleton[0], true );

		//flatten the skeleton into a list of bones
		var bonelist = flattenSkeleton(skeleton);
		var joints = skinController.skin.joints;

		//sort that list so that the order reflects the order in the joint list
		var sortedbones = [];
		for (i = 0; i < joints.length; i ++) {

			for (j = 0; j < bonelist.length; j ++) {

				if (bonelist[j].name === joints[i]) {

					sortedbones[i] = bonelist[j];

				}

			}

		}

		//hook up the parents by index instead of name
		for (i = 0; i < sortedbones.length; i ++) {

			for (j = 0; j < sortedbones.length; j ++) {

				if (sortedbones[i].parent === sortedbones[j].name) {

					sortedbones[i].parent = j;

				}

			}

		}


		var w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape
		for ( i = 0; i < geometry.vertices.length; i ++ ) {
			geometry.vertices[i].applyMatrix4( skinController.skin.bindShapeMatrix );
		}

		var skinIndices = [];
		var skinWeights = [];
		var weights = skinController.skin.weights;

		// hook up the skin weights
		// TODO - this might be a good place to choose greatest 4 weights
		for ( i = 0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4(weights[i][0] ? weights[i][0].joint : 0,weights[i][1] ? weights[i][1].joint : 0,weights[i][2] ? weights[i][2].joint : 0,weights[i][3] ? weights[i][3].joint : 0);
			weight = new THREE.Vector4(weights[i][0] ? weights[i][0].weight : 0,weights[i][1] ? weights[i][1].weight : 0,weights[i][2] ? weights[i][2].weight : 0,weights[i][3] ? weights[i][3].weight : 0);

			skinIndices.push(indicies);
			skinWeights.push(weight);

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// process animation, or simply pose the rig if no animation

		//create an animation for the animated bones
		//NOTE: this has no effect when using morphtargets
		var animationdata = { "name":animationBounds.ID,"fps":30,"length":animationBounds.frames / 30,"hierarchy":[] };

		for (j = 0; j < sortedbones.length; j ++) {

			animationdata.hierarchy.push({ parent:sortedbones[j].parent, name:sortedbones[j].name, keys:[] });

		}

		console.log( 'ColladaLoader:', animationBounds.ID + ' has ' + sortedbones.length + ' bones.' );



		skinToBindPose(geometry, skeleton, skinController);


		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];
			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			for (i = 0; i < bones.length; i ++) {

				for (j = 0; j < animationdata.hierarchy.length; j ++) {

					if (animationdata.hierarchy[j].name === bones[i].sid) {

						var key = {};
						key.time = (frame / 30);
						key.matrix = bones[i].animatrix;

						if (frame === 0)
							bones[i].matrix = key.matrix;

						var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
						key.matrix.decompose(data[0], data[1], data[2]);

						key.pos = [ data[0].x,data[0].y,data[0].z ];

						key.scl = [ data[2].x,data[2].y,data[2].z ];
						key.rot = data[1];

						animationdata.hierarchy[j].keys.push(key);

					}

				}

			}

			geometry.animation = animationdata;

		}

	}

	function createKinematics() {

		if ( kinematicsModel && kinematicsModel.joints.length === 0 ) {
			kinematics = undefined;
			return;
		}

		var jointMap = {};

		var _addToMap = function( jointIndex, parentVisualElement ) {

			var parentVisualElementId = parentVisualElement.getAttribute( 'id' );
			var colladaNode = visualScene.getChildById( parentVisualElementId, true );
			var joint = kinematicsModel.joints[ jointIndex ];

			scene.traverse(function( node ) {

				if ( node.colladaId == parentVisualElementId ) {

					jointMap[ jointIndex ] = {
						node: node,
						transforms: colladaNode.transforms,
						joint: joint,
						position: joint.zeroPosition
					};

				}

			});

		};

		kinematics = {

			joints: kinematicsModel && kinematicsModel.joints,

			getJointValue: function( jointIndex ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					return jointData.position;

				} else {

					console.log( 'getJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			},

			setJointValue: function( jointIndex, value ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					var joint = jointData.joint;

					if ( value > joint.limits.max || value < joint.limits.min ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ')' );

					} else if ( joint.static ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' is static' );

					} else {

						var threejsNode = jointData.node;
						var axis = joint.axis;
						var transforms = jointData.transforms;

						var matrix = new THREE.Matrix4(), m1 = new THREE.Matrix4();

						for (i = 0; i < transforms.length; i ++ ) {

							var transform = transforms[ i ];

							// kinda ghetto joint detection
							if ( transform.sid && transform.sid.indexOf( 'joint' + jointIndex ) !== -1 ) {

								// apply actual joint value here
								switch ( joint.type ) {

									case 'revolute':

										matrix.multiply( m1.makeRotationAxis( axis, THREE.Math.degToRad(value) ) );
										break;

									case 'prismatic':

										matrix.multiply( m1.makeTranslation(axis.x * value, axis.y * value, axis.z * value ) );
										break;

									default:

										console.warn( 'setJointValue: unknown joint type: ' + joint.type );
										break;

								}

							} else {

								switch ( transform.type ) {

									case 'matrix':

										matrix.multiply( transform.obj );

										break;

									case 'translate':

										matrix.multiply( m1.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );

										break;

									case 'rotate':

										matrix.multiply( m1.makeRotationAxis( transform.obj, transform.angle ) );

										break;

								}
							}
						}

						// apply the matrix to the threejs node
						var elementsFloat32Arr = matrix.elements;
						var elements = Array.prototype.slice.call( elementsFloat32Arr );

						var elementsRowMajor = [
							elements[ 0 ],
							elements[ 4 ],
							elements[ 8 ],
							elements[ 12 ],
							elements[ 1 ],
							elements[ 5 ],
							elements[ 9 ],
							elements[ 13 ],
							elements[ 2 ],
							elements[ 6 ],
							elements[ 10 ],
							elements[ 14 ],
							elements[ 3 ],
							elements[ 7 ],
							elements[ 11 ],
							elements[ 15 ]
						];

						threejsNode.matrix.set.apply( threejsNode.matrix, elementsRowMajor );
						threejsNode.matrix.decompose( threejsNode.position, threejsNode.quaternion, threejsNode.scale );
					}

				} else {

					console.log( 'setJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			}

		};

		var element = COLLADA.querySelector('scene instance_kinematics_scene');

		if ( element ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				if ( child.nodeType != 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':

						var visualTarget = child.getAttribute( 'target' ).split( '/' ).pop();
						var axis = child.querySelector('axis param').textContent;
						var jointIndex = parseInt( axis.split( 'joint' ).pop().split( '.' )[0] );
						var visualTargetElement = COLLADA.querySelector( '[sid="' + visualTarget + '"]' );

						if ( visualTargetElement ) {
							var parentVisualElement = visualTargetElement.parentElement;
							_addToMap(jointIndex, parentVisualElement);
						}

						break;

					default:

						break;

				}

			}
		}

	}

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;
    var inst_geom;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

          break;

				default:
					break;

			}

		}

		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length === 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( !( instance_material.symbol in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ instance_material.symbol ] = _copied_material;

							}

							material3js = double_sided_materials[ instance_material.symbol ];

						}

						material3js.opacity = !material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MultiMaterial( used_materials_array );

				}

				if ( skinController !== undefined ) {


					applySkin( geom, skinController );

					if ( geom.morphTargets.length > 0 ) {

						material.morphTargets = true;
						material.skinning = false;

					} else {

						material.morphTargets = false;
						material.skinning = true;

					}


					mesh = new THREE.SkinnedMesh( geom, material, false );


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers[ skinController.url ];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					if ( geom.isLineStrip === true ) {

						mesh = new THREE.Line( geom );

					} else {

						mesh = new THREE.Mesh( geom, material );

					}

				}

				obj.add(mesh);

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			var cam = new THREE.PerspectiveCamera(cparams.yfov, parseFloat(cparams.aspect_ratio),
					parseFloat(cparams.znear), parseFloat(cparams.zfar));

			obj.add(cam);
		}

		for ( i = 0; i < node.lights.length; i ++ ) {

			var light = null;
			var instance_light = node.lights[i];
			var lparams = lights[instance_light.url];

			if ( lparams && lparams.technique ) {

				var color = lparams.color.getHex();
				var intensity = lparams.intensity;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;

				switch ( lparams.technique ) {

					case 'directional':

						light = new THREE.DirectionalLight( color, intensity, distance );
						light.position.set(0, 0, 1);
						break;

					case 'point':

						light = new THREE.PointLight( color, intensity, distance );
						break;

					case 'spot':

						light = new THREE.SpotLight( color, intensity, distance, angle );
						light.position.set(0, 0, 1);
						break;

					case 'ambient':

						light = new THREE.AmbientLight( color );
						break;

				}

			}

			if (light) {
				obj.add(light);
			}
		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

		if ( options.centerGeometry && obj.geometry ) {

			var delta = obj.geometry.center();
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	}

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] === id ) {

				return i;

			}

		}

	}

	function getLibraryNode( id ) {

		var nodes = COLLADA.querySelectorAll('library_nodes node');

		for ( var i = 0; i < nodes.length; i++ ) {

			var attObj = nodes[i].attributes.getNamedItem('id');

			if ( attObj && attObj.value === id ) {

				return nodes[i];

			}

		}

		return undefined;

	}

	function getChannelsForNode ( node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var target_id = channel.target.split('/')[0];

				if ( target_id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	}

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	}

	function calcMatrixAt( node, t ) {

		var animated = {};
    var channel;

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix.multiplyMatrices( matrix, value );

					} else {

						// FIXME: handle other types

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			} else {

				matrix.multiplyMatrices( matrix, transform.matrix );

			}

		}

		return matrix;

	}

	function bakeAnimations ( node ) {
    var i, j, key;

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( i = 0, il = node.channels.length; i < il; i ++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( j = 0, jl = channel.arrIndices.length; j < jl; j ++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( j = 0, jl = input.length; j < jl; j ++ ) {

						var time = input[j];
						var data = sampler.getData( transform.type, j, member );
						key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx === -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( i = 0; i < sids.length; i ++ ) {

				var sid = sids[ i ];

				for ( j = 0; j < keys.length; j ++ ) {

					key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	}

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal === null; i ++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	}

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx === -1; i ++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	}

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx - 1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx + 1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++ i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	}

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx ++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx -- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	function _Image() {

		this.id = "";
		this.init_from = "";

	}

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	}

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	}

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i, source;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	}

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic === 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic === 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];
    var i, j, k;

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( j = 0; j < numBones; j ++ ) {

				var influence = {};

				for ( k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group();

	}

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	}

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid === transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id === id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid === sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid === sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');
		this.layer = element.getAttribute('layer');

		this.type = this.type === 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					this.lights.push( ( new InstanceLight() ).parse( child ) );
					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	}

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[3] );
        break;

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4();

		return function ( matrix ) {

			switch ( this.type ) {

				case 'matrix':

					matrix.multiply( this.obj );

					break;

				case 'translate':

					matrix.multiply( m1.makeTranslation( this.obj.x, this.obj.y, this.obj.z ) );

					break;

				case 'rotate':

					matrix.multiply( m1.makeRotationAxis( this.obj, this.angle ) );

					break;

				case 'scale':

					matrix.scale( this.obj );

					break;

			}

		};

	}();

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	}

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = child.querySelectorAll('instance_material');

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[j];
						this.instance_material.push( (new InstanceMaterial()).parse(instance) );

					}


					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	}

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	}

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName === 'bind_material' ) {

				var instances = child.querySelectorAll('instance_material');

				for ( var j = 0; j < instances.length; j ++ ) {

					var instance = instances[j];
					this.instance_material.push( (new InstanceMaterial()).parse(instance) );

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	}

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	}

	Mesh.prototype.parse = function ( element ) {

    var i;

		this.primitives = [];

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'linestrips':

					this.primitives.push( ( new LineStrips().parse( child ) ) );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		if ( this.vertices === null ) {

			// TODO (mrdoob): Study case when this is null (carrier.dae)

			return this;

		}

		var vertexData = sources[ this.vertices.input.POSITION.source ].data;

		for ( i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		return this;

	};

	Mesh.prototype.handlePrimitive = function ( primitive, geom ) {

		if ( primitive instanceof LineStrips ) {

			// TODO: Handle indices. Maybe easier with BufferGeometry?

			geom.isLineStrip = true;
			return;

		}

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];
    var ndx, len;

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];

			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset) ? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++ pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( !ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[3], ns.length ? [ ns[0].clone(), ns[1].clone(), ns[3].clone() ] : [], cs.length ? [ cs[0], cs[1], cs[3] ] : new THREE.Color() ) );

					faces.push( new THREE.Face3( vs[1], vs[2], vs[3], ns.length ? [ ns[1].clone(), ns[2].clone(), ns[3].clone() ] : [], cs.length ? [ cs[1], cs[2], cs[3] ] : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						faces.push( new THREE.Face3( vs[0], vs[k], vs[k + 1], ns.length ? [ ns[0].clone(), ns[k ++].clone(), ns[k].clone() ] : [], clr ) );

					}

				}

				if ( faces.length ) {

					for ( ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k ++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx + 1], uv[ndx + 2] ];

							} else if ( vcount === 4 ) {

								if ( ndx === 0 ) {

									uvArr = [ uv[0], uv[1], uv[3] ];

								} else {

									uvArr = [ uv[1].clone(), uv[2], uv[3].clone() ];

								}

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( geom.faceVertexUvs[k] === undefined ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}

		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	}

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source === vertices.id ) {

				this.inputs[ i ].source = vertices.input.POSITION.source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	}

	Polylist.prototype = Object.create( Polygons.prototype );
	Polylist.prototype.constructor = Polylist;

	function LineStrips() {

		Polygons.call( this );

		this.vcount = 1;

	}

	LineStrips.prototype = Object.create( Polygons.prototype );
	LineStrips.prototype.constructor = LineStrips;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	}

	Triangles.prototype = Object.create( Polygons.prototype );
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	}

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'param' ) {

				var param = {};
				param.name = child.getAttribute( 'name' );
				param.type = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	}

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName === 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	}

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic === 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	}

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName === 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

		var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

		switch ( param.type ) {

			case 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				for ( var j = 0; j < this.data.length; j += 16 ) {

					var s = this.data.slice( j, j + 16 );
					var m = getConvertedMat4( s );
					result.push( m );
				}

				break;

			default:

				console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
				break;

		}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	}

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color();
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	}

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture === null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture !== null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		if (element.nodeName === 'transparent') {

			this.opaque = element.getAttribute('opaque');

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color();
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );

					break;

				case 'wrapU':
				case 'wrapV':

					// some dae have a value of true which becomes NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						this.texOpts[ child.nodeName ] = 1;

					} else {

						this.texOpts[ child.nodeName ] = parseInt( child.textContent );

					}
					break;

				default:

					this.texOpts[ child.nodeName ] = child.textContent;

					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	}

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'bump':

					// If 'bumptype' is 'heightfield', create a 'bump' property
					// Else if 'bumptype' is 'normalmap', create a 'normal' property
					// (Default to 'bump')
					var bumpType = child.getAttribute( 'bumptype' );
					if ( bumpType ) {
						if ( bumpType.toLowerCase() === "heightfield" ) {
							this.bump = ( new ColorOrTexture() ).parse( child );
						} else if ( bumpType.toLowerCase() === "normalmap" ) {
							this.normal = ( new ColorOrTexture() ).parse( child );
						} else {
							console.error( "Shader.prototype.parse: Invalid value for attribute 'bumptype' (" + bumpType + ") - valid bumptypes are 'HEIGHTFIELD' and 'NORMALMAP' - defaulting to 'HEIGHTFIELD'" );
							this.bump = ( new ColorOrTexture() ).parse( child );
						}
					} else {
						console.warn( "Shader.prototype.parse: Attribute 'bumptype' missing from bump node - defaulting to 'HEIGHTFIELD'" );
						this.bump = ( new ColorOrTexture() ).parse( child );
					}

					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = child.querySelectorAll('float');

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};

		var transparent = false;

		if (this.transparency !== undefined && this.transparent !== undefined) {
			// convert transparent color RBG to average value
			var transparentColor = this.transparent;
			var transparencyLevel = (this.transparent.color.r + this.transparent.color.g + this.transparent.color.b) / 3 * this.transparency;

			if (transparencyLevel > 0) {
				transparent = true;
				props.transparent = true;
				props.opacity = 1 - transparencyLevel;

			}

		}

		var keys = {
			'diffuse':'map',
			'ambient':'lightMap',
			'specular':'specularMap',
			'emission':'emissionMap',
			'bump':'bumpMap',
			'normal':'normalMap'
			};

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'normal':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler[samplerId];

							if ( surfaceId !== undefined && surfaceId.source !== undefined ) {

								var surface = this.effect.surface[surfaceId.source];

								if ( surface !== undefined ) {

									var image = images[ surface.init_from ];

									if ( image ) {

                    var url = image.init_from;

                    if (texturePath) url = texturePath + url;
                    else url = baseUrl + url;

										var texture;
										var loader = THREE.Loader.Handlers.get( url );

										if ( loader !== null ) {

											texture = loader.load( url );

										} else {

											texture = new THREE.Texture();

											loadTextureImage( texture, url );

										}

										texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props[keys[prop]] = texture;

										// Texture with baked lighting?
										if (prop === 'emission') props.emissive = 0xffffff;

									}

								}

							}

						} else if ( prop === 'diffuse' || !transparent ) {

							if ( prop === 'emission' ) {

								props.emissive  = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if ( props[ prop ] > 0.0 ) props.envMap = options.defaultEnvMap;
					props.combine = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props.refractionRatio = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props.envMap = options.defaultEnvMap;
					break;

				case 'transparency':
					// gets figured out up top
					break;

				default:
					break;

			}

		}

		props.shading = preferredShading;
		props.side = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		if ( props.diffuse !== undefined ) {

			props.color = props.diffuse;
			delete props.diffuse;

		}

		switch ( this.type ) {

			case 'constant':

				if (props.emissive !== undefined) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				this.material = new THREE.MeshPhongMaterial( props );
				break;

			default:

				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	}

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	}

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	}

	Effect.prototype.create = function () {

		if ( this.shader === null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[sid] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[sid] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;
				case 'extra':
					this.parseExtra(child);
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtra = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseExtraTechnique( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bump':
					this.shader.parse( element );
					break;
				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	}

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	}

	Animation.prototype.parse = function ( element ) {

    var src;

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	}

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	}

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

    var i;

		for ( i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			for ( i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx, member ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++ i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

			if ( member && type === 'translate' ) {
				data = getConvertedTranslation( member, data );
			}

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	}

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0, l = this.targets.length; i < l; i ++ ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++ j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	// Camera
	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

    var i, j, k, param;

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique === 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( k = 0; k < perspective.childNodes.length; k ++ ) {

							param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique === 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( k = 0; k < orthographic.childNodes.length; k ++ ) {

							param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	}

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	// Light

	function Light() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Light.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				case 'technique':

					this.parseTechnique( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Light.prototype.parseCommon = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			switch ( element.childNodes[ i ].nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes[ i ].nodeName;

					var light = element.childNodes[ i ];

					for ( var j = 0; j < light.childNodes.length; j ++ ) {

						var child = light.childNodes[j];

						switch ( child.nodeName ) {

							case 'color':

								var rgba = _floats( child.textContent );
								this.color = new THREE.Color(0);
								this.color.setRGB( rgba[0], rgba[1], rgba[2] );
								this.color.a = rgba[3];
								break;

							case 'falloff_angle':

								this.falloff_angle = parseFloat( child.textContent );
								break;

							case 'quadratic_attenuation':
								var f = parseFloat( child.textContent );
								this.distance = f ? Math.sqrt( 1 / f ) : 0;
						}

					}

			}

		}

		return this;

	};

	Light.prototype.parseTechnique = function ( element ) {

		this.profile = element.getAttribute( 'profile' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'intensity':

					this.intensity = parseFloat(child.textContent);
					break;

			}

		}

		return this;

	};

	function InstanceLight() {

		this.url = "";

	}

	InstanceLight.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function KinematicsModel( ) {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.joints = [];
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon(child);
					break;

				default:
					break;

			}

		}

		return this;

	};

	KinematicsModel.prototype.parseCommon = function( element ) {

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( element.childNodes[ i ].nodeName ) {

				case 'joint':
					this.joints.push( (new Joint()).parse(child) );
					break;

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Joint( ) {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector('axis');
		var _axis = _floats(axisElement.textContent);
		this.axis = getConvertedVec3(_axis, 0);

		var min = element.querySelector('limits min') ? parseFloat(element.querySelector('limits min').textContent) : -360;
		var max = element.querySelector('limits max') ? parseFloat(element.querySelector('limits max').textContent) : 360;

		this.limits = {
			min: min,
			max: max
		};

		var jointTypes = [ 'prismatic', 'revolute' ];
		for (var i = 0; i < jointTypes.length; i ++ ) {

			var type = jointTypes[ i ];

			var jointElement = element.querySelector(type);

			if ( jointElement ) {

				this.type = type;

			}

		}

		// if the min is equal to or somehow greater than the max, consider the joint static
		if ( this.limits.min >= this.limits.max ) {

			this.static = true;

		}

		this.middlePosition = (this.limits.min + this.limits.max) / 2.0;
		return this;

	};

	function Link( ) {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.transforms = [];
		this.attachments = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					this.attachments.push( (new Attachment()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function Attachment( ) {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function( element ) {

		this.joint = element.getAttribute('joint').split('/').pop();
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] !== undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	}

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix === "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	}

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] === 'true' || raw[i] === '1') ? true : false );

		}

		return data;

	}

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	}

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	}

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	}

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	}

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	}

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	}

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	}

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while ( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	}

  function loadTextureImage ( texture, url ) {

    var image = new Image();

    image.addEventListener('load', (function(texture) {

      return function() {
        texture.needsUpdate = true;
      };

    }) ( texture ) );

    image.src = url;

    texture.image = image;
  }

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = element.querySelectorAll('extra double_sided')[0];

		if ( node ) {

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	}

	// Up axis conversion

	function setUpConversion() {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	}

	function fixCoords( data, sign ) {

    var tmp;

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	}

	function getConvertedTranslation( axis, data ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return data;

		}

		switch ( axis ) {
			case 'X':
				data = upConversion === 'XtoY' ? data * -1 : data;
				break;
			case 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX' ? data * -1 : data;
				break;
			case 'Z':
				data = upConversion === 'ZtoY' ? data * -1 : data ;
				break;
			default:
				break;
		}

		return data;
	}

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	}

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4().set(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	}

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = [ 'X', 'Y', 'Z' ],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	}

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	}

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};

var AMTHREE = AMTHREE || {};


(function() {

  if (typeof THREE === 'undefined')
    return;

  var SELECT_BOX_GEOMETRY = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  SELECT_BOX_GEOMETRY.uuid = '71EB1490-B411-48E3-B187-D4A9B1836ACA';
  SELECT_BOX_GEOMETRY.name = 'SELECT_BOX_GEOMETRY';

  var SELECT_BOX_MATERIAL = new THREE.MeshBasicMaterial( {
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false
  } );
  SELECT_BOX_MATERIAL.uuid = '0DD7A775-4B05-487D-845B-A10A2A224A55';
  SELECT_BOX_MATERIAL.name = 'SELECT_BOX_MATERIAL';
  SELECT_BOX_MATERIAL.transparent = true;
  SELECT_BOX_MATERIAL.opacity = 0;


  /**
  * Class to load and hold a Collada model, and to ease its serialization.
  * @class
  * @memberof AMTHREE
  * @augments THREE.Object3D
  */
  var ColladaObject = function() {
    THREE.Object3D.call(this);

    this.model_url = '';

    this.model_object = new THREE.Object3D();

    this.add(this.model_object);
  };

  ColladaObject.prototype = Object.create(THREE.Object3D.prototype);
  ColladaObject.prototype.constructor = ColladaObject;

  /**
  * Loads a Collada model into this, erasing the inner model, if it wasnt empty.
  * @param {string} url
  * @param {string} texture_path
  * @returns {Promise<this, string>} A promise that resolves when the model is loaded.
  */
  ColladaObject.prototype.load = function(url, texture_path) {
    var scope = this;

    return new Promise(function(resolve, reject) {
      var loader = new AMTHREE.ColladaLoader();
      loader.options.convertUpAxis = true;

      loader.load(url, texture_path,
        function(collada) {
        var box = new THREE.Box3();
        var center = new THREE.Vector3();
        var object = collada.scene;
        var mesh = new THREE.Mesh(SELECT_BOX_GEOMETRY, SELECT_BOX_MATERIAL);


        mesh.add(object);

        scope.model_url = url;
        scope.model_object.remove.apply(scope.model_object, scope.model_object.children);
        scope.model_object.add(mesh);


        box.setFromObject(object);
        box.size(mesh.scale);
        scope.updateMatrix();

        box.center(center);
        object.scale.divide(mesh.scale);
        object.position.sub(center.divide(mesh.scale));

        object.updateMatrix();
        AMTHREE.ObjectConvert(scope.model_object);
        resolve(scope);
      },
      undefined,
      reject);
    });
  };
  
  /**
  * Returns the json representation of this.
  * @param {object} meta
  * @returns {object}
  */
  ColladaObject.prototype.toJSON = function(meta) {
    var json = {
      uuid: this.uuid,
      type: 'Collada',
      name: this.name,
      url: AMTHREE.GetFilename(this.model_url),
      matrix: this.matrix.toArray()
    };

    if (JSON.stringify(this.userData) !== '{}') json.userData = this.userData;
    if (this.castShadow === true) json.castShadow = true;
    if (this.receiveShadow === true) json.receiveShadow = true;
    if (this.visible === false) json.visible = false;

    var children = [];

    for (var i = 0; i < this.children.length; ++i) {
      if (this.children[i] !== this.model_object)
        children.push(this.children[i].toJSON(meta).object);
    }

    if (children.length > 0)
      json.children = children;

    return { object: json };
  };


  AMTHREE.ColladaObject = ColladaObject;


})();
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * A helper class to use a gif image as a Threejs texture
   *  - Requires libgif: {@link https://github.com/buzzfeed/libgif-js}
   * @class
   * @augments THREE.Texture
   */
  AMTHREE.GifTexture = function(image) {
    THREE.Texture.call(this);

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.imageElement = document.createElement('img');
    var scriptTag = document.getElementsByTagName('script');
    scriptTag = scriptTag[scriptTag.length - 1];
    scriptTag.parentNode.appendChild(this.imageElement);

    this.imageElement.width = this.imageElement.naturalWidth;
    this.imageElement.height = this.imageElement.naturalHeight;

    if (image)
      this.setGif(image);
  };

  AMTHREE.GifTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.GifTexture.prototype.constructor = AMTHREE.GifTexture;

  /**
   * Plays the animated texture.
   */
  AMTHREE.GifTexture.prototype.play = function() {
    this.anim.play();
    this.image = this.gifCanvas;
  };

  /**
   * Updates the animated texture.
   */
  AMTHREE.GifTexture.prototype.update = function() {
    this.needsUpdate = true;
  };

  /**
   * Stops the animated texture.
   */
  AMTHREE.GifTexture.prototype.stop = function() {
    this.anim.move_to(0);
    this.image = undefined;
  };

  /**
   * Pauses the animated texture.
   */
  AMTHREE.GifTexture.prototype.pause = function() {
    this.anim.pause();
  };

  /**
   * Sets the source gif of the texture.
   */
  AMTHREE.GifTexture.prototype.setGif = function(image) {
    if (image.url) {
      this.image_ref = image;

      this.imageElement.src = image.url;

      this.anim = new SuperGif( { gif: this.imageElement, auto_play: false } );
      this.anim.load();

      this.gifCanvas = this.anim.get_canvas();

      this.gifCanvas.style.display = 'none';
    }
  };

  /**
  * Returns the json representation of the texture
  * @param {object} [meta] - an object holding json ressources. If provided, the result of this function will be added to it.
  * @returns {object} A json object
  */
  AMTHREE.GifTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    if (this.image_ref)
      output.image = this.image_ref.uuid;
    output.animated = true;

    this.image_ref.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.GifTexture = function() {
    console.warn('GifTexture.js: THREE undefined');
  };
}

var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @param {string} [uuid] - generated if not provided
   * @param {string} [url] - The url of the image
   */
  AMTHREE.Image = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = url;
  };

  /**
  * Returns an json object.
  * @param {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  * @returns {object} A json object
  */
  AMTHREE.Image.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.url = AMTHREE.GetFilename(this.url);

    if (typeof meta === 'object') {
      if (!meta.images) meta.images = {};
      meta.images[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.Image = function() {
    console.warn('Image.js: THREE undefined');
  };
}

var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   * @param {AMTHREE.Image} image - An image to map to the texture.
   */
  AMTHREE.ImageTexture = function(image) {
    THREE.Texture.call(this);

    this.image = new Image();
    this.image.addEventListener('load', function(texture) {
      return function() {
        texture.needsUpdate = true;
      };
    }(this));

    this.set(image);
  };

  AMTHREE.ImageTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.ImageTexture.prototype.constructor = AMTHREE.ImageTexture;

  /*
  * Sets the image of the texture
  * @param {AMTHREE.Image} image
  */
  AMTHREE.ImageTexture.prototype.set = function(image) {
    this.image_ref = image;
    this.image.src = image.url;
  };

  /**
  * Returns the json representation of the texture
  * @param {object} [meta] - an object holding json ressources. If provided, the result of this function will be added to it.
  * @returns {object} A json object
  */
  AMTHREE.ImageTexture.prototype.toJSON = function(meta) {
    var output = {};

    output.uuid = this.uuid;
    output.image = this.image_ref.uuid;

    this.image_ref.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.ImageTexture = function() {
    console.warn('ImageTexture.js: THREE undefined');
  };
}

var AMTHREE = AMTHREE || {};


(function() {

  function IsDef(val) {
    return typeof val !== 'undefined' && val !== null;
  }

  function ObjectConvert(object) {
    object.traverse(function(child) {

      if (IsDef(child.material) && IsDef(child.material.map)) {
        if (IsDef(child.material.map.image)) {
          var image = new AMTHREE.Image(undefined, child.material.map.image.src);
          var texture = new AMTHREE.ImageTexture(image);
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      }

    });
  }


  /**
  * Converts textures types to ArtMobilib types, to ease serialization
  * @function
  * @param {THREE.Object3D}
  */
  AMTHREE.ObjectConvert = ObjectConvert;


})();
/*********************


AMTHREE.ObjectsLoading


Dependency:

three.js,
ColladaLoader.js,
OBJLoader.js,
OBJMTLLoader.js,
libgif.js


*********************/


var AMTHREE = AMTHREE || {};


(function() {

  function CreateConstants(json, root) {
    json = json || {};

    var constants = {};

    if (root)
      constants.asset_path = root + '/';
    else
      constants.asset_path = '';
    constants.asset_path += (json.asset_path) ? (json.asset_path + '/') : '';
    constants.image_path = constants.asset_path + ((json.image_path) ? json.image_path : '');
    constants.video_path = constants.asset_path + ((json.video_path) ? json.video_path : '');
    constants.model_path = constants.asset_path + ((json.model_path) ? json.model_path : '');
    constants.sound_path = constants.asset_path + ((json.sound_path) ? json.sound_path : '');

    return constants;
  }

  function CreateMaterials(json, textures) {

    var materials = {};

    if (json instanceof Array) {
      var loader = new THREE.MaterialLoader();
      loader.setTextures(textures);

      for (var i = 0, l = json.length; i < l; i++) {
        var material = loader.parse(json[i]);
        materials[material.uuid] = material;
      }
    }
    else {
      console.log('materials parsing failed: json not an array');
    }

    return materials;
  }

  function CreateAnimations(json) {

    var animations = [];

    if (json instanceof Array) {
      for (var i = 0; i < json.length; i++) {
        var clip = THREE.AnimationClip.parse(json[i]);
        animations.push(clip);
      }
    }
    else {
      console.log('animations parsing failed: json not an array');
    }

    return animations;
  }

  function CreateSounds(json, path) {

    var sounds = {};

    if (json instanceof Array) {

      for (var i = 0, c = json.length; i < c; ++i) {
        var sound = json[i];

        if (sound.uuid === undefined)
          console.warn('failed to parse sound: no "uuid" specified for sound ' + i);
        else if (sound.url === undefined)
          console.warn('failed to parse sound: no "url" specified for sound ' + i);
        else {
          var elem = new AMTHREE.Sound(sound.uuid, path + '/' + sound.url);

          sounds[sound.uuid] = elem;
        }
      }

    }
    return sounds;
  }

  function ParseImages(json, path) {
    return new Promise(function(resolve, reject) {
      var images = {};
      if (json instanceof Array) {

        return Promise.all(json.map(function(image_json) {

          return new Promise(function(resolve, reject) {
            if (image_json.url === undefined)
              reject('failed to parse image: no "url" specified for image ' + i);
            else if (image_json.uuid === undefined)
              reject('failed to parse image: no "uuid" specified for image ' + i);
            else {
              var image = new AMTHREE.Image(image_json.uuid, path + '/' + image_json.url);
              images[image.uuid] = image;
              resolve();
            }
          });


        })).then(resolve(images), reject);

      }
      else {
        reject('images parsing failed: json not an array');
      }
    });
  }

  function CreateVideos(json, path) {
    var videos = {};

    if (json instanceof Array) {

      for (var i = 0, c = json.length; i < c; i++) {
        var video = json[i];

        if (video.uuid === undefined)
          console.warn('failed to parse video: no "uuid" specified for video ' + i);
        else if (video.url === undefined)
          console.warn('failed to parse video: no "url" specified for video ' + i);
        else {
          var elem = new AMTHREE.Video(video.uuid, path + '/' + video.url);

          videos[video.uuid] = elem;
        }

      }
    }
    return videos;
  }

  function ParseThreeConstant(value) {
    if (typeof value === 'number') return value;
    console.warn('AMTHREE.ObjectLoading: Constant should be in numeric form.', value);
    return THREE[value];
  }

  function CreateTextures(json, images, videos) {

    var textures = {};

    if (typeof SuperGif === 'undefined')
      console.warn('AMTHREE.ObjectLoading: SuperGif is undefined');


    if (typeof json !== 'undefined') {
      for (var i = 0, l = json.length; i < l; i++) {
        var data = json[i];
        var texture = undefined;

        if (!data.uuid) {
          console.warn('failed to parse texture ' + i + ': no uuid provided');
        }
        if (data.image === undefined && data.video === undefined ) {
          console.warn('failed to parse texture: no "image" nor "video" specified for ' + data.uuid);
          continue;
        }


        if (data.image !== undefined) {
          if (images[data.image] === undefined) {
            console.warn('failed to parse texture ' + data.uuid + ': undefined image', data.image);
            continue;
          }

          var image = images[data.image];

          if (data.animated !== undefined && data.animated) {
            if (typeof SuperGif == 'undefined')
              continue;
            texture = new AMTHREE.GifTexture(image);
          } else {
            texture = new AMTHREE.ImageTexture(image);
            texture.needsUpdate = true;
          }
        }
        else {
          if (videos[data.video] === undefined ) {
            console.warn('failed to parse texture ' + data.uuid + ': undefined video', data.video);
            continue;
          }

          var video = videos[data.video];
          texture = new AMTHREE.VideoTexture(video, data.width, data.height, data.loop, data.autoplay);
        }

        texture.uuid = data.uuid;

        if (data.name !== undefined) texture.name = data.name;
        if (data.mapping !== undefined) texture.mapping = ParseThreeConstant(data.mapping);
        if (data.offset !== undefined) texture.offset = new THREE.Vector2(data.offset[0], data.offset[1]);
        if (data.repeat !== undefined) texture.repeat = new THREE.Vector2(data.repeat[0], data.repeat[1]);
        if (data.minFilter !== undefined) texture.minFilter = ParseThreeConstant(data.minFilter);
        else texture.minFilter = THREE.LinearFilter;
        if (data.magFilter !== undefined) texture.magFilter = ParseThreeConstant(data.magFilter);
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;
        if (Array.isArray(data.wrap)) {

          texture.wrapS = ParseThreeConstant(data.wrap[0]);
          texture.wrapT = ParseThreeConstant(data.wrap[1]);

        }

        textures[data.uuid] = texture;

      }

    }

    return textures;
  }

  function CreateGeometries(json) {
    var geometries = {};

    if (typeof json !== 'undefined') {

      var geometry_loader = new THREE.JSONLoader();
      var buffer_geometry_loader = new THREE.BufferGeometryLoader();

      for (var i = 0, l = json.length; i < l; i++) {

        var data = json[i];

        var geometry;

        switch (data.type) {

          case 'PlaneGeometry':
          case 'PlaneBufferGeometry':

          geometry = new THREE[data.type](
            data.width,
            data.height,
            data.widthSegments,
            data.heightSegments
            );

          break;

          case 'BoxGeometry':
          case 'CubeGeometry':
          geometry = new THREE.BoxGeometry(
            data.width,
            data.height,
            data.depth,
            data.widthSegments,
            data.heightSegments,
            data.depthSegments
            );

          break;

          case 'CircleBufferGeometry':

          geometry = new THREE.CircleBufferGeometry(
            data.radius,
            data.segments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'CircleGeometry':

          geometry = new THREE.CircleGeometry(
            data.radius,
            data.segments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'CylinderGeometry':

          geometry = new THREE.CylinderGeometry(
            data.radiusTop,
            data.radiusBottom,
            data.height,
            data.radialSegments,
            data.heightSegments,
            data.openEnded,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'SphereGeometry':

          geometry = new THREE.SphereGeometry(
            data.radius,
            data.widthSegments,
            data.heightSegments,
            data.phiStart,
            data.phiLength,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'SphereBufferGeometry':

          geometry = new THREE.SphereBufferGeometry(
            data.radius,
            data.widthSegments,
            data.heightSegments,
            data.phiStart,
            data.phiLength,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'DodecahedronGeometry':

          geometry = new THREE.DodecahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'IcosahedronGeometry':

          geometry = new THREE.IcosahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'OctahedronGeometry':

          geometry = new THREE.OctahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'TetrahedronGeometry':

          geometry = new THREE.TetrahedronGeometry(
            data.radius,
            data.detail
            );

          break;

          case 'RingGeometry':

          geometry = new THREE.RingGeometry(
            data.innerRadius,
            data.outerRadius,
            data.thetaSegments,
            data.phiSegments,
            data.thetaStart,
            data.thetaLength
            );

          break;

          case 'TorusGeometry':

          geometry = new THREE.TorusGeometry(
            data.radius,
            data.tube,
            data.radialSegments,
            data.tubularSegments,
            data.arc
            );

          break;

          case 'TorusKnotGeometry':

          geometry = new THREE.TorusKnotGeometry(
            data.radius,
            data.tube,
            data.radialSegments,
            data.tubularSegments,
            data.p,
            data.q,
            data.heightScale
            );

          break;

          case 'BufferGeometry':

          geometry = buffer_geometry_loader.parse(data);

          break;

          case 'Geometry':

          geometry = geometry_loader.parse(data.data, this.texturePath).geometry;

          break;

          default:

          console.warn('AMTHREE.ObjectLoading: Unsupported geometry type "' + data.type + '"');

          continue;

        }

        geometry.uuid = data.uuid;

        if (data.name !== undefined) geometry.name = data.name;

        geometries[data.uuid] = geometry;

      }

    }

    return geometries;
  }

  function LoadFile(url, parser, path) {
    return new Promise(function(resolve, reject) {

      var loader = new AM.JsonLoader();

      loader.Load(url, function() {
        parser(loader.json, path).then(resolve, reject);
      }, function() {
        reject('failed to load object: ' + url);
      });

    });
  }

  function Load(url, path) {
    return LoadFile(url, Parse, path);
  }

  function LoadArray(url, path) {
    return LoadFile(url, ParseArray, path);
  }

  function ParseResources(json, path) {
    var constants = CreateConstants(json.constants, path);

    return ParseImages(json.images || [], constants.image_path).then(function(images) {

      var sounds = CreateSounds(json.sounds || [], constants.sound_path);
      var videos = CreateVideos(json.videos || [], constants.video_path);
      var textures = CreateTextures(json.textures || [], images, videos);
      var animations = CreateAnimations(json.animations || []);
      var materials = CreateMaterials(json.materials || [], textures);
      var geometries = CreateGeometries(json.geometries || []);

      var resources = {
        constants:  constants,
        videos:     videos,
        images:     images,
        sounds:     sounds,
        textures:   textures,
        animations: animations,
        materials:  materials,
        geometries: geometries
      };

      return resources;
    });
  }

  function Parse(json, path) {
    return ParseResources(json, path).then(function(res) {
      return ParseObject(json.object, res.materials, res.geometries, res.sounds, res.constants)
      .then(function(object) {

        object.animations = res.animations;
        return object;

      });
    });
  }

  function ParseArray(json, path) {
    return ParseResources(json, path).then(function(res) {

      return ParseObjectArray(json.objects, res.materials,
        res.geometries, res.sounds, res.constants);

    });
  }

  function ParseObjectPostLoading(object, json, materials, geometries, sounds, constants) {
    var matrix = new THREE.Matrix4();

    object.uuid = json.uuid;

    if (json.name !== undefined) object.name = json.name;
    if (json.matrix !== undefined) {

      matrix.fromArray(json.matrix);
      matrix.decompose(object.position, object.quaternion, object.scale);

    } else {

      if (json.position !== undefined) object.position.fromArray(json.position);
      if (json.rotation !== undefined) object.rotation.fromArray(json.rotation);
      if (json.scale !== undefined) object.scale.fromArray(json.scale);
      if (json.scaleXYZ !== undefined) {
        object.scale.x *= json.scaleXYZ;
        object.scale.y *= json.scaleXYZ;
        object.scale.z *= json.scaleXYZ;
      }
    }

    if (json.castShadow !== undefined) object.castShadow = json.castShadow;
    if (json.receiveShadow !== undefined) object.receiveShadow = json.receiveShadow;

    if (json.visible !== undefined) object.visible = json.visible;
    if (json.userData !== undefined) object.userData = json.userData;

    if (json.type === 'LOD') {

      var levels = json.levels;

      for (var l = 0; l < levels.length; l++) {

        var level = levels[l];
        var child = object.getObjectByProperty('uuid', level.object);

        if (child !== undefined) {
          object.addLevel(child, level.distance);
        }

      }
    }

    if (json.children !== undefined) {
      return ParseObjectArray(json.children, materials, geometries, sounds, constants).then(function(array) {
        for (var i = 0, c = array.length; i < c; ++i) {
          object.add(array[i]);
        }
        return object;
      });
    }
    else
      return Promise.resolve(object);
  }

  function GetGeometry(name, geometries) {
    if (geometries[name] !== undefined)
      return geometries[name];
    else {
      if (name === undefined)
        console.warn('failed to get geometry: no id provided');
      else
        console.warn('failed to get geometry: no such geometry: ' + name);
    }
    return undefined;
  }

  function GetMaterial(name, materials) {
    if (materials[name] !== undefined)
      return materials[name];
    else {
      if (name === undefined)
        console.warn('failed to get material: no id provided');
      else
        console.warn('failed to get material: no such material: ' + name);
    }
    return undefined;
  }

  function GetSound(name, sounds) {
    if (sounds[name] !== undefined)
      return sounds[name];
    else {
      if (name === undefined)
        console.warn('failed to get sound: no id provided');
      else
        console.warn('failed to get sound: no such sound: ' + name);
    }
    return undefined;
  }

  function ParseObject(json, materials, geometries, sounds, constants) {
    var object, url;

    switch (json.type) {

      case 'OBJ':
      return new Promise(function(resolve, reject) {
        if (THREE.OBJLoader) {
          var obj_loader = new THREE.OBJLoader();

          url = constants.model_path + '/' + json.url;
          obj_loader.load(url, function(object) {

            object.traverse(function(child) {
              if (child.geometry) child.geometry.computeBoundingSphere();
            });

            ParseObjectPostLoading(object, json, materials, geometries, sounds, constants).then(function() {
              resolve(object);
            }, reject);

          });
        }
        else {
          reject('failed to load ' + json.uuid + ': THREE.OBJLoader is undefined');
        }
      });

      case 'Collada':
      object = new AMTHREE.ColladaObject();
      return object.load(constants.model_path + json.url, constants.image_path).then(function(object) {
        return ParseObjectPostLoading(object, json, materials, geometries, sounds, constants).then(function() {
          return object;
        });
      });

      case 'SoundObject':
      object = new AMTHREE.SoundObject(GetSound(json.sound, sounds));
      break;

      case 'Scene':
      object = new THREE.Scene();
      break;

      case 'PerspectiveCamera':
      object = new THREE.PerspectiveCamera( json.fov, json.aspect, json.near, json.far );
      break;

      case 'OrthographicCamera':
      object = new THREE.OrthographicCamera( json.left, json.right, json.top, json.bottom, json.near, json.far );
      break;

      case 'AmbientLight':
      object = new THREE.AmbientLight( json.color );
      break;

      case 'DirectionalLight':
      object = new THREE.DirectionalLight( json.color, json.intensity );
      break;

      case 'PointLight':
      object = new THREE.PointLight( json.color, json.intensity, json.distance, json.decay );
      break;

      case 'SpotLight':
      object = new THREE.SpotLight( json.color, json.intensity, json.distance, json.angle, json.exponent, json.decay );
      break;

      case 'HemisphereLight':
      object = new THREE.HemisphereLight( json.color, json.groundColor, json.intensity );
      break;

      case 'Mesh':
      object = new THREE.Mesh( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ) );
      break;

      case 'LOD':
      object = new THREE.LOD();
      break;

      case 'Line':
      object = new THREE.Line( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ), json.mode );
      break;

      case 'PointCloud': case 'Points':
      object = new THREE.Points( GetGeometry( json.geometry, geometries ), GetMaterial( json.material, materials ) );
      break;

      case 'Sprite':
      object = new THREE.Sprite( GetMaterial( json.material, materials ) );
      break;

      case 'Group':
      object = new THREE.Group();
      break;

      default:
      object = new THREE.Object3D();
    }

    return ParseObjectPostLoading(object, json, materials, geometries, sounds, constants);
  }

  function ParseObjectArray(json, materials, geometries, sounds, constants) {
    if (json instanceof Array) {
      return Promise.all(json.map(function(elem) {

        return ParseObject(elem, materials, geometries, sounds, constants);

      }));
    }
    else
      return Promise.reject('failed to parse object array: json not an array');
  }

  function NormalizeObject(object) {
    var box = new THREE.Box3();
    var sphere = new THREE.Sphere();
    var mesh = new THREE.Object3D();

    mesh.add(object);

    box.setFromObject(object);
    box.getBoundingSphere(sphere);

    mesh.scale.multiplyScalar(1 / sphere.radius);

    sphere.center.divideScalar(sphere.radius);
    mesh.position.sub(sphere.center);
    mesh.updateMatrix();

    var parent = new THREE.Object3D();
    parent.add(mesh);

    return parent;
  }

  function ComputeBoundingBox(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.computeBoundingBox();
      }
    });
  }

  function ComputeBoundingSphere(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.computeBoundingSphere();
      }
    });
  }


  if (typeof THREE !== 'undefined') {

    /**
    * @function
    * @description Parses a json into an object.
    * @param {object} json - the json structure
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<THREE.Object3D, string>} a promise
    */
    AMTHREE.ParseObject = Parse;

    /**
    * @function
    * @description Parses a json into an array of objects.
    * @param {object} json - the json structure
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<Array.<THREE.Object3D>, string>} a promise
    */
    AMTHREE.ParseObjectArray = ParseArray;

    /**
    * @function
    * @description Loads a json file describing an object.
    * @param {string} url
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<THREE.Object3D, string>} a promise
    */
    AMTHREE.LoadObject = Load;

    /**
    * @function
    * @description Loads a json file describing an array of objects.
    * @param {string} url
    * @param {string} [path] - the path of the directory containing the assets.
    * @returns {Promise.<Array.<THREE.Object3D>, string>} a promise
    */
    AMTHREE.LoadObjectArray = LoadArray;

    /**
    * @function
    * @description Moves and rescales an object so that it is contained in a sphere of radius 1, centered on the origin.
    * @param {THREE.Object3D} the source object
    * @returns {THREE.Object3D} an object containing the source
    */
    AMTHREE.NormalizeObject = NormalizeObject;

    /**
    * @function
    * @description Compute the bounding box of an object's geometry and every descending.
    * @param {THREE.Object3D}
    */
    AMTHREE.ComputeBoundingBox = ComputeBoundingBox;

    /**
    * @function
    * @description Compute the bounding sphere of an object's geometry and every descending.
    * @param {THREE.Object3D}
    */
    AMTHREE.ComputeBoundingSphere = ComputeBoundingSphere;

  }
  else {
  }

})();
var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {


  /**
  * A class to hold an url.
  * @param {string} [uuid] - Generated if not provided
  * @param {string} [url]
  */
  AMTHREE.Sound = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = url;
  };

  /**
  * Returns the json representation of this.
  * @param {object} meta
  * @return {object}
  */
  AMTHREE.Sound.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      url: AMTHREE.GetFilename(this.url)
    };

    if (!meta.sounds)
      meta.sounds = {};
    if (!meta.sounds[this.uuid])
      meta.sounds[this.uuid] = output;

    return output;
  };


}
else {
  AMTHREE.Sound = function() {
    console.warn('Sound.js: THREE undefined');
  };
}
var AMTHREE = AMTHREE || {};


if (typeof THREE !== 'undefined') {

  /**
   * A THREE.Object holding a sound.
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
   */
  AMTHREE.SoundObject.prototype.play = function() {
    this.playing = true;
    this.audio.src = this.sound.url;
    this.audio.play();
  };

  /**
   * Stops the sound.
   */
  AMTHREE.SoundObject.prototype.stop = function() {
    this.audio.src = '';
    this.playing = false;
  };

  /**
   * Pauses the sound.
   */
  AMTHREE.SoundObject.prototype.pause = function() {
    this.audio.pause();
    this.playing = false;
  };

  /**
   * Sets the sound's url.
   * @param {string} url
   */
  AMTHREE.SoundObject.prototype.setSound = function(sound) {
    this.sound = sound;
    if (this.isPlaying())
      this.play();
  };

  /**
   * Returns whether the sound is played.
   * @returns {bool}
   */
  AMTHREE.SoundObject.prototype.isPlaying = function() {
    return this.playing;
  };

  /**
   * Returns a clone of this.
   * @returns {AMTHREE.SoundObject}
   */
  AMTHREE.SoundObject.prototype.clone = function() {
    return (new AMTHREE.SoundObject()).copy(this);
  };

  /**
   * Copies the parameter.
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
  * @param {THREE.Object3D} object
  */
  AMTHREE.PlaySounds = function(object) {
    AMTHREE.SoundsCall(object, 'play');
  };

  /**
  * Recursively pauses the sounds of this object and all his children
  * @param {THREE.Object3D} object
  */
  AMTHREE.PauseSounds = function(object) {
    AMTHREE.SoundsCall(object, 'pause');
  };

  /**
  * Recursively stops the sounds of this object and all his children
  * @param {THREE.Object3D} object
  */
  AMTHREE.StopSounds = function(object) {
    AMTHREE.SoundsCall(object, 'stop');
  };

  AMTHREE.SoundObject.prototype.toJSON = function(meta) {
    var output = THREE.Object3D.prototype.toJSON.call(this, meta);

    this.sound.toJSON(meta);

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
var AMTHREE = AMTHREE || {};

(function() {

  if (typeof THREE === 'undefined') {
    AMTHREE.TrackedObjManager = function() {
      console.warn('TrackedObjManager.js: THREE undefined');
    };
    return;
  }


  /**
  * A class that moves objects on the scene relatively to the camera,
  *  smoothly by interpolation of successives positions and updates.
  * @class
  * @param {object} parameters - An object holding parameters
  * @param {THREE.Camera} parameters.camera
  * @param {number} [parameters.lerp_track_factor] - Sets the lerp_track_factor property.
  * @param {number} [parameters.lerp_update_factor] - Sets the lerp_update_factor property.
  * @param {number} [parameters.damping_factor] - Sets the damping_factor property.
  * @param {number} [parameters.timeout] - Sets the timeout property.
  */
  AMTHREE.TrackedObjManager = function(parameters) {
    parameters = parameters || {};

    var that = this;

    var _clock = new THREE.Clock(true);

    var _holder = new Holder();


    function LerpObjectsTransforms(src, dst, factor) {
      src.position.lerp(dst.position, factor);
      src.quaternion.slerp(dst.quaternion, factor);
      src.scale.lerp(dst.scale, factor);
    }

    function UpdateLerpMethod() {
      _holder.ForEach(function(elem) {

        if (elem.enabled)
          LerpObjectsTransforms(elem.object, elem.target, that.lerp_update_factor);

      });
    }

    var _update_method = UpdateLerpMethod;

    /**
     * @property {THREE.Camera} camera
     * @property {number} lerp_track_factor - [0-1] - 0.01 by default. Helps filter out bad poses. The new target tranform is an interpolation by this factor of the last tranform and the tranform given by a 'Track' call.
     * @property {number} lerp_update_factor - [0-1] - 0.3 by default. The object's transform gets closer to the target transform, by this factor, at each 'Update' call.
     * @property {number} damping_factor - [0-1] - 0.9 by default. Successive calls of 'Track' creates a momentum, that needs to be damped, otherwise it creates a yoyo effect.
     * @property {number} timeout - 6 by default. Time before an object enabled gets disabled, in seconds.
     */
    this.camera = parameters.camera;

    this.lerp_track_factor = parameters.lerp_track_factor || 0.01;
    this.lerp_update_factor = parameters.lerp_update_factor || 0.3;
    this.damping_factor = parameters.damping_factor || 0.9;

    this.timeout = parameters.timeout || 6;

    /**
     * Adds an object
     * @param {THREE.Object3D} object - Starts disabled.
     * @param {value} uuid
     * @param {function} [on_enable] - Function called when the object is tracked and was disabled before.
     * @param {function} [on_disable] - Function called when the object isnt tracked for "timeout" seconds.
     */
    this.Add = function(object, uuid, on_enable, on_disable) {
      _holder.Add(object, uuid, on_enable, on_disable);
    };

    /**
     * Remove an object
     * @param {value}
     */
    this.Remove = function(uuid) {
      _holder.Remove(uuid);
    };

    /**
     * Clear all the objects
     */
    this.Clear = function() {
      _holder.Clear();
    };

    /**
     * Updates the objects tranforms
     */
    this.Update = function() {

      _holder.UpdateElapsed(_clock.getDelta());
      _holder.CheckTimeout(that.timeout);

      _update_method();
    };

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {THREE.Matrix4} matrix
     */
    this.Track = function() {

      var new_matrix = new THREE.Matrix4();
      var tmp_pos = new THREE.Vector3();
      var tmp_qtn = new THREE.Quaternion();
      var tmp_scl = new THREE.Vector3();

      return function(uuid, matrix) {

        if (that.camera) {

          var elem = _holder.Get(uuid);
          if (elem) {
            var target = elem.target;

            new_matrix.copy(that.camera.matrixWorld);
            new_matrix.multiply(matrix);

            if (elem.enabled) {
              new_matrix.decompose(tmp_pos, tmp_qtn, tmp_scl);
              elem.inter_track.Update(tmp_pos, tmp_qtn, tmp_scl, that.lerp_track_factor, that.damping_factor);
            }
            else {
              new_matrix.decompose(target.position, target.quaternion, target.scale);
              new_matrix.decompose(elem.object.position, elem.object.quaternion, elem.object.scale);
              elem.inter_track.Init(target.position, target.quaternion, target.scale);
            }

            _holder.Track(uuid);

            return true;

          }
          else
            console.warn('TrackedObjManager: object ' + uuid + ' not found');
        }
        else
          console.warn('TrackedObjManager: camera is undefined');

        return false;
      };
    }();

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {THREE.Vector3} position
     * @param {THREE.Quaternion} quaternion
     * @param {THREE.Vector3} scale
     */
    this.TrackCompose = function() {

      var matrix = new THREE.Matrix4();

      return function(uuid, position, quaternion, scale) {

        matrix.compose(position, quaternion, scale);

        return that.Track(uuid, matrix);
      };
    }();

    /**
     * Sets a tracked object transform
     * @param {value} uuid
     * @param {number[]} translation_pose
     * @param {number[][]} rotation_pose
     * @param {number} model_size
     */
    this.TrackComposePosit = function() {

      var position = new THREE.Vector3();
      var euler = new THREE.Euler();
      var quaternion = new THREE.Quaternion();
      var scale = new THREE.Vector3();

      return function(uuid, translation_pose, rotation_pose, model_size) {

        position.x = translation_pose[0];
        position.y = translation_pose[1];
        position.z = -translation_pose[2];

        euler.x = -Math.asin(-rotation_pose[1][2]);
        euler.y = -Math.atan2(rotation_pose[0][2], rotation_pose[2][2]);
        euler.z = Math.atan2(rotation_pose[1][0], rotation_pose[1][1]);

        scale.x = model_size;
        scale.y = model_size;
        scale.z = model_size;

        quaternion.setFromEuler(euler);

        return that.TrackCompose(uuid, position, quaternion, scale);
      };
    }();

    /**
     * Returns an object held by this
     * @param {value} uuid
     */
    this.GetObject = function(uuid) {
      var elem = _holder.get(uuid);
      if (elem) {
        return elem.object;
      }
      return undefined;
    };

    /**
    * Moves all enabled objects
    * @param {THREE.Vector3} vec
    */
    this.MoveEnabledObjects = function(vec) {
      _holder.ForEach(function(elem) {
        if (elem.enabled) {
          elem.target.position.add(vec);
          elem.object.position.add(vec);
        }
      });
    };


  };


  function Holder() {
    this._objects = {};
  }

  Holder.prototype.Add = function(object, uuid, on_enable, on_disable) {

    var obj =
    {
      object: object,
      target:
      {
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      },
      inter_track: new TransformInterpolationComputer(),
      elapsed: 0,
      on_enable: on_enable,
      on_disable: on_disable,
      enabled: false
    };

    obj.inter_track.Init(object.position, object.quaternion, object.scale);

    this._objects[uuid] = obj;
  };

  Holder.prototype.Remove = function(uuid) {
    var elem = this._objects[uuid];

    if (elem.enabled) {
      if (elem.on_disable)
        elem.on_disable(elem.object);
    }
    delete this._objects[uuid];
  };

  Holder.prototype.Clear = function() {
    for (var uuid in this._objects)
      this.Remove(uuid);
  };

  Holder.prototype.Track = function(uuid) {

    var elem = this._objects[uuid];

    elem.elapsed = 0;

    if (!elem.enabled) {
      elem.enabled = true;
      if (elem.on_enable)
        elem.on_enable(elem.object);
    }
  };

  Holder.prototype.UpdateElapsed = function(elapsed) {
    for (var uuid in this._objects) {

      this._objects[uuid].elapsed += elapsed;
    }
  };

  Holder.prototype.CheckTimeout = function(timeout) {

    for (var uuid in this._objects) {

      var elem = this._objects[uuid];

      if (elem.enabled && elem.elapsed > timeout) {
        if (elem.on_disable)
          elem.on_disable(elem.object);
        elem.enabled = false;
      }
    }
  };

  Holder.prototype.ForEach = function(fun) {
    for (var uuid in this._objects) {
      fun(this._objects[uuid]);
    }
  };

  Holder.prototype.Get = function(uuid) {
    return this._objects[uuid];
  };


  var qtn_zero = new THREE.Quaternion();
  var tmp_pos = new THREE.Vector3();
  var tmp_qtn = new THREE.Quaternion();
  var tmp_scl = new THREE.Vector3();

  function TransformInterpolationComputer() {
    this.pos = null;
    this.d_pos = new THREE.Vector3();
    this.qtn = null;
    this.d_qtn = new THREE.Quaternion();
    this.scl = null;
    this.d_scl = new THREE.Vector3();
  }

  TransformInterpolationComputer.prototype.Init = function(position, quaternion, scale) {
    this.pos = position;
    this.d_pos.set(0, 0, 0);
    this.qtn = quaternion;
    this.d_qtn.set(0, 0, 0, 1);
    this.scl = scale;
    this.d_scl.set(0, 0, 0);
  };

  TransformInterpolationComputer.prototype.Update = function(position, quaternion, scale, interpolation, damping) {
    tmp_pos.subVectors(position, this.pos);
    tmp_pos.multiplyScalar(interpolation);
    this.d_pos.add(tmp_pos);

    tmp_qtn.copy(this.qtn);
    tmp_qtn.inverse();
    tmp_qtn.multiply(quaternion);
    tmp_qtn.slerp(qtn_zero, 1 - interpolation);
    this.d_qtn.multiply(tmp_qtn);

    tmp_scl.subVectors(scale, this.scl);
    tmp_scl.multiplyScalar(interpolation);
    this.d_scl.add(tmp_scl);

    this.pos.add(this.d_pos);
    this.qtn.multiply(this.d_qtn);
    this.scl.add(this.d_scl);

    this.d_pos.multiplyScalar(damping);
    this.d_qtn.slerp(qtn_zero, 1 - damping);
    this.d_scl.multiplyScalar(damping);
  };


})();
/**
 * @author arodic / https://github.com/arodic
 */
 /*jshint sub:true*/

( function () {

	'use strict';

  if (typeof THREE === 'undefined')
    return;


	var GizmoMaterial = function ( parameters ) {

		THREE.MeshBasicMaterial.call( this );

		this.depthTest = false;
		this.depthWrite = false;
		this.side = THREE.FrontSide;
		this.transparent = true;

		this.setValues( parameters );

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

				this.color.copy( this.oldColor );
				this.opacity = this.oldOpacity;

			}

		};

	};

	GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
	GizmoMaterial.prototype.constructor = GizmoMaterial;


	var GizmoLineMaterial = function ( parameters ) {

		THREE.LineBasicMaterial.call( this );

		this.depthTest = false;
		this.depthWrite = false;
		this.transparent = true;
		this.linewidth = 1;

		this.setValues( parameters );

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

				this.color.copy( this.oldColor );
				this.opacity = this.oldOpacity;

			}

		};

	};

	GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );
	GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;


	var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );


	AMTHREE.TransformGizmo = function () {

		var scope = this;

		this.init = function () {

			THREE.Object3D.call( this );

			this.handles = new THREE.Object3D();
			this.pickers = new THREE.Object3D();
			this.planes = new THREE.Object3D();

			this.add( this.handles );
			this.add( this.pickers );
			this.add( this.planes );

			//// PLANES

			var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 2, 2 );
			var planeMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.DoubleSide } );

			var planes = {
				"XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
				"XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
			};

			this.activePlane = planes[ "XYZE" ];

			planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
			planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

			for ( var i in planes ) {

				planes[ i ].name = i;
				this.planes.add( planes[ i ] );
				this.planes[ i ] = planes[ i ];

			}

			//// HANDLES AND PICKERS

			var setupGizmos = function( gizmoMap, parent ) {

				for ( var name in gizmoMap ) {

					for ( i = gizmoMap[ name ].length; i --; ) {

						var object = gizmoMap[ name ][ i ][ 0 ];
						var position = gizmoMap[ name ][ i ][ 1 ];
						var rotation = gizmoMap[ name ][ i ][ 2 ];

						object.name = name;

						if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
						if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

						parent.add( object );

					}

				}

			};

			setupGizmos( this.handleGizmos, this.handles );
			setupGizmos( this.pickerGizmos, this.pickers );

			// reset Transformations

			this.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					child.updateMatrix();

					var tempGeometry = child.geometry.clone();
					tempGeometry.applyMatrix( child.matrix );
					child.geometry = tempGeometry;

					child.position.set( 0, 0, 0 );
					child.rotation.set( 0, 0, 0 );
					child.scale.set( 1, 1, 1 );

				}

			} );

		};

		this.highlight = function ( axis ) {

			this.traverse( function( child ) {

				if ( child.material && child.material.highlight ) {

					if ( child.name === axis ) {

						child.material.highlight( true );

					} else {

						child.material.highlight( false );

					}

				}

			} );

		};

	};

	AMTHREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );
	AMTHREE.TransformGizmo.prototype.constructor = AMTHREE.TransformGizmo;

	AMTHREE.TransformGizmo.prototype.update = function ( rotation, eye ) {

		var vec1 = new THREE.Vector3( 0, 0, 0 );
		var vec2 = new THREE.Vector3( 0, 1, 0 );
		var lookAtMatrix = new THREE.Matrix4();

		this.traverse( function( child ) {

			if ( child.name.search( "E" ) !== - 1 ) {

				child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

			} else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

				child.quaternion.setFromEuler( rotation );

			}

		} );

	};

	AMTHREE.TransformGizmoTranslate = function () {

		AMTHREE.TransformGizmo.call( this );

		var arrowGeometry = new THREE.Geometry();
		var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
		mesh.position.y = 0.5;
		mesh.updateMatrix();

		arrowGeometry.merge( mesh.geometry, mesh.matrix );

		var lineXGeometry = new THREE.BufferGeometry();
		lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

		var lineYGeometry = new THREE.BufferGeometry();
		lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

		var lineZGeometry = new THREE.BufferGeometry();
		lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

		this.handleGizmos = {

			X: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
				[ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
				[	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
				[ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
			],

			XY: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
			],

			YZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
			],

			XZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
			],

			XY: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
			],

			YZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
			],

			XZ: [
				[ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
			]

		};

		this.setActivePlane = function ( axis, eye ) {

			var tempMatrix = new THREE.Matrix4();
			eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

			if ( axis === "X" ) {

				this.activePlane = this.planes[ "XY" ];

				if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

			}

			if ( axis === "Y" ) {

				this.activePlane = this.planes[ "XY" ];

				if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "Z" ) {

				this.activePlane = this.planes[ "XZ" ];

				if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

			if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

			if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

			if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];

		};

		this.init();

	};

	AMTHREE.TransformGizmoTranslate.prototype = Object.create( AMTHREE.TransformGizmo.prototype );
	AMTHREE.TransformGizmoTranslate.prototype.constructor = AMTHREE.TransformGizmoTranslate;

	AMTHREE.TransformGizmoRotate = function () {

		AMTHREE.TransformGizmo.call( this );

		var CircleGeometry = function ( radius, facing, arc ) {

			var geometry = new THREE.BufferGeometry();
			var vertices = [];
			arc = arc ? arc : 1;

			for ( var i = 0; i <= 64 * arc; ++ i ) {

				if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
				if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
				if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

			}

			geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) );
			return geometry;

		};

		this.handleGizmos = {

			X: [
				[ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			E: [
				[ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
			],

			XYZE: [
				[ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			E: [
				[ new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
			],

			XYZE: [
				[ new THREE.Mesh( new THREE.Geometry() ) ]// TODO
			]

		};

		this.setActivePlane = function ( axis ) {

			if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

			if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

			if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

			if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

		};

		this.update = function ( rotation, eye2 ) {

			AMTHREE.TransformGizmo.prototype.update.apply( this, arguments );

			var group = {

				handles: this[ "handles" ],
				pickers: this[ "pickers" ],

			};

			var tempMatrix = new THREE.Matrix4();
			var worldRotation = new THREE.Euler( 0, 0, 1 );
			var tempQuaternion = new THREE.Quaternion();
			var unitX = new THREE.Vector3( 1, 0, 0 );
			var unitY = new THREE.Vector3( 0, 1, 0 );
			var unitZ = new THREE.Vector3( 0, 0, 1 );
			var quaternionX = new THREE.Quaternion();
			var quaternionY = new THREE.Quaternion();
			var quaternionZ = new THREE.Quaternion();
			var eye = eye2.clone();

			worldRotation.copy( this.planes[ "XY" ].rotation );
			tempQuaternion.setFromEuler( worldRotation );

			tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
			eye.applyMatrix4( tempMatrix );

			this.traverse( function( child ) {

				tempQuaternion.setFromEuler( worldRotation );

				if ( child.name === "X" ) {

					quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					child.quaternion.copy( tempQuaternion );

				}

				if ( child.name === "Y" ) {

					quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					child.quaternion.copy( tempQuaternion );

				}

				if ( child.name === "Z" ) {

					quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
					child.quaternion.copy( tempQuaternion );

				}

			} );

		};

		this.init();

	};

	AMTHREE.TransformGizmoRotate.prototype = Object.create( AMTHREE.TransformGizmo.prototype );
	AMTHREE.TransformGizmoRotate.prototype.constructor = AMTHREE.TransformGizmoRotate;

	AMTHREE.TransformGizmoScale = function () {

		AMTHREE.TransformGizmo.call( this );

		var arrowGeometry = new THREE.Geometry();
		var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
		mesh.position.y = 0.5;
		mesh.updateMatrix();

		arrowGeometry.merge( mesh.geometry, mesh.matrix );

		var lineXGeometry = new THREE.BufferGeometry();
		lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

		var lineYGeometry = new THREE.BufferGeometry();
		lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

		var lineZGeometry = new THREE.BufferGeometry();
		lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

		this.handleGizmos = {

			X: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
				[ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
			],

			Y: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
				[ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
			],

			Z: [
				[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
				[ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
			]

		};

		this.pickerGizmos = {

			X: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
			],

			Y: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
			],

			Z: [
				[ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
			],

			XYZ: [
				[ new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
			]

		};

		this.setActivePlane = function ( axis, eye ) {

			var tempMatrix = new THREE.Matrix4();
			eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

			if ( axis === "X" ) {

				this.activePlane = this.planes[ "XY" ];
				if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

			}

			if ( axis === "Y" ) {

				this.activePlane = this.planes[ "XY" ];
				if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "Z" ) {

				this.activePlane = this.planes[ "XZ" ];
				if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

			}

			if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		};

		this.init();

	};

	AMTHREE.TransformGizmoScale.prototype = Object.create( AMTHREE.TransformGizmo.prototype );
	AMTHREE.TransformGizmoScale.prototype.constructor = AMTHREE.TransformGizmoScale;


  /**
  * THREE exemple edited. Display guizmos to move, rotate and rescale a THREE.Object3D.
  * @class
  * @param {THREE.Camera} camera - The guizmos are displayed relatively to this camera.
  * @param {DomElement} [domElement=document] - The element to which attach the mouse events.
  */
	AMTHREE.TransformControls = function ( camera, domElement ) {

		// TODO: Make non-uniform scale and rotate play nice in hierarchies
		// TODO: ADD RXYZ contol

		THREE.Object3D.call( this );

		domElement = ( domElement !== undefined ) ? domElement : document;

		this.object = undefined;
		this.visible = false;
		this.translationSnap = null;
		this.rotationSnap = null;
		this.space = "world";
		this.size = 1;
		this.axis = null;

		var scope = this;

		var _mode = "translate";
		var _dragging = false;
		var _plane = "XY";
		var _gizmo = {

			"translate": new AMTHREE.TransformGizmoTranslate(),
			"rotate": new AMTHREE.TransformGizmoRotate(),
			"scale": new AMTHREE.TransformGizmoScale()
		};

		for ( var type in _gizmo ) {

			var gizmoObj = _gizmo[ type ];

			gizmoObj.visible = ( type === _mode );
			this.add( gizmoObj );

		}

		var changeEvent = { type: "change" };
		var mouseDownEvent = { type: "mouseDown" };
		var mouseUpEvent = { type: "mouseUp", mode: _mode };
		var objectChangeEvent = { type: "objectChange" };

		var ray = new THREE.Raycaster();
		var pointerVector = new THREE.Vector2();

		var point = new THREE.Vector3();
		var offset = new THREE.Vector3();
    var camera_offset = new THREE.Vector3();

		var rotation = new THREE.Vector3();
		var offsetRotation = new THREE.Vector3();
		var scale = 1;

		var lookAtMatrix = new THREE.Matrix4();
		var eye = new THREE.Vector3();

		var tempMatrix = new THREE.Matrix4();
		var tempVector = new THREE.Vector3();
		var tempQuaternion = new THREE.Quaternion();
		var unitX = new THREE.Vector3( 1, 0, 0 );
		var unitY = new THREE.Vector3( 0, 1, 0 );
		var unitZ = new THREE.Vector3( 0, 0, 1 );

		var quaternionXYZ = new THREE.Quaternion();
		var quaternionX = new THREE.Quaternion();
		var quaternionY = new THREE.Quaternion();
		var quaternionZ = new THREE.Quaternion();
		var quaternionE = new THREE.Quaternion();

		var oldPosition = new THREE.Vector3();
		var oldScale = new THREE.Vector3();
		var oldRotationMatrix = new THREE.Matrix4();

		var parentRotationMatrix  = new THREE.Matrix4();
		var parentScale = new THREE.Vector3();

		var worldPosition = new THREE.Vector3();
		var worldRotation = new THREE.Euler();
		var worldRotationMatrix  = new THREE.Matrix4();
		var camPosition = new THREE.Vector3();
		var camRotation = new THREE.Euler();

		domElement.addEventListener( "mousedown", onPointerDown, false );
		domElement.addEventListener( "touchstart", onPointerDown, false );

		domElement.addEventListener( "mousemove", onPointerHover, false );
		domElement.addEventListener( "touchmove", onPointerHover, false );

		domElement.addEventListener( "mousemove", onPointerMove, false );
		domElement.addEventListener( "touchmove", onPointerMove, false );

		domElement.addEventListener( "mouseup", onPointerUp, false );
		domElement.addEventListener( "mouseout", onPointerUp, false );
		domElement.addEventListener( "touchend", onPointerUp, false );
		domElement.addEventListener( "touchcancel", onPointerUp, false );
		domElement.addEventListener( "touchleave", onPointerUp, false );

    /**
    * Destroyes this object, by removing the event listeners.
    */
		this.dispose = function () {

			domElement.removeEventListener( "mousedown", onPointerDown );
			domElement.removeEventListener( "touchstart", onPointerDown );

			domElement.removeEventListener( "mousemove", onPointerHover );
			domElement.removeEventListener( "touchmove", onPointerHover );

			domElement.removeEventListener( "mousemove", onPointerMove );
			domElement.removeEventListener( "touchmove", onPointerMove );

			domElement.removeEventListener( "mouseup", onPointerUp );
			domElement.removeEventListener( "mouseout", onPointerUp );
			domElement.removeEventListener( "touchend", onPointerUp );
			domElement.removeEventListener( "touchcancel", onPointerUp );
			domElement.removeEventListener( "touchleave", onPointerUp );

		};

    /**
    * Sets the object to be edited.
    * @param {THREE.Object3D} object
    */
		this.attach = function ( object ) {

			this.object = object;
			this.visible = true;
			this.update();

		};

    /**
    * Detach this from the object.
    */
		this.detach = function () {

			this.object = undefined;
			this.visible = false;
			this.axis = null;

		};

    /**
    * Returns the current mode.
    * @returns {'translate'|'rotate'|'scale'}
    */
		this.getMode = function () {

			return _mode;

		};

    /**
    * Sets the mode of edition.
    * @param {'translate'|'rotate'|'scale'} mode
    */
		this.setMode = function ( mode ) {

			_mode = mode ? mode : _mode;

			if ( _mode === "scale" ) scope.space = "local";

			for ( var type in _gizmo ) _gizmo[ type ].visible = ( type === _mode );

			this.update();
			scope.dispatchEvent( changeEvent );

		};

		this.setTranslationSnap = function ( translationSnap ) {

			scope.translationSnap = translationSnap;

		};

		this.setRotationSnap = function ( rotationSnap ) {

			scope.rotationSnap = rotationSnap;

		};

		this.setSize = function ( size ) {

			scope.size = size;
			this.update();
			scope.dispatchEvent( changeEvent );

		};

		this.setSpace = function ( space ) {

			scope.space = space;
			this.update();
			scope.dispatchEvent( changeEvent );

		};

    /**
    * Updates the target object, and the guizmos.
    */
		this.update = function () {

			if ( scope.object === undefined ) return;

			scope.object.updateMatrixWorld();
			worldPosition.setFromMatrixPosition( scope.object.matrixWorld );
			worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

			camera.updateMatrixWorld();
			camPosition.setFromMatrixPosition( camera.matrixWorld );
			camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

			scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
			this.position.copy( worldPosition );
			this.scale.set( scale, scale, scale );

			eye.copy( camPosition ).sub( worldPosition ).normalize();

			if ( scope.space === "local" ) {

				_gizmo[ _mode ].update( worldRotation, eye );

			} else if ( scope.space === "world" ) {

				_gizmo[ _mode ].update( new THREE.Euler(), eye );

			}

			_gizmo[ _mode ].highlight( scope.axis );

		};

		function onPointerHover( event ) {

			if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

			var axis = null;

			if ( intersect ) {

				axis = intersect.object.name;

				event.preventDefault();

			}

			if ( scope.axis !== axis ) {

				scope.axis = axis;
				scope.update();
				scope.dispatchEvent( changeEvent );

			}

		}

		function onPointerDown( event ) {

			if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			if ( pointer.button === 0 || pointer.button === undefined ) {

				var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

				if ( intersect ) {

					event.preventDefault();
					event.stopPropagation();

					scope.dispatchEvent( mouseDownEvent );

					scope.axis = intersect.object.name;

					scope.update();

					eye.copy( camPosition ).sub( worldPosition ).normalize();

					_gizmo[ _mode ].setActivePlane( scope.axis, eye );

					var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

					if ( planeIntersect ) {

						oldPosition.copy( scope.object.position );
						oldScale.copy( scope.object.scale );

						oldRotationMatrix.extractRotation( scope.object.matrix );
						worldRotationMatrix.extractRotation( scope.object.matrixWorld );

						parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
						parentScale.setFromMatrixScale( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

						offset.copy( planeIntersect.point );
            camera_offset.copy(offset);
            camera_offset.project(camera);

					}

				}

			}

			_dragging = true;

		}

    function scaleFromDistance( d ) {
      return 1 + Math.sign( d ) * d * d * 5;
    }

		function onPointerMove( event ) {

			if ( scope.object === undefined || scope.axis === null || _dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

			var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

			if ( planeIntersect === false ) return;

			event.preventDefault();
			event.stopPropagation();

			point.copy( planeIntersect.point );

			if ( _mode === "translate" ) {

				point.sub( offset );
				point.multiply( parentScale );

				if ( scope.space === "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
					if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
					if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

					point.applyMatrix4( oldRotationMatrix );

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );

				}

				if ( scope.space === "world" || scope.axis.search( "XYZ" ) !== - 1 ) {

					if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
					if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
					if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

					point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );

				}

				if ( scope.translationSnap !== null ) {

					if ( scope.space === "local" ) {

						scope.object.position.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					}

					if ( scope.axis.search( "X" ) !== - 1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.translationSnap ) * scope.translationSnap;
					if ( scope.axis.search( "Y" ) !== - 1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.translationSnap ) * scope.translationSnap;
					if ( scope.axis.search( "Z" ) !== - 1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.translationSnap ) * scope.translationSnap;

					if ( scope.space === "local" ) {

						scope.object.position.applyMatrix4( worldRotationMatrix );

					}

				}

			} else if ( _mode === "scale" ) {

        point.project( camera );
        point.sub( camera_offset );

				if ( scope.space === "local" ) {

					if ( scope.axis === "XYZ" ) {

						scale = scaleFromDistance( point.y );

						scope.object.scale.x = oldScale.x * scale;
						scope.object.scale.y = oldScale.y * scale;
						scope.object.scale.z = oldScale.z * scale;

					} else {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

            // Compute vector guizmo -> object
            tempVector.copy(scope.object.position);
            tempVector.project(camera);
            tempVector.sub(camera_offset);
            tempVector.normalize();

            var val = -(tempVector.x * point.x + tempVector.y * point.y + tempVector.z * point.z);

						if ( scope.axis === "X" ) scope.object.scale.x = oldScale.x * scaleFromDistance( val );
						if ( scope.axis === "Y" ) scope.object.scale.y = oldScale.y * scaleFromDistance( val );
						if ( scope.axis === "Z" ) scope.object.scale.z = oldScale.z * scaleFromDistance( val );

					}

				}

			} else if ( _mode === "rotate" ) {

				point.sub( worldPosition );
				point.multiply( parentScale );
				tempVector.copy( offset ).sub( worldPosition );
				tempVector.multiply( parentScale );

				if ( scope.axis === "E" ) {

					point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
					tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.axis === "XYZE" ) {

					quaternionE.setFromEuler( point.clone().cross( tempVector ).normalize() ); // rotation axis

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
					quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo( tempVector ) );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.space === "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );

					if ( scope.rotationSnap !== null ) {

						quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

					} else {

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

					}

					if ( scope.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
					if ( scope.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
					if ( scope.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

					scope.object.quaternion.copy( quaternionXYZ );

				} else if ( scope.space === "world" ) {

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					if ( scope.rotationSnap !== null ) {

						quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
						quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

					} else {

						quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
						quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
						quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

					}

					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					if ( scope.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					if ( scope.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					if ( scope.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				}

			}

			scope.update();
			scope.dispatchEvent( changeEvent );
			scope.dispatchEvent( objectChangeEvent );

		}

		function onPointerUp( event ) {

			if ( event.button !== undefined && event.button !== 0 ) return;

			if ( _dragging && ( scope.axis !== null ) ) {

				mouseUpEvent.mode = _mode;
				scope.dispatchEvent( mouseUpEvent );

			}

			_dragging = false;
			onPointerHover( event );

		}

		function intersectObjects( pointer, objects ) {

			var rect = domElement.getBoundingClientRect();
			var x = ( pointer.clientX - rect.left ) / rect.width;
			var y = ( pointer.clientY - rect.top ) / rect.height;

			pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
			ray.setFromCamera( pointerVector, camera );

			var intersections = ray.intersectObjects( objects, true );
			return intersections[ 0 ] ? intersections[ 0 ] : false;

		}

	};

	AMTHREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );
	AMTHREE.TransformControls.prototype.constructor = AMTHREE.TransformControls;

} )();

var AMTHREE = AMTHREE || {};


AMTHREE.AnimatedTextureCall = function(object, fun) {
  object.traverse(function(s) {
    if (s.material && s.material.map && s.material.map[fun])
      s.material.map[fun]();
  });
};

/**
 * Recursively play animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.PlayAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'play');
};

/**
 * Recursively stop animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.StopAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'stop');
};

/**
 * Recursively pause animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.PauseAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'pause');
};

/**
 * Recursively update animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.UpdateAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'update');
};


/**
 * Converts a world position to a canvas position.
 * @param {THREE.Vector3} position
 * @param {THREE.Camera} camera
 * @param {Canvas} canvas
 */
AMTHREE.WorldToCanvasPosition = function(position, camera, canvas) {
  var vec = new THREE.Vector3();

  vec.copy(position);
  vec.project(camera);

  var x = Math.round( (vec.x + 1) * canvas.width / 2 );
  var y = Math.round( (-vec.y + 1) * canvas.height / 2 );

  return { x: x, y: y, z: vec.z };
};

/**
* Returns the name of the file pointed by a path string.
* @param {string} path
* @returns {string}
*/
AMTHREE.GetFilename = function(path) {
  return path.split('/').pop().split('\\').pop();
};

AMTHREE.IMAGE_PATH = 'images/';
AMTHREE.MODEL_PATH = 'models/';
AMTHREE.VIDEO_PATH = 'videos/';
AMTHREE.SOUND_PATH = 'sounds/';
AMTHREE.ASSET_PATH = 'assets/';
var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {

  /**
   * @class
   * @augments THREE.Texture
   * @param {string} [uuid] - genrated if not provided
   * @param {string} [url] - The url of the video.
   */
  AMTHREE.Video = function(uuid, url) {
    this.uuid = uuid || THREE.Math.generateUUID();
    this.url = (typeof url === 'string') ? url : undefined;
  };

  /**
  * Returns an object that can be serialized using JSON.stringify.
  * @param {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  * @returns {object} A json object
  */
  AMTHREE.Video.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      url: AMTHREE.GetFilename(this.url)
    };

    if (typeof meta === 'object') {
      if (!meta.videos) meta.videos = {};
      meta.videos[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.Video = function() {
    console.warn('Video.js: THREE undefined');
  };
}

var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  /**
   * @class
   * @augments THREE.Texture
   * @param {AMTHREE.Video} [video]
   * @param {string} [uuid]
   * @param {number} [width]
   * @param {number} [height]
   * @param {bool} [loop=true]
   * @param {bool} [autoplay=false]
   */
  AMTHREE.VideoTexture = function(video, uuid, width, height, loop, autoplay) {
    THREE.Texture.call(this);

    this.uuid = (typeof uuid === 'string') ? uuid : THREE.Math.generateUUID();

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.videoElement = document.createElement('video');

    this.needsUpdate = false;

    this.set(video, width, height, loop, autoplay);
  };

  AMTHREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.VideoTexture.prototype.constructor = AMTHREE.VideoTexture;

  /**
   * Plays the animated texture.
   */
  AMTHREE.VideoTexture.prototype.play = function() {
    if (this.videoElement && !this.playing && this.video) {
      if (!this.paused) {
        this.videoElement.src = this.video.url;
      }
      this.videoElement.setAttribute('crossorigin', 'anonymous');
      this.videoElement.play();
      this.image = this.videoElement;
      this.playing = true;
    }
  };

  /**
   * Updates the animated texture.
   */
  AMTHREE.VideoTexture.prototype.update = function() {
    if (this.videoElement && this.videoElement.readyState == this.videoElement.HAVE_ENOUGH_DATA) {
      this.needsUpdate = true;
    }
  };

  /**
   * Pauses the animated texture.
   */
  AMTHREE.VideoTexture.prototype.pause = function() {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
      this.playing = false;
    }
  };

  /**
   * Stops the animated texture.
   */
  AMTHREE.VideoTexture.prototype.stop = function() {
    if (this.videoElement) {
      this.pause();
      this.videoElement.src = '';
      this.image = undefined;
      this.needsUpdate = true;
    }
  };

  /**
   * Sets the texture.
   * @param {AMTHREE.Video} [video]
   * @param {number} [width]
   * @param {number} [height]
   * @param {bool} [loop=true]
   * @param {bool} [autoplay=false]
   */
  AMTHREE.VideoTexture.prototype.set = function(video, width, height, loop, autoplay) {
    this.stop();

    this.video = video;

    this.videoElement.width = (typeof width === 'number') ? width : undefined;
    this.videoElement.height = (typeof height === 'number') ? height : undefined;
    this.videoElement.autoplay = (typeof autoplay === 'boolean') ? autoplay : false;
    this.videoElement.loop = (typeof loop === 'boolean') ? loop : true;

    this.playing = false;

    if (this.videoElement.autoplay)
      this.play();
  };

  /**
  * Returns a json object.
  * {object} [meta] - an object holding json ressources. The result of this function will be added to it if provided.
  */
  AMTHREE.VideoTexture.prototype.toJSON = function(meta) {
    var output = {
      uuid: this.uuid,
      video: this.video.uuid,
      width: this.videoElement.width,
      height: this.videoElement.height,
      loop: this.videoElement.loop,
      autoplay: this.videoElement.autoplay
    };

    this.video.toJSON(meta);

    if (typeof meta === 'object') {
      if (!meta.textures) meta.textures = {};
      meta.textures[output.uuid] = output;
    }

    return output;
  };


}
else {
  AMTHREE.VideoTexture = function() {
    console.warn('VideoTexture.js: THREE undefined');
  };
}
var AM = AM || {};


/**
 * Detects corners in an image using FAST, and descriptors using ORB.
 * @class
 */
AM.Detection = function() {
  var that=this;
  var _params = {
    laplacian_threshold: 30,
    eigen_threshold: 25,
    detection_corners_max: 500,
    border_size: 15,
    fast_threshold: 20
  };

  var _debug =false;

  var _screen_corners = [];
  var _num_corners = 0;

  var _screen_descriptors = new jsfeat.matrix_t(32, _params.detection_corners_max, jsfeat.U8_t | jsfeat.C1_t);
  var _cropped = new jsfeat.matrix_t(640, 480, jsfeat.U8_t | jsfeat.C1_t);

  function AllocateCorners(width, height) {
    var i = width * height;

    if (i > _screen_corners.length) {
      while (--i >= 0) {
        _screen_corners[i] = new jsfeat.keypoint_t();
      }
    }
  }

  /**
   * Computes the image corners and descriptors and saves them internally.
   * <br>Use {@link ImageFilter} first to filter an Image.
   * @inner
   * @param {jsfeat.matrix_t} img
   */
  this.Detect = function(img, fixed_angle) {
    AllocateCorners(img.cols, img.rows);

    _num_corners = AM.DetectKeypointsYape06(img, _screen_corners, _params.detection_corners_max,
      _params.laplacian_threshold, _params.eigen_threshold, _params.border_size, fixed_angle);
    
    // _num_corners = AM.DetectKeypointsFast(img, _screen_corners, _params.detection_corners_max,
    //   _params.fast_threshold, _params.border_size);

    jsfeat.orb.describe(img, _screen_corners, _num_corners, _screen_descriptors);

    if (_debug) console.log("Learn : " + _num_corners + " corners");
  };

  /**
   * Crop image and computes the image corners and descriptors and saves them internally.
   * <br>Use {@link ImageFilter} first to filter an Image.
   * @inner
   * @param {jsfeat.matrix_t} img
   * @param {bool} use fixed angles for descriptor orientation
   * @param {double} width percentage to crop on each image side
   * @param {double} height percentage to crop on each image side
   */
  this.CropDetect = function(img, fixed_angle, cx, cy) {
    // crop image
    var bandw=Math.round(cx*img.cols);
    var bandh=Math.round(cy*img.rows);
    var new_cols=img.cols-2*bandw;
    var new_rows=img.rows-2*bandh;
    var i,j;

    if (new_cols != _cropped.cols || new_rows != _cropped.rows )
      _cropped.resize(new_cols, new_rows, _cropped.channel);

    for (j=0; j<new_rows; ++j)
      for (i=0; i<new_cols; ++i){
        _cropped.data[j*new_cols+i]=img.data[(j+bandh)*img.cols+i+bandw];
      }

    // detect features
    that.Detect(_cropped, fixed_angle);

    // correct corners location
    for (i=0; i<_screen_corners.length; ++i){
      _screen_corners[i].x += bandw;
      _screen_corners[i].y += bandh;
    }
  };

  /**
   * Sets the params used during the detection
   * @inner
   * @param {object} params
   * @param {number} [params.laplacian_threshold] - 0 - 100 default 30
   * @param {number} [params.eigen_threshold] - 0 - 100 default 25
   * @param {number} [params.detection_corners_max] - 100 - 1000 default 500
   * @param {number} [params.border_size] default 3
   * @param {number} [params.fast_threshold] - 0 - 10 default 48
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };

  /**
   * Returns the last computed descriptors
   * @inner
   * @returns {jsfeat.matrix_t} Descriptors
   */
  this.GetDescriptors = function() {
    return _screen_descriptors;
  };

  /**
   * Returns the count of the last computed corners
   * @inner
   * @returns {number}
   */
  this.GetNumCorners = function() {
    return _num_corners;
  };

  /**
   * Returns a copy of the last computed corners
   * @inner
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetCorners = function() {
    var copy = [];
    var i=that.GetNumCorners();
    while( i--)
       copy[i]=_screen_corners[i];
    
    return copy;
  };


};

AM.IcAngle = (function() {
  var u_max = new Int32Array( [ 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 11, 10, 9, 8, 6, 3, 0 ] );
  var half_pi = Math.PI / 2;
  
  function DiamondAngle(y, x) {
    if (y >= 0)
      return (x >= 0 ? y / (x + y) : 1 - x / (-x + y)); 
    else
      return (x < 0 ? 2 - y / (-x - y) : 3 + x / (x - y));
  }

  return function(img, px, py) {
    var half_k = 15; // half patch size
    var m_01 = 0, m_10 = 0;
    var src = img.data, step = img.cols;
    var u = 0, v = 0, center_off = (py * step + px) | 0;
    var v_sum = 0, d = 0, val_plus = 0, val_minus = 0;

    // Treat the center line differently, v=0
    for (u = -half_k; u <= half_k; ++u)
      m_10 += u * src[center_off + u];

    // Go line by line in the circular patch
    for (v = 1; v <= half_k; ++v) {
      // Proceed over the two lines
      v_sum = 0;
      d = u_max[v];
      for (u = -d; u <= d; ++u) {
        val_plus = src[center_off + u + v * step];
        val_minus = src[center_off + u - v * step];
        v_sum += (val_plus - val_minus);
        m_10 += u * (val_plus + val_minus);
      }
      m_01 += v * v_sum;
    }

    return Math.atan2(m_01, m_10);
    // return DiamondAngle(m_01, m_10) * half_pi;
  };
})();

AM.DetectKeypointsPostProc = (function() {

  function Comp(a, b) {
    return b.score < a.score;
  }

  return function(img, corners, count, max_allowed, angle) {
    var i;

    // sort by score and reduce the count if needed
    if(count > max_allowed) {
      jsfeat.math.qsort(corners, 0, count - 1, Comp);
      count = max_allowed;
    }

    // calculate dominant orientation for each keypoint
    if (typeof angle === 'number') {
      for(i = 0; i < count; ++i) {
        corners[i].angle = angle;
      }
    }
    else {
      for(i = 0; i < count; ++i) {
        corners[i].angle = AM.IcAngle(img, corners[i].x, corners[i].y);
      }
    }

    return count;
  };
})();

AM.DetectKeypointsYape06 = function(img, corners, max_allowed,
  laplacian_threshold, eigen_threshold, border_size, angle) {

  jsfeat.yape06.laplacian_threshold = laplacian_threshold;
  jsfeat.yape06.min_eigen_value_threshold = eigen_threshold;

  // detect features
  var count = jsfeat.yape06.detect(img, corners, border_size);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed, angle);

  return count;
};

AM.DetectKeypointsFast = function(img, corners, max_allowed, threshold, border_size) {
  jsfeat.fast_corners.set_threshold(threshold);

  var count = jsfeat.fast_corners.detect(img, corners, border_size || 3);

  count = AM.DetectKeypointsPostProc(img, corners, count, max_allowed);

  return count;
};
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
   * @param {number} [params.blur_size] default 3
   * @param {bool} [params.blur] - compute blur ? default true
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};
/*************************







SetParameters(params)

params.match_min
params.laplacian_threshold
params.eigen_threshold
params.detection_corners_max
params.blur
params.blur_size
params.match_threshold
params.num_train_levels
params.image_size_max
params.training_corners_max



*************************/


var AM = AM || {};


/**
 * Finds a list of image in an image, and compute its pose.
 * @class
 */
AM.MarkerTracker = function() {

  var _training = new AM.Training();
  var _trained_images = {};

  var _image_filter = new AM.ImageFilter();
  var _detection = new AM.Detection();
  var _matching = new AM.Matching();
  var _pose = new AM.Pose();

  var _match_found = false;
  var _matching_image;
  var _last_trained_uuid;

  var _params = {
    match_min : 8
  };
  
  var _debug =true; 
  
  var _profiler = new AM.Profiler();
  _profiler.add('filter');
  _profiler.add('detection');
  _profiler.add('matching');
  _profiler.add('pose');


  /**
  * Computes the corners and descriptors.
  * @param {ImageData} image_data
  */
  this.ComputeImage = function(image_data, fixed_angle) {
    _profiler.new_frame();
    _profiler.start('filter');
    _image_filter.Filter(image_data);
    _profiler.stop('filter');
    _profiler.start('detection');

    // crop image if image is in landscape (sides are less important)
    var cx= image_data.width>image_data.height ? 0.2 : 0;
    _detection.CropDetect(_image_filter.GetFilteredImage(), fixed_angle, cx, 0);
//    _detection.Detect(_image_filter.GetFilteredImage(), fixed_angle);
    _profiler.stop('detection');
    if (_debug) console.log( "im("+image_data.width+" "+image_data.height+") nbScreenCorners: " + _detection.GetNumCorners());
  };

  /**
   * Matches the last computed ImageData and every active trained image.
   * @returns {bool} true if a match if found.
   */
  this.Match = function() {
    _profiler.start('matching');

    _match_found = false;
    _matching_image = undefined;

    _matching.SetScreenDescriptors(_detection.GetDescriptors());

    for(var uuid in _trained_images) {
      var trained_image = _trained_images[uuid];
      _last_trained_uuid = uuid;

      if (!trained_image.IsActive())
        continue;

      _matching.Match(trained_image.GetDescriptorsLevels());

      var count = _matching.GetNumMatches();


      _match_found = (count >= _params.match_min);
      if (_debug) console.log( "image: " + uuid + " nbMatches: " + count);
      if (!_match_found)
        continue;

      var good_count = _pose.Pose(_matching.GetMatches(), count,
        _detection.GetCorners(), trained_image.GetCornersLevels());
      _match_found = (good_count >= _params.match_min);

      if (_debug) console.log(" goodMatches: " + good_count);
      if (_match_found) {
        _matching_image = trained_image;
        break;
      }

    }

    _profiler.stop('matching');
    if (_debug) console.log(_profiler.log2());

    return _match_found;
  };

  /**
   * Returns the id of the last match.
   */
  this.GetMatchUuid = function() {
    if (_matching_image)
      return _matching_image.GetUuid();
  };

  /**
   * Returns the id of the last match
   * Returns the id of the last match
   */
  this.GetLastUuid = function() {
      return _last_trained_uuid;
  };

  /**
   * Computes and returns the pose of the last match
   * @inner
   * @returns {Point2D[]} The corners
   */
  this.GetPose = function() {
    if (_match_found) {
      _profiler.start('pose');
      var pose = _pose.GetPoseCorners(_matching_image.GetWidth(), _matching_image.GetHeight());
      _profiler.stop('pose');
      return pose;
    }
    return undefined;
  };

  /**
   * Trains a marker.
   * @param {ImageData} image_data - The marker, has to be a square (same width and height).
   * @param {value} uuid - The identifier of the marker.
   */
  this.AddMarker = function(image_data, uuid) {
    _training.Train(image_data);
    var trained_image = new AM.TrainedImage(uuid);
    _training.SetResultToTrainedImage(trained_image);
    _training.Empty();
    _trained_images[uuid] = trained_image;
  };

  /**
   * Removes a marker.
   * @param {value} uuid - The identifier of the marker.
   */
  this.RemoveMarker = function(uuid) {
    if (_trained_images[uuid]) {
      delete _trained_images[uuid];
    }
  };

  /**
   * Activates or desactivates a marker.
   * <br>A marker inactive will be ignored during the matching.
   * @param {value} uuid - The identifier of the marker.
   * @param {bool} bool - Sets active if true, inactive if false.
   */
  this.ActiveMarker = function(uuid, bool) {
    if (_trained_images[uuid])
      _trained_images[uuid].Active(bool);
  };

  /**
   * Sets active or inactive all the markers.
   * @param {bool} bool - Sets all active if true, inactive if false.
   */
  this.ActiveAllMarkers = function(bool) {
    for (var uuid in _trained_images) {
      _trained_images[uuid].Active(bool);
    }
  };

  /**
   * Removes all the markers.
   */
  this.ClearMarkers = function() {
    _trained_images = {};
  };

  /**
   * Returns the corners of the last computed image.
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetScreenCorners = function() {
    return _detection.GetCorners();
  };

  /**
   * Returns the count of corners of the last computed image.
   * @returns {number}
   */
  this.GetNumScreenCorners = function() {
    return _detection.GetNumCorners();
  };

 /**
   * Returns the buffer of matches.
   * @returns {AM.match_t[]}
   */
  this.GetMatches = function () {
    return _matching.GetMatches();
  };

 /**
   * Returns the buffer of matches validated by homography.
   * @returns {AM.match_t[]}
   */
  this.GetMatchesMask = function () {
    return _pose.GetMatchesMask();
  };

/**
   * Returns the timings of matching function.
   * @returns {pair[]}
   */
  this.GetProfiler = function () {
    return _profiler.GetProfiler();
  };

/**
   * Returns corners of trained image.
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetTrainedCorners = function () {
    var trained_image;
    if (_matching_image) {
      trained_image = _trained_images[_matching_image.GetUuid()];
      return trained_image.GetCornersLevels();
    }
    else if(_last_trained_uuid){
      trained_image = _trained_images[_last_trained_uuid];
      return trained_image.GetCornersLevels();
    }
    else
      return [];
  };

/**
   * Returns corners of trained image.
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetTrainedDescriptors = function () {
    var trained_image;
    if (_matching_image) {
      trained_image = _trained_images[_matching_image.GetUuid()];
      return trained_image.GetDescriptorsLevels();
    }
    else if(_last_trained_uuid){
      trained_image = _trained_images[_last_trained_uuid];
      return trained_image.GetDescriptorsLevels();
    }
    else
      return [];
  };

  /**
   * Puts the log to the console.
   */
  this.Log = function() {
    console.log(_profiler.log() + ((_match_found) ? '<br/>match found' : ''));
  };

  /**
   * Sets optionnals parameters
   * @param {object} params
   * @param {number} [match_min] minimum number of matching corners necessary for a match to be valid. default 8
   * @see AM.ImageFilter
   * @see AM.Detection
   * @see AM.Matching
   * @see AM.Training
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }

    _training.SetParameters(params);
    _image_filter.SetParameters(params);
    _detection.SetParameters(params);
    _matching.SetParameters(params);
  };

  /**
  * If a fixed angle is used, corner orientation isnt computed, set to 0 for the training, and for the detection, a provided angle is used.
  * @param {boolean} bool
  */
  this.UseFixedAngle = function(bool) {
    _training.UseFixedAngle(bool);
  };
};
var AM = AM || {};


/**
 * Matches descriptors
 * @class
 */
AM.Matching = function() {

  var _screen_descriptors;

  var _num_matches = 0;
  var _matches = [];

  var _params = {
    match_threshold: 48
  };

  /**
   *
   * @inner
   * @param {jsfeat.matrix_t} screen_descriptors
   */
  this.SetScreenDescriptors = function(screen_descriptors) {
    _screen_descriptors = screen_descriptors;
  };

  /**
   * Computes the matching.
   * @inner
   * @param {jsfeat.matrix_t[]} pattern_descriptors - The descriptors of a trained image.
   * @returns {number} The number of matches of the best match if there is a match, 0 otherwise.
   */
  this.Match = function(pattern_descriptors) {
    _num_matches = MatchPattern(_screen_descriptors, pattern_descriptors);
    return _num_matches;
  };

  function popcnt32(n) {
    n -= ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4))& 0xF0F0F0F)* 0x1010101) >> 24;
  }

  var popcnt32_2 = function() {
    var v2b = [
      0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
      4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8,
    ];

    var m8 = 0x000000ff;

    return function(n) {
      var r = v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      n = n >> 8;
      r += v2b[n & m8];
      return r;
    };
  }();

  var popcnt32_3 = function() {

    var v2b = [];
    for (i = 0; i < 256 * 256; ++i)
      v2b.push(popcnt32(i));

    var m16 = 0x0000ffff;

    return function(n) {
      var r = v2b[n & m16];
      n = n >> 16;
      r += v2b[n & m16];
      return r;
    };
  }();

  function MatchPattern(screen_descriptors, pattern_descriptors) {
    var q_cnt = screen_descriptors.rows;
    var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
    var qd_off = 0;
    var num_matches = 0;

    _matches.length = 0;

    for (var qidx = 0; qidx < q_cnt; ++qidx) {
      var best_dist = 256;
      var best_dist2 = 256;
      var best_idx = -1;
      var best_lev = -1;

      for (var lev = 0, lev_max = pattern_descriptors.length; lev < lev_max; ++lev) {
        var lev_descr = pattern_descriptors[lev];
        var ld_cnt = lev_descr.rows;
        var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
        var ld_off = 0;

        for (var pidx = 0; pidx < ld_cnt; ++pidx) {

          var curr_d = 0;
          // our descriptor is 32 bytes so we have 8 Integers
          for (var k = 0; k < 8; ++k) {
            curr_d += popcnt32_3(query_u32[qd_off + k] ^ ld_i32[ld_off + k]);
          }

          if (curr_d < best_dist) {
            best_dist2 = best_dist;
            best_dist = curr_d;
            best_lev = lev;
            best_idx = pidx;
          } else if (curr_d < best_dist2) {
            best_dist2 = curr_d;
          }

          ld_off += 8; // next descriptor
        }
      }

      // filter out by some threshold
      if (best_dist < _params.match_threshold) {

        while (_matches.length <= num_matches) {
          _matches.push(new AM.match_t());
        }

        _matches[num_matches].screen_idx = qidx;
        _matches[num_matches].pattern_lev = best_lev;
        _matches[num_matches].pattern_idx = best_idx;
        num_matches++;
      }

      // filter using the ratio between 2 closest matches
      /*if(best_dist < 0.8*best_dist2) {
        while (_matches.length <= num_matches) {
          _matches.push(new AM.match_t());
        }
        _matches[num_matches].screen_idx = qidx;
        _matches[num_matches].pattern_lev = best_lev;
        _matches[num_matches].pattern_idx = best_idx;
        num_matches++;
      }*/
      

      qd_off += 8; // next query descriptor
    }

    _matches.length = num_matches;
    return num_matches;
  }

  /**
   * Returns the matches
   * @inner
   * @returns {AM.match_t[]} The buffer of matches
   */
  this.GetMatches = function() {
    return _matches;
  };

  /**
   * Returns the number of matches
   * @inner
   * @returns {number}
   */
  this.GetNumMatches = function() {
    return _num_matches;
  };

  /**
   * Sets parameters of the matching
   * @inner
   * @param {object} params
   * @param {number} [params.match_threshold] 16 - 128, default 48
   */
  this.SetParameters = function(params) {
    for (var name in params) {
      if (typeof _params[name] !== 'undefined')
        _params[name] = params[name];
    }
  };


};

/**
 *
 * @class
 * @param {number} screen_idx
 * @param {number} pattern_lev
 * @param {number} pattern_idx
 * @param {number} distance
 */ 
AM.match_t = function (screen_idx, pattern_lev, pattern_idx, distance) {
  this.screen_idx = screen_idx || 0;
  this.pattern_lev = pattern_lev || 0;
  this.pattern_idx = pattern_idx || 0;
  this.distance = distance || 0;
};
var AM = AM || {};


/**
 * Computes the pose and remove bad matches using RANSAC
 * @class
 */
AM.Pose = function() {

  var _good_count = 0;
  var _homo3x3 = new jsfeat.matrix_t(3, 3, jsfeat.F32C1_t);
  var _match_mask = new jsfeat.matrix_t(500, 1, jsfeat.U8C1_t);


  // estimate homography transform between matched points
  function find_transform(matches, count, homo3x3, match_mask, screen_corners, pattern_corners) {
    // motion kernel
    var mm_kernel = new jsfeat.motion_model.homography2d();
    // ransac params
    var num_model_points = 4;
    var reproj_threshold = 3;
    var ransac_param = new jsfeat.ransac_params_t(num_model_points,
                                                  reproj_threshold, 0.5, 0.99);

    var pattern_xy = [];
    var screen_xy = [];

    var i;

    // construct correspondences
    for(i = 0; i < count; ++i) {
      var m = matches[i];
      var s_kp = screen_corners[m.screen_idx];
      var p_kp = pattern_corners[m.pattern_lev][m.pattern_idx];
      pattern_xy[i] = { x: p_kp.x, y: p_kp.y };
      screen_xy[i] =  { x: s_kp.x, y: s_kp.y };
    }

    // estimate motion
    var ok = false;
    ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
                                        pattern_xy, screen_xy, count, homo3x3, match_mask, 1000);

    // extract good matches and re-estimate
    var good_cnt = 0;
    if (ok) {
      for(i = 0; i < count; ++i) {
        if(match_mask.data[i]) {
          pattern_xy[good_cnt].x = pattern_xy[i].x;
          pattern_xy[good_cnt].y = pattern_xy[i].y;
          screen_xy[good_cnt].x = screen_xy[i].x;
          screen_xy[good_cnt].y = screen_xy[i].y;
          good_cnt++;
        }
      }
      // run kernel directly with inliers only
      mm_kernel.run(pattern_xy, screen_xy, homo3x3, good_cnt);
    } else {
      jsfeat.matmath.identity_3x3(homo3x3, 1.0);
    }

    return good_cnt;
  }

  // project/transform rectangle corners with 3x3 Matrix
  function tCorners(M, w, h) {
    var pt = [ { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h } ];
    var z = 0.0, px = 0.0, py = 0.0;

    for (var i = 0; i < 4; ++i) {
      px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
      py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
      z  = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
      pt[i].x = px / z;
      pt[i].y = py / z;
    }

    return pt;
  }

  /**
   *
   * @inner
   * @param {AM.match_t[]} matches
   * @param {number} count - The matches count.
   * @param {jsfeat.keypoint_t[]} screen_corners
   * @param {jsfeat.keypoint_t[][]} pattern_corners
   */
  this.Pose = function(matches, count, screen_corners, pattern_corners) {
    _good_count = find_transform(matches, count, _homo3x3, _match_mask, screen_corners, pattern_corners);
    return _good_count;
  };

  /**
   * Returns the count of good matches, computed using RANSAC by {@link AM.Pose#Pose}
   * @inner
   * @returns {number}
   */
  this.GetGoodCount = function() {
    return _good_count;
  };

  /**
   * Computes the 4 corners of the pose
   * @inner
   * @param {number} marker_width
   * @param {number} marker_height
   * @returns {Point2D[]} The corners
   */
   this.GetPoseCorners = function(marker_width, marker_height) {
    return tCorners(_homo3x3.data, marker_width, marker_height);
  };


  this.GetMatchesMask = function() {
    return _match_mask;
  };
};


/**
 * Computes the posit pose, based on the corners
 * @class
 */
AM.PosePosit = function() {

  /**
   * @typedef {object} PositPose
   * @property {number[]} pose.bestTranslation
   * @property {number[][]} pose.bestRotation
   */

  /**
   * @property {PositPose} pose
   */

  this.posit = new POS.Posit(10, 1);
  this.pose = undefined;
};

/**
 * Computes the pose
 * @inner
 * @param {Point2D[]} corners
 * @param {number} [model_size=35] The size of the real model.
 * @param {number} image_width
 * @param {number} image_height
 */
AM.PosePosit.prototype.Set = function(corners, model_size, image_width, image_height) {
  model_size = model_size || 35;

  var corners2 = [];
  for (var i = 0; i < corners.length; ++i) {
    var x = corners[i].x - (image_width / 2);
    var y = (image_height / 2) - corners[i].y;

    corners2.push( { x: x, y: y } );
  }

  this.pose = this.posit.pose(corners2);
};

/**
 * Sets the focal's length
 * @inner
 * @param {number} value
 */
AM.PosePosit.prototype.SetFocalLength = function(value) {
  this.posit.focalLength = value;
};


/**
 * Computes the threejs pose, based on the posit pose
 * @class
 */
AM.PoseThree = function() {
  this.position = new THREE.Vector3();
  this.rotation = new THREE.Euler();
  this.quaternion = new THREE.Quaternion();
  this.scale = new THREE.Vector3();
};

/**
 * Computes the pose
 * @inner
 * @param {PositPose} posit_pose
 * @param {number} model_size
 */
AM.PoseThree.prototype.Set = function(posit_pose, model_size) {
  model_size = model_size || 35;

  var rot = posit_pose.bestRotation;
  var translation = posit_pose.bestTranslation;

  this.scale.x = model_size;
  this.scale.y = model_size;
  this.scale.z = model_size;

  this.rotation.x = -Math.asin(-rot[1][2]);
  this.rotation.y = -Math.atan2(rot[0][2], rot[2][2]);
  this.rotation.z = Math.atan2(rot[1][0], rot[1][1]);

  this.position.x = translation[0];
  this.position.y = translation[1];
  this.position.z = -translation[2];

  this.quaternion.setFromEuler(this.rotation);
};
var AM = AM || {};


/**
 * Holds the corners and the descriptors of an image, at different levels of zoom.
 * @class
 * @param {string} [uuid] - An unique identifier
 */
AM.TrainedImage = function(uuid) {

  var _empty = true;

  var _corners_levels = [];
  var _descriptors_levels = [];

  var _width = 0;
  var _height = 0;

  var _uuid = uuid;

  var _active = true;
  

  /**
   * Returns the corners of a specified level.
   * @inner
   * @param {number} level - The level of the corners to be returned.
   * @returns {jsfeat.keypoint_t[]}
   */
  this.GetCorners = function(level) {
    return _corners_levels[level];
  };

  /**
   * Returns the descriptors of a specified level.
   * @inner
   * @param {number} level - The level of the descriptors to be returned.
   * @returns {jsfeat.matrix_t}
   */
  this.GetDescriptors = function(level) {
    return _descriptors_levels[level];
  };

  /**
   * Returns the number of level.
   * @inner
   * @return {number}
   */
  this.GetLevelNbr = function() {
    return Math.min(_descriptors_levels.length, _corners_levels.length);
  };

  /**
   * Returns all the corners.
   * @inner
   * @return {jsfeat.keypoint_t[][]}
   */
  this.GetCornersLevels = function() {
    return _corners_levels;
  };

  /**
   * Returns all the descriptors.
   * @inner
   * @return {jsfeat.matrix_t[]}
   */
  this.GetDescriptorsLevels = function() {
    return _descriptors_levels;
  };

  /**
   * Returns the width of the trained image at level 0.
   * @inner
   * @return {number}
   */
  this.GetWidth = function() {
    return _width;
  };

  /**
   * Returns the height of the trained image at level 0.
   * @inner
   * @return {number}
   */
  this.GetHeight = function() {
    return _height;
  };

  /**
   * Sets the trained image.
   * @inner
   * @param {jsfeat.keypoint_t[][]} corners_levels
   * @param {jsfeat.matrix_t[]} descriptors_levels
   * @param {number} width - width of the image at level 0
   * @param {number} height - height of the image at level 0
   */
  this.Set = function(corners_levels, descriptors_levels, width, height) {
    _empty = false;
    _corners_levels = corners_levels;
    _descriptors_levels = descriptors_levels;
    _width = width;
    _height = height;
  };

  /**
   * Returns wether the object is set or not.
   * @inner
   * @returns {bool}
   */
  this.IsEmpty = function() {
    return _empty;
  };

  /**
   * Empty the object.
   * @inner
   */
  this.Empty = function() {
    _empty = true;
    _corners_levels = [];
    _descriptors_levels = [];
  };

  /**
   * Sets the unique identifier of this object.
   * @inner
   * @param {value} uuid
   */
  this.SetUuid = function(uuid) {
    _uuid = uuid;
  };

  /**
   * Returns the unique identifier of this object.
   * @inner
   * @returns {value}
   */
  this.GetUuid = function() {
    return _uuid;
  };

  /** Sets this object active or inactive
   * @inner
   * param {bool} bool
   */
  this.Active = function(bool) {
    _active = (bool === true);
  };

  /**
   * Returns the state of this object
   * @inner
   * @returns {bool}
   */
  this.IsActive = function() {
    return _active;
  };

  
};
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
        _params.laplacian_threshold, _params.eigen_threshold, undefined, -Math.PI / 2);
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