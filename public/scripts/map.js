let nukeLat = document.getElementById("nukeLat");
let NukeLon = document.getElementById("nukeLon");
let nukeR = document.getElementById("nukeR");

let map = L.map("map").setView([0, 0], 3); // ([lat, lon], zoom)
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