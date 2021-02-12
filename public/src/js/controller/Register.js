define(['userModel', 'validator', 'authController', 'util', 'swal','css!css/login-register'], 
	(UserModel, Validator,  AuthController, Util, swal) => {
	let _router;

	return class Register{
		constructor(router){
			_router = router;
			Register.initRegisterForm();
		}

		static initRegisterForm(){
			const registerForm = document.querySelector('#signup-form');
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
								swal("Register unsuccessful!", 
									"Invalid First Name",
											 "error");
							}else if(!Validator.isNameValid(surname)){
								swal("Register unsuccessful!", 
									"Invalid Surname",
											 "error");
							}else if(!Validator.isEmailValid(email)){
								swal("Register unsuccessful!", 
									"Invalid Email Address",
											 "error");
							}else if(password.length < 8){
								swal("Register unsuccessful!", 
									"Password must be at least 8 characters",
											 "error");
							}else if(password.length > 25){
								
								swal("Register unsuccessful!", 
									"Password must not exceed 25 characters",
											 "error");
							}else if(!Validator.isPasswordValid(password)){
								swal("Register unsuccessful!", 
									"Password must start with a capital letter and contains at least one number",
											 "error");
							}else{
								// register
								try {
									const userModel = new UserModel(firebase.firestore(), firebase.auth());
									const name = Util.toCapitalizeString(fname+' '+surname);
									const userdata = userModel.createUser(name, email);

									const account = await userModel.createAccount(userdata.email[0], password);

									if(account){
										userdata.uid = account.uid;
										userdata.timestamp = account.timestamp;
										const isUserAdded = await userModel.addUser(userdata.uid, userdata);

										if(isUserAdded){
											swal("Register successful!", "Check your email for verification",
											 "success");
											firebase.auth().signOut().then(() => {
												_router.navigate('/login');
											});
										}else{
											swal("Register unsuccessful", "Try again",
											 "error");
										}
									}
					
								} catch(e) {
									swal("Register unsuccessful", e.message,
											 "error");
									console.log(e.message);
								}
							}
						}else{
							swal("Register unsuccessful", "Please fill out the the required fields.",
											 "error");
						}
					})();

				});
			}
		}
	}
});