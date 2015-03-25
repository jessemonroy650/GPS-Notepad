/*
	Firebase/User account Status - 
	isCloudConnected - isCloudConnected()
	isLoggedIn - isLoggedIn()
	getLoggedInStatus - getLoggedInStatus()

*/
var gMybaseRef   = new Firebase('https://gps-notepad.firebaseio.com/');
var gFirebaseRef = new Firebase('https://gps-notepad.firebaseio.com/users');
// This reference is for our (single) user.
var gUserDataRef = null;

//
// http://stackoverflow.com/questions/11351689/detect-if-firebase-connection-is-lost-regained
// NOTE: must wait until connection is made; sometimes upto a 3 seconds.
var isCloudConnected = function () {
	var connectedRef = gMybaseRef.child(".info/connected");
	connectedRef.on("value", function(snap) {
		if (snap.val() === true) {
			//alert("connected" + whoami());
			console.log("isCloudConnected");
		} else {
			//alert("not connected");
			console.log("NOT CloudConnected");
		}
	});
}

//
// https://www.firebase.com/docs/web/guide/user-auth.html#section-monitoring-authentication
//
var isLoggedIn = function () {
	gMybaseRef.onAuth(function(authData) {
		if (authData) {
			// user authenticated with Firebase
			gUserDataRef = gFirebaseRef.child(authData.uid);
			console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
		} else {
			// user is logged out
			console.log("user logged out.")
		}
	});
}

var getLoggedInStatus = function () {
	var authData = gMybaseRef.getAuth();
	if (authData) {
		// user authenticated, specific to Firebase
		//console.log("auth: " + JSON.stringify(authData));
		// http://stackoverflow.com/questions/14963776/get-users-by-name-property-using-firebase
		// early mistake was:
		// gUserDataRef = gFirebaseRef + '/' + authData.uid;
		//
		//	NOTE: THIS IS NOT CLEAR ENOUGH. 
		//	Mainly, Firebase offers user authentication, but only dances around this answer.
		//
		gUserDataRef = gFirebaseRef.child(authData.uid);
		console.log("gUserDataRef:" + gUserDataRef);
		//console.log("authData", JSON.stringify(authData));
		console.log("iam:", whoami());
	} else {
		// user is logged out
		console.log("user logged out.")
	}
}

//
//	Write some actual data
//
var writeData = function (data) {

	gUserDataRef.set(data, function(e) {
		if (e) {
			console.log("error write:" + e.code);
		} else {
			console.log("data write succeed");
		}
	});
}

//
//
//
