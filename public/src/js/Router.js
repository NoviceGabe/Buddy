define(()=>{
	let _routes;

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
		}

		load(path){
			const component = this.findComponentByPath(path) || this.findComponentByPath('/error');
			const main = document.querySelector('#container');
			sessionStorage.setItem('routerPath', path);
			main.innerHTML = component.render();
		}

		setRoute(routes){
			_routes = routes;
		}
	}
});