define(() => {
	return class View{
		constructor(){

		}

		addActive(element){
		  const current = document.querySelector('.active');
		  if(current){
		  	current.classList.remove('active');
		  }
		  if(element){
		  	 element.classList.add('active');
		  }
		}

		onToggleMenu(){
			const navMenuItems = document.querySelectorAll('#nav-menu a > i');

			navMenuItems.forEach(item => {
			  item.addEventListener('click', (e) => {
			  		this.addActive(e.target);
			  });
			});
		}

		renderMenu(){
			const container = document.querySelector('#root-container');
			const menu = `
			<nav>
				<div id="searchbar">
					<input type="text" placeholder="Search..">
				</div>
				<div id="logo">
					<h2>BUDDY</h2>
				</div>
				<ul id="nav-menu">
				  <li><a href="#/"><i class="fa fa-home fa-lg" aria-hidden="true"></i></a></li>
				  <li><a href="#/connections"><i class="fa fa-users fa-lg" aria-hidden="true"></i></a></li>
				  <li><a href="#/service"><i class="fa fa-briefcase fa-lg" aria-hidden="true"></i></a></li>
				  <li><a href="#/chat"><i class="fa fa-comment fa-lg" aria-hidden="true"></i></a></li>
				  <li><i class="fa fa-bell fa-lg" aria-hidden="true"></i></li>
				  <li><a href="#/profile"><i class="fa fa-user fa-lg" aria-hidden="true"></i></a></li>
				</ul>
			</nav>`;
			container.insertAdjacentHTML('afterbegin', menu);
		}

		removeMenu(){
			const container = document.querySelector('#root-container');
			const nav = document.querySelector('nav');
			if(nav){
				container.removeChild(nav);
			}
		}
	}
});