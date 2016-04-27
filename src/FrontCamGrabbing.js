navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL;


var AM = AM || {};

(function() {
  
  /**
  * Class to start the front camera of the device, or a webcam, on a computer.
  */
  function FrontCamGrabbing() {
    var _dom_element = document.createElement('video');
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

    function GetSourcesMST(on_error) {
      return new Promise(function(resolve, reject) {
        if (_to_destruct)
          reject('loader interrupted');
        return MediaStreamTrack.getSources(resolve);
      });
    }

    function GetSourcesMD(on_error) {
      if (_to_destruct)
        return Promise.reject('loader interrupted');
      else
        return navigator.mediaDevices.enumerateDevices();
    }

    function Load() {
      if (_to_destruct)
        return Promise.reject('loader interrupted');

      var sources_promises = [];
      sources_promises.push(GetSourcesMST());
      sources_promises.push(GetSourcesMD());

      var p = Promise.race(sources_promises).then(GetStream);

      return p;
    }

    function Dispose() {
      _to_destruct = true;
    }

    this.Load = Load;
    this.Dispose = Dispose;
  }


  AM.FrontCamGrabbing = FrontCamGrabbing;

})();