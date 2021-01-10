define(['db'], db => {
	return class User extends db{
		constructor(firestore, auth){
			super(firestore);
			this.auth = auth;

		}

		createUser(name, email, photoURL, groups){
			return {
				name: name,
				email: email,
				photoURL: photoURL,
				groups: groups,
			}
		}

		createAccount(email, password){
			return this.auth.createUserWithEmailAndPassword(email,password).then(cred => {
				cred.user.sendEmailVerification();
				return {
					uid: cred.user.uid.trim(), 
					timestamp: cred.user.metadata.creationTime
				}
			});
		}

		addUser(id, user){
			return this.set(`user/${id.trim()}`, user)
			.then(() => {
				return true;
			}).catch(() => {
				return false;
			});
		}

		getUser(uid){
			return this.get(`user/${uid}`).then(doc => {
			    return doc.data();
			});
		}

		async fetchMembers(group) {
			const members = [];
			for (const id of group) {
			  	members[id] = await this.getUser(id);
			}

			return members;
		}
	}
});