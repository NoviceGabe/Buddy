const PRIVATE_CONVO = 1; 
const MSG_COUNT = 7;
const ORDER = 'desc';
const FOLLOWING = 'following';
const FOLLOWER = 'follower';
//const DOMAIN = 'http://localhost/buddy/public/'; // local server 1
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
        'postModel': 'src/js/model/Post',
        'view': 'src/js/view/View',
        'chatComponent': 'src/js/view/component/chat/Chat',
        'messageComponent': 'src/js/view/component/chat/Message',
        'overviewComponent': 'src/js/view/component/profile/Overview',
        'profileComponent': 'src/js/view/component/profile/Profile',
        'suggestionsComponent':'src/js/view/component/home/Suggestions',
        'postComponent':'src/js/view/component/home/Post',
        'p_connectionsComponent': 'src/js/view/component/profile/Connections',
        'c_connectionsComponent': 'src/js/view/component/connections/Connections',
        'invitationComponent': 'src/js/view/component/chat/Invitation',
        '404':'src/js/view/404',
        'chatView': 'src/js/view/Chat',
        'homeView': 'src/js/view/Home',
        'profileView': 'src/js/view/Profile',
        'loginView': 'src/js/view/Login',
        'registerView': 'src/js/view/Register',
        'dateComponent': 'src/js/util/DateMenu',
        'modalComponent':'src/js/util/Modal',
        'authController': 'src/js/controller/Authenticate',
        'loginController': 'src/js/controller/Login',
        'registerController':'src/js/controller/Register',
        'homeController':'src/js/controller/Home',
        'profileController':'src/js/controller/Profile',
        'connectionsController': 'src/js/controller/Connections',
        'chatController': 'src/js/controller/Chat',
        'router':'src/js/Router',
        'util':'src/js/util/Util',
        'map':'src/js/util/Map',
        'validator':'src/js/util/Validator'
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


