define([
	'view', 
	'overView', 
	'profileView', 
	'suggestionsView', 
	'connectionView',
	'userModel'
	], (View, Overview, ProfileView, SuggestionsView, ConnectionView, UserModel)=>{
	
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	let _contentId = 'tab-profile-content';

	return class Profile{
		constructor(state){
			this.state = state;
		}

		initViews(){
			this.initOverview();
			this.initProfile();
			this.initSuggestions();
			this.initConnections();
		}

		initOverview(){
			const overView = new Overview(this.state);
			overView.render();
		}

		initProfile(){
			const profileView = new ProfileView(this.state);
			profileView.render();
		}

		async initSuggestions(){
			const suggestionsView = new SuggestionsView(this.state);
			const users = await _userModel.getAllUsersExcept(firebase.auth().currentUser.uid);
			const suggestions = await _userModel.fetchNotFollowingUsers(users);
			suggestionsView.render(suggestions);
			this.initSuggestionsEvents();
		}

		async initConnections(){
			try {
				const connectionView = new ConnectionView(this.state);

				const following = await _userModel.getAllFollowing(firebase.auth().currentUser.uid);
				const followingUsers = await _userModel.fetchMembers(following);

				if(followingUsers){
					connectionView.render('following', followingUsers);
				}

				const follower = await _userModel.getAllFollowers(firebase.auth().currentUser.uid);
				const followerUsers = await _userModel.fetchMembers(follower);

				if(followerUsers){
					connectionView.render('follower', followerUsers);
				}

			} catch(e) {
				console.log(e);
			}
		}

		initTabEvents(){
			const tabs = document.querySelectorAll('#profile-tabs li');
			tabs.forEach(tab => {
				tab.addEventListener('click', e => {
					const currentTab = e.target;
					View.addActive(currentTab);
					const contentId = currentTab.dataset.content;
					const tabContent = document.querySelector(`#${contentId}`);
					if(contentId != _contentId){
						document.querySelector(`#${_contentId}`).style.display = 'none';
					}
					const suggestions = document.querySelector('#suggestions');
					if(contentId != 'tab-profile-content'){
						suggestions.style.display = 'none';
					}else{
						suggestions.style.display = 'block';
					}
					tabContent.style.display = 'block';
					_contentId = contentId;
				});
			});
		}

		initSuggestionsEvents(){
			const suggestions = document.querySelectorAll('#suggestions ul li .follow');
			suggestions.forEach(user => {
				user.addEventListener('click', e => {
					const id = e.target.parentElement.getAttribute('id');
					_userModel.follow(firebase.auth().currentUser.uid.trim(), id.trim()).then(() => {
						user.setAttribute('src', '');
						console.log('followed '+id)
					}).catch(err => {
						console.log(err)
					});
				});
			});
			
		}
	}
});