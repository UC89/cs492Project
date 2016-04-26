Router.configure({
	'layoutTemplate':'layout'
});

//Homepage Router
Router.route('/', function() {
	this.render('homepage');
});

Router.route('/sendMessage',{name:'sendMessage'});

Router.route('/receiveMessage/:_messageId', function() {
	this.render('receiveMessage', {
		data: function() {
			return Messages.findOne(this.params._messageId);
		}
	});
});