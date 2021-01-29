define(['db'], db => {
	const UID = firebase.auth().currentUser.uid;

	return class Post extends db{

		constructor(firestore){
			super(firestore);
		}

		add(post){
			const ref = this.prepareCollection(`posts/${UID}/userPost`).doc();
			post.id = ref.id;
			return ref.set(post);
		}

		get(uid, postId){
			return this.get(`posts/${uid}/userPost/${postId}`);
		}

		getAll(id){
		 	return this.get(`posts/${id}/userPost`).then(snapshot => {
		        const posts = snapshot.docs.map(doc => ({
		        ...doc.data()
		        }));
		        return posts;
		    });
		}

		getAllByDate(id, order){
			return this.getAllOrderBy(`posts/${id}/userPost`, 'timestamp', order).then(snapshot => {
		        const posts = snapshot.docs.map(doc => ({
		        ...doc.data()
		        }));
		        return posts;
		    });
		}

		update(post){
			return this.hasPost(post.id).then(p => {
				if(p.docs.length > 0){
		           return this.update(`posts/${UID}/userPost/${post.id}`, post)
		           .then(() => {
		           	return true;
		           }).catch(error => {
		           		return false;
		           });
		        }
		        return false;
			}).catch(() => {
				return false;
			});
		}

		delete(id){
			return this.hasPost(id).then(p => {
				if(p.docs.length > 0){
					return this.delete(`posts/${UID}/userPost/${id}`)
					.then(() => {
		           		return true;
		           }).catch(error => {
		           		return false;
		           });
				}
		        return false;
			}).catch(() => {
				return false;
			});
		}

		like(id){
			const batch = this.batch();
			const like = this.prepare(`likes/${UID}_${id}`);
			batch.set(like, {
		        userId: UID,
		        postId: id,
		    });

		    const increment = firebase.firestore.FieldValue.increment(1);
		    const count = this.prepare(`posts/${UID}/userPost/${id}`);
		    batch.update(count, {
		      likeCount: increment
		    });

		    return batch.commit();
		}

		dislike(id){
			const batch = this.batch();
			const dislike = this.prepare(`likes/${UID}_${id}`);
			batch.delete(dislike);

			const decrement = firebase.firestore.FieldValue.increment(-1);
		    const count = this.prepare(`posts/${UID}/userPost/${id}`);
		    batch.update(count, {
		      likeCount: decrement
		    });

		    return batch.commit();
		}

		hasPost(id){
			return this.db.getByCustom(`posts/${UID}/userPost`, {
				attribute: 'id',
				operator: '==',
				value: id
			});
		}
	}
});