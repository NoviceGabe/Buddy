define(()=>{
	const template = () =>{
		return `
			<p>Error 404</p>
			<a href="#/login">Login</a>
			<a href="#/signup">Signup</a>
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