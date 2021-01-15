define(['userModel','c_connectionsView', 'css!css/connections'], (UserModel, ConnectionsView)=>{
	const _userModel = new UserModel(firebase.firestore(), firebase.auth());

	return class Connections{
		constructor(state){
			this.state = state;
		}

		initViews(){
			const ref = sessionStorage.getItem('method');
			if(ref == 'following'){
				this.initFollowing();
			}
		}

		async initFollowing(){
			const following = await _userModel.getAllFollowing(firebase.auth().currentUser.uid);
			const followingUsers = await _userModel.fetchMembers(following);

			if(followingUsers){
				const connectionsView = new ConnectionsView();
				connectionsView.render('following', followingUsers, 'all');
			}
		}

	}
});