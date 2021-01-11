define(() => {
	return class Authenticate{
		
		static signOut(){
		  return auth.signOut().then(() => {
		  	 localStorage.clear();
		  	sessionStorage.clear();
		  	return true;
		  });
		}

		static async signIn(email, password){
			
			try {
				const cred = await auth.signInWithEmailAndPassword(email, password);

			   	if(cred.user.emailVerified){
				   	return true;
				}

				try {
					const status = await Authenticate.signOut();
					if(status){
						throw new Error('Email is not verified');
					}
				} catch(e) {
					throw e;
				}

			} catch(e) {
				throw e;
			}		
		}

	}
});