define(['authController'], (AuthController) => {
	return class Login{
		static initLoginForm(ref){
			const loginForm = document.querySelector(ref);
			if(loginForm){
				loginForm.addEventListener('submit', e => {
					e.preventDefault();
					(async()=>{
						const email = loginForm['email'].value.trim();
						const password = loginForm['password'].value.trim();

						if(email.length > 0 && password.length > 0){
							
							try {
								const auth = await AuthController.signIn(email.trim(), password.trim());
								if(auth){
										console.log('Login successful');
										document.location.href = DOMAIN;
								}else{
										console.log('Invalid email or password');
								}
							} catch(e) {
								console.log('Unable to log in. Please try again later');
							}
							
						}else{
							console.log('Please fill out the email and password.');
						}
						
					})();
				});
			}
		}

		static loginWithGoogle(){
			const googleProvider = new firebase.auth.GoogleAuthProvider();
			return auth.signInWithPopup(googleProvider).then(() => {
				return true;
			}).catch(err => {
				console.log(err);
			});
		}
	}
} );