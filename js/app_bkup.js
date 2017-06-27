$(document).foundation();


// User Info and Location
var user = {
	location: {},
	impeMetr: "impe",
	celcFahr: "F",
	oppCelcFahr: "C",
	kmhMph: "mph",
	kmMi: "mi",
	mbHpa: "mb",
	mmIn: "in"
};
var darksky = {
	weather: {},
	skycons: new Skycons({
		"color": "black",
		"resizeClear": true
	})
};
var googleMap = {};
var errorMsg = $("#error");
var succMsg = $("#succ-msg");

$(document).ready(function() {

	// Set current weather to height of window
	function setCurrentHeight() {
    windowHeight = $(window).innerHeight();
    $('#current-weather').css('min-height', windowHeight);
  };
  setCurrentHeight();
  
  $(window).resize(function() {
    setCurrentHeight();
	});
	// End set current weather to height of window

	function getLocation() {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(setPosition);
			console.log("Request Location");
		} else {
			errorMsg.
				html("Geolocation is not supported by this browser.");
		}
	}

	function setPosition(position) {
		// Sets Latitude and Longitude
		console.log("Setting Position");
		user.location.lati = position.coords.latitude;
		user.location.long = position.coords.longitude;
		console.log(user);
		getLocationInfo();
		getWeather();
	}

	function showError(error) {
		switch(error.code) {
			case error.PERMISSION_DENIED:
				errorMsg.innerHTML =
					"User denied the request for Geolocation."
				break;
			case error.POSITION_UNAVAILABLE:
				errorMsg.innerHTML = "Location information is unavailable."
				break;
			case error.TIMEOUT:
				errorMsg.innerHTML =
					"The request to get user location timed out."
				break;
			case error.UNKNOWN_ERROR:
				errorMsg.innerHTML = "An unknown error occurred."
				break;
		}
		console.log("An location error happened");
	}

	getLocation();

	function getLocationInfo() {
		googleMap.src =
			"https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
			user.location.lati + "," + user.location.long +
			"&key= AIzaSyAFMnK5nKcxQIswtGHOqMki75PCk-WqWYU";
		$.ajax({
			type: "GET",
			//dataType: "jsonp",
			url: googleMap.src,
			contentType: "text/plain",
			xhrFields: {
				withCredentials: false
			},
			headers: {
				// Set any custom headers here.
		    // If you set any non-simple headers,your server must include these
		    // headers in the 'Access-Control-Allow-Headers' response header.
			},
			success: function(googleMapJSON) {
				console.log("Got Google Maps JSON");
				user.location.neighborhood = googleMapJSON.results[2].
					formatted_address;
				console.log("Neighborhood Set to User");
			},
			error: function(JSONerror) {
				console.log(JSONerror);
			}

		});
	}

	// Weather API
	function getWeather() {
		// Set API Values
		darksky.seceretKey = "2f6268241a100d9c3611366445dcd8f5";
		darksky.src = "https://api.darksky.net/forecast/" +
			darksky.seceretKey + "/" + user.location.lati + "," +
			user.location.long;

		// API Request
		$.ajax({
			type: "GET",
			dataType:"jsonp",
			url: darksky.src,
			contentType: "text/plain",
			xhrFields: {
				withCredentials: false
			},
			headers: {
				// Set any custom headers here.
		    // If you set any non-simple headers, your server must include these
		    // headers in the 'Access-Control-Allow-Headers' response header.
			},
			success: function(darkskyJSON) {
				darksky.weather = darkskyJSON;
				console.log("Got DarkSky JSON");
				console.log(darksky);

				function convertTime(UNIX_timestamp, format){
				  var timeStamp = new Date(UNIX_timestamp * 1000);
				  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',
				  	'Aug','Sep','Oct','Nov','Dec'];
				  var year = timeStamp.getFullYear();
				  var month = months[timeStamp.getMonth()];
				  var day = timeStamp.getDate();
				  var hour = timeStamp.getHours();
				  var min = timeStamp.getMinutes();
				  min = min < 10 ? '0' + min : min;
				  var sec = timeStamp.getSeconds();
				  sec = sec < 10 ? "0" + sec : sec;
				  var amPM = "am";

				  if (hour > 12) {
				  	hour = hour - 12;
				  	amPM = "pm";
				  }

				  var full = month + ' ' + day + ' ' + year + ' ' + hour +
				  	':' + min + " " + amPM;
				  var mdy = month + ' ' + day + ' ' + year;
				  var time = hour + ':' + min + " " + amPM;

				  switch(format){
				  	case "full":
				  		return full;
				  		break;
				  	case "mdy":
				  		return mdy;
				  		break;
				  	case "time":
				  		return time;
				  		break
				  	default:
				  		return full;
				  }
				}

				// Checks if Celsius or Fahrenheit is set and passes correct temperature
				function checkCelcFahr(temp) {
					var celcFahr = user.celcFahr;
					switch (celcFahr) {
						case "F":
							return Math.round(temp) + '&#176;';
							break;
						case "C":
							return Math.round((temp - 32) * 5 / 9) + '&#176;';
							break;
					}
				}

				function checkKmhMph(speed) {
					switch(user.kmhMph) {
						case "mph":
							return Math.round(speed) + " mph";
							break;

						case "km/h":
							speed = speed * 1.60934;
							return Math.round(speed) + " km/h";
							break;
					}
				}

				function checkKmMi(distance) {
					var kmMi = user.kmMi;
					switch(kmMi) {
						case "mi":
							return Math.round(distance) + " " + kmMi;
							break;
						case "km":
							distance = Math.round(distance * 1.609344) + " " + kmMi;
							return distance;
					}
				}

				function checkMmIn(mesurement) {
					var mmIn = user.mmIn;

					switch(mmIn) {
						case "in":
							return mesurement + " " + mmIn;
							break;
						case "mm":
							return mesurement * 25.4 + " " + mmIn;
							break;
					}
				}

				function setTime(timeFormat, functionID, propID, arrayID) {
					return convertTime(
						functionID(propID, arrayID), timeFormat
					);
				}

				// Sets needed icon to referenced icon
				function setSkycon(canvasID, functionID, arrayID) {
					var skycons = darksky.skycons;

					skycons.set(canvasID, Skycons[functionID("icon", arrayID).toUpperCase().replace(/-/g, "_")]);
				}

				function setTemp(functionID, propID, arrayID) {
					return checkCelcFahr(functionID(propID, arrayID)) +
					' <span class="celc-fahr">' + user.celcFahr + '</span>';
				}

				function setPrecipType (functionID, arrayID) {
					if(typeof functionID("precipType", arrayID) !==
							"undefined") {
						return functionID("precipType", arrayID);
					} else {
						return "rain";
					}
				}

				function setWind(functionID, arrayID) {
					var speed = checkKmhMph(functionID("windSpeed", arrayID));
					var bearing = functionID("windBearing", arrayID) + "deg";
					var result = speed +
						' <span class="direction" style="display: inline-block; -ms-transform: rotate(' +
							bearing + '); -webkit-transform: rotate(' +
							bearing + '); transform: rotate(' + bearing +
							');">&uarr;</span>';

					return result;
				}

				function setPercent(functionID, propID, arrayID) {
					return Math.round(functionID(propID, arrayID) * 100) +
						"%";
				}

				function setPrecipAmount(functionID, arrayID) {
					return checkMmIn(functionID("precipIntensity", arrayID));
				}

				function setVisibility(functionID, arrayID) {
					return checkKmMi(functionID("visibility", arrayID));
				}

				function setPressure(functionID, arrayID) {
					return Math.round(functionID("pressure", arrayID)) + " " +
						user.mbHpa;
				}

				// Current Weather
				function currentWeather(propID) {
					return darksky.weather.currently[propID];
				}

				// Up to the Minute Weather for the Next Hour
				function minutelyWeather(propID, minuteID) {
					return darksky.weather.minutely.data[minuteID][propID];
				}

				// Hourly Weather
				function hourlyWeather(propID, hourID) {
					return darksky.weather.hourly.data[hourID][propID];
				}

				// Daily Weather
				function dailyWeather(propID, dayID) {
					return darksky.weather.daily.data[dayID][propID];
				}

				displayWeather();

				// Button Actions
				$("#current-temp button").on("click", function() {
					switch(user.impeMetr) {
						case "impe":
							user.celcFahr = "C";
							user.oppCelcFahr = "F";
							user.kmhMph = "km/h";
							user.mmIn = "mm";
							user.kmMi = "km";
							user.mbHpa = "hPa";
							displayWeather();
							//$("#current-celc-fahr").html("C |");
							//$("#opposite-celc-fahr").html("F");
							break;
						case "metr":
							user.celcFahr = "F";
							user.oppCelcFahr = "C";
							user.kmhMph = "mph";
							user.mmIn = "in";
							user.kmMi = "mi";
							user.mbHpa = "mb";
							displayWeather();
							//$("#current-celc-fahr").html("F |");
							//$("#opposite-celc-fahr").html("C");
							break;
					}
				});

				function displayWeather() {

  				// Plays skycons icons animation
  				darksky.skycons.play();

  				// Global Info set in classes
  				$(".location").html(user.location.neighborhood);
  				$(".lookup-time").html(
  					setTime("full", currentWeather, "time")
  				);

  				//Current Weather
  				setSkycon("current-icon", currentWeather);
  				$("#current-temp").html(
  					setTemp(currentWeather, "temperature")
  				);
  				$("#current-temp .celc-fahr").html( 
  					'<button class="button"><span id="current-celc-fahr">' +
  					user.celcFahr + ' |</span> <span ' + 
  					'id="opposite-celc-fahr">' + user.oppCelcFahr +
  					'</span></button>'
  				);
  				$("#current-summary").html(currentWeather("summary"));
  				$("#current-wind").html(setWind(currentWeather));
  				$("#current-feels-like").html(
  					setTemp(currentWeather, "apparentTemperature")
  				);
  				$("#current-humidity").html(setPercent(currentWeather, "humidity"));
  				$("#current-dew-point").html(
  					setTemp(currentWeather, "dewPoint")
  				);
  				$("#current-visibility").html(
  					setVisibility(currentWeather)
  				);
  				$("#current-pressure").html(setPressure(currentWeather));
  				$("#current-sunrise").html(
  					setTime("time", dailyWeather, "sunriseTime", 0)
  				);
  				$("#current-sunset").html(
  					setTime("time", dailyWeather, "sunsetTime", 0)
  				);
  				$(".current-precip-type").html(
						setPrecipType(currentWeather)
  				);
  				$("#current-precip-chance").html(setPercent(currentWeather, "precipProbability"));
  				$("#current-precip-amount").html(setPrecipAmount(currentWeather));

  				// Hourly Weather

				}
			},
			error: function(JSONerror) {
				console.log(JSONerror.statusCode);
			}


		});
	}
});