'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCallback, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import styles from './GraphView.module.scss';
import dynamic from 'next/dynamic';

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

function extractLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const matches = [...content.matchAll(linkRegex)];
  return matches.map(match => match[1]);
}

function buildGraphData(notes) {
  const nodes = notes.map(note => ({
    id: note.id,
    name: note.title,
    val: 1,
  }));

  const links = [];
  notes.forEach(note => {
    const linkedTitles = extractLinks(note.content);
    linkedTitles.forEach(linkedTitle => {
      const targetNote = notes.find(n => n.title === linkedTitle);
      if (targetNote) {
        links.push({
          source: note.id,
          target: targetNote.id,
        });
      }
    });
  });

  return { nodes, links };
}

export default function GraphView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const graphData = notes ? buildGraphData(notes) : { nodes: [], links: [] };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.graphContainer}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeColor={node => node.id === selectedNode?.id ? '#ff6b6b' : '#4dabf7'}
          nodeRelSize={6}
          linkWidth={1}
          linkColor={() => '#adb5bd'}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          cooldownTicks={100}
          backgroundColor="rgba(0,0,0,0)"
          width={dimensions.width}
          height={dimensions.height}
          onEngineStop={() => fgRef.current && fgRef.current.zoomToFit(400)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // Draw the bubble (circle)
            const isSelected = node.id === selectedNode?.id;
            const radius = 6 * globalScale; // match nodeRelSize
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = isSelected ? '#ff6b6b' : '#3a5a40';
            ctx.shadowColor = isSelected ? '#ffb3b3' : '#b8c4b9';
            ctx.shadowBlur = isSelected ? 12 : 6;
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = isSelected ? '#ff6b6b' : '#3a5a40';
            ctx.lineWidth = isSelected ? 2.5 : 1.5;
            ctx.stroke();
            ctx.restore();

            // Draw the label with dynamic opacity
            const label = node.name;
            const fontSize = 14 / globalScale;
            let opacity = 0;
            if (globalScale > 2.5) {
              opacity = 1;
            } else if (globalScale > 1.2) {
              opacity = 0.5 + 0.5 * ((globalScale - 1.2) / (2.5 - 1.2));
            } else if (globalScale > 0.7) {
              opacity = 0.3 * ((globalScale - 0.7) / (1.2 - 0.7));
            } else {
              opacity = 0;
            }
            if (opacity > 0) {
              ctx.save();
              ctx.globalAlpha = opacity;
              ctx.font = `${fontSize}px Arial, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#222';
              ctx.strokeStyle = 'rgba(255,255,255,0.7)';
              ctx.lineWidth = 4 / globalScale;
              ctx.strokeText(label, node.x, node.y - radius - 10 / globalScale);
              ctx.fillText(label, node.x, node.y - radius - 10 / globalScale);
              ctx.restore();
            }
          }}
        />
      </div>
      {selectedNode && (
        <div className={styles.sidebar}>
          <h2>{selectedNode.name}</h2>
          <div className={styles.links}>
            <h3>Connected Notes</h3>
            <ul>
              {graphData.links
                .filter(link => link.source === selectedNode.id || link.target === selectedNode.id)
                .map(link => {
                  const connectedNodeId = link.source === selectedNode.id ? link.target : link.source;
                  const connectedNode = graphData.nodes.find(n => n.id === connectedNodeId);
                  return connectedNode ? (
                    <li key={connectedNode.id}>
                      <button onClick={() => setSelectedNode(connectedNode)}>
                        {connectedNode.name}
                      </button>
                    </li>
                  ) : null;
                })}
            </ul>
          </div>
        </div>
      )}
      <style>{`
        canvas {
          background: transparent !important;
          background-color: transparent !important;
        }
        .force-graph-tooltip {
          color: #222 !important;
          background: #fff !important;
          border: 1px solid #1976d2 !important;
          border-radius: 6px !important;
          font-size: 15px !important;
          font-family: inherit !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
          padding: 6px 12px !important;
          z-index: 9999 !important;
        }
      `}</style>
    </div>
  );
} 