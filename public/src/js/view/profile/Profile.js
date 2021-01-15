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
			let education = '';

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
				workplace = this.state.workplace;
			}
			if(this.state.education){
				if(this.state.education.college){
					let college = this.state.education.college;
					education = `<p>${college.course} at ${college.name}</p>`;
				}
				if(this.state.education.highschool){
					let highschool = this.state.education.highschool;
					education += `<p>${highschool.name}</p>`;
				}
			}

			const template = `
				<div id="content-general">
					 <h4 class="info-header">GENERAL INFORMATION</h4>
					<p><b>Gender: </b>${gender}</p>
					<p><b>Birthday: </b>${bday}</p>
					<p><b>Workplace: </b>${workplace}</p>
					<p><b>Education: </b></p>
					${education}
				</div>
				<h4 class="info-header">ABOUT</h4>
				<p></p>
				`;

			container.innerHTML = template;

		}

		
	}

});