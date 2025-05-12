'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useCallback, useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import styles from './GraphView.module.scss';
import dynamic from 'next/dynamic';
import cytoscape from 'cytoscape';

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
  const [useCytoscape, setUseCytoscape] = useState(false);
  const cyRef = useRef(null);
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

  useEffect(() => {
    if (useCytoscape && cyRef.current) {
      console.log('Cytoscape graphData:', graphData);
      cyRef.current.innerHTML = '';
      const cy = cytoscape({
        container: cyRef.current,
        elements: [
          ...graphData.nodes.map(node => ({ data: { id: String(node.id), label: node.name } })),
          ...graphData.links.map(link => ({ data: { source: String(link.source), target: String(link.target) } })),
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#4dabf7',
              'border-width': 3,
              'border-color': '#1976d2',
              'label': 'data(label)',
              'color': '#222',
              'font-family': 'Inter, Nunito, Arial, sans-serif',
              'font-size': 16,
              'font-weight': 400,
              'text-valign': 'center',
              'text-halign': 'center',
              'text-outline-width': 2,
              'text-outline-color': '#fff',
              'width': 44,
              'height': 44,
              'shape': 'ellipse',
              'transition-property': 'background-color, border-color, width, height, color',
              'transition-duration': '0.5s',
              'opacity': 1,
            },
          },
          {
            selector: 'node:selected',
            style: {
              'background-color': '#fffde7',
              'border-color': '#b8c4b9',
              'color': '#1976d2',
              'width': 54,
              'height': 54,
              'font-size': 18,
              'opacity': 1,
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#1976d2',
              'curve-style': 'bezier',
              'opacity': 0.7,
              'target-arrow-shape': 'none',
              'transition-property': 'line-color, opacity',
              'transition-duration': '0.5s',
            },
          },
        ],
        layout: {
          name: 'cose',
          animate: true,
          randomize: false,
          fit: true,
          padding: 60,
          nodeRepulsion: 12000,
          idealEdgeLength: 120,
          edgeElasticity: 0.2,
          gravity: 0.25,
        },
        minZoom: 0.4,
        maxZoom: 2.5,
        wheelSensitivity: 0.2,
      });
      cy.nodes().forEach((node, i) => {
        setTimeout(() => {
          node.animate({ style: { opacity: 1 } }, { duration: 700, easing: 'ease-in-out' });
        }, 100 + i * 60);
      });
      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        setSelectedNode({ id: node.id(), name: node.data('label') });
      });
      cy.on('tap', (evt) => {
        if (evt.target === cy) setSelectedNode(null);
      });
      cyRef.current.cyInstance = cy;
    }
  }, [useCytoscape, graphData]);

  useEffect(() => {
    // Apply forced transparent background and no border/box-shadow to all relevant elements in the graph container
    const graphContainer = document.querySelector(`.${styles.graphContainer}`);
    if (graphContainer) {
      const elements = graphContainer.querySelectorAll('canvas, svg, div');
      elements.forEach(el => {
        el.style.backgroundColor = 'transparent';
        el.style.background = 'none';
        el.style.boxShadow = 'none';
        el.style.border = 'none';
      });
    }
  }, [useCytoscape, graphData]);

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
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setUseCytoscape((v) => !v)}>
          Switch to {useCytoscape ? 'ForceGraph2D' : 'Cytoscape.js'}
        </button>
      </div>
      <div className={styles.graphContainer}>
        {useCytoscape ? (
          <div ref={cyRef} style={{ width: '100%', height: '65vh', background: 'transparent' }} />
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="name"
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
          />
        )}
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