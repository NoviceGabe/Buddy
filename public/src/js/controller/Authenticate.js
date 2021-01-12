define(() => {
	return class Authenticate{
		
		static async signIn(email, password){
			
			try {
				const cred = await firebase.auth().signInWithEmailAndPassword(email, password);

			   	if(cred.user.emailVerified){
				   	return true;
				}

				firebase.auth().signOut().then(() => {
					throw new Error('Email is not verified');
				});
				
			} catch(e) {
				throw e;
			}		
		}

	}
});