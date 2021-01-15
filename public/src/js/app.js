if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	sessionStorage.setItem('reloading', 'true');
  	document.location.href = DOMAIN;
} 

require([
	'controller',
	'userModel',
	'routes',
	'private-routes',
	'css!css/index',
	'css!css/helper'
], (Controller, UserModel, routes, privateRoutes) => {

	firebase.auth().onAuthStateChanged(user => {
	    if(user){
	    	console.log('logged in user as '+user.uid);
	    	const provider = user.providerData[0].providerId;

	    	if((provider == EMAIL_PASSWORD_SIGN_IN_METHOD && user.emailVerified) ||
	    		(provider == GOOGLE_PROVIDER) ||
	    		 (provider == FACEBOOK_PROVIDER)){
	    		main(Controller, UserModel, privateRoutes);
	    	}

	    }else{
	    	console.log('logged out');
	    	Controller.instance(routes);
	    	Controller.routeChangeListener();
	    }
	   
	});

}, err => {
	console.log(err.message)
	console.log('unable to load page please try again');
});

async function main(Controller, UserModel, privateRoutes){
	try {

		const userModel = new UserModel(firebase.firestore(), firebase.auth());
		const UID = firebase.auth().currentUser.uid;
		const data = await userModel.getUser(UID);
		if(data){
			sessionStorage.setItem(UID, JSON.stringify(data));
		}
		
		Controller.instance(privateRoutes);
		Controller.routeChangeListener();
	
	} catch(e) {
		console.log(e);
	}
}

//signOut();
//signIn('lazymacs017@gmail.com', 'Password123');


	//const status = await chatView.invite(user.uid, '8o6jAuRrpdNHred9o3AntYacnp63');
	//console.log(status);
	/*
	    const accept = await chatView.accept('ZX4s8p6B8Th7V7P5NnaTMWZMzZj1', user.uid);
	    if(accept){
	      const create = await chatView.createGroup('ZX4s8p6B8Th7V7P5NnaTMWZMzZj1', '', ['ZX4s8p6B8Th7V7P5NnaTMWZMzZj1', user.uid]);
	    }
	*/
function signOut(){
		  return firebase.auth().signOut().then(() => {
		  	 localStorage.clear();
		  	sessionStorage.clear();
		  	return true;
		  }).catch(() => {
		  	return false;
		  });
		 
		}