define(()=>{
	let _map;
	let _searchControl;
	let _geocodeService;

	return class Map{
		constructor(lat = 12.8797, lng = 121.7740){
			this.geo = new L.LatLng(lat,lng);

			if(!_geocodeService){
				_geocodeService = L.esri.Geocoding.geocodeService();
			}
			if(!_map){
				_map = new L.map('map');
				_map.setView(this.geo, 5);
			}else{
				_map.eachLayer((layer) => {
				  layer.remove();
				});
				_map.setView(this.geo, 5);
			}

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(_map);

			this.layerGroup = L.layerGroup().addTo(_map);

			if(!_searchControl){
				_searchControl = L.esri.Geocoding.geosearch().addTo(_map);
			}

			this.marker = L.marker([_map.getCenter().lat, _map.getCenter().lng], {      
			      draggable: true
			}).addTo(_map); 

			_map.dragging.enable();
			_map.scrollWheelZoom.enabled();

			this.location = {};
		}

		onDragMarker(){
			let self = this;
			this.marker.on('drag', function(e){
				this.marker = e.target;
				const position = this.marker.getLatLng();
				this.marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
				_map.panTo(new L.LatLng(position.lat, position.lng));
				self.onGeoCode(e.latlng);
			});
			return this;
		}

		onGeoCode(latlng){
			let self = this;
			_geocodeService.reverse().latlng(latlng).run(function (error, result) {
				if (error) {
				   return;
				}
				self.location.x = latlng.lng;
				self.location.y = latlng.lat;
				self.location.label = result.address.Match_addr;
	      		self.marker.bindPopup(result.address.Match_addr).openPopup();
	    	});
		}

		onClickMap(){
			let self = this;
			_map.on('click', function(e){
				self.callback(e.latlng);
			});
			return this;
		}

		onSearch(){
			let self = this;
			_searchControl.on('results', function (data) {
			    for (var i = data.results.length - 1; i >= 0; i--) {
			    	self.callback(data.results[i].latlng);
			    }
			});
			return this;
		}

		callback(latLng){
			let self = this;
			if (this.marker !== null) {
		        _map.removeLayer(this.marker);
		    }
			this.marker = new L.marker(latLng, {draggable:'true'});
			this.marker.on('drag', function(e){
				this.marker = e.target;
				const position = this.marker.getLatLng();
				this.marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
				_map.panTo(new L.LatLng(position.lat, position.lng))
			});
			this.marker.addTo(this.layerGroup);
			//_map.addLayer(this.marker);
			this.onGeoCode(latLng);
		}

		clear(){
			this.layerGroup.clearLayers();
		}
	}
});