define(['util'],(Util) => {
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
			let address = '';
			let mobilePrimary = '';
			let mobileSecondary = '';
			let emailPrimary = '';
			let emailSecondary = '';


			if(this.state.bio){
				bio = this.state.bio;
			}
			if(this.state.gender){
				gender = this.state.gender;
			}
			if(this.state.birthday){
				bday = this.bdayTemplate(this.state.birthday);
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

			if(this.state.address){
				address = this.state.address;
			}

			if(this.state.email){
				if(this.state.email[0]){
					emailPrimary = this.state.email[0];
				}

				if(this.state.email[1]){
					emailSecondary = this.state.email[1];
				}
			}

			if(this.state.mobile){
				if(this.state.mobile[0]){
					mobilePrimary = this.state.mobile[0];
				}

				if(this.state.mobile[1]){
					mobileSecondary = this.state.mobile[1];
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
								<div ${(college && highschool)?'style="margin-bottom:15px"':''}>
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
							<h5>${address}</h5>
							<p>${(address.length > 0)? 'Current Home': ''}</p>
							
						</div>
					</div>
					<div id="contact">
						<div class="header">
							<h4>CONTACT INFO</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-contact">Edit</span>':''}
						</div>
						<div class="content">
							<div id="mobile" ${(mobilePrimary || mobileSecondary)?'style="margin-bottom: 15px;"':''}>
								<div class="primary"  ${(mobilePrimary && mobileSecondary)?'style="margin-bottom:15px"':''}>
									<h5>${mobilePrimary}</h5>
									<p>${(mobilePrimary)?'Mobile Number (Primary)':''}</p>
								</div>
								<div class="secondary">
									<h5>${mobileSecondary}</h5>
									<p>${(mobileSecondary)?'Mobile Number (Secondary)':''}</p>
								</div>
							</div>
							<div id="email">
								<div class="primary" ${(emailPrimary && emailSecondary)?'style="margin-bottom:15px"':''}>
									<h5>${emailPrimary}</h5>
									<p>${(emailPrimary)?'Email (Primary)':''}</p>
								</div>
								<div class="secondary">
									<h5>${emailSecondary}</h5>
									<p>${(emailSecondary)?'Email (Secondary)':''}</p>
								</div>
							</div>
						</div>
					</div>
					<div id="basic-info">
						<div class="header">
							<h4>BASIC INFO</h4>
							${(firebase.auth().currentUser.uid == this.state.uid)?'<span id="edit-basic">Edit</span>':''}
						</div>
						<div class="content">
							<div id="gender"  ${(gender && bday)?'style="margin-bottom:15px"':''}>
								<div>
									<h5>${(gender)?Util.toCapitalizeString(gender):gender}</h5>
									<p>${(gender)?'Gender':''}</p>
								</div>
							</div>
							<div id="bday">
								<h5>${bday}</h5>
								<p>${(bday)?'Birthday':''}</p>
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

		bdayTemplate(birthday){
			const months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];

			let bday = '';
			if(birthday){
				bday = `${months[birthday.month]} ${birthday.day}, ${birthday.year}`;
			}
			return bday;
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

		updateBio(bio){
			const p = document.querySelector('#bio .content > p');
			p.innerHTML = bio;
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

		updateAddress(address){
			const header = document.querySelector('#address .content h5');
			header.innerHTML = address;

			const subheader = document.querySelector('#address .content p');
			subheader.innerHTML = 'Current Home';
		}

		updateContact(state){
			if(state.mobile){
				if(state.mobile[0]){
					const header = document.querySelector('#contact #mobile .primary h5');
					header.innerHTML = state.mobile[0];

					const subheader = document.querySelector('#contact #mobile .primary p');
					subheader.innerHTML = 'Mobile Number (Primary)';
				}

				if(state.mobile[1]){
					const header = document.querySelector('#contact #mobile .secondary h5');
					header.innerHTML = state.mobile[1];

					const subheader = document.querySelector('#contact #mobile .secondary p');
					subheader.innerHTML = 'Mobile Number (Secondary)';
				}
			}

			if(state.email){
				if(state.email[0]){
					const header = document.querySelector('#contact #email .primary h5');
					header.innerHTML = state.email[0];

					const subheader = document.querySelector('#contact #email .primary p');
					subheader.innerHTML = 'Email (Primary)';
				}


				if(state.email[1]){
					const header = document.querySelector('#contact #email .secondary h5');
					header.innerHTML = state.email[1];

					const subheader = document.querySelector('#contact #email .secondary p');
					subheader.innerHTML = 'Email (Secondary)';
				}
			}
			
		}

		updateBday(bday){
			const header = document.querySelector('#basic-info .content #bday h5');
			header.innerHTML = this.bdayTemplate(bday);

			const subheader = document.querySelector('#basic-info .content #bday p');
			subheader.innerHTML = 'Birthday';
		}


		
	}

});