//To do
//Complete conversion of message to Ascii values
//Encrypt message and store encrypted message
//Store private key for user just in case for demo
//Get decrypt button to actually attempt to decrypt and change message in message box



console.log('On send message page');

Template.sendMessage.events = {
	'click #add-message' : function(event,template) {
		console.log('Add Message');
		var toUser = template.find('#usernameTo').value;
		var messageContents = template.find('#message').value;
		console.log('To: '+toUser+' Message: '+messageContents);
		var messageContentsAscii = returnStringInAscii(messageContents);
		var encryptedMessage = encryptMessage(messageContentsAscii,toUser);
		console.log("Pass this to db: "+encryptedMessage);
		var currentdate = new Date();
		var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

  //messageContents,messsageContentsEncrypted,encryptedPlain
  console.log("Passing :" + messageContents+encryptedMessage[0]+encryptedMessage[1]+toUser+Meteor.user().username+datetime)
	Meteor.call('addMessage',messageContents,encryptedMessage[0],encryptedMessage[1],toUser,Meteor.user().username,datetime);
	Router.go('/');

	}
}

function returnStringInAscii(message) {
	asciiArray = []
	for (var i = 0, len = message.length; i < len; i++) {
  	asciiArray.push(message.charCodeAt(i));
	}
	//asciiAppend = asciiArray.join("");
	return asciiArray
}

function convertAsciiToPlain(asciiChar) {
	characterReturn = String.fromCharCode(asciiChar%127);
	return characterReturn;
}

//c=m^e mod n
function encryptMessage(messageAscii,userTo) {
	var publicKeyUser = PublicKeys.findOne({"user":userTo});
	var publicKey = publicKeyUser.publicKey
	var e = parseInt(publicKey[0])
	var n = parseInt(publicKey[1])
	console.log("E: "+e);
	console.log("N: "+n )
	console.log("Public key: "+publicKey[0]);
	encryptedStringArray = []
	encryptedStringChars = []
	console.log("Passed messageAscii to encrypt: "+messageAscii);

	//Encrypt each letter seperately
	for (var i = 0, len = messageAscii.length; i < len; i++) {
		var valueToInt = parseInt(messageAscii[i]);
		var encryptedCharAscii = (Math.pow(valueToInt,e)%n)
		console.log("Math.pow: "+Math.pow(valueToInt,e));
		console.log("Attempt encrypt indi: "+Math.pow(valueToInt,e)%n);

		console.log("Attempt to encrypt: "+messageAscii[i]);
		encryptedStringArray.push(encryptedCharAscii);
		encryptedStringChars.push(convertAsciiToPlain(encryptedCharAscii));
	}
	var encryptedString = encryptedStringChars.join("");

	console.log("CipherTextAscii: "+encryptedStringArray);
	console.log("CipherTextPlain: "+encryptedStringChars);
	console.log("Cipher plain: "+encryptedString)
	var returnArray = [encryptedStringArray,encryptedString]
	return returnArray;
}