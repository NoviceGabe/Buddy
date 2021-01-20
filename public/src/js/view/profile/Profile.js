define(() => {
	return class Profile{
		constructor(state){
			this.state = state;
		}

		render(){
			const container = document.querySelector('#profile');
			let bio = '';
			let gender = '';
			let bday = '';
			let workplace = '';
			let workplaceSince = '';
			let college = '';
			let collegeClass = '';
			let highschool = '';
			let highschoolClass = '';

			if(this.state.bio){
				bio = this.state.bio;
			}
			if(this.state.gender){
				gender = this.state.gender;
			}
			if(this.state.bday){
				bday = this.state.bday;
			}
			if(this.state.workplace){
				workplace = this.workplaceTemplate(this.state);
				workplaceSince = this.workplaceSinceTemplate(this.state);
			}
			if(this.state.education){
				if(this.state.education.college){
					college = this.collegeTemplate(this.state);
					collegeClass = this.collegeClassTemplate(this.state);
				}

				if(this.state.education.highschool){
					highschool = this.highschoolTemplate(this.state);
					highschoolClass = this.highschoolClassTemplate(this.state);
				}
			}



			const template = `
				<div id="about">
					<div id="bio">
						<div class="header">
							<h4>BIO</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-bio">Edit</span>':''}
						</div>
						<div class="content">
							<p>${bio}</p>
						</div>
					</div>
					<div id="workplace">
						<div class="header">
							<h4>WORKPLACE</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-workplace">Edit</span>':''}
						</div>
						<div class="content">
							<h5>${workplace}</h5>
							<p>${workplaceSince}</p>
						</div>
					</div>
					<div id="education">
						<div class="header">
							<h4>EDUCATION</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-education">Edit</span>':''}
						</div>
						<div class="content">
							<div id="college">
								<div>
									<h5>${college}</h5>
									<p>${collegeClass}</p>
								</div>
							</div>
							<div id="highschool">
								<h5>${highschool}</h5>
								<p>${highschoolClass}</p>
							</div>
						</div>
					</div>
					<div id="address">
						<div class="header">
							<h4>ADDRESS</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-address">Edit</span>':''}
						</div>
						<div class="content">
							<h5>Lucena Pasig City</h5>
							<p>Current Home</p>
						</div>
					</div>
					<div id="contact">
						<div class="header">
							<h4>CONTACT INFO</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-contact">Edit</span>':''}
						</div>
						<div class="content">
							<div id="mobile">
								<h5>091234567801</h5>
								<p>Mobile Number</p>
							</div>
							<div id="email">
								<h5>johndoe123@gmail.com</h5>
								<p>Email</p>
							</div>
						</div>
					</div>
					<div id="basic-info">
						<div class="header">
							<h4>BASIC INFO</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-basic">Edit</span>':''}
						</div>
						<div class="content">
							<div id="gender">
								<div>
									<h5>Male</h5>
									<p>Gender</p>
								</div>
							</div>
							<div id="bday">
								<h5>August 21, 1997</h5>
								<p>Birthday</p>
							</div>
						</div>
					</div>
				</div>
			`;
			
			container.innerHTML = template;

		}

		workplaceTemplate(state){
			let workplace = '';
	
			if(state.workplace){
				if(state.workplace.name && state.workplace.position){
					workplace = `${state.workplace.position} at ${state.workplace.name}`;
				}else if(state.workplace.name){
					workplace = `Works at ${state.workplace.name}`;
				}
			}
			return workplace;
		}

		workplaceSinceTemplate(state){
			let since = '';
			let description = '';

			if(state.workplace){
				if(state.workplace.description){
					description = state.workplace.description;
				}

				if(state.workplace.start && !state.workplace.end){
					since = `${state.workplace.start.year}-present . <span>${description}</span>`;
				}else if(state.workplace.start && state.workplace.end){
					since = `${state.workplace.start.year}-
					${state.workplace.end.year} . <span>${description}</span>`;
				}else if(!state.workplace.start && state.workplace.end){
					since = `<span>${description}</span>`;
				}
			}

			return since;
		}

		collegeTemplate(state){
			let prefix = '';
			let college = '';
			if(state.education.college){
				let temp = state.education.college;

				if(!state.education.college.end){
					prefix = 'Studies';
				}else{
					prefix = 'Studied';
				}
				college = `${prefix} ${temp.course} at ${temp.name}`;
			}
			return college;
		}

		collegeClassTemplate(state){
			let collegeClass = 'College';
			if(state.education.college){
				if(state.education.college.start && !state.education.college.end){
					collegeClass = `${state.education.college.start.year}-present`;
				}else if(state.education.college.start && state.education.college.end){
					collegeClass = `${state.education.college.start.year}-
					${state.education.college.end.year}`;
				}else if(!state.education.college.start && state.education.college.end){
					collegeClass = `Class of ${state.education.college.end.year}`;
				}
			}
			
			return collegeClass;
		}

		highschoolTemplate(state){
			let highschool = '';
			if(state.education.highschool){
				let temp = state.education.highschool;
				highschool = `Went to ${temp.name}`;
			}
			return highschool;
		}

		highschoolClassTemplate(state){
			let highschoolClass = '';
			if(state.education.highschool && state.education.highschool.end){
				highschoolClass = `Class of ${state.education.highschool.end.year}`;
			}
			return highschoolClass;
		}

		updateCollege(state){
			let college = '';
			let collegeClass = '';

			const header = document.querySelector('#education #college h5');
			const subheader = document.querySelector('#education #college p');

			college = this.collegeTemplate(state);
			header.innerHTML = college;

			collegeClass = this.collegeClassTemplate(state);
			subheader.innerHTML = collegeClass;
		}

		updateHighSchool(state){
			let highschool = '';
			let highschoolClass = '';

			const header = document.querySelector('#education #highschool h5');
			const subheader = document.querySelector('#education #highschool p');

			highschool = this.highschoolTemplate(state);
			header.innerHTML = highschool;

			highschoolClass = this.highschoolClassTemplate(state);
			subheader.innerHTML = highschoolClass;
		}

		updateBio(value){
			const bio = document.querySelector('#bio .content > p');
			bio.innerHTML = value;
		}

		updateWorkplace(state){
			let workplace = '';
			let since = '';

			const header = document.querySelector('#workplace .content h5');
			const subheader = document.querySelector('#workplace .content p');

			workplace = this.workplaceTemplate(state);
			header.innerHTML = workplace;

			since = this.workplaceSinceTemplate(state);
			subheader.innerHTML = since;
		}
		
	}

});