if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
	sessionStorage.setItem('reloading', 'true');
  	document.location.href = DOMAIN;
} 

require(['router', 'userModel', 'view', 
	'css!css/index', 'css!css/helper', 'css!css/post', 'css!css/modal'], 
	(Router, UserModel, View) => {

	firebase.auth().onAuthStateChanged(async (user) => {
		
	    if(user){
	    	console.log('logged in user as '+user.uid);

	    	const provider = user.providerData[0].providerId;

	    	if((provider == EMAIL_PASSWORD_SIGN_IN_METHOD && user.emailVerified) ||
	    		(provider == GOOGLE_PROVIDER) ||
	    		 (provider == FACEBOOK_PROVIDER)){

				const reloading = sessionStorage.getItem('reloading');
				sessionStorage.removeItem('reloading');
				if (reloading) {
					const path = sessionStorage.getItem('path');
					if(path){
						Router.navigate(path);
					}else{
						Router.navigate('');
					}
					
				}else{
					if(user.uid){
						Router.navigate('');
					}else{
						Router.navigate('login');
					}
				}
	    		
	    		const userModel = new UserModel(firebase.firestore(), firebase.auth());

				const data = await userModel.getUser(user.uid);
				const image = await userModel.getUserImage(user.uid);

				data.photoURL = image[0].url;

				View.instance(data);
				View.renderMenu();
				View.onToggleMenu();

		    	main(Router, userModel,  data);
	
	    		
	    	}
	    }else{
	    	console.log('logged out');

	    	const reloading = sessionStorage.getItem('reloading');
	    	sessionStorage.removeItem('reloading');
			if (reloading) {
				const path = sessionStorage.getItem('path');
				if(path){
						Router.navigate(path);
				}else{
						Router.navigate('login');
				}
					
			}else{
				Router.navigate('login');
			}
			

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
			})
			.add(/login/, function() {
			   	return {
					view: 'loginView',
					controller:'loginController',
				};
			})
			.resolve()
			Router.listener();
	    }
	   
	});

}, err => {
	console.log(err.message)
	console.log('unable to load page please try again');
});


const main = (Router, userModel, data) => {
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
				return userModel.getUser(id).then(state => {
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
		.add(/connections\/following\/(.*)/, async function(segment){
			const id = segment.split('/').pop();
			if(id != firebase.auth().currentUser.uid){
				let user = await userModel.getUser(id);
				return {
					view:'connectionsView',
					controller:'connectionsController',
					state: user
				};

			}else{
				return {
					view:'connectionsView',
					controller:'connectionsController',
					state: data
				};
			}
		})
		.add(/connections\/follower\/(.*)/, async function(segment){
			const id = segment.split('/').pop();
			if(id != firebase.auth().currentUser.uid){
				let user = await userModel.getUser(id);
				return {
					view:'connectionsView',
					controller:'connectionsController',
					state: user
				};

			}else{
				return {
					view:'connectionsView',
					controller:'connectionsController',
					state: data
				};
			}
		})
		.add(function() {
		   return {
		     view: 'homeView',
		     controller: 'homeController',
		     state: data
		   }
		})
		.resolve()
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
