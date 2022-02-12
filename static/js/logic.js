/* 
███╗   ███╗ █████╗ ██████╗                
████╗ ████║██╔══██╗██╔══██╗               
██╔████╔██║███████║██████╔╝               
██║╚██╔╝██║██╔══██║██╔═══╝                
██║ ╚═╝ ██║██║  ██║██║                    
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝                    
                                          
███████╗███████╗████████╗██╗   ██╗██████╗ 
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
███████╗█████╗     ██║   ██║   ██║██████╔╝
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
███████║███████╗   ██║   ╚██████╔╝██║     
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     
 */
function initialize()
{
    // create tile layer
    var default_map = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, //19
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // create gray scale layer
    var gray_scale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Gray Scale map sourced from <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    });

    /* // create water color layer
    var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 1,
        maxZoom: 16,
        ext: 'jpg'
    }); */

    // create topo layer
    var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, //17
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // create base map
    let base_map = {Default: default_map, GrayScale: gray_scale, OpenTopoMap:topoMap};

    // create map object
    var quake_map = L.map("map", {center: [35, -120], zoom: 5, layers: [gray_scale, default_map, topoMap]});

    // add the default map to the map
    default_map.addTo(quake_map);

    // draw tectonic plates
    let tectonic_plates  = new L.layerGroup();
    let tectonic_json = d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    draw_tectonic_plates(tectonic_json);

    //let quake_layer = new L.layerGroup();
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(quake_json => {
        let quake_layer = new L.layerGroup();
        draw_quake_markers(quake_json, quake_layer, quake_map);
    });
    //draw_quake_markers(quake_json, quake_layer);

    /* let overlays = { 
        "Tectonic Plates": tectonic_plates,
        "Earthquakes": quake_layer
    }
    L.control.layers(base_map, overlays).addTo(quake_map); */

    // add legend
    let legend  = L.control({
        position: "bottomright"
    });

    // set up the legend
    legend.onAdd = function(){
        let div = L.DomUtil.create('div', 'info legend');
        let intervals = [-10, 10, 30, 50, 70, 90];
        // I chose a sequential, multi-hue color scheme (I didn't like green to red because green indicates "good"
        // to me and I don't think earthquakes are particularly good lol)
        let colors = ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"];
        for (var i = 0; i < intervals.length; i++){
            div.innerHTML += "<i style=background:"
                    + colors[i] 
                    + "></i>"
                    + intervals[i]
                    + (intervals[i+1] ? "km &ndash; " + intervals[i+1] + "km" + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(quake_map);
}

/*
███████╗ █████╗ ██████╗ ████████╗██╗  ██╗ ██████╗ ██╗   ██╗ █████╗ ██╗  ██╗███████╗
██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔═══██╗██║   ██║██╔══██╗██║ ██╔╝██╔════╝
█████╗  ███████║██████╔╝   ██║   ███████║██║   ██║██║   ██║███████║█████╔╝ █████╗  
██╔══╝  ██╔══██║██╔══██╗   ██║   ██╔══██║██║▄▄ ██║██║   ██║██╔══██║██╔═██╗ ██╔══╝  
███████╗██║  ██║██║  ██║   ██║   ██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██╗███████╗
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
                                                                                   
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██████╗ ███████╗                        
████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗██╔════╝                        
██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██████╔╝███████╗                        
██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗╚════██║                        
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗██║  ██║███████║                        
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝                        
*/
function draw_quake_markers(quake_json, quake_layer, quake_map)
{
    try {
        L.geoJson(quake_json, {
            pointToLayer: function(feature, latLng) {
                return L.circleMarker(latLng);
            },
            style: dataStyle,
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                                Depth:<b>${feature.geometry.coordinates[2]}</b><br>
                                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(quake_layer);
        quake_layer.addTo(quake_map);
    }
    catch (error) {
        console.error(error);
    }





    /* // plot circle where the radius is dependent on the magnitude and the color on depth
    // draw earthquake markers
    let quakes  = new L.layerGroup();
    //add the geoJson
    L.geoJson(quake_json, {
        // make each feature a marker that is on the map, each marker is a circle
        pointToLayer: function(latlng){
            return L.circleMarker(latlng);
        },
        //set the style for each marker
        style: dataStyle, //Calls the datastyle function and passes in the earthquaake data
        //add popups
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                            Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                            Location: <b>${feature.properties.place}</b>`)
        }

    }).addTo(quakes); 

    //Add the earthquake layer
    quakes.addTo(myMap);*/
}

/*
████████╗███████╗ ██████╗████████╗ ██████╗ ███╗   ██╗██╗ ██████╗                   
╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔═══██╗████╗  ██║██║██╔════╝                   
   ██║   █████╗  ██║        ██║   ██║   ██║██╔██╗ ██║██║██║                        
   ██║   ██╔══╝  ██║        ██║   ██║   ██║██║╚██╗██║██║██║                        
   ██║   ███████╗╚██████╗   ██║   ╚██████╔╝██║ ╚████║██║╚██████╗                   
   ╚═╝   ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝                   
                                                                                   
██████╗ ██╗      █████╗ ████████╗███████╗███████╗                                  
██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝██╔════╝                                  
██████╔╝██║     ███████║   ██║   █████╗  ███████╗                                  
██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝  ╚════██║                                  
██║     ███████╗██║  ██║   ██║   ███████╗███████║                                  
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝
*/
function draw_tectonic_plates(tectonic_json)
{
    console.log(tectonic_json);
}

/**
 * Function to style the earthquake markers
 * @param {*} feature 
 * @returns 
 */
 function dataStyle(feature){

    return {
        opacity: 0.5,
        fillOpacity: 0.5,
        fillColor: dataColor(feature.geometry.coordinates[2]),
        color: "000000",  //outline color
        radius: radiusSize(feature.properties.mag),
        weight: 0.5,
        stroke: true
    }

}

/**
 * Function to determine the color depending on the depth of the earth quake
 * @param {*} depth 
 * @returns 
 */
 function dataColor(depth){
    if (depth > 90) return "#fef0d9";
    else if (depth > 70) return "#fdd49e";
    else if (depth > 50) return "#fdbb84";
    else if (depth > 30) return "#fc8d59";
    else if (depth > 10) return "#e34a33";
    else return "#b30000";
}

/**
 * Function to determine the radius of the marker depending on the magnitude of the earthquake
 * @param {*} magnitude 
 * @returns 
 */
 function radiusSize(magnitude){
    if (magnitude == 0) return 1; //to make sure a 0 mag earthquake shows up
    else return magnitude * 5;
}

initialize()