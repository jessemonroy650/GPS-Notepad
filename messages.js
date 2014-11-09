/*
	Inline Notification Message (non-popup)
	Date: 2013-12-30	
*/
var myMessages = ['info','success','warning','error'];
var myMessagesDefault = 'message';
var myMessagesTimeoutHandle = undefined;

function myMessageToggle() {
	var thing = document.getElementById(myMessagesDefault);
	if ( thing.style.visibility == 'visible' ) {
		thing.style.visibility = 'collapse';
		thing.style.display = 'none';
	} else {
		thing.style.visibility = 'visible';
		thing.style.display = 'block';
	}
}
//
//	Message is displayed in the <div id="notification" class="info"></div>
//	* Reassign the 'class' for the appropriate style/color - defaults to 'info'.
//	* Use 'whichClass' to reassign the style/color - default NOT WORKING.
//	* This object will automatically toggle the message off after 'timeout'.
//	* The object is 'none' & 'collapse' by default.
//
function myMessage(message, timeout, whichClass) {
	var thing = document.getElementById(myMessagesDefault);
	if (message) {
		myMessageToggle();
		thing.innerHTML = message;
	}
	if (timeout) {
		if (timeout > 0) {
			myMessagesTimeoutHandle =  window.setTimeout(myMessageToggle, timeout);
		}
	} else {alert("Set the timeout for myMessage()\-1=No timeout.");}
	if (whichClass) { alert("Class not working for myMessage()");}
}

function myMessageClear() {
	if (myMessagesTimeoutHandle) {
		window.clearTimeout(myMessagesTimeoutHandle);
	}
}
