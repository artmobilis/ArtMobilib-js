var AM = AM || {};


AM.LoadingManager = function() {

  var _end_callbacks = [];
  var _progress_callbacks = [];
  var _loading = 0;

  function DoCallbacks(array) {
    for (var i = 0, c = array.length; i < c; ++i)
      array[i]();
  }
  

  this.Start = function(nbr) {
    nbr = nbr || 1;
    _loading += nbr;
    DoCallbacks(_progress_callbacks);
  };

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

  this.OnEnd = function(callback) {
    if (_loading > 0) {
      _end_callbacks.push(callback);
    }
    else
      callback();
  };

  this.OnProgress = function(callback) {
    if (_loading > 0) {
      _progress_callbacks.push(callback);
    }
    else
      callback();
  };

  this.IsLoading = function() {
    return _loading > 0;
  };

  this.GetRemaining = function() {
    return _loading;
  };

};