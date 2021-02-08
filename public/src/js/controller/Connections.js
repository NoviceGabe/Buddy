define([
    'userModel',
    'chatModel',
    'c_connectionsComponent',
    'util',
    'css!css/connections'
], (UserModel, ChatModel, ConnectionsComponent, Util) => {

    const _userModel = new UserModel(firebase.firestore(), firebase.auth());
    const _chatModel = new ChatModel(firebase.firestore());
    let _connectionsComponent;

    let _state;
    let _router;

    const _initViews = () => {
        const fragment = _router.getFragment().split('/');

        if (fragment[1] == FOLLOWING) {
            _initFollowing();
        } else if (fragment[1] == FOLLOWER) {
            _initFollower();
        }
    }

    const _initFollowing = async () => {
        const header = document.querySelector('#ref');

       	const today = new Date()
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const week = new Date(today);
        week.setDate(week.getDate() - 7);

       const recent = await _userModel.fetchMembersFromFollowingByDate(_state.uid, ORDER, week);
        if (recent && recent.length) {
            _connectionsComponent.render(FOLLOWING, recent, 'recent');
        }

        const view1 = document.querySelectorAll('#recent .view');
        view1.forEach(element => {
            element.addEventListener('click', e => {
                const id = e.target.parentElement.parentElement.parentElement.getAttribute('class').trim();
                if (id) {
                    _router.navigate(`profile/${id}`);
                }
            });
        });

        _initChatStatus(recent, 'recent');

        const all = await _userModel.fetchMembersFromFollowing(_state.uid, ORDER);
        let count = all.length || 0;
        header.innerText = `Following (${count})`;

        if (all && all.length) {
            _connectionsComponent.render(FOLLOWING, all);
        }

        const view2 = document.querySelectorAll('#all .view');
        view2.forEach(element => {
            element.addEventListener('click', e => {
                const id = e.target.parentElement.parentElement.parentElement.getAttribute('class').trim();
                if (id) {
                    _router.navigate(`profile/${id}`);
                }
            });
        });

        _initChatStatus(all);

         _initFollowingStatus(all);

       const unfollow = document.querySelectorAll('#connections-container .unfollow');

        unfollow.forEach(element => {
            element.addEventListener('click', e => {
                const li = e.target.parentElement.parentElement.parentElement;
                const parent = li.parentElement;
                const id = li.getAttribute('class').trim();
                const name = li.querySelector('.col-1 > div h5').textContent;

                _userModel.getFollowing(firebase.auth().currentUser.uid, id)
                .then(data => {
                	if(data){
                		return _userModel.unfollow(firebase.auth().currentUser.uid, id).then(() => {
		                    const ul = document.querySelectorAll('#connections-container ul');

			                ul.forEach(element => {
			                	 const toBeRemoved = element.querySelector(`.${id}`);
			                	 element.removeChild(toBeRemoved);
			                });

		                    count--;
		                    header.innerText = `Followers (${count})`;
		                });
                	}

                	throw new Error('Unable to process action.');
                })
                .then(() => {
                	console.log(`You have unfollowed ${name}`);
                })
                .catch(err => {
                    console.log(err);
                });              
            });
        });

        const follow = document.querySelectorAll('#connections-container .follow');

        follow.forEach(element => {
            element.addEventListener('click', e => {
                const li = e.target.parentElement.parentElement.parentElement;
                const parent = li.parentElement;
                const id = li.getAttribute('class').trim();
                const name = li.querySelector('.col-1 > div h5').textContent;

                _userModel.getFollowing(firebase.auth().currentUser.uid, id)
                .then(data => {
                	if(!data){
                		return _userModel.follow(firebase.auth().currentUser.uid, id).then(() => {
		                    const li = document.querySelectorAll(`#connections-container .${id}`);

		                    li.forEach(element => {
		                    	let followBtn = element.querySelector('.follow');
		                    	if(following && followBtn){
				                	followBtn.classList.remove('follow');
				                	followBtn.classList.add('unfollow');
				                	followBtn.innerText = 'Unfollow';
				                }

		                    });

		                    count++;
		                    header.innerText = `Followers (${count})`;
		                });
                	}

                	throw new Error('Unable to process action.');
                })
                .then(() => {
                	console.log(`You have followed ${name}`);
                })
                .catch(err => {
                    console.log(err);
                });              
            });
        });
    }


    const _initFollower = async () => {
         const header = document.querySelector('#ref');

       	const today = new Date()
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const week = new Date(today);
        week.setDate(week.getDate() - 7);

       const recent = await _userModel.fetchMembersFromFollowersByDate(_state.uid, ORDER, week);
       console.log(recent)
        if (recent && recent.length) {
            _connectionsComponent.render(FOLLOWER, recent, 'recent');
        }

        const view1 = document.querySelectorAll('#recent .view');
        view1.forEach(element => {
            element.addEventListener('click', e => {
                const id = e.target.parentElement.parentElement.parentElement.getAttribute('class').trim();
                if (id) {
                    _router.navigate(`profile/${id}`);
                }
            });
        });

        _initChatStatus(recent, 'recent');
        _initFollowingStatus(recent, 'recent');

        const all = await _userModel.fetchMembersFromFollowers(_state.uid, ORDER);
        let count = all.length || 0;
        header.innerText = `Followers (${count})`;

        if (all && all.length) {
            _connectionsComponent.render(FOLLOWER, all);
        }

        const view2 = document.querySelectorAll('#all .view');
        view2.forEach(element => {
            element.addEventListener('click', e => {
                const id = e.target.parentElement.parentElement.parentElement.getAttribute('class').trim();
                if (id) {
                    _router.navigate(`profile/${id}`);
                }
            });
        });

        _initChatStatus(all);

        _initFollowingStatus(all);

        const unfollow = document.querySelectorAll('#connections-container .unfollow');

        unfollow.forEach(element => {
            element.addEventListener('click', e => {
                const li = e.target.parentElement.parentElement.parentElement;
                const parent = li.parentElement;
                const id = li.getAttribute('class').trim();
                const name = li.querySelector('.col-1 > div h5').textContent;

                _userModel.getFollowing(firebase.auth().currentUser.uid, id)
                .then(data => {
                	if(data){
                		return _userModel.unfollow(firebase.auth().currentUser.uid, id).then(() => {
		                    const ul = document.querySelectorAll('#connections-container ul');

			                ul.forEach(element => {
			                	 const toBeRemoved = element.querySelector(`.${id}`);
			                	 element.removeChild(toBeRemoved);
			                });

		                    count--;
		                    header.innerText = `Followers (${count})`;
		                });
                	}

                	throw new Error('Unable to process action.');
                })
                .then(() => {
                	console.log(`You have unfollowed ${name}`);
                })
                .catch(err => {
                    console.log(err);
                });              
            });
        });

        const follow = document.querySelectorAll('#connections-container .follow');

        follow.forEach(element => {
            element.addEventListener('click', e => {
                const li = e.target.parentElement.parentElement.parentElement;
                const parent = li.parentElement;
                const id = li.getAttribute('class').trim();
                const name = li.querySelector('.col-1 > div h5').textContent;

                _userModel.getFollowing(firebase.auth().currentUser.uid, id)
                .then(data => {
                	if(!data){
                		return _userModel.follow(firebase.auth().currentUser.uid, id).then(() => {
		                    const li = document.querySelectorAll(`#connections-container .${id}`);

		                    li.forEach(element => {
		                    	let followBtn = element.querySelector('.follow');
		                    	if(followBtn){
				                	followBtn.classList.remove('follow');
				                	followBtn.classList.add('unfollow');
				                	followBtn.innerText = 'Unfollow';
				                }

		                    });

		                    count++;
		                    header.innerText = `Followers (${count})`;
		                });
                	}

                	throw new Error('Unable to process action.');
                })
                .then(() => {
                	console.log(`You have followed ${name}`);
                })
                .catch(err => {
                    console.log(err);
                });              
            });
        });

    }

    const _initFollowingStatus = async(users, filter = 'all') =>{
    	try {
    		for(let user of users){
    			let following = await _userModel.getFollowing(firebase.auth().currentUser.uid, user.uid);
    			let listItem = document.querySelector(`#${filter} .${user.uid}`);
                let followBtn = listItem.querySelector('.follow');

                if(following && followBtn){
                	followBtn.classList.remove('follow');
                	followBtn.classList.add('unfollow');
                	followBtn.innerText = 'Unfollow';
                }
    		}
    	} catch(e) {
    		console.log(e);
    	}
    }

    const _initChatStatus = async (users, filter = 'all') => {
        try {
            for (let user of users) {
                let invitation = await _chatModel.getInvitation(firebase.auth().currentUser.uid, user.uid);

                let listItem = document.querySelector(`#${filter} .${user.uid}`);
                let listItemIcon = listItem.querySelector('.chat');

                if (invitation.length > 0) {
                    invitation = invitation[0];
                    if (invitation.accept) {
                        listItemIcon.setAttribute('src', 'src/assets/message.png');
                        listItem.dataset.chat = 'chat';

                    } else {
                        listItemIcon.setAttribute('src', 'src/assets/pending.png');
                        listItem.dataset.chat = 'pending';
                    }
                }
                
                if (listItemIcon) {
                    listItemIcon.addEventListener('click', async (e) => {
                        
                         try {
                            if (listItem.dataset.chat == 'invite') {
                                let status = await _chatModel.invite(firebase.auth().currentUser.uid, user.uid);

                                if (status) {
                                        listItemIcon.setAttribute('src', 'src/assets/pending.png');
                                        listItem.dataset.chat = 'pending';
                                }
                            } else if (listItem.dataset.chat == 'chat') {
                            	let currentUser;

                                if (firebase.auth().currentUser.uid != _state.uid) {
	                                currentUser = await _userModel.getUser(firebase.auth().currentUser.uid);
	                            }else{
	                            	currentUser = _state;
	                            }

	                            if (currentUser &&
	                               (currentUser.groups || currentUser.groups.length) &&
	                               (user.groups || user.groups.length)) {
	                               		const groups = Util.getMatchesFromArray(currentUser.groups, user.groups);
	                                    if (groups.length > 0) {
	                                        const groupId = groups[0];
	                                        _router.navigate(`chat/${groupId}`);
	                                    }
	                             }
                            }
                        } catch (e) {
                            console.log(e.message);
                        }
                       
                    });
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    return class Connections {
        constructor(state, router) {
            _state = state;
            _router = router;
            _connectionsComponent = new ConnectionsComponent(_state);
            _initViews();
        }
    }
});