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
		var currentdate = new Date();
		var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
	Meteor.call('addMessage',messageContents,toUser,Meteor.user().username,datetime);
	Router.go('/');

	}
}

function returnStringInAscii(message) {
	asciiArray = []
	for (var i = 0, len = message.length; i < len; i++) {
  	asciiArray.push(message[i]);
	}

}