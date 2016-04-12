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
          tab[i].apply(this, params);
        }
        return true;
      }
    }
    return false;
  };

  AM.EventManager = EventManager;

})();