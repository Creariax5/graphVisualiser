'use client';
import { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';
import RBush from 'rbush';

const GraphRenderer = ({ containerId, data }) => {
  const graphRef = useRef(null);
  const rendererRef = useRef(null);
  const quadtreeRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize graph
    const graph = new Graph();
    graphRef.current = graph;

    // Initialize RBush tree
    quadtreeRef.current = new RBush();

    // Custom WebGL settings
    const settings = {
      renderEdges: true,
      defaultNodeColor: '#4299E1',
      defaultEdgeColor: '#CBD5E0',
      defaultNodeSize: 5,
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
      webglOpts: {
        antialias: true,
        preserveDrawingBuffer: false
      }
    };

    // Initialize sigma renderer
    const container = document.getElementById(containerId);
    if (container) {
      rendererRef.current = new Sigma(graph, container, settings);

      // Setup camera move handler
      rendererRef.current.getCamera().on('updated', handleCameraMove);
    }

    // Add nodes and edges
    if (data?.nodes) {
      addNodesAndEdges(data);
    }

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.kill();
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      cleanupUnusedNodes();
    };
  }, [containerId, data]);

  const handleCameraMove = () => {
    if (!rendererRef.current || !graphRef.current || !quadtreeRef.current) return;

    const camera = rendererRef.current.getCamera();
    const { x, y } = camera.getState();
    const ratio = camera.getState().ratio;
    const viewportDimensions = rendererRef.current.getDimensions();
    
    // Calculate viewport bounds
    const viewport = {
      x: {
        min: x - (viewportDimensions.width * ratio) / 2,
        max: x + (viewportDimensions.width * ratio) / 2
      },
      y: {
        min: y - (viewportDimensions.height * ratio) / 2,
        max: y + (viewportDimensions.height * ratio) / 2
      }
    };

    const visibleNodes = quadtreeRef.current.search({
      minX: viewport.x.min,
      minY: viewport.y.min,
      maxX: viewport.x.max,
      maxY: viewport.y.max
    }).map(item => item.id);

    // Update visible nodes
    graphRef.current.forEachNode((node, attr) => {
      graphRef.current.setNodeAttribute(node, 'hidden', !visibleNodes.includes(node));
    });
  };

  const addNodesAndEdges = (data) => {
    // Add nodes
    data.nodes.forEach(node => {
      graphRef.current.addNode(node.id, {
        x: node.x,
        y: node.y,
        size: node.size || 5,
        color: node.color || '#4299E1'
      });

      quadtreeRef.current.insert({
        minX: node.x,
        minY: node.y,
        maxX: node.x,
        maxY: node.y,
        id: node.id
      });
    });

    // Add edges
    data.edges.forEach(edge => {
      if (!graphRef.current.hasEdge(edge.source, edge.target)) {
        graphRef.current.addEdge(edge.source, edge.target);
      }
    });

    // Center the camera
    if (rendererRef.current) {
      rendererRef.current.getCamera().animate({ x: 0, y: 0, ratio: 1 }, {
        duration: 1000
      });
    }
  };

  const cleanupUnusedNodes = () => {
    if (!rendererRef.current || !graphRef.current || !quadtreeRef.current) return;

    const camera = rendererRef.current.getCamera();
    const { x, y, ratio } = camera.getState();
    const dimensions = rendererRef.current.getDimensions();
    const margin = Math.max(dimensions.width, dimensions.height) * ratio * 0.5;

    graphRef.current.forEachNode((node, attr) => {
      if (
        attr.x < x - margin ||
        attr.x > x + margin ||
        attr.y < y - margin ||
        attr.y > y + margin
      ) {
        graphRef.current.dropNode(node);
        quadtreeRef.current.remove({
          minX: attr.x,
          minY: attr.y,
          maxX: attr.x,
          maxY: attr.y,
          id: node
        });
      }
    });
  };

  return null; // Sigma handles the rendering
};

export default GraphRenderer;