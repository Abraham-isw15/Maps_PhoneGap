var markerText = 1;
var bndMarker = 0;
var apiMapboxKey = 'pk.eyJ1IjoidGl0b3BpemFycm8iLCJhIjoiY2l5NHZ5OTBkMDA0ZTJxcGZiMnJkaW1ldyJ9.reMbol2DhjmKKczvjYYQzQ';
var OpenWeatherAppKey = "a0670eb7de948584e8d583f428d4774d";	 
var mapsGoogleapisKey = 'AIzaSyDgk92_gkUX4XOPM-ublmBlSGvZGKgVa3c';
var apiFlickrKey = '3df114023660050aa83d002e67b7a9a3';

var app = {
	start: function() {
		this.startFastClick();
	},

	startFastClick: function() {
		FastClick.attach( document.body );
	},

	deviceReady: function() {

		// get the current position
		// navigator.geolocation.getCurrentPosition( app.pintCoordinates, app.onError);

		// Returns the device current position when a change in position is detected
		var options = { 
			maximumAge: 3000,
			timeout: 5000
			// enableHighAccuracy: true  
		};
		navigator.geolocation.watchPosition( app.pintCoordinates, app.onError, options );

	},

	pintCoordinates: function(position) {		
		
		var myMap = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);
   		
		L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token='+apiMapboxKey, {
      		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      		maxZoom: 18
    	}).addTo(myMap);
    	
    	app.pintMarker( position.coords.latitude, position.coords.longitude, [position.coords.latitude, position.coords.longitude], '¡Estoy en XXX!', myMap );

    	myMap.on('click', function(evt){
    		var texto = 'Marcador en l(' + evt.latlng.lat + ') y L(' + evt.latlng.lng + ')';    		
    		app.pintMarker( evt.latlng.lat, evt.latlng.lng, evt.latlng, texto, myMap);    		
    	});


    	//show detail information of position 
		app.getDetailInformation(position);

		app.getPhotosPlace(position.coords.latitude, position.coords.longitude)
		
	},

	pintMarker: function(latitude, longitude, latlng, texto, map) {

		var texto = app.getPlace(latitude, longitude);
				
		if ( bndMarker == 0) {
			var greenIcon = L.icon({
			    iconUrl: 'css/images/leaf-green.png',
			    shadowUrl: 'css/images/leaf-shadow.png',

			    iconSize:     [38, 95], // size of the icon
			    shadowSize:   [50, 64], // size of the shadow
			    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
			    shadowAnchor: [4, 62],  // the same for the shadow
			    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
			});

			var circle = L.circle(latlng, {
			    color: 'red',
			    fillColor: '#f03',
			    fillOpacity: 0.2,
			    radius: 1000
			}).addTo(map);

			var mk = L.marker(latlng, {icon: greenIcon}).addTo(map);
			mk.bindPopup( texto.formatted_address ).openPopup();

			bndMarker++;

		} else{

			var mk = L.marker(latlng).addTo(map);
			mk.bindPopup( texto.formatted_address ).openPopup();

		}

	},

	onError: function(error) {
		console.log( error.code +': '+ error.message);
	},

	getDetailInformation: function(position) {

		var timestamp = moment.unix(position.timestamp);
		var coordsDiv = document.querySelector('#coords');
		coordsDiv.innerHTML = 'Latitud: '              + position.coords.latitude          + '</br>' +
				              'Longitud: '             + position.coords.longitude         + '</br>' +
				              'Altitud: '              + position.coords.altitude          + '</br>' +
				              'Exactitud: '            + position.coords.accuracy          + '</br>' +
				              'Precisión de Altitud: ' + position.coords.altitudeAccuracy  + '</br>' +				              
				              'Velocidad: '            + position.coords.speed             + '</br>';

	},

	getWeatherByLocation: function(latitude, longitude) {
	       
	    var queryString =
	      'http://api.openweathermap.org/data/2.5/weather?lat='
	      + latitude + '&lon=' + longitude + '&appid=' + OpenWeatherAppKey + '&units=metric&lang=sp';

	    app.getWeather(queryString);
	},

	getWeatherByCity: function(name) {
		
	    var queryString = 'http://api.openweathermap.org/data/2.5/weather?q='+name+
	    					'&units=metric&lang=sp&appid='+OpenWeatherAppKey+ 
	    					'&units=metric&lang=sp';

	    app.getWeather(queryString);
	},

	getWeather: function(queryString) {

	    var coordsDiv = document.querySelector('#weather');
	   
	    $.getJSON(queryString, function (results) {
	    	
	        if (results.weather.length) {

				var sunrise = moment.unix(results.sys.sunrise);
				var sunset  = moment.unix(results.sys.sunset);
					                	
				coordsDiv.innerHTML = 'Ciudad: '         + results.name  + '</br>' +
						              'Temperatura: '    + results.main.temp  + '°С</br>' +
						              'Temperatura Max:' + results.main.temp_max  + '°С</br>' +
						              'Temperatura Min:' + results.main.temp_min  + '°С</br>' +
						              'Viento: '         + results.wind.speed  + 'm/s.</br>' +
						              'Humedad: '        + results.main.humidity  + '%</br>' +						              
						              'Presión: '        + results.main.pressure  + ' hpa</br>' +
						              // 'Visibilidad: ' + results.visibility  + '</br>' +
						              // 'Mensaje: '     + results.sys.message + '</br>' +								              
						              'Amanece: '       + sunrise.format("HH:mm") + '</br>' +	
						              'Anochece: '      + sunset.format("HH:mm") + '</br>' +
						              'Nubes: '         + results.weather[0].description  + '<img src="http://openweathermap.org/img/w/'+results.weather[0].icon+'.png"></br>';
           
	        }

	    }).fail(function () {
	       coordsDiv.innerHTML = "Error: Getting location";
	    });
	},
	
	getPlace: function(latitude, longitude) {
				
		var place = { 
			formatted_address: '',
			long_name: ''			
		};
		
		var queryString = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&key='+mapsGoogleapisKey;
		
		var placeDIV = document.querySelector('#place');
				
	    $.ajax({
	        url: queryString,	        
	        dataType: 'json',
	        async: false,
	        success: function(data) {

	        	place.formatted_address = data.results[0].formatted_address;
				place.long_name         = data.results[0].address_components[2].long_name;
				
	        }        
	    });
	    
	    var mt = markerText++; 

	    placeDIV.innerHTML = placeDIV.innerHTML + '</br>' +
	    					 'Marcador: '  + mt + '</br>' +							 
	    					 'Dirección: ' + place.formatted_address + '</br>' +
						     'Ciudad: '    + place.long_name  + '</br>';

		// Get weather by using city name		
		app.getWeatherByCity(place.long_name);

	    return place;
	},

	getPhotosPlace: function(latitude, longitude) {
		$('#pictures').empty();

		var queryString =
		    "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + apiFlickrKey +
		    "&lat=" + latitude + "&lon=" + longitude + "&format=json&jsoncallback=?";

	    $.getJSON(queryString, function (results) {
	        $.each(results.photos.photo, function (index, item) {

	            var photoURL = "http://farm" + item.farm + ".static.flickr.com/" +
	                item.server + "/" + item.id + "_" + item.secret + "_m.jpg";

	            $('#pictures').append($("<img />").attr("src", photoURL));
	            $('#pictures').append("<span>"+ item.title +"</span>");

	           });
	        }
	    );
	}

};

if ('addEventListener' in document) {
  	document.addEventListener('DOMContentLoaded', function() {
    	app.start();
  	}, false);
  	document.addEventListener('deviceready', function() {
    	app.deviceReady();
  	}, false);
  	$("#btnCoords").click( function(){
  		$('#coords').show();
  	});
  	$("#btnWeather").click( function(){
  		$('#weather').show();
  	});
  	$("#btnPictures").click( function(){
  		$('#pictures').show();
  	});

}