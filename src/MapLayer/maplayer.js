export class MapLayer {

    constructor(mapid) {
        // mapid is the id of the div where the map will appear
        var bounds = [[0,0], [640, 960]];
        var map = L.map(mapid, {
            crs: L.CRS.Simple
        });

        map.fitBounds(bounds);
        var level1 = L.imageOverlay('./floorplans/Level1.jpg', bounds).addTo(map);
        var level2 = L.imageOverlay('./floorplans/Level2.jpg', bounds).addTo(map);
        var level3 = L.imageOverlay('./floorplans/Level3.jpg', bounds).addTo(map);
        var level4 = L.imageOverlay('./floorplans/Level4.jpg', bounds).addTo(map);

        var drawnItems = L.featureGroup().addTo(map);

        // http://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
        // https://leafletjs.com/examples/layers-control/	
        var baseMaps = {
            "level_1": level1,
            "level_2": level2,
            "level_3": level3,
            "level_4": level4
        };

        // Add a svg layer to the map
        let svgLayer = L.svg().addTo(map);

        this.map = map;
    }
    
}