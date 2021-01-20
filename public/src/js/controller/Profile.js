define([
	'view', 
	'overView', 
	'profileView', 
	'suggestionsView', 
	'p_connectionsView',
	'userModel',
	'chatModel',
	'routes',
	'util',
	'dateView',
	'css!css/app',
	'css!css/profile',
	'css!css/modal'
	], (View, Overview, ProfileView, SuggestionsView, ConnectionView, UserModel, ChatModel, routes, Util, DateView)=>{
	
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	const _chatModel = new ChatModel(firebase.firestore());

	let _profileView;

	const HOME_TAB = 'tab-1';
	let _contentId;
	let _selected;

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
					console.log(err.message);
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
			this.initChatStatus(this.state);
		}

		initProfile(){
			_profileView = new ProfileView(this.state);
			_profileView.render();
			if(firebase.auth().currentUser.uid == this.state.uid){
				this.initEducationModalEvents();
				this.initBioModalEvents();
				this.initWorkplaceModalEvents();
			}
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
			/*if(firebase.auth().currentUser.uid == this.state.uid){
				if(suggestions.classList.contains('remove')){
					suggestions.classList.remove('remove');
				}
				this.initSuggestions();
			}else{
				const suggestions = document.querySelector('#tab-content #suggestions');
				suggestions.classList.add('remove');
			}*/

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
						console.log(err.message);
					});
				});
			});
		}

		async initChatStatus(user){
			try {
				let invitation = await _chatModel.getInvitation(firebase.auth().currentUser.uid, user.uid);

				let chat = document.querySelector('#profile-overview .chat');

				if(invitation.length > 0){
					invitation= invitation[0];
					if(invitation.accept){
						chat.setAttribute('src', 'src/assets/message.png');
						chat.dataset.chat = 'chat';
							
					}else{
						chat.setAttribute('src', 'src/assets/pending.png');
						chat.dataset.chat = 'pending';
					}
				}

				if(chat){
					chat.addEventListener('click', e => {
						(async()=>{
							try {
								if(chat.dataset.chat == 'invite'){
									let status = await _chatModel.invite(firebase.auth().currentUser.uid, user.uid);
									if(status){
										chat.setAttribute('src', 'src/assets/pending.png');
										chat.dataset.chat = 'pending';
									}
								}else if(chat.dataset.chat == 'chat'){
									if(firebase.auth().currentUser.uid != user.uid){
										const currentUser = await _userModel.getUser(firebase.auth().currentUser.uid);
										if(currentUser && 
											(currentUser.groups || currentUser.groups.length) && 
											(user.groups || user.groups.length)){
											const groups = Util.getMatchesFromArray(currentUser.groups, user.groups);
											if(groups.length > 0){
												const groupId = groups[0];
												this.router.changePath(`/chat/${groupId}`);
											}
										}
									}
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

		initBioModalEvents(){
			const text = document.querySelector("#form-bio textarea");
			let oldText = this.state.bio;
			if(this.state.bio){
				text.value = this.state.bio;
			}
			
			const wordCount = document.querySelector("#count #current");
			wordCount.innerText = text.value.length;
			const limit = 600;

			text.addEventListener("keyup",function(){
				const characters = text.value.split('');
				wordCount.innerText = characters.length;

				if(characters.length > limit){
					text.value = text.value.substring(0,limit);
					wordCount.innerText = limit;
				}
			});

			this.initModalEvents('#modal-bio', '#edit-bio', '#form-bio', function(){
				return (async () => {
					if(text.value.length == 0){
						console.log('Empty field');
						return false;
					}else if(oldText == text.value){
						console.log('No changes');
						return false;
					}else{
						try {
							const status = await _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, {bio: text.value});
								
							if(status){
								console.log('Update successful');
								_profileView.updateBio(text.value);
								oldText = text.value;
								return true;
							}

							return false;
						} catch(e) {
							console.log(e);
							return false;
						}
					}
					})();

				}, function(){
					if(text.value.length == 0 && oldText){
						text.value = oldText;
					}
				return false;
			});
		}

		initEducationModalEvents(){
			const name = document.querySelector('#school-name');
			const acad = document.querySelector('#acad');
			const degree = document.querySelector('#degree');
			const course = document.querySelector('#course');
			const since = document.querySelector('#since');
			const college = since.querySelector('#college');
			const highschool = since.querySelector('#highschool');
			const selectHighschool = document.querySelector('#add-highschool');
			const selectCollege = document.querySelector('#add-college');

			selectCollege.addEventListener('click', () => {
				if(name.classList.contains('remove')){
					name.classList.remove('remove');
				}

				if(since.classList.contains('remove')){
					since.classList.remove('remove');
				}

				acad.style.display = 'flex';
				college.style.display = 'block';
				highschool.style.display = 'none';

				name.setAttribute('placeholder','College name');
				_selected = 'college';
			});

			let selectStartYear = document.querySelector('#college .start .year');
			let selectStartMonth =  document.querySelector('#college .start .month');
			let selectStartDay = document.querySelector('#college .start .day');

			let startDate = new DateView(selectStartYear, selectStartMonth, selectStartDay);

			let selectEndYear = document.querySelector('#college .end .year');
			let selectEndtMonth =  document.querySelector('#college .end .month');
			let selectEndDay = document.querySelector('#college .end .day');

			let endDate = new DateView(selectEndYear, selectEndtMonth, selectEndDay);


			selectHighschool.addEventListener('click', () => {
				if(name.classList.contains('remove')){
					name.classList.remove('remove');
				}

				if(since.classList.contains('remove')){
					since.classList.remove('remove');
				}

				acad.style.display = 'none';

				college.style.display = 'none';
				highschool.style.display = 'flex';

				name.setAttribute('placeholder','HighSchool name');
				_selected = 'highschool';
			});

			let selectEndYearHighschool = document.querySelector('#highschool .year');
			let endDateHighSchool = new DateView(selectEndYearHighschool);
			
			this.initModalEvents('#modal-education', '#edit-education', '#form-education',
				function(){

					let data = {
						education:{
							college:{}
						}
					};

					if(_selected == undefined){
						console.log('Please select an education level');
						return false;
					}else if(_selected == 'college'){
						if(name.value.length == 0){
							console.log('Empty school name');
							return false;
						}else if(degree.value == 'empty'){
							console.log('Select a degree');
							return false;
						}else if(course.value.length == 0){
							console.log('Empty course');
							return false;
						}

						if(!((selectStartYear.value == 'empty' && 
							 selectStartMonth.value == 'empty' &&
							 selectStartDay.value == 'empty') || 
							(selectStartYear.value != 'empty' && 
							 selectStartMonth.value != 'empty' && 
							 selectStartDay.value != 'empty'))){

							console.log('Incomplete fields');
							return false;
						}else{
							if(selectStartYear.value != 'empty' && 
								selectStartMonth.value != 'empty' && 
								selectStartDay.value != 'empty'){
								data.education.college.start = {
									year: selectStartYear.value,
									month: selectStartMonth.value, 
									day: selectStartDay.value
								}
							}
						}


						if(!((selectEndYear.value == 'empty' && selectEndtMonth.value == 'empty' && selectEndDay.value == 'empty') || 
							(selectEndYear.value != 'empty' && selectEndtMonth.value != 'empty' && selectEndDay.value != 'empty'))){
							console.log('Incomplete fields');
							return false;
						}else{
							if(selectEndYear.value != 'empty' && selectEndtMonth.value != 'empty' && selectEndDay.value != 'empty'){
								data.education.college.end = {
									year: selectEndYear.value,
									month: selectEndtMonth.value, 
									day: selectEndDay.value
								}
							}
						}

						data.education.college.name = name.value;
						data.education.college.course = course.value;

						return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data).then(() => {
							console.log('Update successful');
							_profileView.updateCollege(data);
							return true;
						}).catch(err => {
							console.log(err.message);
							return false;
						});

					}else if(_selected == 'highschool'){
						let data = {
							education:{
								highschool:{}
							}
						};

						if(name.value.length == 0){
							console.log('Empty school name');
							return false;
						}

						
						if(selectEndYearHighschool.value != 'empty'){
							data.education.highschool.end = {
								year: selectEndYearHighschool.value
							}
						}

						data.education.highschool.name = name.value;

						return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data).then(() => {
							console.log('Update successful');
							_profileView.updateHighSchool(data);
							return true;
						}).catch(err => {
							console.log(err.message);
							return false;
						});
					}
					return false;
			});
		}

		initWorkplaceModalEvents(){
			const name = document.querySelector('#workplace-name');
			const position = document.querySelector('#workplace-position');
			const description = document.querySelector('#workplace-description');

			let selectStartYear = document.querySelector('#workplace-since .start .year');
			let selectStartMonth =  document.querySelector('#workplace-since .start .month');
			let selectStartDay = document.querySelector('#workplace-since .start .day');
			let startDate = new DateView(selectStartYear, selectStartMonth, selectStartDay);

			let selectEndYear = document.querySelector('#workplace-since .end .year');
			let selectEndtMonth =  document.querySelector('#workplace-since .end .month');
			let selectEndDay = document.querySelector('#workplace-since .end .day');
			let endDate = new DateView(selectEndYear, selectEndtMonth, selectEndDay);

			this.initModalEvents('#modal-workplace', '#edit-workplace', '#form-workplace', function(){
				let data = {
					workplace:{

					}
				};

				if(name.value.length == 0){
					console.log('Empty workplace name');
					return false;
				}

				data.workplace.name =  name.value;

				if(position.value){
					data.workplace.position =  position.value;
				}

				if(description.value){
					data.workplace.description =  description.value;
				}

				if(!((selectStartYear.value == 'empty' && 
					selectStartMonth.value == 'empty' &&
					selectStartDay.value == 'empty') || 
					(selectStartYear.value != 'empty' && 
					selectStartMonth.value != 'empty' && 
					selectStartDay.value != 'empty'))){
						console.log('Incomplete fields');
						return false;
				}else{
					if(selectStartYear.value != 'empty' && 
						selectStartMonth.value != 'empty' && 
						selectStartDay.value != 'empty'){
						data.workplace.start = {
							year: selectStartYear.value,
							month: selectStartMonth.value, 
							day: selectStartDay.value
						}
					}
				}


				if(!((selectEndYear.value == 'empty' && selectEndtMonth.value == 'empty' && selectEndDay.value == 'empty') || 
					(selectEndYear.value != 'empty' && selectEndtMonth.value != 'empty' && selectEndDay.value != 'empty'))){
						console.log('Incomplete fields');
						return false;
				}else{
					if(selectEndYear.value != 'empty' && selectEndtMonth.value != 'empty' && selectEndDay.value != 'empty'){
						data.workplace.end = {
							year: selectEndYear.value,
							month: selectEndtMonth.value, 
							day: selectEndDay.value
						}
					}
				}

				return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data).then(() => {
					console.log('Update successful');
					_profileView.updateWorkplace(data);
					return true;
				}).catch(err => {
					console.log(err.message);
					return false;
				});
			});
		}

		initModalEvents(modalRef, editRef, formRef, onSave, onFinish){
			const modal = document.querySelector(modalRef);
			const edit = document.querySelector(editRef);
			const close = document.querySelector(`${modalRef} .close-btn`);
			const form = document.querySelector(formRef);
			const save = document.querySelector(`${modalRef} .save`);
			const cancel = document.querySelector(`${modalRef} .cancel`);

			edit.addEventListener('click', () => {
				modal.style.display = 'flex';
			});

			close.addEventListener('click', () => {
				modal.style.display = 'none';
				if(typeof onFinish == 'function'){
					if(onFinish()){
						form.reset();
					}
				}else{
					form.reset();
				}
			});

			cancel.addEventListener('click', () => {
				modal.style.display = 'none';
				if(typeof onFinish == 'function'){
					if(onFinish()){
						form.reset();
					}
				}else{
					form.reset();
				}
			});


			save.addEventListener('click', () => {
				(async () => {
					const status = await onSave();
					if(status){
						modal.style.display = 'none';
						if(typeof onFinish == 'function'){
							if(onFinish()){
								form.reset();
							}
						}else{
							form.reset();
						}
					}
				})();
			});

			window.onclick = function(event) {
			  if (event.target == modal) {
			    modal.style.display = 'none';
			    form.reset();
			  }
			}
		}
	}
});