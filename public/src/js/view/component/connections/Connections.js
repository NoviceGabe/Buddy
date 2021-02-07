define(['util'],(Util)=>{
	let _init;

	return class Connections{
		constructor(state){
			this.state = state;
			this.ref;
		}

		render(ref, users, filter = 'all'){
			const header = document.querySelector('#ref');
			this.ref = ref;
			if(ref == FOLLOWER){
				header.innerText = `Followers (${users.length})`;
			}else{
				header.innerText = `Following (${users.length})`;
			}
			
			if(filter == 'recent'){
				const recentDialog = document.querySelector('#recent ul');

				let recent = '';

				users.forEach(user => {
					recent += this.template(user);
				});

				recentDialog.innerHTML = recent;	
				
			}else{
				const allDialog = document.querySelector('#all ul');
				
				let all = '';

				users.forEach(user => {
					all += this.template(user);
				});

				allDialog.innerHTML = all;	
			}
			
		}

/*
		template(user){
			const li = document.createElement('li');
			const col1 = document.createElement('div');
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
			col1.appendChild(avatar);
			col1.appendChild(div);

			const col2 = document.createElement('div');
			const view = document.createElement('button');


			
			li.appendChild(col1);
			li.appendChild(col2);
			return li;
		}

*/
		template(user){
			let imgPath = 'src/assets/man.jpg';

			if(user.photoURL){
				imgPath = user.photoURL;
			}

			let service = '';

			if(user.service && user.service.length > 0){
				service = user.service[0].name;
			}
			let chat = '';

			if(firebase.auth().currentUser.uid != user.uid){
				chat = '<img src="src/assets/invite_chat.png" height="30" width="30" class="chat">';
			}

			let li = `
				<li class="${user.uid}"  data-chat="invite">
					<div class="col-1">
						<img src="${imgPath}">
						<div>
							<h5 >${user.name}</h5>
							<p>${service}</p>
						</div>
						<div>
							${chat}
						</div>
					</div>
					<div class="col-2">
						<div>
							<button class="view">View Profile</button>
							${(firebase.auth().currentUser.uid == this.state.uid && 
								this.ref == FOLLOWING)?'<button class="unfollow">Unfollow</button>':
							'<button class="follow">Follow</button>'}
						</div>
					</div>
				</li>`;

			return li;
		}
	}
});