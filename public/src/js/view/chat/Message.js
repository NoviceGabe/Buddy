define(['moment'], (moment) => {
	return class Message{
		constructor(user){
			this.user = user;
			this.bubbleDialog = document.querySelector('#bubble-dialog');
		}

		template(message){
			let color = '';
			let alignment = 'left';

			if(message.sentBy == this.user.uid){
					name = this.user.name;
					color = 'darker';
					alignment = 'right';
			}	

			let date;

			try {
				date = message.sentAt.toDate();
			} catch(e) {
				date = new firebase.firestore.Timestamp(message.sentAt.seconds, message.sentAt.nanoseconds).toDate();
			}

			let li = document.createElement('li');
			li.classList.add('bubble-container');
			li.classList.add(`bubble-${alignment}`);
			if(color.length > 0){
				li.classList.add(color);
			}

			let div = document.createElement('div');
			div.classList.add('content-container');

			let content = document.createElement('p');
			content.classList.add('content');
			content.innerText = message.content;

			let time = document.createElement('p');
			time.classList.add('time');
			time.innerText = moment(date).format('llll');

			div.appendChild(content);
			li.appendChild(div);
			li.appendChild(time);
			return li;
		}

		render(messages){	
			if(messages.length > 0){
				this.append(messages)
				this.bubbleDialog.classList.add("scrollbar");
				this.bubbleDialog.scrollTo(0, this.bubbleDialog.scrollHeight);
			}else{
				this.bubbleDialog.innerHTML = `
								<li id="message-error">
									<p>No Message</p>
								</li>`;
			}
		}

		append(messages){

			let fragment = document.createDocumentFragment();

			messages.forEach(message => {
				let li = this.template(message);
				fragment.appendChild(li);
			});

			this.bubbleDialog.appendChild(fragment);
		}

		prepend(messages){

			let first = this.bubbleDialog.getElementsByTagName('li')[0];

			let fragment = new DocumentFragment();

			messages.forEach(message => {
				let li = this.template(message);
				fragment.appendChild(li);
			});

			this.bubbleDialog.insertBefore(fragment, first);
		}

		resetInputUI(e){
			if(e.target.value.trim().length == 0){
					e.target.style.height = '38px';
			}
		}

		adjustInputHeight(e){
			const height = parseInt(e.target.style.height.replace('px',''));
			if(height < 138){
			 	e.target.style.height = 'auto';
			  	e.target.style.height = (e.target.scrollHeight) + 'px';
			  	return;
			}
			if(e.target.style.overflowY != 'auto'){
			  	 e.target.style.overflowY = 'auto';
			}
		}

		resetMessagesUI(){
			const bubbleDialog = document.querySelector('#bubble-dialog');
			bubbleDialog.innerHTML = ''; 
		}

		showError(error){
			const bubbleDialog = document.querySelector('#bubble-dialog');
			bubbleDialog.innerHTML = `
								<li id="message-error">
									<p>${error}</p>
								</li>`;
		}

		hideMessageForm(){
			const messageForm = document.querySelector('#message-form');

		}

		showMessageForm(){
			const messageForm = document.querySelector('#message-form');
			messageForm.classList.remove('remove');
		}

		showPreLoader(){
			const loader = document.querySelector('#loader');
		 	loader.classList.remove("remove");
		}

		hidePreloader(){
			const loader = document.querySelector('#loader');
			loader.classList.add("remove");
		}

		showLoadMore(){
			const prevLink = document.querySelector('#load-more');
			prevLink.classList.remove('remove');
		}

		hideLoadMore(){
			const prevLink = document.querySelector('#load-more');
			prevLink.classList.add('remove');
		}
	}
});