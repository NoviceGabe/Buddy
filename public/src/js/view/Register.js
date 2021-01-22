define(()=>{
	const template = () =>{
		return `<div id="register-section" class="clear-fix">
				<div class="col-1 float-left">
					<h1>Buddy</h1>
				</div>
				<div class="col-2 float-right">
					<div>
						<p>Welcome to Buddy</p>
						<h1>Create your account</h1>
						<form id="signup-form">
							<label for="email">Email</label>
							<input type="email" id="email" placeholder="Email">
							<label for="password">Password</label>
							<input type="password" id="password" placeholder="Password">
							<label for="fname">First name</label>
							<input type="text" id="fname" placeholder="First Name">
							<label for="surname">Surname</label>
							<input type="text" id="surname" placeholder="Surname">
							<input type="submit" value="Join">
						</form>
						<p>Already have an account? <a href="#/login">Login here</a></p>
					</div>
				</div>
			</div>`;
		}

	const render = () =>{
		const container = document.querySelector('#container');
		container.innerHTML = template(); 
	}

	return {
		render : render
	};
});