define(['util', 'moment'], (Util, moment) => {
	return class Chat{
		constructor(user){
			this.user = user;
			this.chatDialog = document.querySelector('#chat-dialog');
			this.fragment = new DocumentFragment();
		}

		template(group){

			const chatContainer = document.createElement('div');
			chatContainer.setAttribute('id', group.id.trim());
			chatContainer.classList.add('chat-container');

			const chatName = document.createElement('p');
			chatName.classList.add('chat-name');

			if(group.type == PRIVATE_CONVO){
				const user = group.members.find(member => member.uid != this.user.uid);
				chatName.setAttribute('data-letters-before',user.name.getInitials().toUpperCase());
				chatName.innerText = user.name;
			}else{
				chatName.setAttribute('data-letters-before', group.name.getInitials().toUpperCase());
				chatName.innerText = group.name;
			}
				
			chatContainer.appendChild(chatName);
			chatContainer.appendChild(this.recent(group));
			return chatContainer;
		}

		render(groups){
			this.chatDialog.innerHTML = '';
			this.fragment.innerHTML = '';
			
			groups.forEach(group => {
				let li = this.template(group);
				this.fragment.appendChild(li);
			});
			this.chatDialog.appendChild(this.fragment);
		}

		recent(group){
			if(group.recentMessage){
				let who = '';
				let recentMessage = '';

				const recentRead = document.createElement('p');
				recentRead.classList.add('recent-read');
			
				const time = moment(group.recentMessage.readBy.sentAt.toDate(), "YYYYMMDD").fromNow();

				if(group.recentMessage.readBy.sentBy.trim() == this.user.uid.trim()){
					who = 'You: ';
				}else{
					if(group.members.length > 2){
						const user = group.members.find(member => member.uid.trim() == group.recentMessage.readBy.sentBy.trim());
						who = `${user.name}: `;
					}
				}
				recentMessage = Util.truncate(group.recentMessage.content,24).trim();
				recentRead.innerHTML = `${who}${recentMessage} <span style="font-size:12px;color:#B0B0B0;float: right">sent ${time}</span>`;

				let timer = setInterval(() => { 
					const ago = document.querySelector(`#${group.id.trim()} span`);
					if(ago){
						const date = group.recentMessage.readBy.sentAt.toDate();
						ago.innerText = 'sent '+moment(date, "YYYYMMDD").fromNow();
					}else{
						clearInterval(timer);
					}
				
				}, 60000);

				return recentRead;
			}
		}

		update(group){
			const container = document.querySelector(`#${group.id.trim()}`);
			container.removeChild(container.lastChild);
			container.appendChild(this.recent(group));
		}

		select(id){
			let chat = document.querySelector(`#${id}`);
			chat.classList.add('darker');
		}

		unselect(id){
			let chat = document.querySelector(`#${id}`);
			chat.classList.remove('darker');
		}
	}
});