define(['util'], (Util) => {
	return class Connections{
		constructor(state){
			this.state = state;
		}

		render(ref, users){
			const container = document.querySelector('#tab-connections-content');
			let count = 0;
			if(ref == 'follower' && this.state.followerCount){
				count = this.state.followerCount;
			}else if(ref == 'following' &&  this.state.followingCount){
				count = this.state.followingCount;
			}
			let next = 'hide';
			let view = 'hide';
			if(users.length > 8){
				next = '';
			}
			if(users.length > 0){
				view = '';
			}
			const template = `
				<div id="${ref}">
					<div class="clear-fix">
						<h4 class="float-left">${Util.toCapitalizeString(ref)}s (${count})</h4>
						<span class="float-right ${view}">See all</span>
					</div>
					<ul id="${ref}-dialog">
					</ul>
	  				<img src="src/assets/angle-pointing-to-left.png" class="prev hide" >
	  				<img src="src/assets/angle-arrow-pointing-to-right.png" class="next ${next}" >
				</div>`;

			container.innerHTML += template;

			const fragment = new DocumentFragment();
			const dialog = document.querySelector(`#${ref}-dialog`);

			users.forEach(user => {
				console.log(user)
				fragment.appendChild(this.template(user));
			});

			dialog.appendChild(fragment);
		}

		template(user){
			const li = document.createElement('li');
			const avatar = document.createElement('img');
			const div = document.createElement('div');
			const name = document.createElement('h5');
			const tag = document.createElement('p');

			let imgPath = 'src/assets/man.jpg';

			if(user.photoURL){
				imgPath = user.photoURL;
			}

			avatar.setAttribute('src', imgPath);
			name.innerText = user.name;

			let service = '';

			if(user.service && user.service.length > 0){
				service = user.service[0].name;
			}

			tag.innerText = service;

			div.appendChild(name);
			div.appendChild(tag);

			li.appendChild(avatar);
			li.appendChild(div);
			return li;
		}
	}
});