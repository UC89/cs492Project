Template.homepage.events = {
	'click #cancel-signup' : function() {
		console.log('Cancel signup');
		$('.signup-form').css('display','none');
	},
	'click #signup-submit' : function(event,template) {
		console.log('Submit Form');

		var createdAt = new Date();
		var userName = template.find('#usernameInput').value;
		var userEmail = template.find('#userEmail').value;
		var userPassword1 = template.find('#userPassword1').value;
		var userPassword2 = template.find('#userPassword2').value;

		Meteor.call('addUser',userName,userPassword1,userPassword2,userEmail, createdAt);

		Router.go('/receiveMessage');
	}
}

Template.homepage.onRendered(function() {
console.log('homepage rendered');
});

Template.homepage.onCreated(function() {
	console.log('homepage created');
});

Template.homepage.helpers({
	userMessages: function() {
		var userMessages = Messages.find();
		return userMessages
	}
})