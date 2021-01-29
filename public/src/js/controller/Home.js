define(['userModel', 'postModel', 'suggestionsComponent',  'modalComponent', 'css!css/home', 'css!css/modal'],
	(UserModel, PostModel, SuggestionsComponent, ModalComponent)=>{

	let _router;
	let _state;
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());

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

        budget.setAttribute('placeholder', String.fromCharCode(0x20b1)+'0');

        if(_state.roles.server && _state.roles.server === true){
        	const option = document.createElement('option');
        	option.setAttribute('value', 'server');
        	option.innerText = 'Service Worker';
        	role.appendChild(option);
        }

        modal.onTrigger(function(){
        	_initMap(post);
        });
        

        modal.onSave(function(){
        	const postModel = new PostModel(firebase.firestore());

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
        	}

        	post.user = {
        		uid: firebase.auth().currentUser.uid,
        		name: _state.name,
        		photoURL: _state.photoURL,
        		role: role.value
        	};

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

            return postModel.add(post)
                .then(() => {
                    console.log('Post uploaded');
                   // _homeView.addPost(post);
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

    const _initMap = async (post) => {
	  	const provider = new GeoSearch.OpenStreetMapProvider();
		const searchControl = new GeoSearch.GeoSearchControl({
		  showMarker: true,
		  autoClose: true,
		  keepResult: true,
		  provider: provider,
		  autoComplete: true, 
  		  autoCompleteDelay: 250, 
		});

	  	const lat = 12.8797;
	  	const longt = 121.7740;
	  	const ph = new L.LatLng(lat,longt);
	 	const map = L.map('map').setView(ph, 5);

	 	map.addControl(searchControl);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		L.marker([lat, longt]).addTo(map);

		const callback = (data) => {
        	map.setView([data.location.y, data.location.x], 13);
        	map.dragging.enable();
        	map.scrollWheelZoom.enabled();
			post.location = {};
			post.location.x = data.location.x;
			post.location.y = data.location.y;
			post.location.label = data.location.label;
		}

		map.on('geosearch/showlocation', callback);

	 }

	return class Home{
		constructor(state, router){
			_router = router;
			_state = state;
			_initSuggestions();
			_initWritePost();
		}
	}
});