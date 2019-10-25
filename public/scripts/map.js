// 0 - neutralny 1 - USA 2 - ruscy
let nukeLat = document.getElementById("nukeLat");
let NukeLon = document.getElementById("nukeLon");
let nukeR = document.getElementById("nukeR");

let mapBounds = L.latLngBounds([-90,-180 ], [90,180]);
let map = L.map("map").setView([0, 0], 3); // ([lat, lon], zoom)
map.setMaxBounds(mapBounds);
L.tileLayer("https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=sctVNN0KK6ZeOf7MXVj3", {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
}).addTo(map);

let G;

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
    //let debugCountryControlString = '<p>dodaj/usun mieszkańców(-∞ to +∞)</p> <input type="number" id="popToAdd")"></input> <input type="button" value="dodaj/usun" onClick="modifyPopulation(' + layer._leaflet_id +')"></input>'
    let teams = ["brak(kraj neutralny)", "USA", "Rosja"]

    let countryName = layer.feature.properties.NAME;
    let countryPopulation =  formatNumber(layer.feature.properties.POP2005);
    let countryArea = formatNumber(layer.feature.properties.AREA);
    let team = layer.feature.properties.SOJUSZ;
    let popupString = "<p>Kraj: " + countryName + "</p><p> Populacja: " + countryPopulation + "</p><p> Pole powierzchni: " + countryArea + " km²</p><p> Sojusz: " + teams[team] + "</p>" 
    return popupString
}


// ------------- wczytanie JSON, stworzenie kontur na jego bazie, dodanie funkcji dla: click, hover, unhover
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
        layer.openPopup()
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

    boundaryStyle = function(feature){
        let boundaryColors = ["#E0E0E0", "#4285F4", "#EA4335"]
        style = {
            fillColor: boundaryColors[feature.properties.SOJUSZ],
            fillOpacity: 0.3,
            color: "#212121",
            weight: 2,
            opacity: 0.2,
        }
        return style
    }
    
    let countryBoundaries = L.geoJSON(data,{
        style : boundaryStyle,
        onEachFeature: onEachFeature,
        
    }).addTo(map)

    G = new Game(map)
    G.start()

})
// -------------

// ------------- funckje użytkowe
addCircle = function(lon, lat, r, c="red"){
    L.circle([lon, lat],{
        color: c,
        radius: r
    }).addTo(map).bringToBack()
}


modifyPopulation = function(countryID){
    let layer = map._layers[countryID]
    
    let amount = document.getElementById("popToAdd").value;
    layer.feature.properties.POP2005 += parseInt(amount)
    
}

createNukePath = function(LatStart, LonStart, LatEnd, LonEnd){
    let StartPos = new L.LatLng(LatStart, LonStart); 
    let EndPos = new L.LatLng(LatEnd, LonEnd);
            
    let Geodesic = L.geodesic([[StartPos,EndPos]], {
        className: "line",
        weight: 4, 
        opacity: 0.2,
        color: 'black',
        steps: 30,
    }).addTo(map)
    return Geodesic
    }

// -------------
    
// ------------- funkcje debug
    
    sendNuke = function(){
        let lat = nukeLat.value;
        let lon = nukeLon.value;
        let r = nukeR.value;
        addCircle(lat,lon,r)
    }
    
    generatePath = function(){
        let latStart = document.getElementById("startLat").value
        let lonStart =document.getElementById("startLon").value
        let latEnd = document.getElementById("endLat").value
        let lonEnd = document.getElementById("endLon").value
        createNukePath(latStart, lonStart, latEnd, lonEnd)
    }
    
    