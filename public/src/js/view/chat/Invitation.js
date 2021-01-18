define(() =>{
	return class Invitation{
		constructor(){

		}

		render(users){
			const invitationDialog = document.querySelector('#invitation-dialog');
			invitationDialog.innerHTML = '';
			const fragment = new DocumentFragment();
			if(users.length > 0){
				users.forEach(user => {
					let li = this.template(user);
					fragment.appendChild(li);
				});
				invitationDialog.appendChild(fragment);
			}else{
				invitationDialog.innerHTML = `
					<li class="message-error">
						<p>No chat request</p>
					</li>`;
			}
		}

		template(user){
			let li = document.createElement('li');
			let avatar = document.createElement('img');
			let message = document.createElement('div')
			let p = document.createElement('p');
			let btns = document.createElement('div');
			let accept = document.createElement('button');
			let decline = document.createElement('button');

			li.classList.add('darker');
			li.setAttribute('id', user.uid);

			let imagePath = 'src/assets/man.jpg';
			if(user.photoURL){
				imagePath = user.photoURL;
			}	

			avatar.setAttribute('src', imagePath);
			p.innerHTML = `<span class="name">${user.name}</span> invites you to chat`;

			message.classList.add('message');
			message.appendChild(p);

			accept.innerText = 'accept';
			accept.classList.add('accept');

			decline.innerText = 'decline';
			decline.classList.add('decline');

			btns.classList.add('btns');
			btns.appendChild(accept);
			btns.appendChild(decline);
			li.appendChild(avatar);
			li.appendChild(message);
			li.appendChild(btns);

			return li;
		}

		showInvitationWindow(){
			const invitation = document.querySelector('#invitation-dialog');
			if(invitation.classList.contains('remove')){
				invitation.classList.remove('remove');
			}
		}

		hideInvitationWindow(){
			const invitation = document.querySelector('#invitation-dialog');
			invitation.classList.add('remove');
			
		}


		chatRequestViewState(invitations){
			const request = document.querySelector('#chat-request');

			if(invitations.length > 0){
				if(request.classList.contains('remove')){
					request.classList.remove('remove');
				}
				request.style.backgroundColor = '#E8E8E8';
			}else{
				request.classList.add('remove');
			}
		}
	}
});