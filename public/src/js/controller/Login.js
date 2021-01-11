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
								console.log(auth)
								if(auth){
										console.log('Login successful');
										document.location.href = DOMAIN;
								}else{
										console.log('Invalid email or password');
								}
							} catch(e) {
								switch (e.code) {
									case 'auth/user-not-found':
										console.log('A user with this email address doesn\'t exist');
										break;
									default:
										console.log(e.message);
										break;
								}
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
			return auth.signInWithPopup(googleProvider);
			
		}

		static loginWithFacebook(){
			const facebookProvider = new firebase.auth.FacebookAuthProvider();
			return auth.signInWithPopup(facebookProvider);
		}
	}
} );