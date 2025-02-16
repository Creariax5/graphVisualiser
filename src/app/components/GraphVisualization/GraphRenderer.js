'use client';
import { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import Graph from 'graphology';

const GraphRenderer = ({ containerId, data }) => {
  const graphRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    // Initialize graph
    const graph = new Graph();
    graphRef.current = graph;

    // Enhanced WebGL settings
    const settings = {
      renderEdges: true,
      defaultNodeColor: '#4299E1',
      defaultEdgeColor: '#CBD5E0',
      defaultNodeSize: 3,
      minCameraRatio: 0.05,  // Allow closer zoom
      maxCameraRatio: 30,    // Allow further zoom out
      labelSize: 14,
      labelWeight: 'normal',
      defaultEdgeType: 'line',
      allowInvalidContainer: true,
      hideEdgesOnMove: false,  // Keep edges visible during movement
      nodeReducer: null,       // Prevent node filtering
      edgeReducer: null,       // Prevent edge filtering
      webglOpts: {
        antialias: true,
        preserveDrawingBuffer: false
      }
    };

    // Initialize sigma renderer
    const container = document.getElementById(containerId);
    if (container) {
      // Ensure container has dimensions
      const resizeObserver = new ResizeObserver(() => {
        if (rendererRef.current) {
          rendererRef.current.refresh();
        }
      });
      
      resizeObserver.observe(container);
      
      // Create Sigma instance
      rendererRef.current = new Sigma(graph, container, settings);

      // Add nodes and edges
      if (data?.nodes) {
        addNodesAndEdges(data);
      }

      // Cleanup
      return () => {
        resizeObserver.disconnect();
        if (rendererRef.current) {
          rendererRef.current.kill();
        }
      };
    }
  }, [containerId, data]);

  const addNodesAndEdges = (data) => {
    // Calculate bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    // Add nodes
    data.nodes.forEach(node => {
      graphRef.current.addNode(node.id, {
        x: node.x,
        y: node.y,
        size: node.size || 3,
        color: node.color || '#4299E1',
        hidden: false  // Ensure nodes are never hidden
      });

      // Update bounds
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    // Add edges
    data.edges.forEach(edge => {
      if (!graphRef.current.hasEdge(edge.source, edge.target)) {
        graphRef.current.addEdge(edge.source, edge.target, {
          hidden: false  // Ensure edges are never hidden
        });
      }
    });

    // Center and zoom the camera to fit all nodes
    if (rendererRef.current) {
      const camera = rendererRef.current.getCamera();
      const padding = 1.2; // 20% padding
      
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      const graphCenter = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
      
      const { width, height } = rendererRef.current.getDimensions();
      const scale = Math.min(width / (graphWidth * padding), height / (graphHeight * padding));
      
      camera.animate({
        x: graphCenter.x,
        y: graphCenter.y,
        ratio: 1 / scale,
        angle: 0
      }, {
        duration: 1000
      });
    }
  };

  return null; // Sigma handles the rendering
};

export default GraphRenderer;