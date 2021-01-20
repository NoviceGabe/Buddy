define([''],() => {

	const homeComponent = {
		render: () => {
			return `home`;
		}
	}

	const connectionComponent = {
		render: () => {
			return `
			<div id="connections-section">

				<ul class="breadcrumb" >
				  <li><a href="#/">Buddy</a></li>
				  <li>Connections</li>
				</ul>
				
				<div id="connections-container" class="clear-fix">
				</div>

			</div>
			`;
		}
	}

	const serviceComponent = {
		render: () => {
			return `service`;
		}
	}

	const chatComponent = {
		render: () => {
			return `
			<div id="chat-section" class="flex-container">
				<div id="sidebar">
					<h3 >Chats</h3>
					<div id="chat-request">Chat Request</div>
					<div id="chat-dialog" ></div>
				</div>
				<div id="main">
					<div class="pre-loader" id="loader">
					    <img src="src/assets/Rolling-1s-200px.gif" height="120" width="120">
					</div>
					
					<ul id="invitation-dialog"></ul>
					<ul id="bubble-dialog"></ul>

					<form id="message-form" class="remove">
						<textarea placeholder="Send a message.." id="message-input"></textarea>
						<i class="fa fa-paper-plane fa-lg" aria-hidden="true" id="submit"></i>
					</form>
				</div>
			</div>`;
		}
	}

	const profileComponent = {
		render: () => {
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

				<div id="modal-bio" class="modal" style="min-height:200px;width:70%">
					<div class="modal-header">
				    	<h3>Edit Bio</h3>
				    	<span class="close-btn">&times;</span>
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

				<div id="modal-workplace" class="modal" style="min-height:200px;width:60%">
					<div class="modal-header">
				    	<h3>Edit Workplace</h3>
				    	<span class="close-btn">&times;</span>
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

				<div id="modal-education" class="modal" style="min-height:200px;width:70%;">
				  <div class="modal-header">
				    <h3>Edit Education</h3>
				    <span class="close-btn">&times;</span>
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

				<button id="logout">logout</button>
			</div>
			`;
		}
	}

	const errorComponent = {
		render: () => {
			return `error`;
		}
	}

	const routes = [
	{
		path: '/',
		template: homeComponent
	},
	{
		path: '/connections',
		template: connectionComponent
	},
	{
		path: '/service',
		template: serviceComponent
	},{
		path: '/chat',
		template: chatComponent
	},{
		path: '/profile',
		template: profileComponent
	},
	{
		path: '/error',
		template: errorComponent
	}];

	return routes;
});