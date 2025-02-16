'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import _ from 'lodash';

const GraphVisualization = dynamic(
  () => import('./GraphVisualization'),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder />
  }
);

function LoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-950">
      <span className="font-[family-name:var(--font-geist-sans)]">Loading graph visualization...</span>
    </div>
  );
}

export default function ClientGraph() {
  const [nodeCount, setNodeCount] = useState(500);
  const [graphData, setGraphData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const mounted = useRef(false);

  const generateRandomPosition = () => {
    // Increased bounds for better spread with large number of nodes
    const bounds = 100000;
    return {
      x: _.random(-bounds, bounds),
      y: _.random(-bounds, bounds)
    };
  };

  const generateNodes = async (count) => {
    if (!mounted.current) return null;
    
    setIsGenerating(true);
    
    // Generate nodes in chunks for better performance
    const chunkSize = 50;
    const nodes = [];
    const edges = [];
    
    // Generate nodes first
    for (let i = 0; i < count; i += chunkSize) {
      const chunk = _.range(i, Math.min(i + chunkSize, count)).map(index => ({
        id: String(index + 1),
        ...generateRandomPosition(),
        size: 1, // Smaller node size for better performance
        color: '#4299E1'
      }));
      nodes.push(...chunk);
      
      // Allow UI to update
      if (i % 10000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Generate edges with reduced connections for better performance
    const connectionsPerNode = Math.min(2, Math.max(1, Math.floor(10000 / count)));
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const numConnections = _.random(1, connectionsPerNode);
      
      // Only connect to nodes within a certain range to reduce edge crossings
      const nearbyNodes = nodes
        .slice(Math.max(0, i - 100), Math.min(nodes.length, i + 100))
        .filter(n => n.id !== node.id);
        
      _.sampleSize(nearbyNodes, numConnections)
        .forEach(target => {
          edges.push({
            source: node.id,
            target: target.id
          });
        });
      
      // Allow UI to update periodically
      if (i % 10000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    setIsGenerating(false);
    return { nodes, edges };
  };

  useEffect(() => {
    mounted.current = true;
    generateNodes(nodeCount).then(data => setGraphData(data));
    return () => {
      mounted.current = false;
    };
  }, []);

  const Controls = () => (
    <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg dark:shadow-gray-800 z-50">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Number of Nodes:
        <input
          type="number"
          min="100"
          max="50000"
          value={nodeCount}
          onChange={(e) => setNodeCount(Number(e.target.value))}
          className="ml-2 p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </label>
      <button
        onClick={() => generateNodes(nodeCount).then(data => setGraphData(data))}
        disabled={isGenerating}
        className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded transition-colors w-full
          ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
      >
        {isGenerating ? 'Generating...' : 'Generate Graph'}
      </button>
      {isGenerating && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Generating large graphs may take a few seconds...
        </p>
      )}
    </div>
  );

  if (!graphData) return <LoadingPlaceholder />;

  return (
    <div className="relative w-full h-full">
      <Controls />
      <div className="absolute inset-0 z-0">
        <GraphVisualization data={graphData} />
      </div>
    </div>
  );
}
