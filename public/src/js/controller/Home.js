define([
        'userModel',
        'postModel',
        'chatModel',
        'u_postComponent',
        'suggestionsComponent',
        'modalComponent',
        'map',
        'util',
        'css!css/home',
        'css!css/modal'
    ],
    (
        UserModel,
        PostModel,
        ChatModel,
        PostComponent,
        SuggestionsComponent,
        ModalComponent,
        Map,
        Util
    ) => {

        let _router;
        let _state;
        const _userModel = new UserModel(firebase.firestore(), firebase.auth());
        const _postModel = new PostModel(firebase.firestore());
        const _chatModel = new ChatModel(firebase.firestore());
        let _modal;
        let _map;
       
        let config = {
            add: true
        }
  
        const _initSuggestions = async () => {
            const suggestionsView = new SuggestionsComponent();
            const users = await _userModel.getAllUsersExcept(firebase.auth().currentUser.uid);
            const suggestions = await _userModel.fetchNotFollowingUsers(users);
            suggestionsView.render(suggestions);
            _initSuggestionsEvents();
        }

        const _initSuggestionsEvents = () => {
            const suggestions = document.querySelectorAll('#suggestions ul li .avatar');
            suggestions.forEach(user => {
                user.addEventListener('click', e => {
                    const id = e.target.parentElement.getAttribute('id');
                    _router.navigate(`profile/${id}`);
                });
            });
            const follow = document.querySelectorAll('#suggestions ul li .follow');
            follow.forEach(user => {
                user.addEventListener('click', e => {
                    e.preventDefault();
                    const id = e.target.parentElement.getAttribute('id');
                    _userModel.follow(firebase.auth().currentUser.uid.trim(), id.trim()).then(() => {
                        user.setAttribute('src', '');
                        console.log('followed ' + id)
                    }).catch(err => {
                        console.log(err.message);
                    });
                });
            });
        }

        const _initWritePost = () => {
            const post = {};

            const ref = document.querySelector('#modal-post');
            const write = document.querySelector('#write-post');
            const form = document.querySelector('#form-post');
            _modal = new ModalComponent(ref, write, form);

            const role = form.querySelector('#user-role');
            const service = form.querySelector('#service-category');
            const title = form.querySelector('#title textarea');
            const description = form.querySelector('#description textarea');
            const budget = form.querySelector('#budget');
            const budgetType = form.querySelector('#budget-type');
            const work = form.querySelector('#work-experience');
            const job = form.querySelector('#job-type');
            const location = document.querySelector('#container-location');

            budget.setAttribute('placeholder', String.fromCharCode(0x20b1) + '0');

            if (_state.roles && _state.roles.server && _state.roles.server === true) {
                const option = document.createElement('option');
                option.setAttribute('value', 'server');
                option.innerText = 'Service Worker';
                role.appendChild(option);
            }

            job.addEventListener('change', function(event) {

                if (event.target.value == 2) {

                    if (location.classList.contains('remove')) {
                        location.classList.remove('remove');
                    }
                    if (!_map) {
                        _map = new Map();
                        _map
                            .onDragMarker()
                            .onClickMap()
                            .onSearch();
                    }

                } else {

                    if (!location.classList.contains('remove')) {
                        location.classList.add('remove');
                    }
                }
            });

            _modal.onSave(function() {
                if (job.value == 2 && _map) {
                    post.location = _map.location;
                } else if (post.location) {
                    delete post.location;
                }

                if (role.value == 'empty') {
                    console.log('No role was selected.');
                    return false;
                } else if (service.value == 'empty') {
                    console.log('No service category was selected.');
                    return false;
                } else if (!title.value.length) {
                    console.log('Empty title.');
                    return false;
                } else if (!description.value.length) {
                    console.log('Empty description.');
                    return false;
                } else if (!budget.value.length) {
                    console.log('No budget included.');
                    return false;
                } else if (!budget.value.match(/^\d*(\.\d+)?$/)) {
                    console.log('Invalid budget format.');
                    return false;
                } else if (budgetType.value == 'empty') {
                    console.log('No budget type was selected.');
                    return false;
                } else if (work.value == 'empty') {
                    console.log('No work experience was selected.');
                    return false;
                } else if (job.value == 'empty') {
                    console.log('No job type was selected.');
                    return false;
                } else if (job.value == 2 && post.location &&
                    Object.keys(post.location).length === 0 && post.location.constructor === Object) {
                    console.log('No location was selected.');
                    return false;
                }

                post.user = {
                    uid: firebase.auth().currentUser.uid,
                    name: _state.name,
                    photoURL: _state.photoURL,
                    role: role.value
                };

                if (_state.workplace) {
                    post.user.work = _state.workplace.position;
                }

                post.serviceCat = service.value;
                post.title = title.value.trim();
                post.description = description.value.trim();
                post.budget = parseFloat(budget.value).toFixed(2);
                post.budgetType = budgetType.value;
                post.workExp = work.value;
                post.jobType = job.value;
                post.notification = true;

                if(config.add){
                    post.commentCount = 0;
                    post.likeCount = 0;
                    post.shareCount = 0;
                    post.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
                   return _postModel.add(post)
                    .then(() => {
                        console.log('Post uploaded');
                        if (_map) {
                            _map.clear();
                            _map = null;

                        }
                        if (!location.classList.contains('remove')) {
                            location.classList.add('remove');
                        }
                        return true;
                    }).catch(err => {
                        console.log(err.message);
                        return false;
                    });  

                }else{
                    post.updatedAt = firebase.firestore.Timestamp.fromDate(new Date());
                    post.id = config.postId;

                    if(!post.id){
                        return false;
                    }

                    return _postModel.update(post)
                    .then(() => {
                        console.log('Post updated');
                        if (_map) {
                            _map.clear();
                            _map = null;

                        }
                        if (!location.classList.contains('remove')) {
                            location.classList.add('remove');
                        }

                        return true;
                    }).catch(err => {
                        console.log(err.message);
                        return false;
                    });  
                }
               
                return false;
            }, function(){
                config.add = true;
                const header = document.querySelector('#modal-post h3');
                header.innerText = 'Post a service';
            });

            const wordCount = (count, text, limit = 600) => {
                count.innerText = text.value.length;

                text.addEventListener("keyup", function() {
                    const characters = text.value.trim().split('');
                    count.innerText = characters.length;

                    if (characters.length > limit) {
                        text.value = text.value.trim().substring(0, limit);
                        count.innerText = limit;
                    }
                });
            }

            const titleCount = form.querySelector("#container-title #count #current");
            const titleText = form.querySelector('#container-title textarea');

            wordCount(titleCount, titleText, 50);

            const descCount = form.querySelector("#container-description #count #current");
            const descText = form.querySelector('#container-description textarea');

            wordCount(descCount, descText, 3000);

        }

        const _initNewsFeed = async () => {

            PostComponent.clearListeners();

            const postObserver = (userId, timestamp, by = '>=') => {
                let postListener;
                const container = document.querySelector('#newsfeed');
                postListener = _postModel.prepareAllByDate(userId, ORDER)
                    .where('timestamp', by, timestamp)
                    .onSnapshot(querySnapshot => {
                        let posts = [];
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type == 'added') {
                                const post = change.doc.data();
                                let component = new PostComponent(_state, _router, post);
                                posts.push(component);
                            }else if(change.type == 'modified'){
                                const post = change.doc.data();
                                PostComponent.updatePostView(post);
                            }
                        });

                        if (posts.length) {
                            try {
                                posts.sort(function(post1, post2) {
                                  return post1.post.timestamp.toDate() - post2.post.timestamp.toDate();
                                });

                                posts.forEach(post => {
                                    post.render(container)
                                    .likeObserver()
                                    .commentObserver()
                                    .unfollowObserver()
                                    .hidePostObserver()
                                    .deleteObserver()
                                    .avatarObserver()
                                    .editObserver(_modal, _map, config)
                                    .messageObserver()
                                    
                                });


                            } catch(e) {
                                console.log(e.message);
                            }
                            
                        } 
                    });
                PostComponent.listeners(postListener);
            }
           
            try {
                const today = new Date()
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const week = new Date(today);
                week.setDate(week.getDate() - 7);

                let posts = [];
                const users = await _userModel.getAllFollowing(firebase.auth().currentUser.uid);
                users.push({ uid: firebase.auth().currentUser.uid });
                // get all posts today from user and user following 
                for (let user of users) {
                    postObserver(user.uid, yesterday);
                }

            } catch (e) {
                console.log(e.message);
            }
        }

        return class Home {
            constructor(state, router) {
                _router = router;
                _state = state;
               // _postComponent = new PostComponent(_state);
                const write = document.querySelector('#write-post');
                _initWritePost(write);
                _initNewsFeed();
                _initSuggestions();

            }
        }
    });