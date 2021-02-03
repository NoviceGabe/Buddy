define([
	'userModel',
	'postModel',
	'postComponent', 
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
		PostComponent,
		SuggestionsComponent, 
		ModalComponent, 
		Map,
        Util
	)=>{

	let _router;
	let _state;
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());
	const _postModel = new PostModel(firebase.firestore());
	let _postComponent;
    const COMMENT_COUNT = 2;
	
	let _map;

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
        const modal = new ModalComponent(ref, write, form);

        const role = form.querySelector('#user-role');
        const service = form.querySelector('#service-category');
        const title = form.querySelector('#title textarea');
        const description = form.querySelector('#description textarea');
        const budget = form.querySelector('#budget');
        const budgetType = form.querySelector('#budget-type');
        const work = form.querySelector('#work-experience');
        const job = form.querySelector('#job-type');
        const location = document.querySelector('#container-location');

        budget.setAttribute('placeholder', String.fromCharCode(0x20b1)+'0');

        if(_state.roles.server && _state.roles.server === true){
        	const option = document.createElement('option');
        	option.setAttribute('value', 'server');
        	option.innerText = 'Service Worker';
        	role.appendChild(option);
        }

		job.addEventListener('change', function(event) {

		   if(event.target.value == 2){

			   	 if(location.classList.contains('remove')){
			   	 	location.classList.remove('remove');
			   	 }
			   	 if(!_map){
			   	 	_map = new Map();
			   	 	_map
			   	 	.onDragMarker()
			   	 	.onClickMap()
			   	 	.onSearch();
			   	 }
		   		
		   }else{
		   	 
		   	  	if(!location.classList.contains('remove')){
			   	 	location.classList.add('remove');
			   	}
		   }
		});
		
        

        modal.onSave(function(){
        	if(job.value == 2 && _map){
        		post.location = _map.location;
        	}else if(post.location){
        		delete post.location;
        	}

        	if(role.value == 'empty'){
        		console.log('No role was selected.');
        		return false;
        	}else if(service.value == 'empty'){
        		console.log('No service category was selected.');
        		return false;
        	}else if(!title.value.length){
        		console.log('Empty title.');
        		return false;
        	}else if(!description.value.length){
        		console.log('Empty description.');
        		return false;
        	}else if(!budget.value.length){
        		console.log('No budget included.');
        		return false;
        	}else if(!budget.value.match(/^\d*(\.\d+)?$/)){
        		console.log('Invalid budget format.');
        		return false;
        	}else if(budgetType.value == 'empty'){
        		console.log('No budget type was selected.');
        		return false;
        	}else if(work.value == 'empty'){
        		console.log('No work experience was selected.');
        		return false;
        	}else if(job.value == 'empty'){
        		console.log('No job type was selected.');
        		return false;
        	}else if(job.value == 2 &&
        		Object.keys(post.location).length === 0 && post.location.constructor === Object){
        		console.log('No location was selected.');
        		return false;
        	}

        	post.user = {
        		uid: firebase.auth().currentUser.uid,
        		name: _state.name,
        		photoURL: _state.photoURL,
        		role: role.value
        	};

            if(_state.workplace){
                post.user.work = _state.workplace.position;
            }

            post.serviceCat = service.value;
            post.title = title.value.trim();
            post.description = description.value.trim();
            post.budget = parseFloat(budget.value).toFixed(2);
            post.budgetType = budgetType.value;
            post.workExp = work.value;
            post.jobType = job.value;

            post.commentCount = 0;
            post.likeCount = 0;
            post.shareCount = 0;
            post.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
         
            return _postModel.add(post)
                .then(() => {
                    console.log('Post uploaded');
                   if(_map){
                   	_map.clear();
                   	_map = null;

                   }
			   	  	if(!location.classList.contains('remove')){
				   	 	location.classList.add('remove');
				   	}
                    return true;
                }).catch(err => {
                    console.log(err.message);
                    return false;
                });

        	return false;
        });

        const wordCount = (count, text, limit = 600) =>{
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

        wordCount(descCount, descText, 1000);
        
    }

    const _initNewsFeed = async () =>{
    	try {
			const today = new Date()
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const week = new Date(today);
			week.setDate(week.getDate() - 7);

    		const following = await _userModel.getAllFollowing(firebase.auth().currentUser.uid);
    		// get posts for the past 7 days and today from following 
    		for(let user of following){
				_postModel.prepareAllByDate(user.uid, ORDER)
				.where('timestamp', '>=', week)
				.onSnapshot(querySnapshot => {
					querySnapshot.docChanges().forEach(change =>{
						if(change.type == "added"){
							const post = change.doc.data();
							if(post){
								_postComponent.render(post);
                                avatarObserver(post);
                                likeObserver(post);
                                commentObserver(post);
							}
						}
					});
				});    			
    		}
    		// get posts for the past 7 days and today from current user 
    		_postModel.prepareAllByDate(firebase.auth().currentUser.uid, ORDER)
                //.where('timestamp', '>=', week)
				.where('timestamp', '>=', yesterday)
				.onSnapshot(querySnapshot => {
					querySnapshot.docChanges().forEach(change =>{
						if(change.type == "added"){
							const post = change.doc.data();
							if(post){
                                _postComponent.render(post);
                                avatarObserver(post);
                                likeObserver(post);
                                commentObserver(post);
                            }
						}
					});
				});   		


    		
    	} catch(e) {
    		console.log(e.message);
    	}

        const likeObserver = (post) =>{
            const ref = document.getElementById(post.id);
            const like = ref.querySelector('.action-like');
            let hasLike = false;

            _postModel.hasLike(post.id, firebase.auth().currentUser.uid).then(value => {
                if(value.length){
                    like.classList.add('color-like');
                    hasLike = true;
                }
            });

            like.addEventListener('click', function(e){
                if(hasLike){
                    like.classList.remove('color-like');
                }else{
                   like.classList.add('color-like');
                }
                
                _postModel.onToggleLike(post.id, post.user.uid, firebase.auth().currentUser.uid, function(count, flag){
                    const postContainer = document.getElementById(post.id);
                    const bar = postContainer.querySelector('.post-footer .bar');
                    const likeCount = bar.querySelector('.like-count');
                    likeCount.innerText = count;

                    if(count && bar.style.display == 'none'){
                        bar.style.display = 'flex';
                    }

                    if(!count && !post.commentCount){
                        bar.style.display = 'none';
                    }
                    
                    if(count && likeCount.parentElement.style.display == 'none'){
                        likeCount.parentElement.style.display = 'flex';
                    }else if(!count && likeCount.parentElement.style.display == 'flex'){
                        likeCount.parentElement.style.display = 'none';
                    }

                    hasLike = flag;

                    if(hasLike){
                        like.classList.add('color-like');
                    }else{
                        like.classList.remove('color-like');
                    }
                   
                });
            });
        }

        const avatarObserver = (post) => {
            const ref = document.getElementById(post.id);
            const opAvatar = ref.querySelector('.post-header > img');
            const userAvatar = ref.querySelector('.post-footer .comment-section .input img')
            opAvatar.addEventListener('click', e =>{
                _router.navigate(`profile/${post.user.uid}`);
            });

            userAvatar.addEventListener('click', e =>{
                _router.navigate(`profile/${firebase.auth().currentUser.uid}`);
            });
        }

        const commentObserver = (post) => {
            const ref = document.getElementById(post.id);
            const commentCount = ref.querySelector('.comment-count');
            const text = ref.querySelector('.input textarea');

            let lastVisible;
            let showPreviousLink = false;
            let prevCount = 0;
            let lastPage = false;
            let flag = false;
            let commentListener;

            text.addEventListener('keyup', (e) => {
                const key = e.keyCode;
                if(key === 13 && text.value.length){
                    const comment = {
                                uid: firebase.auth().currentUser.uid,
                                name: _state.name,
                                photoURL:_state.photoURL,
                                postId: post.id,
                                postUserId: post.user.uid,
                                text:text.value.trim(),
                                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                                }

                    _postModel.addComment(comment).then(() => {
                        text.value = '';
                        e.target.style.height = '38px';
                        let suffix = (post.commentCount > 1)? 's':'';
                        post.commentCount++;
                        commentCount.innerText = `${post.commentCount} comment${suffix}`;
                    }).catch(err => {
                        console.log(err.message);
                    });
                }
            });

            if(commentListener != undefined){
                commentListener();
                commentListener = undefined;
            }

            if(commentListener == undefined){
                 commentListener = _postModel.prepareCertainCommentsByDate(post.id, post.user.uid, ORDER, COMMENT_COUNT)
                .onSnapshot(querySnapshot => {
                    let comments = [];
                    querySnapshot.docChanges().forEach(change =>{
                        if(change.type == "added"){
                            const comment = change.doc.data();
                            comments.push(comment);
                        }
                    });

                    if(!flag){
                         if(comments.length == COMMENT_COUNT){
                            lastVisible = querySnapshot.docs[querySnapshot.docs.length-2];
                            comments.pop();
                        }else{
                            lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
                        }
                        flag = true;
                    }

                    if(comments.length){
                        comments.reverse();
                        _postComponent.comments(comments);
                    }

                 });
            }
           
            if(post.commentCount > 1){
                const container = ref.querySelector('.comment-section .comments');
                const loadMore = document.createElement('div');
                const span = document.createElement('span');

                loadMore.classList.add('load-more');
                span.innerText = 'Show more comments';
            
                loadMore.appendChild(span);

                container.insertBefore(loadMore, container.firstChild);
                loadMore.addEventListener('click', async (e) => {
                    // load previous comments
                    console.log(lastVisible)
                    if(lastVisible && !lastPage){
                        try {
                            const prev =  _postModel.prepareCertainCommentsByDate(post.id, post.user.uid, ORDER, 10)
                            .startAfter(lastVisible);
                            const snapshot = await prev.get();
                            prevCount = snapshot.docs.length;

                            if(prevCount > 0){
                                const oldComments = snapshot.docs.map(doc => ({
                                    ...doc.data()
                                }));

                                if(snapshot.docs.length == 10){
                                    lastVisible = snapshot.docs[snapshot.docs.length-2];
                                    oldComments.pop();
                                }else{
                                    lastVisible = snapshot.docs[snapshot.docs.length-1];
                                    loadMore.classList.add('remove');
                                    lastPage = true;
                                }

                                if(oldComments.length){
                                   _postComponent.comments(oldComments, 'first');
                                }

                            }else{
                                loadMore.classList.add('remove');
                                lastPage = true;
                            }

                        } catch(e) {
                            console.log(e.message);
                        }
                      
                    }
                });
            }
        }
    }

	return class Home{
		constructor(state, router){
			_router = router;
			_state = state;
            _postComponent = new PostComponent(_state);
			_initNewsFeed();
			_initSuggestions();
			_initWritePost();
		}
	}
});