define([
	'util', 
	'userModel', 
	'chatModel', 
	'chatView', 
	'messageView'], (Util, UserModel, ChatModel, ChatView, MessageView) => {
	
	let lastVisible = null;
	let loaded = false;
	let selected = false;
	let showPreviousLink = false;
	let messageCount = 0;
	let prevCount = 0;
	let lastPage = false;

	const chatModel = new ChatModel(firebase.firestore());
	const userModel = new UserModel(firebase.firestore(), firebase.auth());

	let chatView;
	let messageView;

	let count = 0;

	let chatListener;
	let messageListener;

	function _initChatWindow(groups, user){
		// reset messageListener
		if(messageListener != undefined){
			messageListener();
			messageListener = undefined;
		}

		chatView.render(groups);
		const currentChat = localStorage.getItem('currentChat');

		groups.forEach(group => {
			if(currentChat != null && currentChat == group.id.trim()){
				if(messageListener == undefined){
					_listenToNewMessages(group.id, user); // register message listener
				}
				chatView.select(group.id.trim());
				selected = true;
				_initMessages(localStorage.getItem('currentChat'), user); // initialize chat messages
			}
			let chat = document.querySelector(`#${group.id.trim()}`);
		
			chat.addEventListener('click', (e) => {
				// reset messageListener
				if(messageListener != undefined){
					messageListener();
					messageListener = undefined;
				}

				_listenToNewMessages(group.id.trim(), user); // register message listener

				const currentChat = localStorage.getItem('currentChat');
				if(currentChat != null){
					chatView.unselect(currentChat);
				}		    
				chatView.select(group.id.trim());
				localStorage.setItem("currentChat", group.id.trim());
				selected = true;
				_initMessages(group.id.trim(), user); // initialize chat messages
			});
		});

		if(!selected){
			chatView.select(groups[0].id.trim());
			localStorage.setItem("currentChat", groups[0].id.trim());
			selected = true;
			_initMessages(groups[0].id.trim(), user);
		}

	}

	async function _initMessages(id, user){
		// resets
		messageCount = 0
		prevCount = 0;
		lastPage = false;
		showPreviousLink = false;
		loaded = false;
		messageView.resetMessagesUI();
		messageView.showPreLoader();
		
		try {
			const messages = await chatModel.getMessagesByGroupId(id, ORDER, MSG_COUNT);
			if(chatModel.snapshot.docs.length == MSG_COUNT){
				lastVisible = chatModel.snapshot.docs[chatModel.snapshot.docs.length-2];
				messages.pop();
			}else{
				lastVisible = chatModel.snapshot.docs[chatModel.snapshot.docs.length-1];
			}

			messageView.showMessageForm();
			messageView.hidePreloader();

			messages.reverse();
			messageView.render(messages);
			//Util.storeInWebStorage(id, messages);
			loaded = true;

		} catch(e) {
			console.error(e);
			messageView.showError(e);
			messageView.showMessageForm();
			messageView.hidePreloader();
		}	
	}

	function _listenToNewMessages(id, user){
		try {
			const bubbleDialog = document.querySelector('#bubble-dialog');
			messageListener = chatModel.prepareMessagesByGroupId(id, ORDER, MSG_COUNT).onSnapshot((querySnapshot) => {
				let currentChat = localStorage.getItem('currentChat');
				let messages = [];
				// listen only to the current chat
				if(loaded && currentChat == id){
					querySnapshot.docChanges().forEach(change =>{
						if(change.type == "added"){
							const data = change.doc.data();
							messages.push(data);
						}
					});
					console.log('listen')
					messageCount = messages.length;

					if(messageCount == 0){
						messageView.showError();
					}
					messageView.append(messages);
					messages = [];
					bubbleDialog.scrollTo(0, bubbleDialog.scrollHeight);	
				}
			});
					
		} catch(e) {
			console.log(e);
		}
	}

	async function _loadMore(id, user){
		if(lastVisible){
			try {
				const bubbleDialog = document.querySelector('#bubble-dialog');
				const prev = chatModel.prepareCertainMessages(id, ORDER, MSG_COUNT).startAfter(lastVisible);
				const snapshot = await prev.get();
				prevCount = snapshot.docs.length;

				if(prevCount > 0){
					const oldMessages = snapshot.docs.map(doc => ({
						...doc.data()
					}));

					if(prevCount == MSG_COUNT){
						lastVisible = snapshot.docs[prevCount-2];
						oldMessages.pop();
					}else{
						lastVisible = snapshot.docs[prevCount-1];
						lastPage = true;
					}
					oldMessages.reverse();
					messageView.prepend(oldMessages);
					bubbleDialog.scrollTop = 5;
				}else{
					lastPage = true;
				}
				messageView.hideLoadMore();
				showPreviousLink = false;
			} catch(e) {
				console.log(e);
			}
		}
	}

	class Chat{
		constructor(user){
			this.user = user;
			chatView = new ChatView(user);
			messageView = new MessageView(user);
		}

		initChatMessageEvents(formRef, inputRef, submitRef){
			const bubbleDialog = document.querySelector('#bubble-dialog');
			const messageForm = document.querySelector(formRef);
	      	const input = document.querySelector(inputRef);
	      	const submit = document.querySelector(submitRef);

	      	input.addEventListener("input", (e) => {
			  messageView.adjustInputHeight(e);
			}, false);

			input.addEventListener('keyup', (e) => {
				messageView.resetInputUI(e);
			});

			submit.addEventListener('click', (e) => {
	      		(async () => {
	      			e.preventDefault();
	      			const groupId = localStorage.getItem('currentChat').trim();
	      			if(groupId){
	      				if(input.value.trim() == 0){
		      				console.log('empty message.');
		      			}else{
		      				try {
		      					const status = await chatModel.commitMessage(groupId, firebase.auth().currentUser.uid, input.value);
								if(status){
									messageForm.reset();
								}
		      				} catch(e) {
		      					console.log(e);
		      				}
		      			}
					}
	      							
				})();
	      	});

	      	bubbleDialog.addEventListener('scroll', (e) => {
				if(bubbleDialog.scrollTop == 0 && !showPreviousLink && !lastPage){
					let prevLink = document.querySelector('#load-more');

					if(prevLink == undefined){
						bubbleDialog.insertAdjacentHTML('afterbegin',
							'<li id="load-more"><i class="fa fa-arrow-up" aria-hidden="true"></i></li>');

						prevLink = document.querySelector('#load-more');
						prevLink.addEventListener('click', e => {
							const groupId = localStorage.getItem('currentChat').trim();
							_loadMore(groupId, this.user);
						});
						showPreviousLink = true;
					}else if(prevLink.classList.contains('remove')){
						messageView.showLoadMore();
						showPreviousLink = true;
					}
				}
			});
		}

		initChatGroups(){
			if(chatListener != undefined){
				chatListener();
			}

			try {
				chatListener = chatModel.prepareGroupByUser({'uid':firebase.auth().currentUser.uid, 'name':this.user.name})
				.onSnapshot(querySnapshot => {
					const groups = [];
					const notifs = [];

					querySnapshot.docChanges().forEach(change =>{

			            if(change.type=="added"){
							const data = change.doc.data();
							groups.push(data);
							      
			            }else if(change.type == "modified"){
			                const data = change.doc.data();
							notifs.push(data);
			            }
			    	});

			    	if(groups.length > 0){
			    		_initChatWindow(groups, this.user);
					}else if(notifs.length > 0){
						notifs.forEach(notif => {
							chatView.update(notif);
						});
					}else{
						messageView.hidePreloader();
						console.log('No group associated with user '+firebase.auth().currentUser.uid);
					}

				});
			} catch(e) {
				console.log(e);
				messageView.hidePreloader();
			}
		
		}
	}

	return Chat;
});