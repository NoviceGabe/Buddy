define(['authController', 'css!css/login-register'], (AuthController) => {
	let _router;

	return class Login{
		constructor(router){
			_router = router;

			const path = sessionStorage.getItem('path');
			const segment = path.split('/');

			if(segment.length == 2){
				(async () => {
					try {
						let status;
						const method = segment.pop();

						if(method == 'google'){
							status = await Login.loginWithGoogle();
						}else if(method == 'facebook'){
							status = await Login.loginWithFacebook();
						}

						const result = await Promise.resolve(status);
						console.log('result', result)

						if(result.additionalUserInfo.isNewUser && 
							((result.additionalUserInfo.providerId == GOOGLE_PROVIDER &&
							result.additionalUserInfo.profile.verified_email) || 
							(result.additionalUserInfo.providerId == FACEBOOK_PROVIDER))){
									
							const data = result.user.providerData[0];
							const userData = userModel.createUser(
										data.displayName, 
										data.email, 
										data.photoURL);

							userData.uid = result.user.uid;
							userData.timestamp = result.user.metadata.creationTime;

							const isUserAdded = await userModel.addUser(userData.uid, userData);
						}
						location.reload(true);
						_router.navigate('/');

					} catch(e) {
						console.log(e.message);
					}
								
				})();
			}else{
				Login.initLoginForm();
			}
		}

		static initLoginForm(){
			const loginForm = document.querySelector('#login-form');
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
										location.reload(true);
										_router.navigate('/');
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
			return firebase.auth().signInWithPopup(googleProvider);
			
		}

		static loginWithFacebook(){
			const facebookProvider = new firebase.auth.FacebookAuthProvider();
			return firebase.auth().signInWithPopup(facebookProvider);
		}
	}
} );