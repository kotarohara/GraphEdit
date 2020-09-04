export function Edge (id, source, target) {
    var _id = id,
        _source = source,
        _target = target,
        _controlPoint = null,
        _cpDisplacement = {dx: 0, dy: 0};

    function _updateControlPoint () {
        var px = (_source.x + _target.x) / 2,
            py = (_source.y + _target.y) / 2;

        _controlPoint = { x: px, y: py};
    }

    function _setControlPointDisplacement (x, y) {
        _cpDisplacement.dx = x;
        _cpDisplacement.dy = y;
    }

    function getControlPoint () {
        return _controlPoint;
    }

    function getControlPointDisplacement () {
        return _cpDisplacement;
    }

    return {
        id: _id,
        controlPoint: _controlPoint,
        source: _source,
        target: _target,
        getControlPoint: getControlPoint,
        getControlPointDisplacement: getControlPointDisplacement,
        updateControlPoint: _updateControlPoint,
        setControlPointDisplacement: _setControlPointDisplacement
    };
}
