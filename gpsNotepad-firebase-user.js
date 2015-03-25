/*
	User account maintainance - 

	login  - loginUser()
	logout - unauth()
	whoami - whoami()
	whatsmyid - whatsmyid()

	// Abstraction layer - Calls to Generic MBaas
	loginUser({loginName, loginPassword}, callback, err)
	forgotUserPassword({email}, callback, err)
	registerUserNew({email, password, firstname, lastname}, callback, err)
	settingsUserGet(accountKey, callback, err)
	settingsUserUpdate(accountKey, callback, err)

    -------------------------------
	mycall - service Calls Required
    -------------------------------
	loginUser - authWithPassword()
	forgotUserPassword - resetPassword()
	registerUserNew - detectCollision() && createUser() && authWithPassword() && settingsUserUpdate()
	settingsUserGet() - whatsmyid()
	settingsUserUpdate() - whatsmyid()

*/
var gCredentials      = {"email": undefined, "password": undefined};
var sErrorMsgCreate   = {'EMAIL_TAKEN': "That email is in use on this system.", 'INVALID_EMAIL': "You gave me an invalid email addres."};
var sErrorMsgLogin    = {'LOGIN_FAILED': "Your login did not work. Your email or password was wrong. I don't know which is wrong."};
var sErrorMsgLostPass = {'INVALID_USER':'The specified user account does not exist.'};

// THIS IS DECLARED in the previous js file (gpsNotepad-firebase.js)
// var gFirebaseRef = new Firebase('https://gps-notepad.firebaseio.com/users');

//
function login() {
	if ((gCredentials.email) && (gCredentials.password)) {
		loginUser(gCredentials);
	} else {
		return false;
	}
}

//
function logout() {
	return gFirebaseRef.unauth();
}

//
function whoami() {
	var authData = gMybaseRef.getAuth();	
	return JSON.stringify(authData.password.email);
}

//
function whatsmyid() {
	var authData = gMybaseRef.getAuth();	
	return JSON.stringify(authData.uid);
}

//
//
//
function loginUser(obj, success, error) {

	credentials = {"email": obj.email, "password": obj.password};

	// Log me in
	gFirebaseRef.authWithPassword(credentials, function(err, authData) {
		if (! err) {
			console.log('Authenticated successfully with payload:', JSON.stringify(authData));
		} else {
			console.log('Login Failed: ' + "err.code", JSON.stringify(err.code));
			//console.log(sErrorMsgLostPass[err.code]);
		}
	});
}

//
function forgotUserPassword(obj, success, error) {
	var creds = {'email':obj.email}
	gMybaseRef.resetPassword(creds, function(err) {
		if (! err ){
			console.log("email away.");
		} else {
			console.log("err.code", JSON.stringify(err.code));
			//console.log(sErrorMsgLostPass[err.code]);
		}
		
	});
}

//
function registerUserNew(obj, success, error) {

	credentials = {"email": obj.email, "password": obj.password};

	// detectCollision()
	// Firebase: Detecting if data exists. This snippet detects if a user ID is already taken
	// https://gist.github.com/anantn/4323949

	// Firebase.createUser() 
	// https://www.firebase.com/docs/web/api/firebase/createuser.html
	gFirebaseRef.createUser(credentials, function(err) {
		if (! err) {
			console.log('createUser() succeeded.');
			//success();
			// authWithPassword()
			authWithPassword(credentials, function(err1, payload) {
				if (! err1) {
					console.log('Authenticated successfully with payload:', authData);
					//
					// payload.uid payload.provider payload.auth payload.expires
					//
					//settingsUserUpdate()
					//
					success();
				} else {
					console.log("Error with authWithPassword, which should not happen.");
				}
			});
		} else {
			console.log('createUser() Failed!', err);
			if ('function' === typeof error) {
				error(err.code);
			}
		}
	});
}

//
function settingsUserGet(obj, success, error) {
/*
	some_function(parms, function(err) {
		if (! err) {
			console("settingsUserGet() success");
			success();
		} else {
			console("error settingsUserGet()");
			error(err.code);
		}
	});
*/
}

//
function settingsUserUpdate(obj, success, error) {
/*
	some_function(parms, function(err) {
		if (! err) {
			console("settingsUserUpdate() success");
			success();
		} else {
			console("error settingsUserUpdate()");
			error(err.code);
		}
	});
*/
}
