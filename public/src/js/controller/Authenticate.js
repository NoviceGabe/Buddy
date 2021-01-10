define(() => {
	return class Authenticate{
		
		static signOut(){
		  return auth.signOut().then(() => {
		  	 localStorage.clear();
		  	sessionStorage.clear();
		  	return true;
		  }).catch(() => {
		  	return false;
		  });
		 
		}

		static signIn(email, password){
		   	return auth.signInWithEmailAndPassword(email, password).then(cred =>{
		    	return true;
			}).catch(()=>{
			    return false;
			});
		}

	}
});