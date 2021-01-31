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
			return super.get(`posts/${uid}/userPost/${postId}`).then(doc => {
				return doc.data();
			});
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

		prepareAllByDate(id, order){
			return this.prepareAllOrderBy(`posts/${id}/userPost`, 'timestamp', order);
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

		like(postId, postUserId, userId){
			const batch = this.batch();
			const like = this.prepare(`likes/${userId}_${postId}`);
			batch.set(like, {
		        userId: userId,
		        postId: postId,
		    });

		    const increment = firebase.firestore.FieldValue.increment(1);
		    const count = this.prepare(`posts/${postUserId}/userPost/${postId}`);
		    batch.update(count, {
		      likeCount: increment
		    });

		    return batch.commit();
		}

		dislike(postId, postUserId, userId){
			const batch = this.batch();
			const dislike = this.prepare(`likes/${userId}_${postId}`);
			batch.delete(dislike);

			const decrement = firebase.firestore.FieldValue.increment(-1);
		    const count = this.prepare(`posts/${postUserId}/userPost/${postId}`);
		    batch.update(count, {
		      likeCount: decrement
		    });

		    return batch.commit();
		}

		async onToggleLike(postId, postUserId, userId, callback){
			try {
				const postLike = await this.hasLike(postId, userId);
				if(postLike.length){
				 	const dislike = await this.dislike(postId, postUserId, userId);
				 	const post = await this.get(postUserId, postId);
				 	callback(post.likeCount, false);
				}else{
				 	const like = await this.like(postId, postUserId, userId);
				 	const post = await this.get(postUserId, postId);
				 	callback(post.likeCount, true);
				 }
			} catch(e) {
				console.log(e.message);
			}
		}

		hasPost(id){
			return this.db.getByCustom(`posts/${UID}/userPost`, {
				attribute: 'id',
				operator: '==',
				value: id
			});
		}

		hasLike(postId, userId){
			return this.prepareCollection('likes')
			  .where('postId','==', postId)
			  .where('userId','==', userId)
			  .get()
			  .then(snapshot => {
			  	 const data = snapshot.docs.map(doc => ({
		        ...doc.data()
		        }));
			  	 return data;
			  });
		}
	}
});