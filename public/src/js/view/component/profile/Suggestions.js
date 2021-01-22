define(['userModel'], (UserModel)=>{
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());

	return class Suggestions{
		construtor(state){
			this.state = state;
		}

		render(users){
			const container = document.querySelector('#suggestions');

			const template = `
				<div style="display:flex;gap:20px">
					<h4 style="flex:2">People you may know</h4>
					<span>See all</span>
				</div>
				<ul id="suggestion-dialog">
							
				</ul>`;

			container.innerHTML = template;

			const fragment = new DocumentFragment();
			const dialog = document.querySelector('#suggestion-dialog');
			users.forEach(user => {
				let li = this.template(user);
				fragment.appendChild(li);
			});

			dialog.appendChild(fragment);

		}

		template(user){
			const li = document.createElement('li');
			const avatar = document.createElement('img');
			const div = document.createElement('div');
			const name = document.createElement('h5');
			const tag = document.createElement('p');
			const follow = document.createElement('img');

			li.setAttribute('id', user.uid);
			li.classList.add('clear-fix');
			div.classList.add('float-left');
			div.classList.add('clear-fix');
			avatar.classList.add('avatar');
			avatar.classList.add('float-left');
			follow.setAttribute('src', 'src/assets/follow-outline.png');
			follow.classList.add('float-right');
			follow.classList.add('follow');

			let imgPath = 'src/assets/man.jpg';
			let service = '';

			if(user.photoURL){
				imgPath = user.photoURL;
			}

			avatar.setAttribute('src', imgPath);
			
			name.innerText = user.name;
			div.appendChild(name);

			if(user.service && user.service.length > 0){
				service = user.service[0].name;
			}

			tag.innerText = service;
			div.appendChild(tag);
			li.appendChild(avatar);
			li.appendChild(div);
			li.appendChild(follow);
			return li;
		}

	}
});