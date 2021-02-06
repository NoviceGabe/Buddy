define(()=>{
	const template = () =>{
		return `
			<div id="home-section">
				<div id="header">
					<div>
						<h1 >My Feed</h1>
						<button id="write-post">Write post</button>
					</div>
				</div>
				<div id="home-main">
					<div id="newsfeed" class="col-1">
					</div>
					<div class="col-2">
						<div id="suggestions"></div>
					</div>
				</div>
			</div>
			`;
		}

	const render = () =>{
		const container = document.querySelector('#container');
		container.innerHTML = template(); 
	}

	return {
		render : render
	};
});