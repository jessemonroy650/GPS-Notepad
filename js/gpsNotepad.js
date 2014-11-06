//
var GPSNotepadVersion = '0.8';
var myName  = 'GPS Notepad';
var debugIt = 1;

// Our global object handler
var obj = {};

// Our GPSKeeperStack
var GPSKeeperStack = Array();

// Settings
var initialTimeOut = 10000; // in milliseconds
var defaultTimeOut = 10000; // in milliseconds
var geoLocationOption = {maximumAge: 20000, timeout: 10000, enableHighAccuracy: true};
var watchID = null;

// GUI handlers and flags
var blockUI = 0 ; // block While we transfer data (upload)
var collectRunning = 0;
var latestGPSCoords = "";
var minimumAccuracy = 15; // in meters

// Counters
var numOfReadings = 0;
var numInMargin   = 0;


	//
	//	Hook to our Location/GPS functions
	//
	var getLocation = function() {
		navigator.geolocation.getCurrentPosition(onSuccess, onError, geoLocationOption);
	}

	var watchLocation = function() {
		watchID = navigator.geolocation.watchPosition(onSuccess, onError, geoLocationOption);
	}

	var clearWatch = function() {
		navigator.geolocation.clearWatch(watchID);
	}

	//
	//	Wrapper Functions
	//
	function wrapGPSData(lat, long, alt, ts, acc) {
		var wrapper = {'latitude': lat, 'longitude': long, 'altitude': alt, 'timestamp': ts, 'accuracy': acc };
		return wrapper;
	}

	//
	// onSuccess Geolocation
	//
	function onSuccess(position) {
		numOfReadings = numOfReadings + 1;
		// Save for GPX format
		// Extra Information to assist in Analysis (position.coords.accuracy)
		GPSKeeperStack.push(wrapGPSData(position.coords.latitude,
			position.coords.longitude, position.coords.altitude,
			position.timestamp, position.coords.accuracy));

		latestGPSCoords = String(position.coords.latitude).substr(0,10) + ',' + 
                          String(position.coords.longitude).substr(0,10);
		// Update Document
		updateLive();

		// DEBUGGER
		// latitude & longitude in decimal degrees
		// altitude in meters above the ellipsoid
		// accuracy & altitudeAccuracy in meters
		//		NOTE: from docs - "altitudeAccuracy: This property is not support by Android devices, it will always return null."
		// heading in degrees counting clockwise relative to the true north
		// speed in meters per second
		if (debugIt) {
        	obj = document.getElementById('debugger');
			obj.innerHTML = '' +
				'Latitude: '           + position.coords.latitude              + '<br />' +
				'Longitude: '          + position.coords.longitude             + '<br />' +
				'Timestamp: '          + position.timestamp                    + '<br />' +
				'Altitude: '           + position.coords.altitude              + '<br />' +
				'Accuracy: '           + position.coords.accuracy              + '<br />' +
				'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
				'Heading: '            + position.coords.heading               + '<br />' +
				'Speed: '              + position.coords.speed                 + '<br />';
		}
		// NOTE: If position.coords.accuracy is less than a predetermined amount, use it.
		if (position.coords.accuracy < minimumAccuracy) {
			numInMargin = numInMargin + 1;
			updateGPSKeeper();
		}
		// Update Document
		updateCounter();

	}

	function updateLive() {
		// Live Data
       	obj = document.getElementById('latLong');
		obj.innerHTML = latestGPSCoords;
	}
	function updateCounter() {
       	obj = document.getElementById('counter');
		obj.innerHTML = numInMargin + "/" + numOfReadings;
	}

	function updateGPSKeeper() {
		// Update User Stack
       	obj = document.getElementById('gpsKeeper');
		// RRR
		// unload GPSKeeperStack, instead
		obj.innerHTML = latestGPSCoords + '<br>' + obj.innerHTML;
	}

	// onError Callback receives a PositionError object
	//
	function onError(error) {
		alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	}
