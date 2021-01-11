define([
	'router', 
	'routes',
	'view'
	], (Router, routes, View)=>{

	const singleton = Symbol();
	const singletonEnforcer = Symbol();

	let _router;
	const _view = new View();

	class Controller{
		constructor(enforcer, routes){
			if(enforcer != singletonEnforcer) throw "Cannot construct singleton";

			_router = new Router(routes);

			let uid;
			
			if(auth.currentUser){
			 	uid = auth.currentUser.uid;
			}

			const reloading = sessionStorage.getItem('reloading');
			if (reloading) {
				sessionStorage.removeItem('reloading');
				const routerPath = sessionStorage.getItem('routerPath');
				if(routerPath){
					_router.load(routerPath);
				}else{
					if(uid){
						_router.load('/');
					}else{
						_router.load('/login');
					}
				}
			}else{
				if(uid){
					_router.load('/', '/');
				}else{
					_router.load('/login');
				}
				
			}

			if(uid){
				const routerPath = sessionStorage.getItem('routerPath');
				_view.renderMenu();
				const active = document.querySelector(`#nav-menu li a[href="#${routerPath}"] i`);
				_view.addActive(active);
				_view.onToggleMenu();
			}

		}

		static routeChangeListener(){
			window.addEventListener('hashchange', () => {
				_router.resolve();
			});
		}

		static instance(routes) {
		    if(!this[singleton]) {
		      this[singleton] = new Controller(singletonEnforcer, routes);
		    }
		    return this[singleton];
		}
	}

	return Controller;
});