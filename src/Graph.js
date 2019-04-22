/**
 * An undirected graph.
 * Reference: https://github.com/chenglou/data-structures/blob/master/source/Graph.coffee
 * @constructor
 */
function Graph() {
    var _vertices = {},
        _edges = {},
        _vertexArray = [],
        _edgeArray = [],
        _uniqueVertexId = 0,
        _uniqueEdgeId = 0;
    var _graphEdit;

    const refreshRate_m = 1 / 60 * 1000;  // Displacement refreshrate

    var repelConstant_a = 0, repelConstant_b = 0.05;
    var attractConstant_a = 0, attractConstant_b = 0.05;
    const edgeRepelFactor = 3;
    const dumpingFactor = 0.9;

    function turnRepelOn() {
        repelConstant_a = 10;
        attractConstant_a = 10;
    }

    /**
     * Add a vertex to this graph.
     * @param id
     * @param x
     * @param y
     * @param floor str
     */
    function addVertex(id, x, y, floor) {
        if (!(id in _vertices)) {
            _vertices[id] = new Vertex(id, x, y, floor);
            _vertexArray.push(_vertices[id]);
            return _vertices[id];
        }
    }

    /**
     * Add an edge that connects source and target.
     * @param id
     * @param sourceId
     * @param targetId
     */
    function addEdge(id, source, target) {
        if (!(id in _edges)) {
            _edges[id] = new Edge(id, source, target);
            _edgeArray.push(_edges[id]);
            _vertices[source.id].addEdge(_edges[id]);
            _vertices[target.id].addEdge(_edges[id]);
            return _edges[id];
        }
    }

    function getUniqueVertexId () {
        var keys = _.map(Object.keys(_vertices), function (x) { return parseInt(x, 10); });
        for (;;_uniqueVertexId++) {
            if (keys.indexOf(_uniqueVertexId) === -1) {
                break;
            }
        }

        return _uniqueVertexId;
    }

    function getUniqueEdgeId () {
        var keys = _.map(Object.keys(_edges), function (x) { return parseInt(x, 10); });
        for (;;_uniqueEdgeId++) {
            if (keys.indexOf(_uniqueEdgeId) === -1) {
                break;
            }
        }
        return _uniqueEdgeId;
    }

    /**
     * Get a vertex in the graph by id.
     * @param id
     * @returns {*}
     */
    function getVertex(id) {
        return _vertices[id];
    }

    /**
     * Get an edge in the graph by id.
     * @param id
     * @returns {*}
     */
    function getEdge(id) {
        return _edges[id];
    }

    /**
     * Remove a vertex
     * @param id
     */
    function removeVertex(id) {
        if (id in _vertices) {
            // Remove edges that are connected to this vertex
            var vertex = getVertex(id),
                edges = vertex.getEdges(),
                len = edges.length;
            for (var i = len - 1; i >= 0; i--) {
                removeEdge(edges[i].id);
            }

            // Remove the vertex
            var index = _vertexArray.indexOf(vertex);
            _vertexArray.splice(index, 1);
            delete _vertices[id];
        }
    }

    /**
     * Remove an edge
     * @param id
     */
    function removeEdge(id) {
        if (id in _edges) {
            // Remove the edge from the vertices that are connected to this edge
            var edge = getEdge(id);
            edge.source.removeEdge(id);
            edge.target.removeEdge(id);

            // Remove the edge
            var index = _edgeArray.indexOf(edge);
            _edgeArray.splice(index, 1);
            delete _edges[id];
        }
    }

    function setVertexCoordinate(id, x, y) {
        var vertex = getVertex(id);
        vertex.x = x;
        vertex.y = y;
    }

    function updateVertexVelocity_Unary () {
        for (var i = 0, len = _vertexArray.length; i < len; i++) {
            _vertexArray[i].updateVelocity();
        }
    }

    /**
     * Need to update this method that computes the pairwise repelling forces.
     * Current O(N^2) method does not scale. Consider reimplementing it with
     * the Fast Multipole algorithm.
     */
    function updateVertexVelocity_Pair () {
        var accumulator = [];
        for (var i = 0, len_i = _vertexArray.length; i < len_i; i++) {
            accumulator.push({x: 0, y: 0});
        }

        // Repel between nodes
        for (var i = 0, len_i = _vertexArray.length; i < len_i; i++) {
            for (var j = 0, len_j = _vertexArray.length; j < len_j; j++) {

                const v1 = _vertexArray[i], v2 = _vertexArray[j];
                const dist = distance(i, j);

                if (v1.id === v2.id) continue;

                const magnitude = repelConstant_a / Math.exp(repelConstant_b * dist);

                const noise = (Math.random() - 0.5) * 0.01;
                const angle = Math.atan2(v2.y - v1.y + noise, v2.x - v1.x + noise);

                accumulator[j].x += magnitude * Math.cos(angle);
                accumulator[j].y += magnitude * Math.sin(angle);
            }
        }

        // Attract between connected nodes
        for (var i = 0, len = _edgeArray.length; i < len; i++) {
            const edge = _edgeArray[i], v1 = edge.source, v2 = edge.target;
            var v1Idx = _vertexArray.indexOf(v1), v2Idx = _vertexArray.indexOf(v2);

            const dist = distance(v1Idx, v2Idx);
            const magnitude = attractConstant_a / Math.exp(attractConstant_b * dist);

            const noise = (Math.random() - 0.5) * 0.01;
            const angle = Math.atan2(v2.y - v1.y + noise, v2.x - v1.x + noise);

            accumulator[v1Idx].x += magnitude * Math.cos(angle);
            accumulator[v1Idx].y += magnitude * Math.sin(angle);
            accumulator[v2Idx].x -= magnitude * Math.cos(angle);
            accumulator[v2Idx].y -= magnitude * Math.sin(angle);

        }

        for (var i = 0, len_i = _vertexArray.length; i < len_i; i++) {
            _vertexArray[i].addToVelocity(accumulator[i].x, accumulator[i].y);
        }
    }

    function distance(idx1, idx2) {
        const v1 = _vertexArray[idx1], v2 = _vertexArray[idx2];
        return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
    }

    function updateVertexDisplacement () {
        for (var i = 0, len = _vertexArray.length; i < len; i++) {
            _vertexArray[i].updateDisplacement();
        }
    }

    function updateBezierControlPoints () {
        // Update the control point
        for (var i = 0, len = _edgeArray.length; i < len; i++) {
            _edgeArray[i].updateControlPoint();
        }

        var accumulator = [];
        for (var i = 0, len_i = _edgeArray.length; i < len_i; i++) {
            accumulator.push({x: 0, y: 0});
        }

        // Update the displacement
        for (var i = 0, len_i = _edgeArray.length; i < len_i; i++) {
            var cp1 = _edgeArray[i].getControlPoint();
            for (var j = 0, len_j = _edgeArray.length; j < len_j; j++) {
                if (i === j) continue;
                var cp2 = _edgeArray[j].getControlPoint();
                const dist = Math.sqrt(Math.pow(cp1.x - cp2.x, 2) + Math.pow(cp1.y - cp2.y, 2));

                const noise = (Math.random() - 0.5) * 0.01;
                const magnitude =  edgeRepelFactor * repelConstant_a / Math.exp(10 * repelConstant_b * dist);
                const angle = Math.atan2(cp2.y - cp1.y + noise, cp2.x - cp1.x + noise);

                accumulator[j].x += magnitude * Math.cos(angle);
                accumulator[j].y += magnitude * Math.sin(angle);
            }
        }

        for (var i = 0, len = _edgeArray.length; i < len; i++) {


            // Get rid of the displacement along the
            const noise = (Math.random() - 0.5) * 0.001;
            var s = _edgeArray[i].source, t = _edgeArray[i].target;
            var vx = t.x - s.x + noise, vy = t.y - s.y + noise;
            var nx = -1/vx, ny = 1/vy, nd = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
            nx /= nd;
            ny /= nd;

            var ax = accumulator[i].x, ay = accumulator[i].y;

            _edgeArray[i].setControlPointDisplacement(ax, ay);
        }
    }

    function update() {
        // Update vertex velocities based on the vertices' inertia
        updateVertexVelocity_Unary();

        // Update vertex velocities based on the interaction between node pairs
        updateVertexVelocity_Pair();

        // Update displacements of verticies.
        updateVertexDisplacement();

        // Update the cotrol points of quadratic bezier curves
        updateBezierControlPoints();

        // Render nodes
        if (_graphEdit) { _graphEdit.update(); }

        repelConstant_a *= dumpingFactor;
        attractConstant_a *= dumpingFactor;
    }

    setInterval(update, refreshRate_m);

    function setGE (ge) {
        _graphEdit = ge;
    }

    return {
        vertices: _vertexArray,
        edges: _edgeArray,
        addVertex: addVertex,
        addEdge: addEdge,
        getUniqueVertexId: getUniqueVertexId,
        getUniqueEdgeId: getUniqueEdgeId,
        getVertex: getVertex,
        getEdge: getEdge,
        removeVertex: removeVertex,
        removeEdge: removeEdge,
        setVertexCoordinate: setVertexCoordinate,
        setGE: setGE,
        update: update,
        turnRepelOn: turnRepelOn
    };
}
