const PRIVATE_CONVO = 1; 
const MSG_COUNT = 7;
const ORDER = 'desc';
const FOLLOWING = 'following';
const FOLLOWER = 'follower';
//const DOMAIN = 'http://localhost/buddy-test/public/'; // local server 1
//const DOMAIN = 'http://localhost:5000/'; // local server 2
const DOMAIN = 'https://chat-3db56.web.app/'; // production
const EMAIL_PASSWORD_SIGN_IN_METHOD = 'password';
const GOOGLE_PROVIDER = 'google.com';
const FACEBOOK_PROVIDER = 'facebook.com';

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
        'overView': 'src/js/view/profile/Overview',
        'profileView': 'src/js/view/profile/Profile',
        'suggestionsView':'src/js/view/profile/Suggestions',
        'p_connectionsView': 'src/js/view/profile/Connections',
        'c_connectionsView': 'src/js/view/connections/Connections',
        'invitationView': 'src/js/view/chat/Invitation',
        'dateView': 'src/js/view/profile/DateMenu',
        'controller': 'src/js/controller/Controller',
        'authController': 'src/js/controller/Authenticate',
        'loginController': 'src/js/controller/Login',
        'registerController':'src/js/controller/Register',
        'profileController':'src/js/controller/Profile',
        'connectionsController': 'src/js/controller/Connections',
        'chatController': 'src/js/controller/Chat',
        'router':'src/js/Router',
        'routes': 'src/js/routes',
        'private-routes': 'src/js/private-routes',
        'util':'src/js/Util',
        'validator':'src/js/Validator'
	},
   map: {
      '*': {
        css: 'src/require-css/css'
      }
    }
});

const firebaseConfig = {
    apiKey: "AIzaSyCJLXZVc3YmsWmvp-XeptIGG9sRYvufhhs",
    authDomain: "chat-3db56.firebaseapp.com",
    projectId: "chat-3db56",
    storageBucket: "chat-3db56.appspot.com",
    messagingSenderId: "863153149044",
    appId: "1:863153149044:web:29e37770fccabc27b66d21",
    measurementId: "G-55X3KZXCHP"
};

try {
    firebase.initializeApp(firebaseConfig);
} catch(e) {
    console.log(e);
}


