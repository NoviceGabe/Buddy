if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	sessionStorage.setItem('reloading', 'true');
  	document.location.href = DOMAIN;
} 

require(['router', 'userModel', 'view', 'css!css/app', 'css!css/index', 'css!css/helper'], 
	(Router, UserModel, View) => {

	firebase.auth().onAuthStateChanged(user => {
		
	    if(user){
	    	console.log('logged in user as '+user.uid);

	    	const provider = user.providerData[0].providerId;

	    	if((provider == EMAIL_PASSWORD_SIGN_IN_METHOD && user.emailVerified) ||
	    		(provider == GOOGLE_PROVIDER) ||
	    		 (provider == FACEBOOK_PROVIDER)){

				const reloading = sessionStorage.getItem('reloading');
				if (reloading) {
					const path = sessionStorage.getItem('path');
					if(path){
						Router.navigate(path);
					}else{
						Router.navigate('/');
					}
					
				}else{
					if(uid){
						Router.navigate('/');
					}else{
						Router.navigate('/login');
					}
				}

	    		(async () => {
	    			const userModel = new UserModel(firebase.firestore(), firebase.auth());
					const data = await userModel.getUser(firebase.auth().currentUser.uid);

					View.instance(data);
					View.renderMenu();
					View.onToggleMenu();

		    		main(Router, data);
	    		})();
	    		
	    	}
	    }else{
	    	console.log('logged out');

	    	Router
			.add(/signup/, function() {
			     	return {
					view: 'registerView',
					controller:'registerController',
				};
			})
			.add(/login\/google/, function() {
			   	return {
					view: 'loginView',
					controller:'loginController',
				};
			})
			.add(/login\/facebook/, function() {
			   	return {
					view: 'loginView',
					controller:'loginController',
				};
			}).add(/login/, function() {
			   	return {
					view: 'loginView',
					controller:'loginController',
				};
			}).add(function() {
			   	return {
					view: 'loginView',
					controller:'loginController',
				};
			})
			.resolve();

			Router.listener();
	    }
	   
	});

}, err => {
	console.log(err.message)
	console.log('unable to load page please try again');
});


const main = (Router, data) => {
	try {
		
		Router
		.add(/chat/, function(){
			return {
				view: 'chatView',
				controller:'chatController',
				state: data
			};
		})
		.add(/chat\/(.*)/, function(){
			return {
				view: 'chatView',
				controller:'chatController',
				state: data
			};
		})
		.add(/profile\/(.*)/, function(segment){
			const id = segment.split('/').pop();
			let state = data;
			 
			if(id != firebase.auth().currentUser.uid){
				return userModel.getUser(UID).then(state => {
					return {
						view:'profileView',
						controller:'profileController',
						state: state
					};
				});
			}else{
				return {
					view:'profileView',
					controller:'profileController',
					state: state
				};
			}
		})
		.add(/connections\/following\/(.*)/, function(segment){
			console.log(segment)
		})
		.add(/connections\/follower\/(.*)/, function(segment){
			console.log(segment)
		})
		.add(function() {
		   return {
		     view: 'homeView',
		     controller: ''
		   }
		})
		.resolve();

		Router.listener();
	
	} catch(e) {
		console.log(e);
	}
}


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
