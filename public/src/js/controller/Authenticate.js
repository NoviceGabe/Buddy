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

	/*	static reauthenticate(currentPassword){
		  const user = firebase.auth().currentUser;
		  const cred = firebase.auth.EmailAuthProvider.credential(
		      user.email, currentPassword);
		  return user.reauthenticateWithCredential(cred);
		}*/

		static changeEmail = (currentPassword, newEmail) => {
			return Authenticate.reauthenticate(currentPassword).then(() => {
			    const user = firebase.auth().currentUser;
			    user.updateEmail(newEmail).then(() => {
			      console.log("Email updated!");
			      return true;
			    }).catch((error) => { 
			    	console.log(error); 
			    	return false;
			    });
			  }).catch((error) => {
			   console.log(error); 
			   return false;
			});
		}

	}
});