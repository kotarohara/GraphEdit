import { Coordinate } from './coordinate.js';

export class Markers {

    constructor(mapid, mapLayer) {
        // mapid is the id of the div where the map will appear
        const _mapid = '#' + mapid;
        this._mapLayer = mapLayer;

        // Create data for circles:
        var markers = [
            new Coordinate(0, 0),
            new Coordinate(100, 100),
            new Coordinate(200, 200),
            new Coordinate(300, 300),
            new Coordinate(400, 400),
            new Coordinate(500, 500)
        ];
        
        // Select the svg area and add circles:
        const _map = this._mapLayer.map;
        d3.select(_mapid)
            .select("svg")
            .selectAll("myCircles")
            .data(markers)
            .enter()
            .append("circle")
            .attr("cx", function(d){ 
                return _map.latLngToLayerPoint([d.lat, d.lng]).x;
            })
            .attr("cy", function(d){ 
                return _map.latLngToLayerPoint([d.lat, d.lng]).y;
            })
            .attr("r", 7)
            .style("fill", "red")
            .attr("stroke", "red")
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)

        // If the user change the map (zoom or drag), I update circle position:
        _map.on("moveend", this.update);
    }

    update = () => {
        const _map = this._mapLayer.map;
        d3.selectAll("circle")
            .attr("cx", function(d){ 
                return _map.latLngToLayerPoint([d.lat, d.lng]).x;
            })
            .attr("cy", function(d) { 
                return _map.latLngToLayerPoint([d.lat, d.lng]).y;
            })
    }
}