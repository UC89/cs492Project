Meteor.methods({
	addUser: function(userName,password_1,password_2,email,createdAt) {
		if (password_1 != password_2) {
			throw new Meteor.Error('Passwords do not match')
		}
		let profile = {};
		var newUser = {'username':userName,'email':email,'password':password_1,'joinDate':createdAt};
		Accounts.createUser(newUser);
	}
});