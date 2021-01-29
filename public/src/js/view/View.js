define(['css!css/app'],() => {
	const singleton = Symbol();
	const singletonEnforcer = Symbol();
	let _state;

	return class View{

		constructor(enforcer, state){
			if(enforcer != singletonEnforcer) throw "Cannot construct singleton";
			_state = state;
		}

		static addActive(element){
		  const current = document.querySelector('.active');
		  if(current){
		  	current.classList.remove('active');
		  }
		  if(element){
		  	 element.classList.add('active');
		  }
		}

		static onToggleMenu(){
			const navMenuItems = document.querySelectorAll('#nav-menu a');

			navMenuItems.forEach(item => {
			  	item.addEventListener('click', (e) => {
			  		this.addActive(e.target);
			  	});
			});
		}

		static renderMenu(){
			const container = document.querySelector('#root-container');
			let imagePath = 'src/assets/man.jpg';

			if(_state != null && _state.photoURL){
				imagePath = _state.photoURL;
			}	

			const menu = `
			<nav>
				<div id="logo">
					<h2>BUDDY</h2>
				</div>
				<ul id="nav-menu">
				  <li><a href="#/">Home</a></li>
				  <li><a href="#/browse">Browse</a></li>
				  <li><a href="#/chat">Message</a></li>
				  <li>
				  <a href="#/profile/${firebase.auth().currentUser.uid}">
				  <img src="${imagePath}" alt="profile image" class="profile-image" heigh="30" width="30">
				  </a></li>
				</ul>
			</nav>`;
			container.insertAdjacentHTML('afterbegin', menu);
		}

		static removeMenu(){
			const container = document.querySelector('#root-container');
			const nav = document.querySelector('nav');
			if(nav){
				container.removeChild(nav);
			}
		}

		static instance(state) {
		    if(!this[singleton]) {
		      this[singleton] = new View(singletonEnforcer, state);
		    }
		    return this[singleton];
		}
	}
});