var AM = AM || {};

(function() {

  var INTERRUPT_MSG = 'UniqueLoader interrupted';

  function UniqueLoader(fun) {
    this._fctn = fun;
    this._interrupted = false;
    this._launched = false;
  }

  UniqueLoader.prototype.Load = function() {
    var scope = this;

    if (this._launched)
      throw new Error('UniqueLoader.Load is called more than once');
    if (this._interrupted)
      return Promise.reject(INTERRUPT_MSG);

    this._launched = true;

    return new Promise(function(resolve, reject) {
      if (!scope._interrupted) {
        Promise.resolve(scope._fctn()).then(function() {
          if (scope._interrupted)
            reject(INTERRUPT_MSG);
          else
            resolve(arguments);
        }, function(e) {
          reject(scope._interrupted ? INTERRUPT_MSG : e);
        });
      }
      else
        reject(INTERRUPT_MSG);
    });
  };

  UniqueLoader.prototype.Interrupt = function() {
    if (this._launched)
      this._interrupted = true;
  };


  AM.UniqueLoader = UniqueLoader;

})();