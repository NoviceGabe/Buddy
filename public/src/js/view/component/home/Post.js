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
			    }
			    else {
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
			footer.classList.add('post-footer');

			const likeCounter = document.createElement('div');
			const actions = document.createElement('div');

			likeCounter.classList.add('like');
			likeCounter.classList.add('clear-fix');

			actions.classList.add('actions');
			actions.classList.add('clear-fix');

			const image = document.createElement('img');
			image.setAttribute('src', 'src/assets/like-filled.png');
			image.classList.add('float-left');
			image.setAttribute('height', '10');
			image.setAttribute('width', '18');

			const countContainer = document.createElement('span');
			countContainer.classList.add('count');
			countContainer.classList.add('float-left');

			let count = 0;

			if(post.likeCount){
				count = post.likeCount;
			}

			countContainer.innerText = count;

			likeCounter.appendChild(image);
			likeCounter.appendChild(countContainer);

			const like = document.createElement('span');
			const comment = document.createElement('span');
			const share = document.createElement('span');

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

			const commentSection = document.createElement('div');
			const comments = document.createElement('div');
			const input = document.createElement('div');
			const div1 = document.createElement('div');
			const div2 = document.createElement('div');

			const avatar = document.createElement('img');
			const commentInput = document.createElement('textarea');
			commentInput.setAttribute('placeholder', 'Write a comment..');
			commentSection.classList.add('comment-section');
			comments.classList.add('comments');
			input.classList.add('input');

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

			footer.appendChild(likeCounter);
			footer.appendChild(actions);
			footer.appendChild(commentSection)

			return footer;
		}
	}
});

