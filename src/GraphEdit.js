function GraphEdit(d3, _, graph) {
    var mode = "draw", // "edit"
        mousedownVertex,
        temporaryVertices = [],
        temporaryEdges = [];

    // Prepare svg elements
    var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height),
        segmentContainer = svg.append("g"),
        temporaryDomContainer = svg.append("g"),
        vertexContainer = svg.append("g");

    // Define behaviors and attributes
    var dragEdge = d3.behavior.drag()
            .origin(function (d) { return d; })
            .on("dragstart", startedDraggingEdge)
            .on("drag", draggingEdge)
            .on("dragend", endedDraggingEdge),
        dragVertex = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", startedDraggingVertex)
            .on("drag", draggingVertex)
            .on("dragend", endedDraggingVertex),
        edgeCoordinates = {
            x1: function (edge) {
                return edge.source.x;
            },
            y1: function (edge) {
                return edge.source.y;
            },
            x2: function (edge) {
                return edge.target.x;
            },
            y2: function (edge) {
                return edge.target.y;
            }
        },
        vertexCoordinate = {
            cx: function (d) {
                return d.x;
            },
            cy: function (d) {
                return d.y;
            }
        };

    // Attach callbacks
    svg.on("mouseup", mouseUp);
    svg.on("mousemove", mouseMove);
    d3.selectAll('.mode-radio-labels').selectAll('input')
        .on("click", function () {
          mode = d3.select(this).property("value");
        });

    /**
     * A callback for a mouse event
     * @param d
     */
    function mouseUp () {
        if (mode == "draw") {

            if (mousedownVertex) {
                // Create a new vertex and a new edge
                var newVertex = graph.addVertex(graph.getUniqueVertexId(), d3.mouse(this)[0], d3.mouse(this)[1]);
                graph.addEdge(graph.getUniqueEdgeId(), mousedownVertex, newVertex);
            } else {
                // Create a new vertex
                graph.addVertex(graph.getUniqueVertexId(), d3.mouse(this)[0], d3.mouse(this)[1]);
           }
            mousedownVertex = null;
            temporaryVertices.splice(0, temporaryVertices.length);  // Empty an array. http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
            temporaryEdges.splice(0, temporaryEdges.length);
        }

        update();
    }

    function mouseMove() {
        if (mode == "draw") {
            if (temporaryVertices.length == 2) {
                temporaryVertices[1].x = d3.mouse(this)[0];
                temporaryVertices[1].y = d3.mouse(this)[1];
            }
        }
    }

    /**
     * A callback for dragstart event
     * http://bl.ocks.org/mbostock/6123708
     * http://stackoverflow.com/questions/13657687/drag-behavior-returning-nan-in-d3
     * @param d
     */
    function startedDraggingVertex(d) {
        if (mode == "edit") {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        }
    }

    /**
     * A callback for a vertex drag event.
     * @param d
     */
    function draggingVertex(d) {
        if (mode == "edit") {
            // Update node coordinates
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

            var vertex = graph.getVertex(d.id),
                edges = vertex.getEdges();

            _.each(edges, function (e) {
                if (e.source.id === d.id) {
                    e.source.x = d.x;
                    e.source.y = d.y;
                } else {
                    e.target.x = d.x;
                    e.target.y = d.y;
                }
            });
        }
        update();
    }

    /**
     * A callback for the vertex dragend event.
     * @param d
     */
    function endedDraggingVertex(d) {
        if (mode == "edit") {
            d3.select(this).classed("dragging", false);
        }
        update();
    }

    function startedDraggingEdge() {
        if (mode == "edit") {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        }
        update();
    }

    /**
     * A callback function for the edge drag event.
     * @param d
     */
    function draggingEdge(d) {
        if (mode == "edit") {
            d3.select(this)
                .attr("x1", d.source.x += d3.event.dx)
                .attr("y1", d.source.y += d3.event.dy)
                .attr("x2", d.target.x += d3.event.dx)
                .attr("y2", d.target.y += d3.event.dy);
        }

        update();
    }

    function endedDraggingEdge(d) {
        if (mode == "edit") {
            d3.select(this).classed("dragging", false);
        }
        update();
    }

    // Reference
    // http://bl.ocks.org/rkirsling/5001347
    var vertexEvents = {
        mouseover: function () {
            d3.select(this).classed("active", true);
        },
        mouseout: function () {
            d3.select(this).classed("active", false);
        },
        mousedown: function (d) {
            if (mode == "draw") {
                var temporaryVertex1 = _.clone(d),
                    temporaryVertex2 = _.clone(d);
                mousedownVertex = d;

                temporaryVertices.push(temporaryVertex1);
                temporaryVertices.push(temporaryVertex2);
                temporaryEdges.push(new Edge(-1, temporaryVertex1, temporaryVertex2));
            }
        },
        mouseup: function (d) {
            // Draw a new edge between two nodes
            if (mode == "draw") {
                d3.event.stopPropagation();
                if (mousedownVertex && mousedownVertex != d) {
                    graph.addEdge(graph.getUniqueEdgeId(), mousedownVertex, d);
                }
            } else if (mode == "delete") {
                graph.removeVertex(d.id);
            }
            temporaryVertices.splice(0, temporaryVertices.length);
            temporaryEdges.splice(0, temporaryEdges.length);
            mousedownVertex = null;
        }
    };

    var edgeEvents = {
        "mouseover": function () {
            d3.select(this).classed("active", true);
        },
        "mouseout": function () {
            d3.select(this).classed("active", false);
        },
        mouseup: function (d) {
            if (mode == "delete") {
                graph.removeEdge(d.id);
            }
        }
    };

    /**
     * A method to render stuff.
     */
    var line, circle, temporaryLine, temporaryCircle;
    function update() {
        // Render Segments
        line = segmentContainer.selectAll("line")
            .data(graph.edges);
        line.enter().append("line")
            .attr("stroke-width", 3)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.2)
            .on(edgeEvents)
            .call(dragEdge);
        line.exit().remove();
        line.attr(edgeCoordinates);

        circle = vertexContainer.selectAll("circle")
            .data(graph.vertices);
        circle.enter().append("circle")
            .attr("fill", "steelblue")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("r", 6)
            .on(vertexEvents)
            .call(dragVertex);
        circle.exit().remove();
        circle.attr(vertexCoordinate);

        temporaryLine = temporaryDomContainer.selectAll("line")
            .data(temporaryEdges);
        temporaryLine.enter().append("line")
            .attr("stroke-width", 3)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.2);
        temporaryLine.exit().remove();
        temporaryLine.attr(edgeCoordinates);

        temporaryCircle = temporaryDomContainer.selectAll("circle")
            .data(temporaryVertices);

        temporaryCircle.enter().append("circle")
            .attr("fill", "orange")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("r", 6);
        temporaryCircle.exit().remove();
        temporaryCircle.attr(vertexCoordinate);
    }
    // http://bl.ocks.org/mbostock/4560481#index.html
    // var brush = svg.append("g")
    //    .attr("class", "brush")
    //    .call(d3.svg.brush()
    //        .x(d3.scale.identity().domain([0, width]))
    //        .y(d3.scale.identity().domain([0, height]))
    //        .on("brush", function() {
    //            var extent = d3.event.target.extent();
    //            circle.classed("active", function(d) {
    //                return extent[0][0] <= d.x && d.x < extent[1][0]
    //                    && extent[0][1] <= d.y && d.y < extent[1][1];
    //            });
    //        }));

    update();
    return {
        update: update
    };
}
