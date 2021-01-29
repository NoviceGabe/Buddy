define(()=>{
	return class Post{
		constructor(){

		}

		render(posts){
			const container = document.querySelector('#newsfeed');

			const fragment = new DocumentFragment();

			posts.forEach(post => {
				let li = this.template(post);
				fragment.appendChild(li);
			});

			container.appendChild(fragment);

		}

		template(post){

		}
	}
});