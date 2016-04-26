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