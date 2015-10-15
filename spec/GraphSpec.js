describe("Vertex", function () {
    var vertex;

    beforeEach(function () {
        vertex = new Vertex(0, 0, 0);
    });

    it("should be able to add an edge", function () {
        vertex.addEdge(new Edge(0, null, null));
        expect(vertex.getEdges().length).toBe(1);
    });

    it("should be able to remove an edge", function () {
        vertex.addEdge(new Edge(0, null, null));
        vertex.addEdge(new Edge(100, null, null));
        vertex.removeEdge(0);
        expect(vertex.getEdges().length).toBe(1);
        vertex.removeEdge(100);
        expect(vertex.getEdges().length).toBe(0);
    });

    it("should be able to set a coordinate", function () {
        vertex.x = 100;
        vertex.y = 200;
        expect(vertex.x).toBe(100);
        expect(vertex.y).toBe(200);
    });
});

describe("Graph", function () {
    var graph;

    beforeEach(function () {
        // Create a small graph.
        graph = new Graph();
    });

    it("should be able to add a vertex", function () {
        graph.addVertex(0, 0, 0);
        expect(graph.vertices.length).toBe(1);
    });

    it("should be able to remove a vertex", function () {
        graph.addVertex(0, 0, 0);
        graph.removeVertex(0);
        expect(graph.vertices.length).toBe(0);
    });

    it("should be able to add an edge", function () {
        var v1 = graph.addVertex(0, 0, 0),
            v2 = graph.addVertex(1, 0, 1),
            e1 = graph.addEdge(0, v1, v2);
        expect(graph.edges.length).toBe(1);
    });

    it("should be able to remove an edge", function () {
        var v1 = graph.addVertex(0, 0, 0),
            v2 = graph.addVertex(1, 0, 1),
            e1 = graph.addEdge(0, v1, v2);
        graph.removeEdge(0);
        expect(graph.edges.length).toBe(0);
    });
});