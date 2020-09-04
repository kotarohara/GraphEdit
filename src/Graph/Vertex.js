
function Displacement (x, y) {
    this.x = x;
    this.y = y;
}

function Velocity (x, y) {
    this.x = x;
    this.y = y;
}

function Vertex (id, x, y) {
    var _id = id,
        _edges = [],
        _x = x,
        _y = y;

    // const refreshRate_m = 1 / 60 * 1000;  // Displacement refreshrate
    const _displacementFactor = 1.0;
    const _springConstant = .5;
    const _dumpingFactor = .9;

    var _displacement = new Displacement(0, 0);
    var _velocity = new Velocity(0, 0);

    var _graphEdit = null;

    /**
     * Add an edgeId.
     * @param id
     */
    function addEdge (edge) {
        _edges.push(edge);
    }

    function addToVelocity(x, y) {
        _velocity.x += x;
        _velocity.y += y;
    }

    function getDisplacement() {
        return _displacement;
    }

    /**
     * Get an array of edgeIds that are connected to this vertex.
     * @returns {Array}
     */
    function getEdges () {
        return _edges;
    }

    /**
     * Remove an edgeId from the _edgeIds array.
     * @param id
     */
    function removeEdge(id) {
        var edgeIdArray = _edges.map(function (e) { return e.id; }),
            index = edgeIdArray.indexOf(id);
        if (index > -1) {
            _edges.splice(index, 1);
        }
    }


    function updateVelocity () {
        _velocity.x += - _displacement.x * _springConstant;
        _velocity.y += - _displacement.y * _springConstant;

        _velocity.x = _velocity.x * _dumpingFactor;
        _velocity.y = _velocity.y * _dumpingFactor;
    }

    function updateDisplacement () {
        // console.log(_velocity);
        _displacement.x += _velocity.x * _displacementFactor;
        _displacement.y += _velocity.y * _displacementFactor;
    }

    function update () {
        updateVelocity();
        updateDisplacement();

        if (_graphEdit) { _graphEdit.update(); }
    }

    function setVelocity (v) {
        _velocity = v;
    }

    function setGE(ge) {
        _graphEdit = ge;
    }

    // setInterval(update, refreshRate_m);

    return {
        x: _x,
        y: _y,
        id: _id,
        addEdge: addEdge,
        addToVelocity: addToVelocity,
        getEdges: getEdges,
        getDisplacement: getDisplacement,
        removeEdge: removeEdge,
        setVelocity: setVelocity,
        setGE: setGE,
        updateDisplacement: updateDisplacement,
        updateVelocity: updateVelocity,
        dx: _displacement.x,
        dy: _displacement.y,
        velocity: _velocity
    };
}