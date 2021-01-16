define([
	'view', 
	'overView', 
	'profileView', 
	'suggestionsView', 
	'p_connectionsView',
	'userModel',
	'routes',
	'css!css/app',
	'css!css/profile',
	], (View, Overview, ProfileView, SuggestionsView, ConnectionView, UserModel, routes)=>{
	
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	const HOME_TAB = 'tab-1';
	let _contentId;;

	return class Profile{
		constructor(state, router){
			this.state = state;
			this.router = router;

			_contentId = HOME_TAB;
			const currentTab = document.querySelector('#tabs li');
			View.addActive(currentTab);

			const logout = document.querySelector('#logout');
			logout.addEventListener('click', () => {
				firebase.auth().signOut()
				.then(() => {
					const path = '/login';
					document.location.href = `${DOMAIN}#${path}`;
					View.removeMenu();
					this.router.setRoute(routes);
					this.router.load(path);
					localStorage.clear();
					sessionStorage.clear();
				}).catch(err => {
					console.log(err);
				});
			});
		}

		initViews(){
			this.initOverview();
			this.initTabs();
			this.initTabContents();
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
			const users = await _userModel.getAllUsersExcept(this.state.uid);
			const suggestions = await _userModel.fetchNotFollowingUsers(users);
			suggestionsView.render(suggestions);
			this.initSuggestionsEvents();
		}

		async initConnections(){
			try {
				const p_connectionsView = new ConnectionView(this.state);

				const following = await _userModel.getAllFollowing(this.state.uid);
				const followingUsers = await _userModel.fetchMembers(following);

				if(followingUsers){
					p_connectionsView.render('following', followingUsers);
				}

				const follower = await _userModel.getAllFollowers(this.state.uid);
				const followerUsers = await _userModel.fetchMembers(follower);

				if(followerUsers){
					p_connectionsView.render('follower', followerUsers);
				}

			} catch(e) {
				console.log(e);
			}
		}

		initTabs(){
			const tabs = document.querySelector('#tabs');
			if(firebase.auth().currentUser.uid == this.state.uid){
				tabs.innerHTML = `
				<ul>
					<li class="active" data-content="tab-1">My Profile</li>
					<li data-content="tab-2">My Connections</li>
					<li data-content="tab-3">Services</li>
					<li data-content="tab-4">Account Settings</li>
				</ul>`;
			}else{
				tabs.innerHTML = `
				<ul>
					<li class="active" data-content="tab-1">Profile</li>
					<li data-content="tab-2">Connections</li>
					<li data-content="tab-3">Services</li>
				</ul>`;
			}
		}

		initTabContents(){
			const content = document.querySelector('#tab-content');
			if(firebase.auth().currentUser.uid == this.state.uid){
				if(suggestions.classList.contains('remove')){
					suggestions.classList.remove('remove');
				}
				this.initSuggestions();
			}else{
				const suggestions = document.querySelector('#tab-content #suggestions');
				suggestions.classList.add('remove');
			}

			this.initProfile();
			this.initConnections();
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
					if(suggestions){
						if(contentId != HOME_TAB){
							suggestions.style.display = 'none';
						}else{
							suggestions.style.display = 'block';
						}
					}

					tabContent.style.display = 'flex';
					_contentId = contentId;
				});
			});
		}

		initSuggestionsEvents(){
			const suggestions = document.querySelectorAll('#suggestions ul li .avatar');
			suggestions.forEach(user => {
				user.addEventListener('click', e => {
					const id = e.target.parentElement.getAttribute('id');
					this.router.changePath(`/profile/${id}`); 
				});
			});
			const follow = document.querySelectorAll('#suggestions ul li .follow');
			follow.forEach(user => {
				user.addEventListener('click', e => {
					e.preventDefault();
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