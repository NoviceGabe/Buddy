const PRIVATE_CONVO = 1; 
const MSG_COUNT = 7;
const ORDER = 'desc';
const DOMAIN = 'http://localhost/buddy-test/public/'; // local server 1
//const DOMAIN = 'http://localhost:5000/'; // local server 2
//const DOMAIN = 'https://chat-3db56.web.app/'; // production


String.prototype.getInitials = function(glue){
	    if (typeof glue == "undefined") {
	        var glue = true;
	    }

	    var initials = this.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g);
	    
	    if (glue) {
	        return initials.join('');
	    }

	    return  initials;
};

requirejs.config({
    enforceDefine: true,
    waitSeconds: 0,
    paths: {
    	'moment':'https://momentjs.com/downloads/moment.min',
        'db': 'src/js/db',
        'userModel': 'src/js/model/User',
        'chatModel': 'src/js/model/Chat',
        'view': 'src/js/view/View',
        'chatView': 'src/js/view/chat/Chat',
        'messageView': 'src/js/view/chat/Message',
        'controller': 'src/js/controller/Controller',
        'authController': 'src/js/controller/Authenticate',
        'loginController': 'src/js/controller/Login',
        'registerController':'src/js/controller/Register',
        'chatController': 'src/js/controller/Chat',
        'router':'src/js/Router',
        'routes': 'src/js/routes',
        'private-routes': 'src/js/private-routes',
        'util':'src/js/Util',
        'validator':'src/js/Validator'
	}
});