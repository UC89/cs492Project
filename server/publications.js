Meteor.publish('messages',function() {
	//Must edit this to only return messages for user and by user
	return Messages.find();
});