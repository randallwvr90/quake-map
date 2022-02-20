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

    // create topo layer
    var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 20, //17
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
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

    // create base map
    let base_map = {Default: default_map, GrayScale: gray_scale, OpenTopoMap:topoMap};

    // create map object
    var quake_map = L.map("map", {center: [35.8, -97.3]/* [36, 138] */, zoom: 8, layers: [topoMap, gray_scale, default_map]});

    // add the default map to the map
    default_map.addTo(quake_map);
    
    // set up layers and draw earthquake markers and tectonic plates
    let tectonic_layer = new L.LayerGroup();
    let quake_layer = new L.layerGroup();
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(tectonic_json => {
        draw_tectonic_plates(tectonic_json, tectonic_layer, quake_map);
    });
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(quake_json => {
        draw_quake_markers(quake_json, quake_layer, quake_map);
    });

    // add quake and plate check boxes to the layer control
    let overlays = {
        "Tectonic Plates": tectonic_layer,
        "Earthquakes": quake_layer
    }
    L.control.layers(base_map, overlays).addTo(quake_map);

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
        let colors = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];
        div.innerHTML += "<strong>Earthquake Depth (km)</strong><hr>"
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
    console.log(quake_json);
    L.geoJson(quake_json, {
        pointToLayer: function(feature, latLng) {
            let myLatLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            return L.circleMarker(myLatLng);
        },
        style: dataStyle,
        onEachFeature: function(feature, layer){
            // get the coordinates and make them pretty for the popup
            let lat = feature.geometry.coordinates[1];
            let long = feature.geometry.coordinates[0];
            let north_south = "north";
            let east_west = "east";
            if (lat < 0) {north_south = "south";}
            if (long < 0) {east_west = "west";}
            lat = Math.abs(lat).toFixed(1);
            long = Math.abs(long).toFixed(1);
            // convert the unix timestamp to a Date object, which has a built-in string representation, used in bindPopup
            unix_timestamp = feature.properties.time;
            var date = new Date(unix_timestamp);
            layer.bindPopup(`Magnitude: <strong>${feature.properties.mag}</strong><br>
                            Depth: <strong>${feature.geometry.coordinates[2]} km</strong><br>
                            Location: <strong>${feature.properties.place}</strong><br>
                            Coordinates: <strong>${lat}&#176; ${north_south}, ${long}&#176; ${east_west}</strong><br>
                            Date & Time: <strong>${date}</strong>`);
        }
    }).addTo(quake_layer);
    quake_layer.addTo(quake_map);
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
function draw_tectonic_plates(tectonic_json, tectonic_layer, quake_map)
{
    // Load the data using geoJSON and add to the tectonic plate layers
    L.geoJson(tectonic_json, {
        color: "red",
        weight: 2
    }).addTo(tectonic_layer);
    tectonic_layer.addTo(quake_map);
}

/*
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██████╗ 
████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██████╔╝
██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                   
███████╗████████╗██╗   ██╗██╗     ███████╗         
██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝         
███████╗   ██║    ╚████╔╝ ██║     █████╗           
╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝           
███████║   ██║      ██║   ███████╗███████╗         
╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝         
*/
 function dataStyle(feature){
     let style = {
        opacity: 0.7,
        fillOpacity: 0.7,
        fillColor: markerColor(feature.geometry.coordinates[2]),
        radius: radiusSize(feature.properties.mag),
        weight: 0.5,
        stroke: true
    };
    return style;
}

/*
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██████╗ 
████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██████╔╝
██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                   
 ██████╗ ██████╗ ██╗      ██████╗ ██████╗          
██╔════╝██╔═══██╗██║     ██╔═══██╗██╔══██╗         
██║     ██║   ██║██║     ██║   ██║██████╔╝         
██║     ██║   ██║██║     ██║   ██║██╔══██╗         
╚██████╗╚██████╔╝███████╗╚██████╔╝██║  ██║         
 ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    
 */
 function markerColor(depth){
     if (depth <10) return "#ffffb2";
     else if (depth >= 10 && depth < 30) return "#fed976";
     else if (depth >= 30 && depth < 50) return "#feb24c";
     else if (depth >= 50 && depth < 70) return "#fd8d3c";
     else if (depth >= 70 && depth < 90) return "#f03b20";
     else if (depth >= 90) return "#bd0026";
}

/*
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██████╗ 
████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██████╔╝
██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                                                   
██████╗  █████╗ ██████╗ ██╗██╗   ██╗███████╗       
██╔══██╗██╔══██╗██╔══██╗██║██║   ██║██╔════╝       
██████╔╝███████║██║  ██║██║██║   ██║███████╗       
██╔══██╗██╔══██║██║  ██║██║██║   ██║╚════██║       
██║  ██║██║  ██║██████╔╝██║╚██████╔╝███████║       
╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚══════╝  
*/
 function radiusSize(magnitude){
    if (magnitude == 0) return 1; // ensure that a mag 0 earthquake shows up - ...do these exist?
    else return magnitude * 5;
}

initialize()
