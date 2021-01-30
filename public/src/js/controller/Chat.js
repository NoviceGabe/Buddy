define([
	'util', 
	'userModel', 
	'chatModel', 
	'chatComponent', 
	'messageComponent',
	'invitationComponent',
	'css!css/chat',
	'css!css/bubble'

	], (Util, UserModel, ChatModel, ChatComponent, MessageComponent, InvitationComponent) => {

	let lastVisible = null;
	let loaded = false;
	let selected = false;
	let showPreviousLink = false;
	let messageCount = 0;
	let prevCount = 0;
	let lastPage = false;

	const _chatModel = new ChatModel(firebase.firestore());
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());

	let _chatView;
	let _messageView;
	let _invitationView;

	let count = 0;

	let chatListener;
	let messageListener;

	let _invitations;

	let _router;

	const _initChatWindow = async (groups, user) => {
		// reset messageListener
		if(messageListener != undefined){
			messageListener();
			messageListener = undefined;
		}

		const groups2 = await _userModel.mergeMemberDataFromGroup(groups);
		_chatView.render(groups2);

		let currentChat = localStorage.getItem('currentChat');

		if(sessionStorage.getItem('method')){
			currentChat = sessionStorage.getItem('method');
			sessionStorage.removeItem('method');
		}
		groups.forEach(group => {
			if(currentChat != null && currentChat == group.id.trim()){
				if(messageListener == undefined){
					_listenToNewMessages(group.id, user); // register message listener
				}
				_chatView.select(group.id.trim());
				selected = true;
				_initMessages(localStorage.getItem('currentChat'), user); // initialize chat messages
			}
			let chat = document.getElementById(group.id.trim());
			let avatar = chat.querySelector('img');
		
			chat.addEventListener('click', (e) => {
				// reset messageListener
				if(messageListener != undefined){
					messageListener();
					messageListener = undefined;
				}

				_listenToNewMessages(group.id.trim(), user); // register message listener

				const currentChat = localStorage.getItem('currentChat');
				if(currentChat != null){
					_chatView.unselect(currentChat);
				}		    
				_chatView.select(group.id.trim());
				localStorage.setItem("currentChat", group.id.trim());
				selected = true;
				_initMessages(group.id.trim(), user); // initialize chat messages
			});

			avatar.addEventListener('click', e => {
				e.preventDefault();
				e.stopPropagation();
				const user = group.members.find(member => member.uid != firebase.auth().currentUser.uid);
				_router.navigate(`profile/${user.uid}`);
			});
		});

		if(!selected){
			_chatView.select(groups[0].id.trim());
			localStorage.setItem("currentChat", groups[0].id.trim());
			selected = true;
			_initMessages(groups[0].id.trim(), user);
		}
	}

	const _initInvitation = async (invitations) => {
		_messageView.showPreLoader();
		_invitationView.showInvitationWindow();

		const users = [];

		for(let invitation of invitations){
			let user = await _userModel.getUser(invitation.createdBy);
			user.invitation = invitation;
			users.push(user);
		}

		_invitationView.render(users);
		_initInvitationEvents();
		_messageView.hidePreloader();
	}

	const _initInvitationEvents = async () => {
		const accept = document.querySelectorAll('#invitation-dialog .accept');
		const decline = document.querySelectorAll('#invitation-dialog .decline');
		const avatar = document.querySelectorAll('#invitation-dialog li img');

		accept.forEach(invitation => {
			invitation.addEventListener('click', e => {
				(async()=>{
					try {
						const li = e.target.parentElement.parentElement;
						const parent = li.parentElement;
						const id = li.id.trim();
						const name = li.querySelector('.name').innerText.trim();

						// check first if invitation was already accepted
						const invitation = await _chatModel.getInvitation(id, firebase.auth().currentUser.uid);
						if(invitation && !invitation.accept){
							const group = {};
							group.members = [{
											 uid:id,
											 name: name
										},{
											 uid:firebase.auth().currentUser.uid,
											 name: firebase.auth().currentUser.displayName
										}];

							group.name = '';
							_chatModel.accept(id, firebase.auth().currentUser.uid, group).then(groupId => {
								const invitationId = _setDocId(id, firebase.auth().currentUser.uid);
								_invitations = _invitations.filter(invitation => invitation.id != invitationId);
								parent.removeChild(li);
							}).catch(err => {
								console.log(err);
							});

						}else{
							console.log('Unknown error occured');
						}

					} catch(e) {
						console.log(e);
					}
				})();
				
			});
		});

		decline.forEach(invitation => {
			invitation.addEventListener('click', e => {
				(async()=>{
					const li = e.target.parentElement.parentElement;
					const parent = li.parentElement;
					const id = li.getAttribute('id').trim();
					_chatModel.decline(id, firebase.auth().currentUser.uid).then(() => {
						const invitationId = _setDocId(id, firebase.auth().currentUser.uid);
						_invitations = _invitations.filter(invitation => invitation.id != invitationId);
						parent.removeChild(li);
					});
				})();
			});
		});

		avatar.forEach(invitation => {
			invitation.addEventListener('click', e => {
				(async () => {
					const li = e.target.parentElement;
					const id = li.id.trim();
					_router.changePath(`/profile/${id}`);
				})();
			});
		});
	}

	const _initMessages = async (id, user) => {
		// resets
		messageCount = 0
		prevCount = 0;
		lastPage = false;
		showPreviousLink = false;
		loaded = false;
		_messageView.resetMessagesUI();
		_messageView.showPreLoader();
		
		const invitation = document.querySelector('#invitation-dialog');
		invitation.classList.add('remove');
		const bubble = document.querySelector('#bubble-dialog');
		if(bubble.classList.contains('remove')){
			bubble.classList.remove('remove');
		}
		_messageView.showMessageForm();

		try {
			const messages = await _chatModel.getMessagesByGroupId(id, ORDER, MSG_COUNT);
			if(_chatModel.snapshot.docs.length == MSG_COUNT){
				lastVisible = _chatModel.snapshot.docs[_chatModel.snapshot.docs.length-2];
				messages.pop();
			}else{
				lastVisible = _chatModel.snapshot.docs[_chatModel.snapshot.docs.length-1];
			}

			_messageView.showMessageForm();
			_messageView.hidePreloader();

			messages.reverse();
			_messageView.render(messages);
			//Util.storeInWebStorage(id, messages);
			loaded = true;

		} catch(e) {
			console.error(e);
			_messageView.showError(e);
			_messageView.showMessageForm();
			_messageView.hidePreloader();
		}	
	}

	const _listenToNewMessages = (id, user) => {
		try {
			const bubbleDialog = document.querySelector('#bubble-dialog');
			messageListener = _chatModel.prepareMessagesByGroupId(id, ORDER, MSG_COUNT).onSnapshot((querySnapshot) => {
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
						_messageView.showError();
					}
					_messageView.append(messages);
					messages = [];
					bubbleDialog.scrollTo(0, bubbleDialog.scrollHeight);	
				}
			});
					
		} catch(e) {
			console.log(e);
		}
	}

	const _loadMore = async (id) => {
		if(lastVisible){
			try {
				const bubbleDialog = document.querySelector('#bubble-dialog');
				const prev = _chatModel.prepareCertainMessages(id, ORDER, MSG_COUNT).startAfter(lastVisible);
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
					_messageView.prepend(oldMessages);
					bubbleDialog.scrollTop = 5;
				}else{
					lastPage = true;
				}
				_messageView.hideLoadMore();
				showPreviousLink = false;
			} catch(e) {
				console.log(e);
			}
		}
	}

	const _setDocId = (initiatorId, receiverId) => {
		let id;
		if(initiatorId < receiverId){
			id = `${initiatorId}_${receiverId}`;
		}else{
			id = `${receiverId}_${initiatorId}`;
		}

		return id;
	}

	const _initChatMessageEvents = () => {
			const bubbleDialog = document.querySelector('#bubble-dialog');
			const messageForm = document.querySelector('#message-form');
	      	const input = document.querySelector('#message-input');
	      	const submit = document.querySelector('#submit');

	      	input.addEventListener("input", (e) => {
			  _messageView.adjustInputHeight(e);
			}, false);

			input.addEventListener('keyup', (e) => {
				_messageView.resetInputUI(e);
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
		      					const status = await _chatModel.commitMessage(groupId, firebase.auth().currentUser.uid, input.value);
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
							_loadMore(groupId);
						});
						showPreviousLink = true;
					}else if(prevLink.classList.contains('remove')){
						_messageView.showLoadMore();
						showPreviousLink = true;
					}
				}
			});
		}

	const _initChatGroups = async (state) => {

			try {

				_invitations = await _chatModel.getAllInvitations(firebase.auth().currentUser.uid);

				_invitationView.chatRequestViewState(_invitations);

				const request = document.querySelector('#chat-request');

				request.addEventListener('click', e =>{
					_messageView.hideMessageWindow();
					_initInvitation(_invitations);
				});

				if(chatListener != undefined){
					chatListener();
				}

				chatListener = _chatModel
				.prepareGroupByUser({
					'uid': firebase.auth().currentUser.uid, 
					'name': state.name})
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
			    		_initChatWindow(groups, state);
					}else if(notifs.length > 0){
						notifs.forEach(notif => {
							_chatView.update(notif);
						});
					}else{
						_messageView.hidePreloader();
						_messageView.showError('You don\'t have group chats yet.');
					}

				});
			} catch(e) {
				console.log(e);
				_messageView.hidePreloader();
			}
		}

	return class Chat{
		constructor(state, router){

			this.state = state;
			_router = router;
			_chatView = new ChatComponent(state);
			_messageView = new MessageComponent(state);
			_invitationView = new InvitationComponent();

			_initChatGroups(this.state);
			_initChatMessageEvents();
		}
	}
});