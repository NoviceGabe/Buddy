define(['moment'],(moment)=>{
	const ENTRY_LEVEL = '1';
	const INTERMEDIATE = '2';
	const PRO = '3';

	const ONLINE = '1';
	const ONSITE = '2';

	const FIXED = '1';
	const NEGO = '2';
	let _state;

	return class Post{
		constructor(state){
			_state = state;
		}

		render(posts){
			const container = document.querySelector('#newsfeed');

			if(posts.length){
				const fragment = new DocumentFragment();
				posts.forEach(post => {
					let div = this.template(post);
					fragment.appendChild(div);
				});

				container.appendChild(fragment);
			}else{
				let div = this.template(posts);
				if (container.firstChild) {
			        container.insertBefore(div, container.firstChild);
			    }else {
			        container.appendChild(div);
			    }
			}
			
		}

		template(post){
			const container = document.createElement('div');
			container.classList.add('post');
			container.setAttribute('id', post.id);
			container.appendChild(this.header(post));
			container.appendChild(this.subheader(post));
			container.appendChild(this.content(post));
			container.appendChild(this.footer(post));
			return container;
		}

		header(post){
			const header = document.createElement('div');
			header.classList.add('post-header');
			header.classList.add('clear-fix');

			const avatar = document.createElement('img');
			avatar.classList.add('float-left');

			let photoUrl = 'src/assets/man.jpg';
			if(post.user.photoURL){
				photoUrl = post.user.photoURL;
			}

			avatar.setAttribute('src', photoUrl);

			const headerDiv = document.createElement('div');
			headerDiv.classList.add('float-left');

			const name = document.createElement('h3');
			name.innerText = post.user.name;

			const ago = document.createElement('p');

			let date;
			try {
				date = post.timestamp.toDate();
			} catch(e) {
				date = new firebase.firestore
					.Timestamp(post.timestamp.seconds, 
					post.timestamp.nanoseconds)
					.toDate();
			}

			const time = moment(date, "YYYYMMDD").fromNow();

			ago.innerText = time;

			headerDiv.appendChild(name);
			headerDiv.appendChild(ago);

			header.appendChild(avatar);
			header.appendChild(headerDiv);

			return header;
		}

		subheader(post){
			const subheader = document.createElement('div');

			subheader.classList.add('post-subheader');
			subheader.classList.add('clear-fix');

			const header = document.createElement('div');
			header.classList.add('header');
			header.classList.add('clear-fix');
					
			if(post.user.work){
				const workContainer = document.createElement('div');
				const img = document.createElement('img');
				const position = document.createElement('span');
				position.classList.add('float-left');
				
				workContainer.classList.add('work');
				workContainer.classList.add('float-left');
				workContainer.classList.add('clear-fix');

				img.classList.add('float-left');
				img.setAttribute('src', 'src/assets/work.svg');
				img.setAttribute('height', '20');
				img.setAttribute('width', '20');

				let work = '';
				work = post.user.work;

				position.innerText = work;

				workContainer.appendChild(img);
				workContainer.appendChild(position);

				header.appendChild(workContainer);
			}

			if(post.location){
				const location = document.createElement('div');
				const marker = document.createElement('img');
				const address = document.createElement('span');

				location.classList.add('location');
				location.classList.add('float-left');
				location.classList.add('clear-fix');

				marker.classList.add('marker');
				marker.classList.add('float-left');
				marker.setAttribute('src', 'src/assets/map-marker.svg');
				marker.setAttribute('height', '20');
				marker.setAttribute('width', '20');

				address.classList.add('address');
				address.classList.add('float-left');
				address.innerText = post.location.label;

				location.appendChild(marker);
				location.appendChild(address);

				header.appendChild(location);
			}

			const budgetContainer = document.createElement('div');
			const workExpContainer = document.createElement('div');

			budgetContainer.classList.add('float-left');
			workExpContainer.classList.add('float-left');

			const budgetHeader = document.createElement('h4');
			const budgetContent = document.createElement('p');

			budgetContent.innerText = 'Budget';

			const workExpHeader = document.createElement('h4');
			const workExpContent = document.createElement('p');

			workExpContent.innerText = 'Experience level';

			let budget = 0;
			let workExp = 'Entry level';

			if(post.budget){
				budget = post.budget;
			}

			if(post.workExp == INTERMEDIATE){
				workExp = 'Intermediate';
			}else if(post.workExp == PRO){
				workExp = 'Professional';
			}

			budgetHeader.innerText = `${String.fromCharCode(0x20b1)}${budget}`;
			workExpHeader.innerText = workExp;

			budgetContainer.appendChild(budgetHeader);
			budgetContainer.appendChild(budgetContent);

			workExpContainer.appendChild(workExpHeader);
			workExpContainer.appendChild(workExpContent);

			subheader.appendChild(header);
			subheader.appendChild(budgetContainer);
			subheader.appendChild(workExpContainer);

			return subheader;
		}	

		content(post){
			const content = document.createElement('div');
			content.classList.add('post-content');

			const titleContainer = document.createElement('h3');
			const descContainer = document.createElement('p');
			const tags = document.createElement('ul');
			const catContainer = document.createElement('li');
			const jobTypeContainer = document.createElement('li');
			const budgetTypeContainer = document.createElement('li');

			titleContainer.classList.add('post-title');
			descContainer.classList.add('post-description');
			tags.classList.add('post-tags');

			let title = '';
			let description = '';
			let cat = '';
			let job = 'Online';
			let budget = 'Negotiable';

			if(post.title){
				title = post.title;
			}

			if(post.description){
				description = post.description;
			}

			if(post.serviceCat){
				cat = post.serviceCat;
			}

			if(post.jobType == ONSITE){
				job = 'Onsite';
			}

			if(post.budgetType == FIXED){
				budget = 'Fixed';
			}

			titleContainer.innerText =  title;
			descContainer.innerText = description;

			catContainer.innerText = cat;
			jobTypeContainer.innerText = job;
			budgetTypeContainer.innerText = budget;

			tags.appendChild(catContainer);
			tags.appendChild(jobTypeContainer);
			tags.appendChild(budgetTypeContainer);

			content.appendChild(titleContainer);
			content.appendChild(descContainer);
			content.appendChild(tags);

			return content;
		}

		footer(post){
			const footer = document.createElement('div');
			
			const bar = document.createElement('div');
			const actions = document.createElement('div');

			const barDiv1 = document.createElement('div');
			const barDiv2 = document.createElement('div')

			const barDiv1Child = document.createElement('div');
			const image = document.createElement('img');
			const likeCountContainer = document.createElement('span');

			const commentCountContainer = document.createElement('span');

			const like = document.createElement('span');
			const comment = document.createElement('span');
			const share = document.createElement('span');

			const commentSection = document.createElement('div');
			const comments = document.createElement('div');
			const input = document.createElement('div');
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			const commentInput = document.createElement('textarea');
			const avatar = document.createElement('img');

			footer.classList.add('post-footer');

			bar.classList.add('bar');
			bar.style.display = 'none';

			image.setAttribute('src', 'src/assets/like-filled.png');
			image.setAttribute('height', '15');
			image.setAttribute('width', '18');
			likeCountContainer.classList.add('like-count');

			commentCountContainer.classList.add('comment-count');

			actions.classList.add('actions');
			actions.classList.add('clear-fix');

			if(post.likeCount || post.commentCount){
				bar.style.display = 'flex';
			}

			if(post.likeCount){
				barDiv1Child.style.display = 'flex';
			}else{
				barDiv1Child.style.display = 'none';
			}

			if(post.commentCount){
				commentCountContainer.style.display = 'block';
			}else{
				commentCountContainer.style.display = 'none';
			}

			likeCountContainer.innerText = post.likeCount;
			barDiv1Child.appendChild(image);
			barDiv1Child.appendChild(likeCountContainer);

			barDiv1.appendChild(barDiv1Child);

			let suffix = (post.commentCount > 1)? 's':'';
			commentCountContainer.innerText = `${post.commentCount} comment${suffix}`;
			commentCountContainer.addEventListener('click', e => {
				if(commentSection.classList.contains('remove')){
					commentSection.classList.remove('remove');
				}else{
					commentSection.classList.add('remove');
				}
			});

			barDiv2.appendChild(commentCountContainer);

			bar.appendChild(barDiv1);
			bar.appendChild(barDiv2);
			
			like.classList.add('float-left');
			comment.classList.add('float-left');
			share.classList.add('float-left');

			like.classList.add('action-like');
			comment.classList.add('action-comment');
			share.classList.add('action-share');

			like.innerText = 'Like';
			comment.innerText = 'Comment';
			share.innerText = 'Share';

			actions.appendChild(like);
			actions.appendChild(comment);
			actions.appendChild(share);
		
			commentInput.setAttribute('placeholder', 'Write a comment..');
			commentInput.style.height = '38px';
			commentSection.classList.add('comment-section');
			commentSection.classList.add('remove');
			comments.classList.add('comments');
			input.classList.add('input');

			if(post.commentCount){
				comments.style.padding = '10px';
			}

			comment.addEventListener('click', e => {
				if(commentSection.classList.contains('remove')){
					commentSection.classList.remove('remove');
				}
				commentInput.focus();
			});

			commentInput.addEventListener('keydown', e => {
				const height = parseInt(e.target.style.height.replace('px',''));
				if(height < 138){
				 	e.target.style.height = 'auto';
				  	e.target.style.height = (e.target.scrollHeight) + 'px';
				  	return;
				}
				if(e.target.style.overflowY != 'auto'){
				  	 e.target.style.overflowY = 'auto';
				}
				 
			}, false);

			commentInput.addEventListener('keyup', (e) => {
				const key = e.keyCode;
				
				if(e.target.value.trim().length == 0){
					e.target.style.height = '38px';
				}			
			});

			let photoUrl = 'src/assets/man.jpg';

			if(_state.photoURL){
				photoUrl = _state.photoURL;
			}

			avatar.setAttribute('src', photoUrl);

			div1.appendChild(avatar);
			div2.appendChild(commentInput);
			input.appendChild(div1);
			input.appendChild(div2);

			commentSection.appendChild(comments);
			commentSection.appendChild(input);

			footer.appendChild(bar);
			footer.appendChild(actions);
			footer.appendChild(commentSection)

			return footer;
		}

		comments(data, position){
			if(data.length){
				data.forEach(comment => {
					this.comment(comment, position);
				});
			}else{
				this.comment(data);
			}
		}

		comment(data, position = 'end'){
			const post = document.getElementById(data.postId);
			const container = post.querySelector('.comment-section .comments');
			const comment = document.createElement('div');
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');
			const bubble = document.createElement('div');
			const avatar = document.createElement('img');
			const name = document.createElement('p');
			const text = document.createElement('p');
			const time = document.createElement('p');

			comment.classList.add('comment');
			bubble.classList.add('bubble-container');
			time.classList.add('time');

			let photoURL = 'src/assets/man.jpg';
			let textData = '';
			let timeData = '';
			let nameData = '';

			if(data.name){
				nameData = data.name;
			}
			if(data.photoURL){
				photoURL = data.photoURL;
			}
			if(data.text){
				textData = data.text;
			}
			if(data.timestamp){
				let date;
				try {
					date = data.timestamp.toDate();
				} catch(e) {
					date = new firebase.firestore
						.Timestamp(data.timestamp.seconds, 
						data.timestamp.nanoseconds)
						.toDate();
				}

				const time = moment(date, "YYYYMMDD").fromNow();
				timeData = time;
			}
			avatar.setAttribute('src', photoURL);
			name.innerText = nameData;
			text.innerText = textData;
			time.innerText = timeData;
			time.setAttribute('data-seconds', data.timestamp.seconds);
			time.setAttribute('data-nanoseconds', data.timestamp.nanoseconds);
			div1.appendChild(avatar);
			bubble.appendChild(name);
			bubble.appendChild(text);
			div2.appendChild(bubble);
			div2.appendChild(time);

			comment.appendChild(div1);
			comment.appendChild(div2);
			if(position == 'first'){
				container.insertBefore(comment, container.firstChild.nextSibling);
			}else{
				container.appendChild(comment);
			}
			
			this.changeTime();
			setInterval(() =>{
				this.changeTime();
			}, 1000*60);
		}

		changeTime(){
			const commentTime = document.querySelectorAll('.comment-section .comment .time');
			commentTime.forEach(element => {
				let seconds = element.dataset.seconds;
				let nanoseconds = element.dataset.nanoseconds;
				let timestamp = new firebase.firestore.Timestamp(seconds, nanoseconds).toDate();
				element.innerText = 'sent '+moment(timestamp, "YYYYMMDD").fromNow();
			});
		}
	}
});

