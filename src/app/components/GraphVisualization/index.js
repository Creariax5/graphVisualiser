'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const GraphRenderer = dynamic(() => import('./GraphRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-950">
      <span className="font-[family-name:var(--font-geist-sans)]">Loading graph visualization...</span>
    </div>
  )
});

const GraphVisualization = ({ data }) => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <span className="font-[family-name:var(--font-geist-sans)]">Initializing...</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      id="graph-container"
      className="w-full h-full"
    >
      <GraphRenderer containerId="graph-container" data={data} />
    </div>
  );
};

export default GraphVisualization;