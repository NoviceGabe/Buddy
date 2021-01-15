define(['util'],(Util)=>{
	let _init = false;

	return class Connections{
		constructor(){

		}

		render(ref, users, filter){
			const container = document.querySelector('#connections-container');
			const count = (users.length > 0)? users.length: 0;

			let template = '';

			if(!_init){
				template = `<h4>${Util.toCapitalizeString(ref)} (${count})</h4>`;
			}

			template += `
				<div class="label clear-fix">
					<p class="float-left">${filter.toUpperCase()}</p>
					<hr class="float-left">
				</div>
				<div id="${ref}">
					<ul class="recent-dialog"></ul>
					<ul class="all-dialog"></ul>
				</div>
			`;

			container.innerHTML += template;

			const allDialog = document.querySelector(`#${ref} .all-dialog`);
			
			let all = '';

			users.forEach(user => {
				all += this.template(user);
			});
			
			allDialog.innerHTML = all;

			_init = true;
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

			const li = `
				<li id="${user.uid}" class="clear-fix">
					<div class="col-1 float-left clear-fix">
						<img src="${imgPath}" class="float-left">
						<div class="float-left">
							<h5 >${user.name}</h5>
							<p>${service}</p>
						</div>
					</div>
					<div class="col-2 float-right">
						<button class="view">View Profile</button>
						<button class="unfollow">Unfollow</button>
					</div>
				</li>
				
			`;
			return li;
		}
	}
});