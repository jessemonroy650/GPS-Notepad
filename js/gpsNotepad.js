//var gDebugIt = 1;

// GUI handlers and flags
var minimumAccuracy = 15; // in meters
var typeAccuracy    = 'meter' // meter or feet
var typeDetails     = 'short' // short or all

// Counters
var numOfReadings   = 0;
var numInMargin     = 0;

// Hooks to our GPS View
var GPSViewHooks      = {'details':'gpsDetails', 'latlong':'latLong', 'counter':'counter', 'notepad':'gpsNotepad'};

// Our GPSKeeper
var GPSlatestCoords      = "";
var GPSKeeperLastReading = "";
var GPSKeeperStack       = [];

// hardware parameters
var GPSinitialTimeOut = 10000; // in milliseconds
var GPSdefaultTimeOut = 10000; // in milliseconds 
var GPSgeoLocationOption = {maximumAge: 20000, timeout: 10000, enableHighAccuracy: true};

//
//	Wrapper Functions
//
var GPSwrapData = function (lat, long, alt, ts, acc) {
	var wrapper = {'latitude': lat, 'longitude': long, 'altitude': alt, 'timestamp': ts, 'accuracy': acc };
	return wrapper;
}

//
// onSuccess Geolocation
//
var GPSonSuccess = function (position) {
	numOfReadings = numOfReadings + 1;

	// DETAILS/DEBUGGER
	// latitude & longitude in decimal degrees
	// altitude in meters above the ellipsoid
	// accuracy & altitudeAccuracy in meters
	//		NOTE: from docs - "altitudeAccuracy: This property is not support by Android devices, it will always return null."
	// heading in degrees counting clockwise relative to the true north
	// speed in meters per second
	if (typeDetails == 'all') {
		detail = 'Latitude: '           + position.coords.latitude              + '<br />' +
			'Longitude: '          + position.coords.longitude             + '<br />' +
			'Timestamp: '          + position.timestamp                    + '<br />' +
			'Altitude: '           + position.coords.altitude              + '<br />' +
			'Accuracy: '           + position.coords.accuracy              + '<br />' +
			'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
			'Heading: '            + position.coords.heading               + '<br />' +
			'Speed: '              + position.coords.speed;
	} else {
		detail = 'Latitude: '           + position.coords.latitude              + '<br />' +
			'Longitude: '          + position.coords.longitude              + '<br />' +
			'Accuracy: '           + position.coords.accuracy;
	}


	GPSView.updateDetails(detail);

	GPSlatestCoords = String(position.coords.latitude).substr(0,10) + ',' + 
                         String(position.coords.longitude).substr(0,10);
	gpslongCords    = String(position.coords.latitude) + ',' + 
                         String(position.coords.longitude);
	//GPSKeeperLastReading = gpslongCords;

	// Update Document
	GPSView.updateLive(GPSlatestCoords);
	// NOTE: If position.coords.accuracy is less than a predetermined amount, use it.
	if (position.coords.accuracy < minimumAccuracy) {
		numInMargin = numInMargin + 1;
		GPSKeeperLastReading = gpslongCords;
		GPSView.updateGPSNotepad(GPSlatestCoords);
		// Save for GPX format
		// Extra Information to assist in Analysis (position.coords.accuracy)
		GPSKeeperStack.push(GPSwrapData(position.coords.latitude,
			position.coords.longitude, position.coords.altitude,
			position.timestamp, position.coords.accuracy));
	}
	// Update Document
	GPSView.updateCounter(numInMargin + "/" + numOfReadings);

}

//
// onError Callback receives a PositionError object
//
var GPSonError = function (error) {
	// Error Hoisted to main (index.html)
	onServiceError(error.code);
	alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
}


//
//	Update views only
//	NOTE: not using JQuery so this section remains neutral & portable
var GPSView = {
	gVersion : '0.9',
	gMyName  : 'GPS Notepad',
    gWatchHooks : GPSViewHooks,
    gDebugIt : 1,

	// Our global object handler
	obj : {},

	updateDetails : function (details) {
		obj = document.getElementById(this.gWatchHooks.details);
		obj.innerHTML = details;
	},

	updateLive : function (LGC) {
		// Live Data
       	obj = document.getElementById(this.gWatchHooks.latlong);
		obj.innerHTML = LGC;
	},

	updateCounter : function (data) {
       	obj = document.getElementById(this.gWatchHooks.counter);
		obj.innerHTML = data;
	},

	updateGPSNotepad : function(LGC) {
		// Update Viewable Stack
       	obj = document.getElementById(this.gWatchHooks.notepad);
		// RRR
		// unload GPSKeeperStack, instead
		obj.innerHTML = LGC + '<br>' + obj.innerHTML;
	}
};

var Location = {
	// Settings
	initialTimeOut : GPSinitialTimeOut, // in milliseconds
	defaultTimeOut : GPSdefaultTimeOut, // in milliseconds
	geoLocationOption : GPSgeoLocationOption,
	watchID : null,
    callback: {'onSuccess':'','onError':''},

	init : function (succ, err) {
		if ((typeof succ === 'function') && (typeof err === 'function')) {
			//console.log("got both functions");
            this.callback['onSuccess'] = succ;
            this.callback['onError'] = err;
		} else {
			// XXX report the error
			alert("Location.init: one or both callbacks failed");
		}
    },

	//
	//	Hook to our Location/GPS functions
	//
	getLocation : function () {
		navigator.geolocation.getCurrentPosition(this.callback.onSuccess, this.callback.onError, this.geoLocationOption);
	},

	watchLocation : function () {
		this.watchID = navigator.geolocation.watchPosition(this.callback.onSuccess, this.callback.onError, this.geoLocationOption);
	},

	clearWatch : function () {
		navigator.geolocation.clearWatch(this.watchID);
	}
};

