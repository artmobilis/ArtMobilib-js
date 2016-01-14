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


DeviceLockScreenOrientation = function() {

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
    for (func of _pending_commands) {
      func();
    }
    _pending_commands = [];
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

  this.LockLandscape = function() {
    Command(LockLandscapeDoit);
  }

  this.LockPortrait = function() {
    Command(LockPortraitDoit);
  }

  this.Unlock = function() {
    Command(UnlockDoit);
  }
};