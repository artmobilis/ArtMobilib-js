navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia;

window.URL = window.URL || window.webkitURL;


var AM = AM || {};

(function() {
    
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

    function Start() {
      if (!_started) {
        if (_loader) {
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

    function Stop() {
      if (_stream) {
        _stream.getTracks()[0].stop();
        _stream = undefined;
      }
      if (_loader) {
        _loader.Dispose();
        _loader = undefined;
      }
      _load_promise = Promise.resolve();
      _started = false;
    }

    function IsActive() {
      return _started;
    }

    this.Start = Start;
    this.Stop = Stop;
    this.IsActive = IsActive;


  }

  function Loader(dom_element) {
    var _stream;

    var _loading = false;
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
          if (sourceInfo.kind == "video" && sourceInfo.facing == "environment") {
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
      return Promise.resolve(function() {
        if (_to_destruct)
          reject('loader interrupted');
        return navigator.mediaDevices.enumerateDevices();
      });
    }

    function Load() {
      _loading = true;

      return new Promise(function(resolve, reject) {
        if (_to_destruct)
          reject('loader interrupted');

        var promise = GetSourcesMST();

        promise = promise.then(function(source_infos) {

          GetStream(source_infos).then(resolve);

        });

        promise.catch(function() {
          GetSourcesMD().then(function(source_infos) {

            GetStream(source_infos).then(resolve);

          }).catch(reject);
        });
      });
    }

    function Dispose() {
      _to_destruct = true;
    }

    this.Load = Load;
    this.Dispose = Dispose;
  }


  AM.FrontCamGrabbing = FrontCamGrabbing;

})();