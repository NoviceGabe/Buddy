define([
        'userModel',
        'postModel',
        'chatModel',
        'u_postComponent',
        'suggestionsComponent',
        'util',
        'css!css/home',
    ],
    (
        UserModel,
        PostModel,
        ChatModel,
        PostComponent,
        SuggestionsComponent,
        Util
    ) => {

        let _router;
        let _state;
        const _userModel = new UserModel(firebase.firestore(), firebase.auth());
        const _postModel = new PostModel(firebase.firestore());
        const _chatModel = new ChatModel(firebase.firestore());
     
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

        const _initNewsFeed = async () => {
            PostComponent.init(_state, _router);
            const container = document.querySelector('#home-section');
            PostComponent.renderModal(container);

            const write = document.querySelector('#write-post');
            PostComponent.initWritePost(write);

            PostComponent.clearListeners();

            const postObserver = (userId, timestamp, by = '>=') => {
                let postListener;
                const container = document.querySelector('#newsfeed');
                postListener = _postModel.prepareAllByDate(userId, ORDER)
                    .where('timestamp', by, timestamp)
                    .where('privacy','==', PUBLIC)
                    .onSnapshot(querySnapshot => {
                        let posts = [];
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type == 'added') {
                                const post = change.doc.data();
                                let component = new PostComponent(post);
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
                                    .editObserver()
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
                _initNewsFeed();
                _initSuggestions();

            }
        }
    });