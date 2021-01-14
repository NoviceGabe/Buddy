define(() => {

	const homeComponent = {
		render: () => {
			return `home`;
		}
	}

	const connectionComponent = {
		render: () => {
			return `connections`;
		}
	}

	const serviceComponent = {
		render: () => {
			return `service`;
		}
	}

	const chatComponent = {
		render: () => {
			return `<div id="chat-section">
			<div class="panel" id="sidebar">
				<h3 >Chats</h3>
				<div id="chat-dialog" ></div>
			</div>
			<div class="panel" id="main">
				<div class="pre-loader" id="loader">
				    <img src="src/assets/Rolling-1s-200px.gif" height="120" width="120">
				</div>
		 
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
				
				<div id="profile-overview" class="clear-fix">
				</div>

				<div id="profile-tabs" class="clear-fix">
					<ul>
						<li class="active" data-content="tab-profile-content">My Profile</li>
						<li data-content="tab-connections-content">My Connections</li>
						<li data-content="tab-services-content">Services</li>
						<li data-content="tab-settings-content">Account Settings</li>
					</ul>	
				</div>

				<div id="tab-container" class="clear-fix">
					<div id="tab-profile-content" class="float-left">
					</div>

					<div id="tab-connections-content" class="remove">
					</div>

					<div id="suggestions" class="float-right">
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