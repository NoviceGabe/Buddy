define([
	'userModel',
	 'chatModel', 
	 'c_connectionsView', 
	 'css!css/connections'
	 ], (UserModel, ChatModel, ConnectionsView)=>{
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	const _chatModel = new ChatModel(firebase.firestore());

	return class Connections{
		constructor(state, router){
			this.state = state;
			this.router = router;
		}

		initViews(){
			const ref = sessionStorage.getItem('method');
			if(ref == 'following'){
				this.initFollowing();
			}else{
				this.initFollower();
			}
		}

		async initFollowing(){
			const following = await _userModel.getAllFollowing(this.state.uid);
			const followingUsers = await _userModel.fetchMembers(following);

			if(followingUsers){
				const connectionsView = new ConnectionsView(this.state);
				connectionsView.render('following', followingUsers, 'all');
			}

			const list = document.querySelectorAll('#following li .view');
			list.forEach(element => {
				element.addEventListener('click', e => {
					const id = e.target.parentElement.parentElement.getAttribute('id');
					this.router.changePath(`/profile/${id}`); 
				});
			});

			this.initChatStatus(followingUsers);
		}

		async initFollower(){
			const followers = await _userModel.getAllFollowers(this.state.uid);
			const followerUsers = await _userModel.fetchMembers(followers);

			if(followerUsers){
				const connectionsView = new ConnectionsView(this.state);
				connectionsView.render('follower', followerUsers, 'all');
			}

			const list = document.querySelectorAll('#follower li .view');
			list.forEach(element => {
				element.addEventListener('click', e => {
					const id = e.target.parentElement.parentElement.getAttribute('id');
					this.router.changePath(`/profile/${id}`); 
				});
			});

			this.initChatStatus(followerUsers);
		}

		async initChatStatus(users){
			try {
				for(let user of users){
					let invitation = await _chatModel.getInvitation(firebase.auth().currentUser.uid, user.uid);

					let listItem = document.getElementById(user.uid);
					let listItemIcon = listItem.querySelector('.chat');

					if(invitation.length > 0){
						invitation= invitation[0];
						if(invitation.accept){
							listItemIcon.setAttribute('src', 'src/assets/message.png');
							listItem.dataset.chat = 'chat';
							
						}else{
							listItemIcon.setAttribute('src', 'src/assets/pending.png');
							listItem.dataset.chat = 'pending';
						}
					}

					listItemIcon.addEventListener('click', e => {
						(async()=>{
							try {
								if(listItem.dataset.chat == 'invite'){
									let status = await _chatModel.invite(firebase.auth().currentUser.uid, user.uid);

									if(status){
										listItemIcon.setAttribute('src', 'src/assets/pending.png');
										listItem.dataset.chat = 'pending';
									}
								}else if(listItem.dataset.chat == 'chat'){
									console.log('chat '+user.uid);
								}
							} catch(e) {
								console.log(e);
							}
						})();
					});
				}
			} catch(e) {
				console.log(e);
			}
		}

	}
});