createUser = function(userName,userPassword,userEmail,joinDate) {
	var profile = {'joinedDate':joinDate};
	var newUser = {'username':userName,'email':userEmail,'password':userPassword};
	console.log(newUser);
	return newUser
}