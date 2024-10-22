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
            const suggestions = await _userModel.fetchNotFollowingUsers(users, 5);
            for(let user of suggestions){
                const image = await _userModel.getUserImage(user.uid);
                if(image.length){
                    user.photoURL = image[0].url;
                }
            }
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
                    const parent = e.target.parentElement;
                    const id = parent.getAttribute('id');
                    const name = parent.querySelector('h5').textContent;
                    _userModel.follow(firebase.auth().currentUser.uid.trim(), id.trim()).then(() => {
                        user.setAttribute('src', '');
                        swal(`You have followed ${name}`);
                        
                    }).catch(err => {
                         swal("Unable to process action", err.message, "error");
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
            let posts = [];

            const postObserver = (userId, timestamp, by = '>=') => {
                let postListener;
                const container = document.querySelector('#newsfeed');
                let changeType;
               

                postListener = _postModel.prepareAllByDate(userId, 'asc')
                    .where('timestamp', by, timestamp)
                    .where('privacy','==', PUBLIC)
                    .onSnapshot(querySnapshot => {
                       
                        querySnapshot.docChanges().forEach(async(change) => {
                            if (change.type == 'added') {
                                const post = change.doc.data();
                                let component = new PostComponent(post);

                                const image = await _userModel.getUserImage(component.post.user.uid);
                                if(image.length){
                                    component.post.user.photoURL = image[0].url;
                                }

                                component.render(container)
                                    .likeObserver()
                                    .unfollowObserver()
                                    .hidePostObserver()
                                    .deleteObserver()
                                    .avatarObserver()
                                    .editObserver()
                                    .messageObserver();
                                    await component.commentObserver();

                                posts.push(component);

                            }else if(change.type == 'modified'){
                                const post = change.doc.data();
                                PostComponent.updatePostView(post);

                                let index = -1;
                                posts.forEach(p => {
                                    if(p.post.id == post.id){
                                        index = p.post.id;
                                    }
                                });

                               if(index > -1){
                                    posts[index] = post;
                                }

                                const ref = document.getElementById(post.id);
                                const indicator = ref.querySelector('.comment-section .comment-indicator');

                                if(!post.isTyping){
                                    indicator.classList.remove('flex-container');
                                    indicator.classList.add('remove');
                                }else{
                                    indicator.classList.add('flex-container');
                                    indicator.classList.remove('remove');
                                }
                            }
                        });
                      
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