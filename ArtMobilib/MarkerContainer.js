// todo license???
/******************

Marker container
contain all marker and the index last marker searched

Properties

Methods

GetCurrent: get last used
GetNext: get a new one
Reset: remove all ImageMarkers from te list

Todo
- test memory management, what whe resetting the container

Dependency

None

******************/

// 
var MarkerContainer = function () {

    /// private data
    var that = this;
    var currentId = -1;

    /// public data
    // descriptors (should we keep level separated?)
    this.markerContainer = [];

    // public methods
    this.Add = function (marker) {
        that.markerContainer.push(marker);
    }

    this.Reset = function () {
        that.markerContainer = [];
        currentId = -1;
    }

    this.GetCurrent = function () {
        return that.markerContainer[currentId];
    }

    this.GetNext = function () {
        currentId = (currentId + 1) % that.markerContainer.length;
        return that.markerContainer[currentId];
    }

};
