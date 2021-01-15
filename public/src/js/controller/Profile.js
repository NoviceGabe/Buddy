define([
	'view', 
	'overView', 
	'profileView', 
	'suggestionsView', 
	'p_connectionsView',
	'userModel',
	'css!css/app',
	'css!css/profile',
	], (View, Overview, ProfileView, SuggestionsView, ConnectionView, UserModel)=>{
	
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	const HOME_TAB = 'tab-1';
	let _contentId = HOME_TAB;


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
				const p_connectionsView = new ConnectionView(this.state);

				const following = await _userModel.getAllFollowing(firebase.auth().currentUser.uid);
				const followingUsers = await _userModel.fetchMembers(following);

				if(followingUsers){
					p_connectionsView.render('following', followingUsers);
				}

				const follower = await _userModel.getAllFollowers(firebase.auth().currentUser.uid);
				const followerUsers = await _userModel.fetchMembers(follower);

				if(followerUsers){
					p_connectionsView.render('follower', followerUsers);
				}

			} catch(e) {
				console.log(e);
			}
		}

		initTabEvents(){
			const tabs = document.querySelectorAll('#tabs li');
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
					if(contentId != HOME_TAB){
						suggestions.style.display = 'none';
					}else{
						suggestions.style.display = 'block';
					}
					tabContent.style.display = 'flex';
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