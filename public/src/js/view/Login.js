define(()=>{
	const template = () =>{
		return `
			<div id="login-section" class="clear-fix">
				<div class="col-1 float-left">
					<h3>Buddy</h3>
					<div>
						<h2>New to Buddy?</h2>
						<a href="#/signup">Join us</a>
					</div>
				</div>
				<div class="col-2 float-right">
					<div>
						<p>Welcome back to Buddy</p>
						<h1>Login to your account</h1>
						<form id="login-form">
							<label for="email">Email</label>
							<input type="email" id="email" placeholder="Email">
							<label for="password">Password</label>
							<input type="password" id="password" placeholder="Password">
							<input type="submit" value="Login"> 
						</form>

						<div class="divider">
				         <span>or</span>
				       </div>
				       <div class="social-media">
				       		<p>Log in with</p>
				       		<a href="#/login/facebook" class="fa fa-facebook" id="login-fb"></a>
							<a href="#/login/google" class="fa fa-google" id="login-google"></a>
				       </div>
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