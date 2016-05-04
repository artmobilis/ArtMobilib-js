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