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
  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const graphData = notes ? buildGraphData(notes) : { nodes: [], links: [] };

  useEffect(() => {
    if (useCytoscape && cyRef.current) {
      cyRef.current.innerHTML = '';
      const cy = cytoscape({
        container: cyRef.current,
        elements: [
          ...graphData.nodes.map(node => ({ data: { id: String(node.id), label: node.name } })),
          ...graphData.links.map(link => ({ data: { source: String(link.source), target: String(link.target) } })),
        ],
        style: [
          { selector: 'node', style: { 'background-color': '#a259f7', label: 'data(label)', width: 20, height: 20 } },
          { selector: 'edge', style: { 'line-color': '#adb5bd', width: 2 } },
          { selector: 'node:selected', style: { 'background-color': '#ff6b6b' } },
        ],
        layout: { name: 'cose', animate: true },
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
          <div ref={cyRef} style={{ width: '100%', height: '600px', background: '#fff' }} />
        ) : (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={node => node.id === selectedNode?.id ? '#ff6b6b' : '#4dabf7'}
            nodeRelSize={6}
            linkWidth={1}
            linkColor={() => '#adb5bd'}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            cooldownTicks={100}
            onEngineStop={() => {
              // Optional: Add any post-layout adjustments here
            }}
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
    </div>
  );
} 