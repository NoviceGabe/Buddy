define(() => {

	const loginComponent = {
		render: () => {
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
			</div>`
		}
	}

	const registerComponent = {
		render: () => {
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
			</div>`
		}
	}

	const errorComponent = {
		render: () => {
			return `error`;
		}
	}

	const routes = [
	{
		path: '/login',
		template: loginComponent
	},
	{
		path: '/signup',
		template: registerComponent
	},
	{
		path: '/error',
		template: errorComponent
	}];

	return routes;
});