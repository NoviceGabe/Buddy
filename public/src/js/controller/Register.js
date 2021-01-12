define(['userModel', 'validator', 'authController', 'util'], (UserModel, Validator,  AuthController, Util) => {
	return class Register{
		static initRegisterForm(ref){
			const registerForm = document.querySelector(ref);
			if(registerForm){
				registerForm.addEventListener('submit', e => {
					e.preventDefault();
					
					(async () => {
						const fname = registerForm['fname'].value.trim();
						const surname = registerForm['surname'].value.trim();
						const email = registerForm['email'].value.trim();
						const password = registerForm['password'].value.trim();

						if((fname.length > 0 && surname.length > 0) && (email.length > 0 && password.length > 0)){
							if(!Validator.isNameValid(fname)){
								console.log('Invalid First Name');
							}else if(!Validator.isNameValid(surname)){
								console.log('Invalid Surname');
							}else if(!Validator.isEmailValid(email)){
								console.log('Invalid Email Address');
							}else if(password.length < 8){
								console.log('Password must be at least 8 characters');
							}else if(password.length > 25){
								console.log('Password must not exceed 25 characters');
							}else if(!Validator.isPasswordValid(password)){
								console.log('Password must start with a capital letter and contains at least one number')
							}else{
								// register
								try {
									const userModel = new UserModel(firebase.firestore(), firebase.auth());
									const name = Util.toCapitalizeString(fname+' '+surname);
									const userdata = userModel.createUser(name, email, '', []);

									const account = await userModel.createAccount(userdata.email, password);

									if(account){
										userdata.uid = account.uid;
										userdata.timestamp = account.timestamp;
										const isUserAdded = await userModel.addUser(userdata.uid, userdata);

										if(isUserAdded){
											console.log('Register successful');
											const status = await AuthController.signOut();
											document.location.href = DOMAIN+'#/login';
										}else{
											console.log('Unable to register user to the database');
										}
									}
					
								} catch(e) {
									console.log(e.message);
								}
							}
						}else{
							console.log('Please fill out the the required fields.');
						}
					})();

				});
			}
		}
	}
});