define(['view'], (View) => {
	let _routes = [];

	const Router = {

		getFragment: function() {
		    let fragment = '';
		    
		    const match = window.location.href.match(/#(.*)$/);
		    fragment = match ? match[1] : '';
		    
		    return this.clearSlashes(fragment);
		},

		clearSlashes: function(path) {
		    return path.toString().replace(/\/$/, '').replace(/^\//, '');
		},

		add: function(re, handler) {
		    if(typeof re == 'function') {
		        handler = re;
		        re = '';
		    }
		    _routes.push({ re: re, handler: handler});
		    return this;
		},

		remove: function(param) {
		    for(let i=0, r; i < _routes.length, r = _routes[i]; i++) {
		        if(r.handler === param || r.re.toString() === param.toString()) {
		            _routes.splice(i, 1); 
		            return this;
		        }
		    }
		    return this;
		},

		resolve: async function(f) {
		    const fragment = f || this.getFragment();
		    for(let i=0; i < _routes.length; i++) {
		        let match = fragment.match(_routes[i].re);
		        if(match) {
		            let segment = match.shift();
		            sessionStorage.setItem('path', segment);
		           	let dispatch = await _routes[i].handler(segment);
		           	if(dispatch.view){
		           		console.log(dispatch)
		           		require([dispatch.view], function(view){
		           				view.render();
					    });
		           	}
		           	if(dispatch.controller){
		           		require([dispatch.controller], function(Controller){
		           			if(dispatch.state){
		           				new Controller(dispatch.state, Router);
		           			}else{
		           				new Controller(Router);
		           			}
		           			
					    });
		           	}
		          	return this;
		        }           
		    }
		    if(!firebase.auth().currentUser){
		    	 require(['404'], function(view){
			        view.render();
				});
		    }
		   
		    return this;
		},

		navigate: function(path) {
	        path = path ? path : '';
	        
	        window.location.href = window.location.href.replace(/#(.*)$/, '') + '#/' + path;
	        return this;
	    },

		listener: function(){
			let obj = this;
			window.addEventListener('hashchange', () => {
				obj.resolve();
			});
		}
	}
	return Router;
});