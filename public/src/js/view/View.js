define(() => {
	return class View{

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
			const navMenuItems = document.querySelectorAll('#nav-menu a > i');

			navMenuItems.forEach(item => {
			  item.addEventListener('click', (e) => {
			  		this.addActive(e.target);
			  });
			});
		}

		static renderMenu(){
			const container = document.querySelector('#root-container');
			const menu = `
			<nav>
				<div id="logo">
					<h2>BUDDY</h2>
				</div>
				<ul id="nav-menu">
				  <li><a href="#/">Home</a></li>
				  <li><a href="#/browse">Browse</a></li>
				  <li><a href="#/chat">Message</a></li>
				  <li><a href="#/about">How it works</a></li>
				  <li>
				  <a href="#/profile">
				  <img src="src/assets/man.jpg" alt="profile image" class="profile-image" heigh="30" width="30">
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
	}
});