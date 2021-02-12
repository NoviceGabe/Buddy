define(['swal'],(swal) => {
	return class Authenticate{
		
		static async signIn(email, password){
			
			try {
				const cred = await firebase.auth().signInWithEmailAndPassword(email, password);

			   	if(cred && cred.user.emailVerified){
				   	return true;
				}

				firebase.auth().signOut();
				throw new Error('Email is not verified');
				
			} catch(e) {
				swal("Unable to login", e.message,
                                    "error");
				return false;
			}		
		}

		static reauthenticate(currentPassword){
		  const user = firebase.auth().currentUser;
		  const cred = firebase.auth.EmailAuthProvider.credential(
		      user.email, currentPassword);
		  return user.reauthenticateWithCredential(cred);
		}

		static changeEmail = (currentPassword, newEmail) => {
			return Authenticate.reauthenticate(currentPassword).then(() => {
			    const user = firebase.auth().currentUser;
			    user.updateEmail(newEmail).then(() => {
			    	user.sendEmailVerification();
			        console.log("Email updated!");
			      return user.uid;
			    }).catch((error) => { 
			    	 console.log(error.message); 
			    	return false;
			    });
			  }).catch((error) => {
			   console.log(error.message); 
			   return false;
			});
		}

	}
});