class Game{
    constructor(map){
        this.map = map
        this.USA = [];
        this.RUSSIA = [];
        this.COUNTRIESWITHAT1 = [];
        this.COUNTRIESWITHAT2 = [];
        this.COUNTRIESWITHAT3 = [];
        this.casualities = 0;
    }

    generateTeams = function(){
        this.map.eachLayer((layer) =>{
            if(layer.feature != undefined){
                if(layer.feature.properties.SOJUSZ == 1){
                    this.USA.push(layer);
                }else if(layer.feature.properties.SOJUSZ == 2){
                    this.RUSSIA.push(layer);
                }
                if(layer.feature.properties.AT1){
                    this.COUNTRIESWITHAT1.push(layer)
                }
                if(layer.feature.properties.AT2){
                    this.COUNTRIESWITHAT2.push(layer)
                }
                if(layer.feature.properties.AT3){
                    this.COUNTRIESWITHAT3.push(layer)
                }
            }
        });
    }

    generateStartingCountry = function(side, nukeType){
        let country;
        if(nukeType == 0){
            country = this.COUNTRIESWITHAT1[Math.floor(Math.random() * this.COUNTRIESWITHAT1.length)]
            while(country.feature.properties.SOJUSZ != side){
                country = this.COUNTRIESWITHAT1[Math.floor(Math.random() * this.COUNTRIESWITHAT1.length)]
            }
        }
        if(nukeType == 1){
            country = this.COUNTRIESWITHAT2[Math.floor(Math.random() * this.COUNTRIESWITHAT2.length)]
            while(country.feature.properties.SOJUSZ != side){
                country = this.COUNTRIESWITHAT2[Math.floor(Math.random() * this.COUNTRIESWITHAT2.length)]
            }
        }
        if(nukeType == 2){
            country = this.COUNTRIESWITHAT3[Math.floor(Math.random() * this.COUNTRIESWITHAT3.length)]
            while(country.feature.properties.SOJUSZ != side){
                country = this.COUNTRIESWITHAT3[Math.floor(Math.random() * this.COUNTRIESWITHAT3.length)]
            }
        }
        return country
    }

    generateTargetCountry = function(attackingSide){
        let targetSide;
        let targetCountry
        if (attackingSide == 1){
            let targetCountryIndex = Math.floor(Math.random() * this.RUSSIA.length)
            while(this.RUSSIA[targetCountryIndex].feature.properties.POP2005 == 0){
                targetCountryIndex = Math.floor(Math.random() * this.RUSSIA.length)
            }
            targetCountry = this.RUSSIA[targetCountryIndex]
        }else if (attackingSide == 2){
            let targetCountryIndex = Math.floor(Math.random() * this.USA.length)
            while(this.USA[targetCountryIndex].feature.properties.POP2005 == 0){
                targetCountryIndex = Math.floor(Math.random() * this.USA.length)
            }
            targetCountry = this.USA[targetCountryIndex]
        }
        return targetCountry
    }

    generateRandomPosition = function(country){
        let bounds = country.getBounds()
        let x_max = bounds.getEast();
        let x_min = bounds.getWest();
        let y_max = bounds.getSouth();
        let y_min = bounds.getNorth();
        let lat = y_min + (Math.random() * (y_max - y_min));
        let lng = x_min + (Math.random() * (x_max - x_min));

        return [lat,lng]
    }

    generateNukeParameters = function(){
        let nukeIndex = Math.floor(Math.random() * 8)
        let nukeType; // 0 - AT1 1 - AT2 2 - AT3
        if(nukeIndex == 0){
            nukeType = 2
        }
        else if(nukeIndex > 0 && nukeIndex < 5){
            nukeType = 1
        }
        else{
            nukeType = 0
        }
        let startingSide = Math.floor(Math.random() * 2) + 1 // 1 - USA, 2 - RUSSIA

        let startingCountry = this.generateStartingCountry(startingSide, nukeType)
        let targetCountry = this.generateTargetCountry(startingSide)

        return [startingCountry, targetCountry, nukeType]
    }

    start = function(){
        this.generateTeams()
    }

    sendNuke = function(a){
        let startingCountry = a[0]
        let targetCountry = a[1]
        let nukeType = a[2]
        let nukeRadiuses = [100000,10000,1000]
        let nukePower = [100000,1000,10]
        let countryCasualities = Math.floor(nukePower[nukeType] * targetCountry.feature.properties.POP2005/targetCountry.feature.properties.AREA)
        if(countryCasualities > targetCountry.feature.properties.POP2005){
            countryCasualities = targetCountry.feature.properties.POP2005;
            targetCountry.feature.properties.POP2005 = 0;
        }else{
            targetCountry.feature.properties.POP2005 -= countryCasualities
        }
        this.casualities += countryCasualities

        let startCountryCoords = this.generateRandomPosition(startingCountry)
        let targetCountryBombCoords = this.generateRandomPosition(targetCountry)
        createNukePath(startCountryCoords[0], startCountryCoords[1],targetCountryBombCoords[0] , targetCountryBombCoords[1])
        addCircle(targetCountryBombCoords[0], targetCountryBombCoords[1], nukeRadiuses[nukeType], "black")
    }

    updateP = function(){
        document.getElementById("bombs").innerHTML = sentNukes;
        document.getElementById("dead").innerHTML = formatNumber(this.casualities);
    }
    run = function(){
        let a = this.generateNukeParameters()
        this.sendNuke(a)
        this.updateP()
    }

}

let sentNukes = 0
startWar = function(){
    for(let i = 1; i < 1000; i++){
        setTimeout(function(){
            sentNukes++;
            G.run()
        }, 5000/Math.pow(i,1/4) * i);

    }
}

