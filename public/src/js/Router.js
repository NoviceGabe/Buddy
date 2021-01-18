define([
	'authController',
	'profileController',
	'connectionsController',
	'chatController', 
	'loginController', 
	'registerController',
	'view', 
	'routes',
	'private-routes',
	'userModel'
	], 
	(
	AuthController, 
	ProfileController, 
	ConnectionsController,
	ChatController, 
	LoginController, 
	RegisterController, 
	View, 
	routes, 
	privateRoutes, 
	UserModel
	)=>{

	let _routes;
	const userModel = new UserModel(firebase.firestore(), firebase.auth());

	return class Router{
		constructor(routes){
			_routes = routes;
		}

		parseLocation(){
			let path = location.hash.slice(1) || '/';
			return this.parseMethod(path);
		}

		findComponentByPath(path){
			let component = _routes.find(route => route.path.match(new RegExp(`^\\${path}$`, 'gm'))) || undefined;
			if(component){
				return component.template;
			}
		}

		parseMethod(path){
			const pathSegments = path.split('/');
			if(pathSegments.length == 3){
				const method = pathSegments.pop();
				sessionStorage.setItem('method', method);
				path = pathSegments.join('/');
			}else if(pathSegments.length == 4){
				const parameter = pathSegments.pop();
				sessionStorage.setItem('parameter', parameter);
				const method = pathSegments.pop();
				sessionStorage.setItem('method', method);
				path = pathSegments.join('/');
			}
			return path;
		}

		resolve(){
			let path = this.parseLocation();
			const component = this.findComponentByPath(path) || this.findComponentByPath('/error');
			const main = document.querySelector('#container');
			sessionStorage.setItem('routerPath', path);
			main.innerHTML = component.render();
			this.dispatch(path);
		}

		load(path, defaultPath = '/error'){
			path = this.parseMethod(path);
			const component = this.findComponentByPath(path) || this.findComponentByPath(defaultPath);
			const main = document.querySelector('#container');
			sessionStorage.setItem('routerPath', path);
			main.innerHTML = component.render();
			this.dispatch(path);
		}

		dispatch(path){
			let state;
			let uid;

			if(firebase.auth().currentUser){
				uid = firebase.auth().currentUser.uid;
				const data = sessionStorage.getItem(uid);

				if(data != undefined){
					state = JSON.parse(data);
				}
			} 

			switch (path) {
				case '/profile':
					(async()=>{
						if(uid){
							try {
								
								const UID = sessionStorage.getItem('method');
								let controller;
								sessionStorage.removeItem('method');

								if(UID){
									if(UID == uid){
										controller = new ProfileController(state, this);
									}else{
										const data = await userModel.getUser(UID);
										controller = new ProfileController(data, this);
									}
									
								}else{
									controller = new ProfileController(state, this);
								}
								
								controller.initViews();
								controller.initTabEvents();
							} catch(e) {
								console.log(e);
							}
						}
					})();
					break;
				case '/connections':
					if(uid){
						(async()=>{
							const UID = sessionStorage.getItem('parameter');
							let controller;
							if(UID){
								if(UID == uid){
									controller = new ConnectionsController(state, this);
								}else{
									const data = await userModel.getUser(UID);
									controller = new ConnectionsController(data, this);
								}
							}else{
							 	controller = new ConnectionsController(state, this);
							}
							controller.initViews();
						})();
					}
					break;
				case '/chat':
					if(uid){
						let controller = new ChatController(state, this);
						controller.initChatGroups();
						controller.initChatMessageEvents('#message-form', '#message-input', '#submit');
					}
					break;
				case '/login':
					const method = sessionStorage.getItem('method');
					sessionStorage.removeItem('method');

					if(method){
						(async () => {
							try {
								let status;

								if(method == 'google'){
									status = await LoginController.loginWithGoogle();
								}else if(method == 'facebook'){
									status = await LoginController.loginWithFacebook();
								}

								const result = await Promise.resolve(status);
								console.log('result', result)

								if(result.additionalUserInfo.isNewUser && 
									((result.additionalUserInfo.providerId == GOOGLE_PROVIDER &&
								   result.additionalUserInfo.profile.verified_email) || 
									(result.additionalUserInfo.providerId == FACEBOOK_PROVIDER))){
									
									const data = result.user.providerData[0];
									const userData = userModel.createUser(
										 	data.displayName, 
										 	data.email, 
										 	data.photoURL);

									userData.uid = result.user.uid;
									userData.timestamp = result.user.metadata.creationTime;

									const isUserAdded = await userModel.addUser(userData.uid, userData);
								}
								this.setRoute(privateRoutes);
								document.location.href = DOMAIN;

							} catch(e) {
								console.log(e.message);
							}
								
						})();
					}else{
						LoginController.initLoginForm('#login-form');
					}
					
					break;
				case '/signup':
					RegisterController.initRegisterForm('#signup-form');
					break;
			}

		}

		setRoute(routes){
			_routes = routes;
		}

		changePath(path){
			window.location.hash = path;
		}
	}
});