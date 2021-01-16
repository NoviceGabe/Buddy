define(['db'], db => {
	return class Chat extends db{

		constructor(firestore){
			super(firestore);
			this.snapshot;
		}

		invite(from, to){
			const ref = this.prepareCollection('invite').doc();
			return ref.set({
				id:ref.id,
				createdBy: from,
				to: to,
				accept: false,
				createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
			}).then(() => {
				return true;
			}).catch(() => {
				return false;
			});
		}

		getInvitation(from, to){
			return this.prepareCollection('invite')
			.where('createdBy', '==', from)
			.where('to', '==', to).get().then(snapshot => {
				this.snapshot = snapshot;
		        const invitation = snapshot.docs.map(doc => ({
		        ...doc.data()
		        }));
		        return invitation;
		    });;
		}

		accept(from, to){
			return this.prepareCollection('invite')
			.where('to', '==', to)
			.where('createdBy', '==', from).get().then(snapshot => {
				const invite = snapshot.docs.map(doc => ({
			    ...doc.data()
			    }));

			    return this.update(`invite/${invite[0].id}`, {
			    	accept: true
			    }).then(() => {
			    	return true;
			    }).catch(() => {
			    	return false;
			    });
			});
		}

		createGroup(uid, name, members){
			const ref = this.prepareCollection('group').doc();
			return ref.set({
				id:ref.id,
				createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
				createdBy: uid,
				members:members,
				name: name,
				type:1
			}).then(() => {
				return ref.id;
			}).catch(() => {
				return false;
			});
		}

		getGroupByUserID(uid) {
			return new Promise((resolve, reject) => {
			    const ref = this.prepareCollection('group');
			    ref
			    .where('members', 'array-contains', uid)
			    .onSnapshot(querySnapshot => {
			    	const allGroups = [];
			    	this.snapshot = querySnapshot;

			    	querySnapshot.docChanges().forEach(change =>{
	                    if(change.type=="added"){
					        const data = change.doc.data();
					        allGroups.push(data);
					      
	                    }else if(change.type == "modified"){
	                    	const data = change.doc.data();
					        allGroups.push(data);
	                    }
	    			});

	    			if(allGroups.length > 0){
					    resolve(allGroups)
					}else{
					    reject('No group associated with user '+uid);
					}
			       
			    });
		   	});
		}

		prepareGroupByUserId(uid){
			return this.prepareCollection('group').where('members', 'array-contains', uid); 
		}

		prepareGroupByUser(user){
			return this.prepareCollection('group').where('members', 'array-contains', user); 
		}


		getMessagesByGroupId(groupId, order, limit) {
			return this.getCertainOrderBy(`message/${groupId.trim()}/messages`, 'sentAt', order, limit).then(snapshot => {
				this.snapshot = snapshot;
		        const messages = snapshot.docs.map(doc => ({
		        ...doc.data()
		        }));
		        return messages;
		    });
		}

		prepareMessagesByGroupId(groupId, order, limit) {
			return this.prepareCertainOrderBy(`message/${groupId.trim()}/messages`, 'sentAt', order, limit);
		}

		getGroup(groupId){
			return new Promise((resolve, reject) => {
				return this.prepare(`group/${groupId.trim()}`).onSnapshot(doc => {
					if(doc.exists){
			       	 	resolve(doc.data())
			       	}else{
			       		reject('No message');
			      	}
			    
			  });
			}); 
		}

		commitMessage(groupId, uid, message){
			const batch = this.batch();
			const messages = this.prepareCollection(`message/${groupId}/messages`).doc();
			message = message.trim();
			message = message.replace(/\r\n|\r|\n/g,"<br>");

		    batch.set(messages, {
				sentBy: uid,
				content: message,
				sentAt: firebase.firestore.Timestamp.fromDate(new Date())
			});

			const group = this.prepare(`group/${groupId}`);

			batch.update(group, {
				recentMessage:{
					content: message,
					readBy:{
						sentAt: firebase.firestore.Timestamp.fromDate(new Date()),
						sentBy: uid
					}
				}
			});
			return batch.commit().then(() => {
				return true;
			}).catch(() => {
				return false;
			});
		}

		prepareCertainMessages(id, order, limit){
			return this.prepareCertainOrderBy(`message/${id}/messages`, 'sentAt', order, limit);
		}

	}
});