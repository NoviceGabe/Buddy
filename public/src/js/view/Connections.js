define(()=>{
	const template = () =>{
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

	const render = () =>{
		const container = document.querySelector('#container');
		container.innerHTML = template(); 
	}

	return {
		render : render
	};
});