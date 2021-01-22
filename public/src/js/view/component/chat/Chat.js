define(['util', 'moment'], (Util, moment) => {
	return class Chat{
		constructor(user){
			this.user = user;
		}

		template(group){

			const chatContainer = document.createElement('div');
			const memberInfo = document.createElement('div');
			chatContainer.setAttribute('id', group.id.trim());
			chatContainer.classList.add('chat-container');
			let avatar;

			const chatName = document.createElement('p');
			chatName.classList.add('chat-name');

			if(group.type == PRIVATE_CONVO){

				let imagePath = 'src/assets/man.jpg';
				
				avatar = document.createElement('img');

				if(group.member && group.member.photoURL){
					imagePath = group.member.photoURL;
				}

				avatar.setAttribute('src', imagePath);
				if(group.member){
					chatName.innerText = group.member.name;
				}else{
					const user = group.members.find(member => member.uid != this.user.uid);
					//chatName.setAttribute('data-letters-before',user.name.getInitials().toUpperCase());
					chatName.innerText = user.name;
				}

			}else{
				chatName.setAttribute('data-letters-before', group.name.getInitials().toUpperCase());
				chatName.innerText = group.name;
			}

			if(avatar){
				memberInfo.appendChild(avatar);	
			}

			memberInfo.appendChild(chatName);	
				
			chatContainer.appendChild(memberInfo);
			const recent = this.recent(group);
			if(recent){
				chatContainer.appendChild(recent);
			}
			return chatContainer;
		}

		render(groups){
			const chatDialog = document.querySelector('#chat-dialog');
			const fragment = new DocumentFragment();
			chatDialog.innerHTML = '';
			
			groups.forEach(group => {
				let li = this.template(group);
				fragment.appendChild(li);
			});
			chatDialog.appendChild(fragment);

			this.changeTime();
			setInterval(() =>{
				this.changeTime();
			}, 1000*60);
		}

		recent(group){
			if(group.recentMessage){
				let who = '';
				let recentMessage = '';

				const recentRead = document.createElement('p');
				recentRead.classList.add('recent-read');

				let date;
				try {
					date = group.recentMessage.readBy.sentAt.toDate();
				} catch(e) {
					date = new firebase.firestore
						.Timestamp(group.recentMessage.readBy.sentAt.seconds, 
						group.recentMessage.readBy.sentAt.nanoseconds)
						.toDate();
				}

				const time = moment(date, "YYYYMMDD").fromNow();
				
				if(group.recentMessage.readBy.sentBy.trim() == this.user.uid.trim()){
					who = 'You: ';
				}else{
					if(group.members.length > 2){
						const user = group.members.find(member => member.uid.trim() == group.recentMessage.readBy.sentBy.trim());
						who = `${user.name}: `;
					}
				}
				recentMessage = Util.truncate(group.recentMessage.content,24).trim();
				recentRead.innerHTML = `${who}${recentMessage} 
				<span style="font-size:12px;color:#B0B0B0;float: right" 
				data-seconds="${group.recentMessage.readBy.sentAt.seconds}"
				 data-nanoseconds="${group.recentMessage.readBy.sentAt.nanoseconds}">${time}</span>`;
				return recentRead;
			}
		}

		changeTime(){
			const recent = document.querySelectorAll('.recent-read span');
			recent.forEach(element => {
				let seconds = element.dataset.seconds;
				let nanoseconds = element.dataset.nanoseconds;
				let timestamp = new firebase.firestore.Timestamp(seconds, nanoseconds).toDate();
				element.innerText = 'sent '+moment(timestamp, "YYYYMMDD").fromNow();
			});
		}

		update(group){
			const container = document.getElementById(group.id.trim());
			console.log(container.lastChild)
			container.removeChild(container.lastChild);

			container.appendChild(this.recent(group));
		}

		select(id){
			let chat = document.getElementById(id);
			chat.classList.add('darker');
		}

		unselect(id){
			let chat = document.getElementById(id);
			chat.classList.remove('darker');
		}
	}
});