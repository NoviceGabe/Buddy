define(['db'], db => {
	return class User extends db{
		constructor(firestore, auth){
			super(firestore);
			this.auth = auth;
		}

		createUser(name, email, photoURL = '', groups = []){
			return {
				name: name,
				email: [email],
				photoURL: photoURL,
				groups: groups,
				followerCount: 0,
				followingCount: 0,
				emailUpdateCount: 0,
				roles:{
					client:true
				} 
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

		prepareUser(uid){
			return this.prepare(`user/${uid}`);
		}

		getAllUsers(){
			return this.db.getAll('user').then(snapshot => {
			    const users = snapshot.docs.map(doc => ({
			    ...doc.data(),
			    }));
			    return users;
			});
		}

		getAllUsersExcept(uid){
			let query = this.prepareCollection('user')
			query = query.where('uid', '!=', uid);
			//query = query.where('emailVerified', '==', true);
			return query.get().then(snapshot => {
			    const users = snapshot.docs.map(doc => ({
			    ...doc.data(),
			    }));
			    return users;
			});
		}

		updateUser(uid, data){
			return this.update(`user/${uid}`, data);
		}

		mergeUpdateUser(uid, data){
			return this.set(`user/${uid}`, data, true).then(() =>{
				return true;
			}).catch(() => {
				return false;
			});
		}

		async fetchMembers(group) {
			const members = [];
			for (const g of group) {
				let user = await this.getUser(g.id);
				members.push(user);
			}
			return members;
		}

		async mergeMemberDataFromGroup(groups){
			let _groups = JSON.parse(JSON.stringify(groups));

			for (const group of _groups) {
				let member = group.members.filter(member => member.uid != firebase.auth().currentUser.uid);
				let user = await this.getUser(member[0].uid);
				group.member = user;
			}
			return _groups;
		}

		async fetchNotFollowingUsers(suggestions){
			const members = [];

			for (const user of suggestions) {
				let following = await this.getFollowing(firebase.auth().currentUser.uid.trim(), user.uid);
			  	if(following == undefined){
			  		members.push(user);
		        }
			}
			return members;
		}

		getFollowing(uid, id){
			return  this.get(`following/${uid}/userFollowing/${id}`)
			.then(doc => {
			    return doc.data();
			});
		}

		getAllFollowing(uid){
			return this.getAll(`following/${uid}/userFollowing`).then(snapshot => {
			    const following = snapshot.docs.map(doc => ({
			    ...doc.data()
			    }));
			    return following;
			});
		}

		getAllFollowers(uid){
		  return this.getAll(`following/${uid}/userFollowers`).then(snapshot => {
		       const followers = snapshot.docs.map(doc => ({
		      ...doc.data()
		      }));
		      return followers;
		  });
		}

		follow(followerId, followedId){
			const batch = this.batch();

		    const following = this.prepare(`following/${followerId.trim()}/userFollowing/${followedId.trim()}`);
		    batch.set(following, {
		      uid:followedId
		    });
	        
	        const increment = firebase.firestore.FieldValue.increment(1);
	        const followerUser = this.prepare(`user/${followerId}`);

	        batch.update(followerUser, {
		      followingCount: increment
		    });

		    const follower = this.prepare(`following/${followedId.trim()}/userFollowers/${followerId.trim()}`);
		    batch.set(follower, {
		      uid:followerId
		    });

		    const followedUser = this.prepare(`user/${followedId}`);

	        batch.update(followedUser, {
		      followerCount: increment
		    });

		    return batch.commit();
	        	    
		}

		unfollow(followerId, followedId){
			const batch = this.batch();

	 		const following = this.prepare(`following/${followerId}/userFollowing/${followedId}`);
		    batch.delete(following);

		    const decrement = firebase.firestore.FieldValue.increment(-1);
	        const followerUser = this.prepare(`users/${followerId}`);

	        batch.update(followerUser, {
		      followingCount: decrement
		    });

		    const follower = this.prepare(`following/${followedId}/userFollowers/${followerId}`);
		    batch.delete(follower);

		    const followedUser = this.prepare(`users/${followedId}`);

	        batch.update(followedUser, {
		      followerCount: decrement
		    });

		    return batch.commit();
		}

		onToggleFollow(e){
		  const target = e.target;
		  const parent = target.parentElement;
		  const id = parent.getAttribute('id').trim();

		  const following = this.db.getById(`following/${this.user.uid}/userFollowing`, id);
		  following.then(snapshot => {

		    if(snapshot.docs.length == 0){
		        this.follow(this.user.uid, id)
		        .then(() => {
		        	console.log('follow '+id)
		          	//target.innerText = 'unfollow';
		        }).catch(error => console.log(error));
		        return;
		    }

		    snapshot.forEach(doc => {
		        if(doc.exists){
		            this.unfollow(this.user.uid, id)
		            .then(() => {
		            	console.log('unfollow '+id)
		              	//target.innerText = 'follow';
		            }).catch(error => console.log(error));
		        }
		    });
		  });
		}

	}
});