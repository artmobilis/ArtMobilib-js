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
  }

  /**
   * @inner
   */
  this.LockPortrait = function() {
    Command(LockPortraitDoit);
  }

  /**
   * @inner
   */
  this.Unlock = function() {
    Command(UnlockDoit);
  }
};