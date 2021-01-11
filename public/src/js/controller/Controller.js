define([
	'view', 
	'router', 
	'routes',
	'chatController', 
	'loginController', 
	'registerController',
	'authController',
	'util'
	], (View, Router, routes, ChatController, LoginController, RegisterController, AuthController, Util)=>{

	const singleton = Symbol();
	const singletonEnforcer = Symbol();

	let _router;
	let _routes;
	const _view = new View();

	let _uid;
	let _state;

	const _dispatch = () => {
		const routerPath = sessionStorage.getItem('routerPath');
		switch (routerPath) {
			case '/profile':
				if(_uid){
					const logout = document.querySelector('#logout');
					logout.addEventListener('click', () => {
						(async ()=>{
							const isSignOut = await AuthController.signOut();
							if(isSignOut){
								const path = '/login';
								document.location.href = `${DOMAIN}#${path}`;
								_view.removeMenu();
								_router.setRoute(routes);
								_router.load(path);
							}
						})();
					});
				}
				break;
			case '/chat':
				if(_uid){
					let controller = new ChatController(_state);
					controller.initChatGroups();
					controller.initChatMessageEvents('#message-form', '#message-input', '#submit');
				}
				break;
			case '/login':
				const method = sessionStorage.getItem('method');
				if(method){
					if(method == 'google'){
						try {
							LoginController.loginWithGoogle().then(status => {
								if(status){
									sessionStorage.removeItem('method');
									document.location.href = DOMAIN;
									_router.setRoute(routes);
									_router.load('/');
								}
								
							});
						} catch(e) {
							console.log(e);
						}
					}
				}else{
					LoginController.initLoginForm('#login-form');
				}
				
				break;
			case '/signup':
				RegisterController.initRegisterForm('#signup-form');
				break;
		}
	}

	class Controller{
		constructor(enforcer, routes, id, state){
			if(enforcer != singletonEnforcer) throw "Cannot construct singleton";

			_router = new Router(routes);
			_routes = routes;

			const reloading = sessionStorage.getItem('reloading');
			if (reloading) {
				sessionStorage.removeItem('reloading');
				const routerPath = sessionStorage.getItem('routerPath');
				if(routerPath){
					_router.load(routerPath);
				}else{
					if(id){
						_router.load('/');
					}else{
						_router.load('/login');
					}
				}
			}else{
				if(id){
					_router.load('/');
				}else{
					_router.load('/login');
				}
				
			}

			if(id){
				_uid = id;
				_state = state;
				const routerPath = sessionStorage.getItem('routerPath');
				_view.renderMenu();
				const active = document.querySelector(`#nav-menu li a[href="#${routerPath}"] i`);
				_view.addActive(active);
				_view.onToggleMenu();
			}

			_dispatch();
		}

		static routeChangeListener(){
			window.addEventListener('hashchange', () => {
				_router.resolve();
				_dispatch();
				
			});
		}

		static instance(routes, id, state) {
		    if(!this[singleton]) {
		      this[singleton] = new Controller(singletonEnforcer, routes, id, state);
		    }
		    return this[singleton];
		}
	}

	return Controller;
});