function GraphEdit(graph, mouse, mapLayer) {
    // References:
    // - https://bl.ocks.org/mbostock/6123708
    var mode = "edit", // "draw"
        mousedownVertex,
        temporaryVertices = [],
        temporaryEdges = [];

    const velocityConstant = 0.01;

    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    function zoomed() {
      // container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      

        // Set velocity based on the nearby node
        const velocity = mouse.getVelocity();

        for (var i = 0, len = graph.vertices.length; i < len; i++) {
            graph.vertices[i].setVelocity(new Velocity(velocityConstant * velocity.x, velocityConstant * velocity.y));
        }

        graph.turnRepelOn();
        update();
    }

    var margin = {top: -5, right: -5, bottom: -5, left: -5};
    var width = 960;
    var height = 640;

    // Prepare svg elements
    // var svg = d3.select("body")
    //         .append("svg")
    //         .attr("width", width)
    //         .attr("height", height)
    //         .append("g")
    //         .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    //         .call(zoom);

    var svg = d3.select('#mapid').select("svg").call(zoom);

    var container = svg.append("g");

    

    container.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");
    
    container.append("g")
        .attr("class", "x axis")
      .selectAll("line")
        .data(d3.range(0, width, 10))
      .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);

    container.append("g")
        .attr("class", "y axis")
      .selectAll("line")
        .data(d3.range(0, height, 10))
      .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });


    var segmentContainer = container.append("g");
    var temporaryDomContainer = container.append("g");
    var vertexContainer = container.append("g");


    // Define behaviors and attributes
    var dragEdge = d3.drag()
            .subject(function (d) { return d; })
            .on("start", startedDraggingEdge)
            .on("drag", draggingEdge)
            .on("end", endedDraggingEdge),
        dragVertex = d3.drag()
            .subject(function(d) { return d; })
            .on("start", startedDraggingVertex)
            .on("drag", draggingVertex)
            .on("end", endedDraggingVertex),
        edgeCoordinates = {
            d: function (edge) {
                const s = edge.source, t = edge.target, s_disp = s.getDisplacement(), t_disp = t.getDisplacement();

                var x1, x2, y1, y2, xq, yq;
                if (s_disp && t_disp) {
                    x1 = s.x + s_disp.x;
                    y1 = s.y + s_disp.y;
                    x2 = t.x + t_disp.x;
                    y2 = t.y + t_disp.y;
                } else {
                    x1 = s.x + s.dx;
                    y1 = s.y + s.dy;
                    x2 = t.x + t.dx;
                    y2 = t.y + t.dy;
                }

                var cp = edge.getControlPoint(),
                    dcp = edge.getControlPointDisplacement();
                if (cp) {
                    xq = cp.x + dcp.dx;
                    yq = cp.y + dcp.dy;
                } else {
                    xq = (x1 + x2) / 2;
                    yq = (y1 + y2) / 2;
                }


                return [
                    "M", x1, " ", y1,
                    "Q", xq, " ", yq,
                    " ", x2, " ", y2
                ].join("");
            },
            x1: function (edge) {
                const p = edge.source,
                    disp = p.getDisplacement();
                if (disp) {
                    return p.x + disp.x;
                } else {
                    return p.x + p.dx;
                }
            },
            y1: function (edge) {
                const p = edge.source,
                    disp = p.getDisplacement();
                if (disp) {
                    return p.y + disp.y;
                } else {
                    return p.y + p.dy;
                }
                // return edge.source.y + edge.source.dy;
            },
            x2: function (edge) {
                const p = edge.target,
                    disp = p.getDisplacement();
                if (disp) {
                    return p.x + disp.x;
                } else {
                    return p.x + p.dx;
                }
            },
            y2: function (edge) {
                const p = edge.target,
                    disp = p.getDisplacement();
                if (disp) {
                    return p.y + disp.y;
                } else {
                    return p.y + p.dy;
                }
            }
        },
        vertexCoordinate = {
            cx: function (d) {
                var disp = d.getDisplacement();
                if (disp) {
                    return d.x + disp.x;
                } else {
                    return d.x + d.dx;
                }

            },
            cy: function (d) {
                var disp = d.getDisplacement();
                if (disp) {
                    return d.y + disp.y;
                } else {
                    return d.y + d.dy;
                }

            }
        };

    // Attach callbacks
    container.on("mouseup", mouseUp);
    container.on("mousemove", mouseMove);
    d3.selectAll('.mode-radio-labels').selectAll('input')
        .on("click", function () {
          mode = d3.select(this).property("value");
        });

    /**
     * A callback for a mouse event
     * @param d
     */
    function mouseUp () {
        if (mode === "draw") {
        
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
        if (mode === "draw") {
            if (temporaryVertices.length === 2) {
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
        if (mode === "edit") {
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
        } else if (mode === "draw") {
            d3.event.sourceEvent.stopPropagation();
        }
    }

    /**
     * A callback for a vertex drag event.
     * @param d
     */
    function draggingVertex(d) {
        if (mode === "edit") {
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
        if (mode === "edit") {
            d3.select(this).classed("dragging", false);
        }
        update();
    }

    function startedDraggingEdge() {
        if (mode === "edit") {
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
        if (mode === "edit") {
            d3.select(this)
                .attr("x1", d.source.x += d3.event.dx)
                .attr("y1", d.source.y += d3.event.dy)
                .attr("x2", d.target.x += d3.event.dx)
                .attr("y2", d.target.y += d3.event.dy);
        }

        update();
    }

    function endedDraggingEdge(d) {
        if (mode === "edit") {
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
            if (mode === "draw") {
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
            if (mode === "draw") {
                d3.event.stopPropagation();
                if (mousedownVertex && mousedownVertex != d) {
                    graph.addEdge(graph.getUniqueEdgeId(), mousedownVertex, d);
                }
            } else if (mode === "delete") {
                graph.removeVertex(d.id);
            } else if (mode === "edit") {
                // d3.event.stopPropagation();
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
            if (mode === "delete") {
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
        line = segmentContainer.selectAll("path")
            .data(graph.edges);
        line.enter().append("path")
            .attr("stroke-width", 3)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.2)
            .attr("fill", "none")
            // .on(edgeEvents)
            // .call(dragEdge);
        line.exit().remove();
        // line.attr(edgeCoordinates);

        // Render circles
        circle = vertexContainer.selectAll("circle")
            .data(graph.vertices);
        circle.enter().append("circle")
            .attr("fill", "steelblue")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("r", 6)
            // .on(vertexEvents)
            // .call(dragVertex);
        circle.exit().remove();
        // circle.attr(vertexCoordinate);

        temporaryLine = temporaryDomContainer.selectAll("line")
            .data(temporaryEdges);
        temporaryLine.enter().append("line")
            .attr("stroke-width", 3)
            .attr("stroke", "black")
            .attr("stroke-opacity", 0.2);
        temporaryLine.exit().remove();
        // temporaryLine.attr(edgeCoordinates);

        temporaryCircle = temporaryDomContainer.selectAll("circle")
            .data(temporaryVertices);

        temporaryCircle.enter().append("circle")
            .attr("fill", "orange")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("r", 6);
        temporaryCircle.exit().remove();
        // temporaryCircle.attr(vertexCoordinate);
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
