define(()=>{
	return class Overview{
		constructor(state){
			this.state = state;
		}

		render(){
			const container = document.querySelector('#profile-overview');
			let imagePath = 'src/assets/man.jpg';
			let address = '';
			let phone = '';

			if(this.state.photoURL){
				imagePath = this.state.photoURL;
			}	
			if(this.state.address){
				address = this.state.address;
			}
			if(this.state.phone){
				phone = this.state.phone;
			}
			let chat = `<img src="src/assets/invite_chat.png" height="30" width="30" class="chat" data-chat="invite">`;

			if(firebase.auth().currentUser.uid == this.state.uid){
				chat = '';
			}

			const template = `
				<div id="col-1">
					<img src="${imagePath}" alt="profile image" class="profile-image" 
						height="110" width="110">
					<div id="overview-general">
						<h1>${this.state.name}</h1>
						<p>${address}</p>
						<div class="social-media">
						</div>	
					</div>
					${chat}
					
					<div class="p-image">
				       <i class="fa fa-camera upload-button"></i>
				        <input class="file-upload" type="file" accept="image/*"/>
				     </div>
					
				</div>
				<div id="col-2">
					<div id="ratings">
						<div>
							<h3>Rating</h3>
							<div>
								<span id="rating-value">0.0</span>
								<span class="fa fa-star"></span>
								<span class="fa fa-star"></span>
								<span class="fa fa-star"></span>
								<span class="fa fa-star"></span>
								<span class="fa fa-star"></span>
							</div>
							<p id="review">0 review</p>
						</div>
					</div>
					<div id="count">
						<div>
							<div id="followers">
								<h1>${this.state.followerCount || 0}</h1>
								<p>Followers</p>
							</div>
							<div id="followings">
								<h1>${this.state.followingCount || 0}</h1>
								<p>Following</p>
							</div>
							<div id="reports">
								<h1>${this.state.reportCount || 0}</h1>
								<p>Reports</p>
							</div>
						</div>
					</div>
				</div>
			`;
			container.innerHTML = template;

			if(this.state.socialIds){
				const socialIdList = document.querySelector('#profile-overview .social-media');
				if(this.state.socialIds.facebook){
					socialIdList.innerHTML += `
					<a href="${this.state.socialIds.facebook}" target="_blank">
					<i class="fa fa-facebook"></i>
					</a>`;
				}
				if(this.state.socialIds.twitter){
					socialIdList.innerHTML += `
					<a href="${this.state.socialIds.twitter}" target="_blank"> 
					<i class="fa fa-twitter"></i>
					</a>`;
				}
				if(this.state.socialIds.linkedin){
					socialIdList.innerHTML += `
					<a href="${this.state.socialIds.linkedin}" target="_blank">
					<i class="fa fa-linkedin"></i>
					</a>`;
				}
			}
		}
	}
});