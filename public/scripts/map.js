let nukeLat = document.getElementById("nukeLat");
let NukeLon = document.getElementById("nukeLon");
let nukeR = document.getElementById("nukeR");

let mapBounds = L.latLngBounds([-90,-180 ], [90,180]);
let map = L.map("map").setView([0, 0], 3); // ([lat, lon], zoom)
map.setMaxBounds(mapBounds);
L.tileLayer("https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=baP93CSTHELEJPXKpzIR", {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
}).addTo(map);

// https://stackoverflow.com/questions/17633462/format-a-javascript-number-with-a-metric-prefix-like-1-5k-1m-1g-etc
var ranges = [
  { divider: 1e9 , suffix: 'MLD' },
  { divider: 1e6 , suffix: 'MLN' },
  { divider: 1e3 , suffix: 'TYŚ' }
];

function formatNumber(n) { 
  for (var i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return (n / ranges[i].divider).toFixed(2).toString() + ranges[i].suffix;
    }
  }
  return n.toString();
}
// ---------------------------------------


generatePopupString = function(layer){
    let debugCountryControlString = '<p>dodaj/usun mieszkańców(-∞ to +∞)</p> <input type="number" id="popToAdd")"></input> <input type="button" value="dodaj/usun" onClick="modifyPopulation(' + layer._leaflet_id +')"></input>'

    let countryName = layer.feature.properties.NAME;
    let countryPopulation =  formatNumber(layer.feature.properties.POP2005);
    let countryArea = layer.feature.properties.AREA
    let popupString = "<p>Country: " + countryName + "</p><p> Population: " + countryPopulation + "</p><p> Pole powierzchni: " + countryArea + "</p>"
    return popupString + debugCountryControlString
}

d3.json("./json/outputPrecision1.json").then(function(data){

    onEachFeature = function(feature, layer){
        layer.on({
            click : onCountryClick,
            mouseover: onCountryMouseOver,
            mouseout: onCountryMouseOut
        })
    }
    onCountryClick = function(e){
        let layer = e.target;
        layer.bindPopup(generatePopupString(layer)) // zrobić miejsce poupa na bazie layer.feature.properties.lat/lon
        console.log(layer.feature.properties)
        console.log(layer)
        layer.openPopup()
        layer.setStyle({
            color: "#000",
            opacity: 1
        })
    }
    onCountryMouseOver = function(e){
        let layer = e.target;
        layer.setStyle({
            weight: 4,
            color: '#666',
            fillOpacity: 0.7
        })
    }

    onCountryMouseOut = function(e){
        let layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#212121',
            fillOpacity: 0.3
        })
    }

    let countryBoundaries = L.geoJSON(data,{
        style : {
            fillColor: "#E0E0E0",
            fillOpacity: 0.3,
            color: "#212121",
            weight: 2,
            opacity: 0.2
        },
        onEachFeature: onEachFeature,
        
    }).addTo(map)

})


addCircle = function(lat, lon, r){
    L.circle([lat, lon],{
        color: 'red',
        radius: r
    }).addTo(map)
}

sendNuke = function(){
    let lat = nukeLat.value;
    let lon = nukeLon.value;
    let r = nukeR.value;
    addCircle(lat,lon,r)
}

modifyPopulation = function(countryID){
    let layer = map._layers[countryID]

    let amount = document.getElementById("popToAdd").value;
    layer.feature.properties.POP2005 += parseInt(amount)

}

// https://gist.github.com/ryancatalani/6091e50bf756088bf9bf5de2017b32e6
var latlngs = [];

var latlng1 = [0, -150],
	latlng2 = [0, 70];

var offsetX = latlng2[1] - latlng1[1],
	offsetY = latlng2[0] - latlng1[0];

var r = Math.sqrt( Math.pow(offsetX, 2) + Math.pow(offsetY, 2) ),
	theta = Math.atan2(offsetY, offsetX);

var thetaOffset = (3.14/10);

var r2 = (r/2)/(Math.cos(thetaOffset)),
	theta2 = theta + thetaOffset;

var midpointX = (r2 * Math.cos(theta2)) + latlng1[1],
	midpointY = (r2 * Math.sin(theta2)) + latlng1[0];

var midpointLatLng = [midpointY, midpointX];

latlngs.push(latlng1, midpointLatLng, latlng2);

var pathOptions = {
	color: 'rgba(0,0,0,0.9)',
	weight: 4
}

if (typeof document.getElementById('map').animate === "function") { 
	var durationBase = 2000;
   	var duration = Math.sqrt(Math.log(r)) * durationBase;
	// Scales the animation duration so that it's related to the line length
	// (but such that the longest and shortest lines' durations are not too different).
   	// You may want to use a different scaling factor.
  	pathOptions.animate = {
		duration: duration,
		iterations: 1,
		easing: 'ease-in',
	}
}

var curvedPath = L.curve(
	[
		'M', latlng1,
		'Q', midpointLatLng,
			 latlng2
    ], pathOptions).addTo(map);
    // ---------------------------------------------------------------------------