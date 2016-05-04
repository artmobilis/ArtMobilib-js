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