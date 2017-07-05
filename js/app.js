$(document).foundation();

// User Info and Location
var user = {
	location: {},
	impeMetr: "IMPERIAL",
	oppImpeMetr: "METRIC",
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
    $('#current-weather').css('max-height', windowHeight);
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

				function convertTime(UNIX_timestamp, format, formatTF = true){
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

				  if(hour > 11 && formatTF) {
				  	amPM = "pm";
				  } if(hour === 0) {
				  	hour = 12;
				  }  if(hour > 12 && formatTF) {
				  	hour = hour - 12;
				  	//if 
				  } if(hour < 10 && formatTF) {
				  	hour = "&nbsp;&nbsp;" + hour;
				  }

				  var full = month + ' ' + day + ' ' + year + ' ' + hour +
				  	':' + min + " " + amPM;
				  var mdy = month + ' ' + day + ' ' + year;
				  var time = hour + ':' + min + " " + amPM;
				  var h = hour;

				  switch(format){
				  	case "full":
				  		return full;
				  		break;
				  	case "mdy":
				  		return mdy;
				  		break;
				  	case "time":
				  		return time;
				  		break;
				  	case "hour":
				  		switch(formatTF) {
				  			case true:
				  				return  hour + ' ' +amPM;
				  				break;
				  			case false:
				  				return hour;
				  				break;
				  		}
				  		break;
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
							return Math.round(speed) + " mph ";
							break;

						case "km/h":
							speed = speed * 1.60934;
							return Math.round(speed) + " km/h ";
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

				function setBackground(weather, objectDOM) {
					var backgroundIMG;
					var container = $("#current-weather-container");

					switch(weather) {
						case "clear-day":
							backgroundIMG = 'url("img/clear-day-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							break;
						case "clear-night":
							backgroundIMG = 'url("img/clear-night-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.65)");
							break;
						case "rain":
							backgroundIMG = 'url("img/rain-day-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.7)");
							break;
						case "snow":
							backgroundIMG = 'url("img/snow-day-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.85)");
							break;
						case "sleet":
							backgroundIMG = 'url("img/sleet-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							break;
						case "wind":
							backgroundIMG = 'url("img/wind-large-1.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.85)");
							break;
						case "fog":
							backgroundIMG = 'url("img/fog-day-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.5)");
							break;
						case "cloudy":
							backgroundIMG = 'url("img/cloudy-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.5)");
							break;
						case "partly-cloudy-day":
							backgroundIMG = 'url("img/partly-cloudy-day-large.jpg")';
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.8)");
							break;
						case "partly-cloudy-night":
							backgroundIMG = 'url("img/partly-cloudy-night-large-1.jpg")';
							//objectDOM.css("background-position", "bottom right");
							objectDOM.css("background-image", backgroundIMG);
							container.css("background-color", "rgba(255,255,255,0.4)");
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
					'<span class="celc-fahr">' + user.celcFahr + '</span>';
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
					var speed = checkKmhMph(functionID("windSpeed", arrayID)) + " ";
					var bearing = functionID("windBearing", arrayID) + "deg";
					var result = speed +
						' <span class="direction" style="display: inline-block; -ms-transform: rotate(' +
							bearing + '); -webkit-transform: rotate(' +
							bearing + '); transform: rotate(' + bearing +
							');"> &uarr; </span> ';

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

				function buildHourly() {
					var hourlyPosition = darksky.weather.hourly
					var hourlyIndex = hourlyPosition.data;

					darksky.skycons.set("hourly-icon", Skycons[hourlyPosition.icon.toUpperCase().replace(/-/g, "_")]);
					$("#hourly-summary").html(hourlyPosition.summary);

					console.log(hourlyIndex[0]);

					for(var i = 0; hourlyIndex.length > i; i++) {
						var thisHour = convertTime(hourlyWeather("time", i), "hour", false);
						var thisHourFormated = convertTime(hourlyWeather("time", i), "hour");
						var thisSummary = hourlyWeather("summary", i);
						var thisTemp = setTemp(hourlyWeather, "temperature", i);
						var thisWind = setWind(hourlyWeather, i);
						var thisFeelsLike = setTemp(hourlyWeather, "apparentTemperature", i);
						var thisPrecipType =
							setPrecipType(hourlyWeather, i).charAt(0).toUpperCase() +
							setPrecipType(hourlyWeather, i).slice(1);
						var thisPrecipChance =
							setPercent(hourlyWeather, "precipProbability", i);
						var thisPercipAmount = setPrecipAmount(hourlyWeather, i);
						var thisHumidity =
							setPercent(hourlyWeather, "humidity", i);
						var thisDewPoint =
							setTemp(hourlyWeather, "dewPoint", i);
						var thisVisibility = 
							setVisibility(hourlyWeather, i);
						var thisPressure = 
							setPressure(hourlyWeather, i);

						function setStat(title, stat) {
							return '<li class="small-6 columns"><strong>' + title +
								'</strong> <br><span id="current-wind">' + stat +
								'</span></li>';
						}

						$("#hourly-weather-list").append(
							'<li id="hour-' +  i +
							'-weather" class="accordion-item hour-weather" data-accordion-item></li>'
						);
						$("#hour-" + i + "-weather").html(
							'<a href="#" id="hour-' + i +
							'-title" class="accordion-title hour-title text-center"></a>'
						);
						$("#hour-" + i + "-title").append(
							'<span class="float-left">' + thisHourFormated + '</span>'
						);
						$("#hour-" + i + "-title").append(
							'<span class="text-center"><canvas id="hour-' + i +
							'-icon" class="weather-icon hourly-icon" width="20" height="20"></canvas> ' + thisSummary + '</span>'

						);
						setSkycon(
							"hour-"+i+"-icon", hourlyWeather, i
						);
						$("#hour-" + i + "-title").append(
							'<span class="float-right">' + thisTemp + '</span>'
						);
						$("#hour-" + i + "-weather").append(
							'<div id="hour-' + i +
							'-content" class="accordion-content hour-content" data-tab-content>' + 
							'</div>'
						);
						$("#hour-" + i + "-content").append('<ul id="hour-' + i +
							'-info" class="row hour-info text-center"></ul>');
						$("#hour-" + i + "-info").append(setStat("Wind", thisWind));
						$("#hour-" + i + "-info").append(setStat(
							"Feels Like", thisFeelsLike
						));
						$("#hour-" + i + "-info").append(setStat(
							"Chance of " + thisPrecipType, thisPrecipChance
						));
						$("#hour-" + i + "-info").append(setStat(
							"Amount of " + thisPrecipType, thisPercipAmount
						));
						$("#hour-" + i + "-info").append(setStat(
							"Humidity", thisHumidity
						));
						$("#hour-" + i + "-info").append(setStat(
							"Dew Pt", thisDewPoint
						));
						$("#hour-" + i + "-info").append(setStat(
							"Visibility", thisVisibility
						));
						$("#hour-" + i + "-info").append(setStat(
							"Pressure", thisPressure
						));

						$("#hour-" + i + "-title").on("click", function() {
							var hourTitle = $("#hour-" + i + "-title");
							var hourContent = hourTitle.siblings(
								"#hour-" + i + "-content"
							);

							function hourContentDisplay(prop) {
								return hourContent.css("display", prop);
							}

							switch(hourContentDisplay) {
								case "block":
									hourContentDisplay("none");
									break;
								case "none":
									hourContentDisplay("block");
									break;
							}
						});

						console.log();
					}
				}

				displayWeather();

				// Button Actions
				$("#impe-metr-switch").on("click", function() {
					switch(user.impeMetr) {
						case "IMPERIAL":
							user.celcFahr = "C";
							user.oppImpeMetr = "IMPERIAL";
							user.impeMetr = "METRIC"
							user.kmhMph = "km/h";
							user.mmIn = "mm";
							user.kmMi = "km";
							user.mbHpa = "hPa";
							displayWeather();
							//$("#current-celc-fahr").html("C |");
							//$("#opposite-celc-fahr").html("F");
							break;
						case "METRIC":
							user.celcFahr = "F";
							user.oppImpeMetr = "METRIC";
							user.impeMetr = "IMPERIAL"
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
  				setBackground(currentWeather("icon"), $("#current-weather"));
  				//$("#current-weather").css("background-image", 'url("../extras/images/clear_day/clear-day-full.jpg")');
  				setSkycon("current-icon", currentWeather);
  				$("#current-temp").html(
  					setTemp(currentWeather, "temperature")
  				);
  				$("#impe-metr-label").html(user.oppImpeMetr);
  				$("#current-summary").html(currentWeather("summary"));
  				$("#current-wind").html(setWind(currentWeather));
  				$("#current-feels-like").html(
  					setTemp(currentWeather, "apparentTemperature")
  				);
  				$(".current-precip-type").html(
						setPrecipType(currentWeather).charAt(0).toUpperCase() +
							setPrecipType(currentWeather).slice(1)
  				);
  				$("#current-precip-chance").html(setPercent(currentWeather, "precipProbability"));
  				$("#current-precip-amount").html(setPrecipAmount(currentWeather));
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

  				// Weather Maps
  				function mapsForC() {
  					switch(user.celcFahr) {
  						case "F":
  							return "_f";
  							break;
  						case "C":
  							return "_c";
  							break;
  					}
  				}
  				$("#weather-maps").html("<iframe src='https://maps.darksky.net/@temperature," + user.location.lati + "," + user.location.long + ".js?embed=true&timeControl=true&fieldControl=true&defaultField=temperature&defaultUnits=" + mapsForC() + "'></iframe>");
  				
  				// Hourly Weather
  				buildHourly();
				}
			},
			error: function(JSONerror) {
				console.log(JSONerror.statusCode);
			}


		});
	}
});