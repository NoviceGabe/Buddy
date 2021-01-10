define(function(){
	return class Database{

		constructor(firestore){
			this.firestore = firestore; 
		}

		get(path){
			return this.firestore.doc(path).get();
		}

		getById(path, id){
			return this.firestore.collection(path).where("id", "==", id).get();
		}

		getByCustom(path, custom){
			return this.firestore.collection(path).where(custom.attribute, custom.operator, custom.value).get();
		}

		getAll(path){
			return this.firestore.collection(path).get();
		}

		getAllOrderBy(path, attribute, order){
			return this.firestore.collection(path).orderBy(attribute, order).get();
		}

		getCertainOrderBy(path, attribute, order, limit){
			return this.firestore.collection(path).orderBy(attribute, order).limit(limit).get();
		}

		getAllExcept(path, uid){
			return this.firestore.collection(path).where("id", "!=", uid).get();
		}

		prepare(path){
			return this.firestore.doc(path);
		}

		prepareByCustom(path, custom){
			return this.firestore.collection(path).where(custom.attribute, custom.operator, custom.value);
		}

		prepareCollection(path){
			return this.firestore.collection(path);
		}

		prepareAllOrderBy(path, attribute, order){
			return this.firestore.collection(path).orderBy(attribute, order);
		}

		prepareCertainOrderBy(path, attribute, order, limit){
			return this.firestore.collection(path).orderBy(attribute, order).limit(limit);
		}

		set(path, doc, merge){
			if(merge != undefined && merge === true){
				return this.firestore.doc(path).set(doc, {merge: true});
			}
			return this.firestore.doc(path).set(doc);
		}

		add(path, doc){
			return this.firestore.collection(path).add(doc);
		}

		update(path, doc){
			return this.firestore.doc(path).update(doc);
		}

		delete(path){
			return this.firestore.doc(path).delete();
		}

		batch(){
			return this.firestore.batch();
		}
	}
}, err => {
	console.log(err)
});