export function init(mapid) {
    // mapid is the id of the div where the map will appear
    const _mapid = '#' + mapid;

    var bounds = [[0,0], [400, 600]];
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

    // Create data for circles:
    var markers = [
    {long: 0, lat: 0}, // corsica
    {long: 100, lat: 100}, // nice
    {long: 200, lat: 200}, // Paris
    {long: 300, lat: 300}, // Hossegor
    {long: 400, lat: 400}, // Lille
    {long: 500, lat: 500}, // Morlaix
    ];

    // Select the svg area and add circles:
    
    d3.select(_mapid)
    .select("svg")
    .selectAll("myCircles")
    .data(markers)
    .enter()
    .append("circle")
        .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
        .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
        .attr("r", 14)
        .style("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)

    // Function that update circle position if something change
    function update() {
    d3.selectAll("circle")
        .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
        .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
    }

    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update);
}
