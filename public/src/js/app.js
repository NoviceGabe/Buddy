if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	sessionStorage.setItem('reloading', 'true');
  	document.location.href = DOMAIN;
} 

require([
	'authController',
	'controller',
	'userModel',
	'routes',
	'private-routes'
], (AuthController, Controller, UserModel, routes, privateRoutes) => {

	auth.onAuthStateChanged(user => {
	    if(user){
	    	if(user.emailVerified){
	    		console.log('logged in user as '+user.uid);
		    	main(user.uid, Controller, UserModel, privateRoutes);
	    	}else if(!user.emailVerified){
	    		console.log('Email is not verified');
	    		setInterval(function(){
					AuthController.signOut();
	    		},1000);
		    	
	    	}
	    }else{
	    	console.log('logged out');
	    	Controller.instance(routes);
	    	Controller.routeChangeListener();
	    }
	   
	});

}, err => {
	console.log('unable to load page please try again');
});

async function main(id, Controller, UserModel, privateRoutes){
	try {

		const userModel = new UserModel(firestore, auth);
		data = await userModel.getUser(id);
		Controller.instance(privateRoutes, data);
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
		  return auth.signOut().then(() => {
		  	 localStorage.clear();
		  	sessionStorage.clear();
		  	return true;
		  }).catch(() => {
		  	return false;
		  });
		 
		}