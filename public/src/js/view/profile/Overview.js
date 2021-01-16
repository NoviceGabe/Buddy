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
				</div>
				<div id="col-2">
					<div id="contacts">
						<h4 class="info-header">CONTACTS</h4>
						<p><b>Email:</b> ${this.state.email}</p>
						<p><b>Phone:</b> ${phone}</p>
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