define(()=>{
	const template = () =>{
		return `
			<div id="connections-section">

				<ul class="breadcrumb" class="clear-fix">
				  <li class="item"><a href="#/">Buddy</a></li>
				  <li class="item">Connections</li>
				</ul>
				
				<div id="connections-container">
					<h3 id="ref"></h3>
					<div id="recent">
						<h4 class="header"><span>Recent</span></h4>
						<ul></ul>
					</div>
					
					<div id="all">
						<h4 class="header"><span>All</span></h4>
						<ul></ul>
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