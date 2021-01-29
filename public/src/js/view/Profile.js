define(()=>{
	const template = () =>{
		return `
			<div id="profile-section">

				<ul class="breadcrumb" >
				  <li><a href="#/">Buddy</a></li>
				  <li>Profile</li>
				</ul>
				
				<div id="profile-overview">
				</div>

				<div id="tabs">
				</div>

				<div id="tab-content">
					<div id="tab-1">
						<div id="profile">
						</div>
					</div>
					<div id="tab-2" class="remove">
						<div id="connections">
						</div>
					</div>
				</div>

				<div id="modal-bio" class="modal vertical-center-fixed" style="min-height:200px;width:70%">
					<div class="modal-header">
				    	<h3>Edit Bio</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content">
				    	<form id="form-bio" >
				    		<div id="bio">
				    			<textarea ></textarea>
				    		</div>
							<div id="count">
							    <span id="current">0</span>
							    <span id="maximum">/ 600</span>
							</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Save</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>

				<div id="modal-workplace" class="modal vertical-center-fixed" style="min-height:200px;width:60%">
					<div class="modal-header">
				    	<h3>Edit Workplace</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content">
				    	<form id="form-workplace">
				    		<input type="text" id="workplace-name" placeholder="Workplace name">
				    		<input type="text" id="workplace-position" placeholder="Position (optional)">
				    		<input type="text" id="workplace-description" placeholder="Description (optional)">
				    		<div id="workplace-since">
				    			<div class="start">
				    				<p>Start Date (Optional)</p>
				    				<select class="year" >
				    					<option value="empty"></option>
									</select>
									<select class="month">
										<option value="empty"></option>
									</select>
									<select class="day">
										<option value="empty"></option>
									</select>
				    			</div>
				    			<div class="end"> 
				    				<p>End Date (Optional)</p>
				    				<select class="year" >
				    					<option value="empty"></option>
									</select>
									<select class="month">
										<option value="empty"></option>
									</select>
									<select class="day">
										<option value="empty"></option>
									</select>
				    			</div>
				    		</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Save</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>

				<div id="modal-education" class="modal vertical-center-fixed" style="min-height:200px;width:70%;">
				  <div class="modal-header">
				    <h3>Edit Education</h3>
				    <span class="close">&times;</span>
				  </div>
				  <div class="modal-content">
				   	<div>
				   		 <span class="link" id="add-college">Add College School</span>
				   		 <span class="link" id="add-highschool">Add High School</span>
				   	</div>
				    <form id="form-education">
				    	<input type="text" id="school-name" class="remove">
				    	
				    	<div id="acad">
				    		<p>Degree</p>
				    		<div>
				    			<select id="degree">
					    			<option value="empty"></option>
					    			<option value="0">Associate's</option>
					    			<option value="1">Certificate / Diploma</option>
					    			<option value="2">Bachelor's</option>
					    			<option value="3">Master's</option>
					    			<option value="4">Doctorate</option>
					    			<option value="5">Graduate Certificates</option>
					    		</select>
				    		</div>
				    		<input type="text" id="course" placeholder="Course">
				    	</div>

				    	<div id="since" class="remove">
				    		<div id="college">
				    			<div class="start">
				    				<p>Start Date (Optional)</p>
				    				<select class="year" >
				    					<option value="empty"></option>
									</select>
									<select class="month">
										<option value="empty"></option>
									</select>
									<select class="day">
										<option value="empty"></option>
									</select>
				    			</div>
				    			<div class="end"> 
				    				<p>End Date (Optional)</p>
				    				<select class="year" >
				    					<option value="empty"></option>
									</select>
									<select class="month">
										<option value="empty"></option>
									</select>
									<select class="day">
										<option value="empty"></option>
									</select>
				    			</div>
				    		</div>
				    		<div id="highschool">
				    			<p>Graduated in (Optional)</p>
				    			<select class="year" >
				    				<option value="empty"></option>
				    			</select>
				    		</div>
				    	</div>
				    </form>
				  </div>
				  <div class="modal-footer">
				  	<button class="save">Save</button>
				     <button class="cancel">Cancel</button>
				  </div>
				</div>

				<div id="modal-address" class="modal vertical-center-fixed" style="min-height:150px;width:60%">
					<div class="modal-header">
				    	<h3>Edit Address</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content" style="height:100px">
				    	<form id="form-address">
				    		<input type="text" id="address-name" placeholder="Current Address">
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Save</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>

				<div id="modal-contact" class="modal vertical-center-fixed" style="min-height:200px;width:60%">
					<div class="modal-header">
				    	<h3>Edit Contact Info</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content" >
				    	<form id="form-contact">
				    		<div id="mobile">
				    		   <div>
					    		   	<label htmlFor="mobile-primary">Mobile Number (Primary)</label>
					    			<input type="text" id="mobile-primary" placeholder="Mobile Number (primary)">
				    		   </div>
				    			<div>
				    				<label htmlFor="mobile-secondary">Mobile Number (Secondary)</label>
				    				<input type="text" id="mobile-secondary" placeholder="Mobile Number (secondary)">
				    			</div>
				    		</div>
				    		<div id="email">
				    			<div>
				    				<label htmlFor="email-secondary">Email Address (Secondary)</label>
				    				<input type="email" id="email-secondary" placeholder="Email Address (secondary)">
				    			</div>
				    		</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Save</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>

				<div class="overlay">
					<div id="modal-password" class="modal vertical-center-fixed" style="min-height:150px;width:30%;top:100px">
						<div class="modal-header">
					    	<h3>Enter your password</h3>
					    	<span class="close">&times;</span>
					    </div>
					    <div class="modal-content" style="height:100px">
					    	<form id="form-password">
					    		<input type="password" id="password" placeholder="Password">
							</form>
					    </div>
					   <div class="modal-footer">
					  	  	<button class="save">Ok</button>
					    	<button class="cancel">Cancel</button>
					  </div>
					</div>
				</div>	

				<div id="modal-basic" class="modal vertical-center-fixed" style="min-height:200px;width:50%">
					<div class="modal-header">
				    	<h3>Edit Basic Info</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content" style="min-height:100px">
				    	<form id="form-basic">
				    		<div id="gender">
				    		  <p>Gender</p>
				    		  <div>
							    <input type="radio" id="male" name="radio-group" checked value="male">
							    <label for="male">Male</label>
							  </div>
							  <div>
							    <input type="radio" id="female" name="radio-group" value="female">
							    <label for="female">Female</label>
							  </div>
							  <div>
							    <input type="radio" id="other" name="radio-group" value="other">
							    <label for="other">Other</label>
							  </div>
				    		</div>
				    		<div id="bday">
				    			<p>Birthday</p>
				    			<select class="year" >
				    				<option value="empty"></option>
								</select>
								<select class="month">
									<option value="empty"></option>
								</select>
								<select class="day">
									<option value="empty"></option>
								</select>
				    		</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Save</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>

				<button id="logout">logout</button>
			</div>
			`;
		}

	const render = () =>{
		const container = document.querySelector('#container');
		container.innerHTML = template(); 
	}

	return {
		render : render
	};
});