import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the GraphRenderer to avoid SSR
const GraphRenderer = dynamic(() => import('./GraphRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-950">
      <span className="font-[family-name:var(--font-geist-sans)]">Loading graph visualization...</span>
    </div>
  )
});

const GraphVisualization = ({ data }) => {
  const [containerId] = useState(() => `graph-container-${Math.random().toString(36).substr(2, 9)}`);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div id={containerId} className="w-full h-full flex items-center justify-center">
        <span className="font-[family-name:var(--font-geist-sans)]">Initializing...</span>
      </div>
    );
  }

  return (
    <div id={containerId} className="w-full h-full">
      <GraphRenderer containerId={containerId} data={data} />
    </div>
  );
};

export default GraphVisualization;
