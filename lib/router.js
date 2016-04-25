Router.configure({
	'layoutTemplate':'layout'
});

//Homepage Router
Router.route('/', function() {
	this.render('homepage');
});

Router.route('/sendMessage',{name:'sendMessage'});

Router.route('/receiveMessage',{name:'receiveMessage'});
