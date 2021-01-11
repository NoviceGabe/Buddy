define([
	'authController', 
	'chatController', 
	'loginController', 
	'registerController',
	'view', 
	'routes',
	'private-routes',
	], (AuthController, ChatController, LoginController, RegisterController, View, routes, privateRoutes)=>{

	let _routes;
	const _view = new View();

	return class Router{
		constructor(routes){
			_routes = routes;
		}

		parseLocation(){
			return location.hash.slice(1).toLowerCase() || '/';
		}

		findComponentByPath(path){
			let component = _routes.find(route => route.path.match(new RegExp(`^\\${path}$`, 'gm'))) || undefined;
			if(component){
				return component.template;
			}
		}

		resolve(){
			let path = this.parseLocation();
			const pathSegments = path.split('/');
			if(pathSegments.length == 3){
				const method = pathSegments.pop();
				sessionStorage.setItem('method', method);
				path = pathSegments.join('/');
			}

			const component = this.findComponentByPath(path) || this.findComponentByPath('/error');
			const main = document.querySelector('#container');
			sessionStorage.setItem('routerPath', path);
			main.innerHTML = component.render();
			this.dispatch(path);
		}

		load(path, defaultPath = '/error'){
			const component = this.findComponentByPath(path) || this.findComponentByPath(defaultPath);
			const main = document.querySelector('#container');
			sessionStorage.setItem('routerPath', path);
			main.innerHTML = component.render();
			this.dispatch(path);
		}

		dispatch(path){
			let state;
			let uid;

			if(auth.currentUser){
				uid = auth.currentUser.uid;
				const data = sessionStorage.getItem(uid);

				if(data != undefined){
					state = JSON.parse(data);
				}
			} 

			switch (path) {
				case '/profile':
					if(uid){
						const logout = document.querySelector('#logout');
						logout.addEventListener('click', () => {
							auth.signOut()
							.then(() => {
								const path = '/login';
								document.location.href = `${DOMAIN}#${path}`;
								_view.removeMenu();
								this.setRoute(routes);
								this.load(path);
			  	 				localStorage.clear();
			  					sessionStorage.clear();
							}).catch(err => {
						  		return err;
						  	});
						});
					}
					break;
				case '/chat':
					if(uid){
						let controller = new ChatController(state);
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

								Promise.resolve(status).then(value => {
									this.setRoute(privateRoutes);
									document.location.href = DOMAIN;
								});

							} catch(e) {
								console.log(e);
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
	}
});