# leaflet-challenge
Mapping global earthquakes from the past 7 days. 

## Table of Contents
* [Background](#background)
* [The Map](#themap)

## Background
This site pulls data from the usgs [Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php). Using global earthquake data from the past 7 days, each earthquake is mapped using Leaflet. 

## The Map
* The "default" map layer is from [OpenStreetMap](https://www.openstreetmap.org), the Topographic layer is from [OpenTopoMap](https://opentopomap.org) and the grayscale layer is from [Stamen](http://maps.stamen.com/#toner/12/37.7706/-122.3782)
* Marker size corresponds to the earthquake's magnitude. 
* Marker color corresponds to the earthquake's depth - shallow quakes are yellow, and deep quakes are red, with colors interpolated sequentially in between. 
* Each marker has a popup box with the following info:
    * Magnitude
    * Depth
    * Location Description (EG "24 km ENE of Krasnogorsk, Russia")
    * Coordinates
