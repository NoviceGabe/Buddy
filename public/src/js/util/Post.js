define([
	'userModel',
    'postModel',
    'chatModel',
    'c_postComponent',
    'map',
    'util'
    ], 
    (UserModel,
     PostModel,
     ChatModel,
     PostComponent,
     Map,
     Util
     ) => {
    
    let _router;
    let _state;
    const _userModel = new UserModel(firebase.firestore(), firebase.auth());
    const _postModel = new PostModel(firebase.firestore());
    const _chatModel = new ChatModel(firebase.firestore());
    let _postComponent;

    let listeners = [];

    return class Post {
        constructor(state, router, post) {
        	this.post = post;
        	if(!_router){
        		_router = router;
        	}
        	if(!_state){
        		_state = state;
        	}
        	if(!_postComponent){
        		_postComponent = new PostComponent(state);
        	}            
            
            this.hasLike = false;
            this.lastVisible;
            this.showPreviousLink = false
            this.prevCount = 0;
            this.lastPage = false;
        }

        likeObserver() {
            const ref = document.getElementById(this.post.id);
            const like = ref.querySelector('.action-like');
            const self = this;
            _postModel.hasLike(this.post.id, firebase.auth().currentUser.uid).then(value => {
                if (value.length) {
                    like.classList.add('color-like');
                    self.hasLike = true;
                }
            });

            like.addEventListener('click', function(e) {
               if (self.hasLike) {
                    like.classList.remove('color-like');
                } else {
                    like.classList.add('color-like');
                }

                _postModel.onToggleLike(self.post.id, self.post.user.uid, firebase.auth().currentUser.uid, 
                	function(count, flag) {
                        const postContainer = document.getElementById(self.post.id);
                        const bar = postContainer.querySelector('.post-footer .bar');
                        const likeCount = bar.querySelector('.like-count');
                        likeCount.innerText = count;

                        if (count && bar.style.display == 'none') {
                            bar.style.display = 'flex';
                        }

                        if (!count && !self.post.commentCount) {
                            bar.style.display = 'none';
                        }

                       	if (count && likeCount.parentElement.style.display == 'none') {
                            likeCount.parentElement.style.display = 'flex';
                       	} else if (!count && likeCount.parentElement.style.display == 'flex') {
                            likeCount.parentElement.style.display = 'none';
                        }

                        self.hasLike = flag;

                        if (self.hasLike) {
                            like.classList.add('color-like');
                         } else {
                            like.classList.remove('color-like');
                        }
                });
            });

            return self;
        }

       	avatarObserver(){
            const ref = document.getElementById(this.post.id);
            const opAvatar = ref.querySelector('.post-header img');
            const commentAvatar = ref.querySelector('.post-footer .comment-section .comments');
            const userAvatar = ref.querySelector('.post-footer .comment-section .input img');
           

            opAvatar.addEventListener('click', e => {
            	e.stopPropagation();
                _router.navigate(`profile/${this.post.user.uid}`);
            });

            userAvatar.addEventListener('click', e => {
            	e.stopPropagation();
                _router.navigate(`profile/${firebase.auth().currentUser.uid}`);
            });

            console.log(commentAvatar)
           /* if(commentAvatar.length){
				commentAvatar.forEach(avatar => {
	            	 avatar.addEventListener('click', e => {
	            	 	console.log('gago')
	            	 	e.stopPropagation();
	            	 	let container = e.target.parentElement.parentElement;
	            	 	if(container.dataset.commenter){
	            	 	 	_router.navigate(`profile/${container.dataset.commenter}`);
	            	 	}
		            });
	            });
            }*/
            
            return this;
        }

        commentObserver(){
            const ref = document.getElementById(this.post.id);
            const commentCount = ref.querySelector('.comment-count');
            const text = ref.querySelector('.input textarea');

            let flag = false;
            let commentListener;
            const self = this;

            text.addEventListener('keyup', (e) => {
                const key = e.keyCode;
                if (key === 13 && text.value.length) {
                    const comment = {
                        uid: firebase.auth().currentUser.uid,
                        name: _state.name,
                        photoURL: _state.photoURL,
                        postId: self.post.id,
                        postUserId: self.post.user.uid,
                        text: text.value.trim(),
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                	}

	                _postModel.addComment(comment).then(() => {
	                	let suffix = (self.post.commentCount > 1) ? 's' : '';
	                    self.post.commentCount++;
	                    commentCount.innerText = `${self.post.commentCount} comment${suffix}`;
	                    text.value = '';
	                    e.target.style.height = '38px';
	                }).catch(err => {
	                    console.log(err.message);
	                });
                }
           	});

            commentListener = _postModel
            .prepareCertainCommentsByDate(this.post.id, this.post.user.uid, ORDER, COMMENT_COUNT)
            .onSnapshot(querySnapshot => {
                let comments = [];
                querySnapshot.docChanges().forEach(change => {
                    if (change.type == "added") {
                        const comment = change.doc.data();
                        comments.push(comment);
                    }
                });

               if (!flag){
                   	if (comments.length == COMMENT_COUNT) {
                        this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 2];
                        comments.pop();
                    }else {
                        this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                    }
                    flag = true;
                }

                if(comments.length) {
                    comments.reverse();
                    _postComponent.comments(comments);
                }
                comments = [];
            });

           	listeners.push(commentListener);

            if(this.post.commentCount > 1) {
                const container = ref.querySelector('.comment-section .comments');
                const loadMore = document.createElement('div');
                const span = document.createElement('span');

                loadMore.classList.add('load-more');
                span.innerText = 'Show more comments';

                loadMore.appendChild(span);

                container.insertBefore(loadMore, container.firstChild);
                loadMore.addEventListener('click', async (e) => {
                // load previous comments
	                if(this.lastVisible && !this.lastPage) {
	                    try {
	                        const prev = _postModel
	                        .prepareCertainCommentsByDate(this.post.id, this.post.user.uid, ORDER, 10)
	                        .startAfter(this.lastVisible);
	                            const snapshot = await prev.get();
	                            this.prevCount = snapshot.docs.length;

	                            if (this.prevCount > 0) {
	                                const oldComments = snapshot.docs.map(doc => ({
	                                    ...doc.data()
	                                }));

	                               	if(snapshot.docs.length == 10) {
	                                    this.lastVisible = snapshot.docs[snapshot.docs.length - 2];
	                                    oldComments.pop();
	                                }else{
	                                    this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
	                                    loadMore.classList.add('remove');
	                                    this.lastPage = true;
	                                }

	                                if (oldComments.length) {
	                                    _postComponent.comments(oldComments, 'first');
	                                }

	                            }else{
	                                loadMore.classList.add('remove');
	                                this.lastPage = true;
	                            }

	                    }catch(e){
	                        console.log(e.message);
	                   	}

	                }
                });
            }
            return this;
        }

       	unfollowObserver(){
            const ref = document.getElementById(this.post.id);
            const unfollow = ref.querySelector('.unfollow');
            const self = this;
            if (unfollow) {
                unfollow.addEventListener('click', async function() {
                    _userModel.unfollow(firebase.auth().currentUser.uid, self.post.user.uid)
                    .then(() => {
                        // select all post wher userId == post.user.uid then hide
                        const posts = document.querySelectorAll(`[data-author="${self.post.user.uid}"]`);
                        posts.forEach(post => {
                           post.classList.add('remove');
                        });
                    }).catch(err => {
                        console.log(err.message);
                    });
                });
            }
            return this;
        }

        hidePostObserver(){
            const ref = document.getElementById(this.post.id);
            const hide = ref.querySelector('.hide-post');
            if (hide) {
                hide.addEventListener('click', function() {
                    ref.classList.add('remove');
                });
            }
            return this;
        }

        async messageObserver(){
            try {
                let invitation = await _chatModel
                .getInvitation(firebase.auth().currentUser.uid, this.post.user.uid);

                const ref = document.getElementById(this.post.id);
                let chat = ref.querySelector('.message');
                let flag;
                const self = this;

                if (!chat) {
                    return;
                }

                if(invitation.length > 0) {
                    invitation = invitation[0];
                    if (invitation.accept) {
                        chat.innerText = 'Message';
                        chat.dataset.chat = 'chat';
                        flag = 'chat';

                  	}else {
                        chat.innerText = 'Chat request pending';
                        chat.dataset.chat = 'pending';
                        flag = 'pending';
                    }
                } else {
                    chat.innerText = 'Chat request';
                    chat.dataset.chat = 'invite';
                    flag = 'invite';
                }

                if (chat) {
                    chat.addEventListener('click', async () => {
                        try {
                            if (flag == 'invite') {
                                let status = await _chatModel
                                .invite(firebase.auth().currentUser.uid, self.post.user.uid);
                                if (status) {
                                    chat.innerText = 'Chat request pending';
                                    chat.dataset.chat = 'pending';
                                    flag = 'pending';
                                }
                            } else if (flag == 'chat') {
                                if (firebase.auth().currentUser.uid != self.post.user.uid) {
                                    const user = await _userModel.getUser(self.post.user.uid);
                                    if (user && (user.groups || user.groups.length) &&
                                       (_state.groups || _state.groups.length)) {
                                        const groups = Util.getMatchesFromArray(_state.groups, user.groups);
                                        if (groups.length > 0) {
                                            const groupId = groups[0];
                                            _router.navigate(`chat/${groupId}`);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e.message);
                        }    
                    });
                }
        	} catch (e) {
                console.log(e);
            }
            return this;
        }

        deleteObserver(){
            const ref = document.getElementById(this.post.id);
            const deletePost = ref.querySelector('.delete');
            const self = this;
            if (deletePost) {
                deletePost.addEventListener('click', async function() {
                    const result = confirm("Delete post?");
                    if (result == true) {
                        try {
                            const isDelete = _postModel.delete(self.post.id);
                            if (isDelete) {
                                ref.classList.add('remove');
                            } else {
                                console.log('Unable to delete post');
                            }

                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                });
            }
            return this;
        }

        editObserver(modal, map, config){
            const ref = document.getElementById(this.post.id);
            const edit = ref.querySelector('.edit-post');
            const self = this;
            if (edit && this.post.user.uid == firebase.auth().currentUser.uid) {
                edit.addEventListener('click', function(e) {
                    modal.open(function() {
                    	const header = document.querySelector('#modal-post h3');
                        header.innerText = 'Edit post';
                        config.add = false;
                        config.postId = self.post.id;
                        const form = document.querySelector('#form-post');
                        const role = form.querySelector('#user-role');
                        const service = form.querySelector('#service-category');
                        const title = form.querySelector('#title textarea');
                        const description = form.querySelector('#description textarea');
                        const budget = form.querySelector('#budget');
                        const budgetType = form.querySelector('#budget-type');
                        const work = form.querySelector('#work-experience');
                        const job = form.querySelector('#job-type');
                        const location = form.querySelector('#container-location');

                        for (let i = 0; i < role.options.length; i++) {
                            if (role.options[i].value == self.post.user.role) {
                                        role.options[i].selected = true;
                            }
                        }

                        for (let i = 0; i < service.options.length; i++) {
                            if (service.options[i].value == self.post.serviceCat) {
                               service.options[i].selected = true;
                            }
                        }

                        title.value = self.post.title;
                        description.value = self.post.description;

                        const titleCount = form.querySelector("#container-title #count #current");
                        const titleText = form.querySelector('#container-title textarea');

                        let characters = titleText.value.trim().split('');
                        titleCount.innerText = characters.length;

                        const descCount = form.querySelector("#container-description #count #current");
                        const descText = form.querySelector('#container-description textarea');

                        characters = descText.value.trim().split('');
                        descCount.innerText = characters.length;

                        budget.value = parseFloat(self.post.budget);

                        for (let i = 0; i < budgetType.options.length; i++) {
                            if (budgetType.options[i].value == self.post.budgetType) {
                                budgetType.options[i].selected = true;
                            }
                        }

                        for (let i = 0; i < work.options.length; i++) {
                            if (work.options[i].value == self.post.workExp) {
                               work.options[i].selected = true;
                             }
                        }

                        for (let i = 0; i < job.options.length; i++) {
                            if (job.options[i].value == self.post.jobType) {
                                job.options[i].selected = true;
                            }
                        }

                        if (!map && self.post.location) {
                            if (location.classList.contains('remove')) {
                               	location.classList.remove('remove');
                           	}
                            
                            map = new Map(self.post.location.y, self.post.location.x);
                            map.onDragMarker()
                            .onClickMap()
                            .onSearch();
                        } else if(self.post.location){
                            map.changeView({
                                lat: self.post.location.y,
                                lng: self.post.location.x,
                                label: self.post.location.label
                            });
                        }

                        if (Object.keys(map.location).length === 0 && map.location.constructor === Object
                        	&& self.post.location) {
                            map.location = {
                                        label: self.post.location.label,
                                        x: self.post.location.x,
                                        y: self.post.location.y
                                    }
                        }
                    });
                });
            }
            return this;
        }

        render(container){
        	_postComponent.render(this.post, container);
        	return this;
        }

        static render(posts, container){
        	_postComponent.render(posts, container);
        }

        static updatePostView(post){
        	this.post = post;
            const ref = document.getElementById(this.post.id);
            const avatar = ref.querySelector('.post-header div:first-child img');
            const name = ref.querySelector('.post-header div:first-child h3');
            const address = ref.querySelector('.post-subheader .location .address');
            const budget = ref.querySelector('.post-subheader .header + div h4');
            const exp = ref.querySelector('.post-subheader div:last-child h4');
            const title = ref.querySelector('.post-content .post-title');
            const description = ref.querySelector('.post-content .post-description');
            const tags = ref.querySelector('.post-tags');

            avatar.setAttribute('src', this.post.user.photoURL);
            name.innerText = this.post.user.name;
            if(this.post.location){
                address.innerText = this.post.location.label;
            }
           
            budget.innerText = this.post.budget;
           
            title.innerText = this.post.title;
            description.innerText = this.post.description;

            let workExp = 'Entry level';

            if(this.post.workExp == INTERMEDIATE){
                workExp = 'Intermediate';
            }else if(this.post.workExp == PRO){
                workExp = 'Professional';
            }

             exp.innerText = workExp;

            let cat = '';
            let job = 'Online';
            let budgetType = 'Negotiable';

            if(this.post.serviceCat){
                cat = this.post.serviceCat;
            }

            if(this.post.jobType == ONSITE){
                job = 'Onsite';
            }

            if(this.post.budgetType == FIXED){
                budgetType = 'Fixed';
            }

            tags.innerHTML = `
                <li>${cat}</li>
                <li>${job}</li>
                <li>${budgetType}</li>
            `;
        }

        static listeners(listener){
        	listeners.push(listener);
        }

        static clearListeners(){
        	if (listeners.length) {
                listeners.forEach(listener => {
                    listener();
                });
            }
        }
	}     
});