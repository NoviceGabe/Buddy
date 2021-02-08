define([
	'userModel',
    'postModel',
    'chatModel',
    'c_postComponent',
    'modalComponent',
    'map',
    'util'
    ], 
    (UserModel,
     PostModel,
     ChatModel,
     PostComponent,
     ModalComponent,
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
    let _modal;
    let _map;
    let _add = true;
    let _post;
      
    return class Post {
        constructor(post) {
        	this.post = post;
            this.hasLike = false;
            this.lastVisible;
            this.showPreviousLink = false
            this.prevCount = 0;
            this.lastPage = false;
        }

        static init(state, router){
        	_state = state;

        	if(!_router){
        		_router = router;
        	}

        	if(!_postComponent && _state && _router){
        		_postComponent = new PostComponent(_state, _router);
        	}   
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
            const userAvatar = ref.querySelector('.post-footer .comment-section .input img');
           

            opAvatar.addEventListener('click', e => {
            	e.stopPropagation();
                _router.navigate(`profile/${this.post.user.uid}`);
            });

            userAvatar.addEventListener('click', e => {
            	e.stopPropagation();
                _router.navigate(`profile/${firebase.auth().currentUser.uid}`);
            });
            
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
            if (unfollow && this.post.user.uid != firebase.auth().currentUser.uid) {
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
            if (deletePost && this.post.user.uid == firebase.auth().currentUser.uid) {
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

        editObserver(){
            const ref = document.getElementById(this.post.id);
            const edit = ref.querySelector('.edit-post');
            const self = this;
            if (edit && this.post.user.uid == firebase.auth().currentUser.uid) {
                edit.addEventListener('click', function(e) {
                    _modal.open(function() {
                    	const header = document.querySelector('#modal-post h3');
                        header.innerText = 'Edit post';
                        
                        _add = false;
                        if(!_post){
                        	_post = self.post;
                        }else if(_post.user.uid == firebase.auth().currentUser.uid && 
                        	_post.id == self.post.id){
                        	self.post = _post;
                        }
                        

                        const form = document.querySelector('#form-post');
                        if(!form.querySelector('#privacy')){
                        	 const privacyContainer = document.createElement('div');
	                       	privacyContainer.setAttribute('id', 'container-privacy');
	                       	privacyContainer.innerHTML = `<h4 class="header"><span>Privacy</span></h4>
					    		<select id="privacy">
							    	<option value="1">Public</option>
							    	<option value="2">Private</option>
						    	</select>`;
						    form.insertBefore(privacyContainer, form.firstChild);
                        }

                        const privacy = form.querySelector('#privacy');
                        const role = form.querySelector('#user-role');
                        const service = form.querySelector('#service-category');
                        const title = form.querySelector('#title textarea');
                        const description = form.querySelector('#description textarea');
                        const budget = form.querySelector('#budget');
                        const budgetType = form.querySelector('#budget-type');
                        const work = form.querySelector('#work-experience');
                        const job = form.querySelector('#job-type');
                        const location = form.querySelector('#container-location');

                        if(self.post.privacy){
	                        for (let i = 0; i < privacy.options.length; i++) {	                       
	                            if (privacy.options[i].value == self.post.privacy) {
	                                privacy.options[i].selected = true;
	                            }
	                        }
                        }

					    for (let i = 0; i < role.options.length; i++) {
                            if (role.options[i].value == self.post.user.role) {
                                        role.options[i].selected = true;
                            }
                        }

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

                        if (!_map && self.post.location) {
                            if (location.classList.contains('remove')) {
                               	location.classList.remove('remove');
                           	}
                            
                            _map = new Map(self.post.location.y, self.post.location.x);
                            _map.onDragMarker()
                            .onClickMap()
                            .onSearch();
                        } else if(self.post.location){
                            _map.changeView({
                                lat: self.post.location.y,
                                lng: self.post.location.x,
                                label: self.post.location.label
                            });
                        }

                        if (_map && Object.keys(_map.location).length === 0 && _map.location.constructor === Object
                        	&& self.post.location) {
                            _map.location = {
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

        static initWritePost(trigger){
            const post = {};

            const ref = document.querySelector('#modal-post');
            const form = document.querySelector('#form-post');
            _modal = new ModalComponent(ref, form, trigger);

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

            if(_state.uid != firebase.auth().currentUser.uid){
            	return false;
            }

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

            _modal.onSave(() => {
            	const privacy = form.querySelector('#privacy');

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

                if(_add){
                	post.notification = true;
                	post.privacy = '1';
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
                    post.id = _post.id;
                    post.privacy = privacy.value;

                    if(!post.id){
                        return false;
                    }

                    if(_post.user.uid != firebase.auth().currentUser.uid){
                    	return false;
                    }
                    
                    return _postModel.update(post)
                    .then(() => {
                        console.log('Post updated');
                        _post = post;
                        if (_map) {
                            _map.clear();
                            _map = null;

                        }
                        if (!location.classList.contains('remove')) {
                            location.classList.add('remove');
                        }

                        return true;
                    }).catch(err => {
                        console.log(err);
                        return false;
                    });  
                }
               
                return false;
            },function(){
                _add = true;
                _post = null;
                const header = document.querySelector('#modal-post h3');
                const privacy = form.querySelector('#container-privacy');
                
                header.innerText = 'Post a service';

                if(privacy){
                    form.removeChild(privacy);
                }
            });

			_modal.onCancel(() => {
                _add = true;
				_post = null;
                const header = document.querySelector('#modal-post h3');
                const privacy = form.querySelector('#container-privacy');

                header.innerText = 'Post a service';

                if(privacy){
                    form.removeChild(privacy);
                }
			});

			_modal.onClose(() => {
				_add = true;
                _post = null;
                const header = document.querySelector('#modal-post h3');
                const privacy = form.querySelector('#container-privacy');
                
                header.innerText = 'Post a service';

                if(privacy){
                    form.removeChild(privacy);
                }
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

        static renderModal(container){
        	const modal = document.createElement('div');
        	modal.setAttribute('id', 'modal-post');
        	modal.classList.add('modal');
        	modal.classList.add('vertical-center-fixed');

        	const template  = `
					<div class="modal-header">
				    	<h3>Post a service</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content">
				    	<form id="form-post" >
				    		<div id="container-role">
				    			<h4 class="header"><span>Choose service role</span></h4>
				    			<select id="user-role">
					    			<option value="empty">Select</option>
					    			<option value="client">Client</option>
					    		</select>
				    		</div>
				    		<div id="container-service">
				    			<h4 class="header"><span>Choose a service category</span></h4>
				    			<select id="service-category">
					    			<option value="empty">Select</option>
					    			<option value="driving">Driving</option>
					    			<option value="delivery">Delivery</option>
					    			<option value="handyman">Handyman</option>
					    			<option value="beauty">Beauty</option>
					    			<option value="cooking">Cooking</option>
					    			<option value="teaching">Teaching</option>
									<option value="laundry">Laundry</option>
									<option value="housekeeping">Housekeeping</option>
					    		</select>
				    		</div>
				    		<div id="container-title">
				    			<h4 class="header"><span>Project title</span></h4>
					    		<div id="title">
					    			<textarea placeholder="E.g. Looking for Truck Driver"></textarea>
					    		</div>
								<div id="count">
								    <span id="current">0</span>
								    <span id="maximum">/ 50</span>
								</div>
				    		</div>
				    		<div id="container-description">
				    			<h4 class="header"><span>Project description</span></h4>
					    		<div id="description">
					    			<textarea placeholder="E.g. We're looking for a professional and experienced truck diver"></textarea>
					    		</div>
								<div id="count">
								    <span id="current">0</span>
								    <span id="maximum">/ 3000</span>
								</div>
				    		</div>
				    		<div id="container-budget" style="display:flex;">
				    			<div style="width:100%">
					    			<h4 class="header"><span>Budget</span></h4>
					    			<input type="number" min="0.01" step="0.01" placeholder="E.g. P5000" id="budget">
				    			</div>
				    			<div style="width:100%;padding-left:10px;">
					    			<h4 class="header"><span>Budget type</span></h4>
					    			<select id="budget-type">
						    			<option value="empty">Select</option>
						    			<option value="1">Fixed price</option>
						    			<option value="2">Negotiable</option>
						    		</select>
				    			</div>
				    		</div>
				    		<div id="container-work">
				    			<h4 class="header"><span>Work experience</span></h4>
				    			<select id="work-experience">
					    			<option value="empty">Select</option>
					    			<option value="1">Entry level</option>
					    			<option value="2">Intermediate</option>
					    			<option value="3">Professional</option>
					    		</select>
				    		</div>
				    		<div id="container-job">
				    			<h4 class="header"><span>Job type</span></h4>
				    			<select id="job-type">
					    			<option value="empty">Select</option>
					    			<option value="1">Online</option>
					    			<option value="2">Onsite</option>
					    		</select>
				    		</div>
				    		<div id="container-location" style="height:380px;width:100%;" class="remove">
				    			<h4 class="header"><span>Location</span></h4>
				    			<div id="map" style="height:100%;width:70%;margin:auto">
				    			</div>
				    		</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Post</button>
				    	<button class="cancel">Cancel</button>
				  </div>`;
			modal.innerHTML = template;
			container.appendChild(modal);
        }

        static updatePostView(post){
        	this.post = post;
            const ref = document.getElementById(this.post.id);
            const avatar = ref.querySelector('.post-header div:first-child img');
            const name = ref.querySelector('.post-header div:first-child h3');
            const address = ref.querySelector('.post-subheader .location .address');
            const budget = ref.querySelector('.post-subheader div:first-child + div h4');
            const exp = ref.querySelector('.post-subheader div:last-child h4');
            const title = ref.querySelector('.post-content .post-title');
            const description = ref.querySelector('.post-content .post-description');
            const tags = ref.querySelector('.post-tags');

            if(this.post.user.photoURL){
            	avatar.setAttribute('src', this.post.user.photoURL);
            }
           
            name.innerText = this.post.user.name;
            if(address && this.post.location){
                address.innerText = this.post.location.label;
            }
           
            budget.innerText = `${String.fromCharCode(0x20b1)}${this.post.budget}`;
           
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