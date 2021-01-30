define(()=>{
	const template = () =>{
			return `
			<div id="chat-section" class="flex-container">
				<div id="sidebar">
					<h3 >Chats</h3>
					<div id="chat-request" class="remove">Chat Request</div>
					<div id="chat-dialog" ></div>
				</div>
				<div id="main">
					<div class="pre-loader" id="loader">
						<img src="src/assets/Rolling-1s-200px.gif" height="120" width="120">
					</div>
							
					<ul id="invitation-dialog" class="remove"></ul>
					<ul id="bubble-dialog"></ul>

					<form id="message-form" class="remove">
						<textarea placeholder="Send a message.." id="message-input"></textarea>
						<i class="fa fa-paper-plane fa-lg" aria-hidden="true" id="submit"></i>
					</form>
				</div>
			</div>`;
		}

	const render = () =>{
		const container = document.querySelector('#container');
		container.innerHTML = template(); 
	}

	return {
		render : render
	};
});