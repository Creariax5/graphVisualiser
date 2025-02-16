'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import _ from 'lodash';

// Dynamically import the GraphVisualization component with no SSR
const GraphVisualization = dynamic(
  () => import('./GraphVisualization'),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder />
  }
);

// Separate loading component to ensure consistent rendering
function LoadingPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-950 font-[family:var(--font-geist-sans)]">
      Loading graph visualization...
    </div>
  );
}

export default function ClientGraph() {
  const [nodeCount, setNodeCount] = useState(5);
  const [graphData, setGraphData] = useState(null);

  // Function to generate random coordinates within bounds
  const generateRandomPosition = () => {
    const bounds = 300; // Maximum distance from center
    return {
      x: _.random(-bounds, bounds),
      y: _.random(-bounds, bounds)
    };
  };

  // Function to generate nodes
  const generateNodes = (count) => {
    const nodes = _.range(count).map(i => {
      const position = generateRandomPosition();
      return {
        id: String(i + 1),
        ...position,
        size: 5,
        color: '#4299E1'
      };
    });

    // Generate edges - connecting each node to 2-3 random other nodes
    const edges = [];
    nodes.forEach((node) => {
      const numConnections = _.random(2, 3);
      const possibleTargets = nodes
        .filter(n => n.id !== node.id && !edges.some(e => 
          (e.source === node.id && e.target === n.id) || 
          (e.source === n.id && e.target === node.id)
        ));

      _.sampleSize(possibleTargets, Math.min(numConnections, possibleTargets.length))
        .forEach(target => {
          edges.push({
            source: node.id,
            target: target.id
          });
        });
    });

    return { nodes, edges };
  };

  // Controls component
  const Controls = () => (
    <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg dark:shadow-gray-800">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Number of Nodes:
        <input
          type="number"
          min="2"
          max="50"
          value={nodeCount}
          onChange={(e) => setNodeCount(Number(e.target.value))}
          className="ml-2 p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </label>
      <button
        onClick={() => setGraphData(generateNodes(nodeCount))}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Generate Graph
      </button>
    </div>
  );

  // Initialize graph on component mount
  useEffect(() => {
    setGraphData(generateNodes(nodeCount));
  }, []);

  if (!graphData) return <LoadingPlaceholder />;

  return (
    <div className="relative w-full h-full">
      <Controls />
      <GraphVisualization data={graphData} />
    </div>
  );
}