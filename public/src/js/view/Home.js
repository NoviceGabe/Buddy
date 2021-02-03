define(()=>{
	const template = () =>{
		return `
			<div id="home-section">
				<div id="header">
					<div>
						<h1 >My Feed</h1>
						<button id="write-post">Write post</button>
					</div>
				</div>
				<div id="home-main">
					<div id="newsfeed" class="col-1">
					</div>
					<div class="col-2">
						<div id="suggestions"></div>
					</div>
				</div>
				<div id="modal-post" class="modal vertical-center-fixed">
					<div class="modal-header">
				    	<h3>Post a service</h3>
				    	<span class="close">&times;</span>
				    </div>
				    <div class="modal-content">
				    	<form id="form-post" >
				    		<div id="container-role">
				    			<h4 class="header"><span>Choose service role</span></h4>
				    			<select id="user-role">
					    			<option value="empty">Select</option>
					    			<option value="client">Client</option>
					    		</select>
				    		</div>
				    		<div id="container-service">
				    			<h4 class="header"><span>Choose a service category</span></h4>
				    			<select id="service-category">
					    			<option value="empty">Select</option>
					    			<option value="driving">Driving</option>
					    			<option value="delivery">Delivery</option>
					    			<option value="handyman">Handyman</option>
					    			<option value="beauty">Beauty</option>
					    			<option value="cooking">Cooking</option>
					    			<option value="teaching">Teaching</option>
									<option value="laundry">Laundry</option>
									<option value="housekeeping">Housekeeping</option>
					    		</select>
				    		</div>
				    		<div id="container-title">
				    			<h4 class="header"><span>Project title</span></h4>
					    		<div id="title">
					    			<textarea placeholder="E.g. Looking for Truck Driver"></textarea>
					    		</div>
								<div id="count">
								    <span id="current">0</span>
								    <span id="maximum">/ 50</span>
								</div>
				    		</div>
				    		<div id="container-description">
				    			<h4 class="header"><span>Project description</span></h4>
					    		<div id="description">
					    			<textarea placeholder="E.g. We're looking for a professional and experienced truck diver"></textarea>
					    		</div>
								<div id="count">
								    <span id="current">0</span>
								    <span id="maximum">/ 1000</span>
								</div>
				    		</div>
				    		<div id="container-budget" style="display:flex;">
				    			<div style="width:100%">
					    			<h4 class="header"><span>Budget</span></h4>
					    			<input type="number" min="0.01" step="0.01" placeholder="E.g. P5000" id="budget">
				    			</div>
				    			<div style="width:100%;padding-left:10px;">
					    			<h4 class="header"><span>Budget type</span></h4>
					    			<select id="budget-type">
						    			<option value="empty">Select</option>
						    			<option value="1">Fixed price</option>
						    			<option value="2">Negotiable</option>
						    		</select>
				    			</div>
				    		</div>
				    		<div id="container-work">
				    			<h4 class="header"><span>Work experience</span></h4>
				    			<select id="work-experience">
					    			<option value="empty">Select</option>
					    			<option value="1">Entry level</option>
					    			<option value="2">Intermediate</option>
					    			<option value="3">Professional</option>
					    		</select>
				    		</div>
				    		<div id="container-job">
				    			<h4 class="header"><span>Job type</span></h4>
				    			<select id="job-type">
					    			<option value="empty">Select</option>
					    			<option value="1">Online</option>
					    			<option value="2">Onsite</option>
					    		</select>
				    		</div>
				    		<div id="container-location" style="height:380px;width:100%;" class="remove">
				    			<h4 class="header"><span>Location</span></h4>
				    			<div id="map" style="height:100%;width:70%;margin:auto">
				    			</div>
				    		</div>
						</form>
				    </div>
				   <div class="modal-footer">
				  	  	<button class="save">Post</button>
				    	<button class="cancel">Cancel</button>
				  </div>
				</div>
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