import { useState, useRef, useEffect } from 'react';
import { Briefcase, Mail, Phone, MapPin, X, ZoomIn, ZoomOut, Square } from 'lucide-react';
import * as d3 from 'd3';

// Types for our data
interface Profile {
  id: number;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  color: string;
}

interface NodeDatum extends d3.SimulationNodeDatum, Profile {}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  confidence?: number;
}

// Sample data
const nodes: Profile[] = [
  { 
    id: 1, 
    name: 'Ruiheng Lee', 
    title: 'Senior Product Manager', 
    company: 'Acme Technologies', 
    email: 'ruiheng.lee@acme.com', 
    phone: '(555) 123-4567', 
    location: 'San Francisco, CA', 
    bio: 'Product strategist with 8+ years of experience leading cross-functional teams. Specializes in SaaS products with a focus on user experience and data-driven decision making.', 
    avatar: 'JS', 
    color: '#4f46e5' 
  },
  { 
    id: 2, 
    name: 'Satish Deshbhratar', 
    title: 'Full Stack Developer', 
    company: 'CodeWorks Inc.', 
    email: 'satish.db@codeworks.com', 
    phone: '(555) 987-6543', 
    location: 'Austin, TX', 
    bio: 'Full stack developer with expertise in React, Node.js, and cloud infrastructure. Passionate about building scalable applications and mentoring junior developers.', 
    avatar: 'MC', 
    color: '#0891b2' 
  },
  { 
    id: 3, 
    name: 'Jane Poojari', 
    title: 'UX Research Lead', 
    company: 'DesignHub', 
    email: 'jane.p@designhub.com', 
    phone: '(555) 456-7890', 
    location: 'Chicago, IL', 
    bio: 'User experience researcher with a background in cognitive psychology. Conducts user interviews, usability testing, and translates research insights into actionable design recommendations.', 
    avatar: 'SR', 
    color: '#9333ea' 
  },
  { 
    id: 4, 
    name: 'Daniel Swarup', 
    title: 'Marketing Director', 
    company: 'Growth Partners', 
    email: 'd.swarup@growthpartners.com', 
    phone: '(555) 789-0123', 
    location: 'New York, NY', 
    bio: 'Marketing executive specializing in B2B growth strategies. Experienced in building marketing teams and developing comprehensive brand strategies across digital channels.', 
    avatar: 'DJ', 
    color: '#16a34a' 
  },
  { 
    id: 5, 
    name: 'Mikey Wilson', 
    title: 'Data Scientist', 
    company: 'DataViz Analytics', 
    email: 'mikey.w@dataviz.com', 
    phone: '(555) 234-5678', 
    location: 'Seattle, WA', 
    bio: 'Data scientist with expertise in machine learning and data visualization. Focuses on turning complex data into actionable business insights.', 
    avatar: 'EW', 
    color: '#dc2626' 
  },
  { 
    id: 6, 
    name: 'Danny Wilson', 
    title: 'Project Manager', 
    company: 'Acme Technologies', 
    email: 'j.wilson@acme.com', 
    phone: '(555) 345-6789', 
    location: 'Boston, MA', 
    bio: 'Agile project manager with PMP certification. Experienced in leading digital transformation initiatives and implementing efficient workflows.', 
    avatar: 'JW', 
    color: '#ea580c' 
  }
];

// Initial links with confidence scores
const initialLinks = [
  { source: 1, target: 2, confidence: 0.85 },
  { source: 1, target: 3, confidence: 0.72 },
  { source: 2, target: 3, confidence: 0.93 },
  { source: 2, target: 4, confidence: 0.68 },
  { source: 2, target: 5, confidence: 0.77 },
  { source: 5, target: 6, confidence: 0.81 },
  { source: 6, target: 1, confidence: 0.75 }
];

export default function NetworkGraph() {
  // State
  const [selectedNode, setSelectedNode] = useState<Profile | null>(null);
  const [viewMode, setViewMode] = useState<'panel' | 'modal'>('panel');
  const [links, setLinks] = useState<LinkDatum[]>([...initialLinks]);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  
  // Refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const graphRef = useRef<SVGGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<NodeDatum, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Helper functions
  const getNodeConnections = (nodeId: number) => {
    const connectionIds: any[] = [];
    
    links.forEach(link => {
        const sourceId = getNodeId(link.source);
        const targetId = getNodeId(link.target);
      
      if (sourceId === nodeId) {
        connectionIds.push(targetId);
      } else if (targetId === nodeId) {
        connectionIds.push(sourceId);
      }
    });
    
    return nodes.filter(node => connectionIds.includes(node.id));
  };
  
  const getNonConnections = (nodeId: number) => {
    const connections = getNodeConnections(nodeId).map(node => node.id);
    return nodes.filter(node => node.id !== nodeId && !connections.includes(node.id));
  };
  
  const getLinkConfidence = (source: number, target: number) => {
    const link = links.find(link => {
      let s: number;
      let t: number;
      
      if (typeof link.source === 'number') {
        s = link.source;
      } else if (typeof link.source === 'object' && link.source !== null && 'id' in link.source) {
        s = link.source.id;
      } else {
        return false;
      }
      
      if (typeof link.target === 'number') {
        t = link.target;
      } else if (typeof link.target === 'object' && link.target !== null && 'id' in link.target) {
        t = link.target.id;
      } else {
        return false;
      }
      
      return (s === source && t === target) || (s === target && t === source);
    });
    return link?.confidence ?? 0.5;
  };
  
  const addLink = (targetId: number) => {
    if (!selectedNode) return;
    
    // Prevent duplicate links
    if (links.some(link => {
      const sourceId = getNodeId(link.source);
      const targetId2 = getNodeId(link.target);
      return (sourceId === selectedNode.id && targetId2 === targetId) || 
             (sourceId === targetId && targetId2 === selectedNode.id);
    })) return;
    
    // Add with random confidence between 0.6 and 0.95
    const newLink = { 
      source: selectedNode.id, 
      target: targetId, 
      confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100 
    };
    
    setLinks([...links, newLink]);
  };

  // Helper function to safely get node IDs from link sources/targets
  const getNodeId = (node: string | number | object | null): number | null => {
    if (typeof node === 'number') {
      return node;
    } else if (typeof node === 'object' && node !== null && 'id' in node) {
      return (node as NodeDatum).id;
    }
    return null;
  };
  
  // Then use it in your functions
const removeLink = (targetId: number) => {
    if (!selectedNode) return;
    
    setLinks(links.filter(link => {
      const sourceId = getNodeId(link.source);
      const targetId2 = getNodeId(link.target);
      
      if (sourceId === null || targetId2 === null) return true;
      
      return !((sourceId === selectedNode.id && targetId2 === targetId) || 
               (sourceId === targetId && targetId2 === selectedNode.id));
    }));
  };
  
  const closeDetail = () => {
    setSelectedNode(null);
  };
  
  const resetView = () => {
    if (!svgRef.current || !zoomRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
      );
  };
  
  // D3 Setup
  useEffect(() => {
    if (!svgRef.current || !graphRef.current) return;
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Function to restart the simulation with updated links
    const restartSimulation = () => {
      // Clear existing elements
      const svg = d3.select(graphRef.current);
      svg.selectAll('*').remove();
      
      // Stop existing simulation if any
      if (simulationRef.current) simulationRef.current.stop();
      
      // Create simulation
      const simulation = d3.forceSimulation(nodes as NodeDatum[])
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(200))
        .force('charge', d3.forceManyBody().strength(-600))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .on('tick', ticked);
      
      simulationRef.current = simulation;
      
      // Create links
      const linkElements = svg.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', d => {
          const conf = d.confidence ?? 0.5;
          if (conf >= 0.8) return '#22c55e'; // Green for high confidence
          if (conf >= 0.6) return '#3b82f6'; // Blue for medium confidence
          return '#ef4444';                  // Red for low confidence
        })
        .attr('stroke-width', 2)
        .attr('stroke-opacity', d => (d.confidence ?? 0.5) * 0.8);
      
      // Create node groups
      const nodeGroups = svg.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d);
        });
      
      // Add card rectangles
      nodeGroups.append('rect')
        .attr('width', 160)
        .attr('height', 100)
        .attr('rx', 8)
        .attr('fill', 'white')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))');
      
      // Add avatar circles
      nodeGroups.append('circle')
        .attr('cx', 30)
        .attr('cy', 30)
        .attr('r', 16)
        .attr('fill', d => d.color);
      
      // Add avatar text
      nodeGroups.append('text')
        .attr('x', 30)
        .attr('y', 34)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '14')
        .text(d => d.avatar);
      
      // Add name text
      nodeGroups.append('text')
        .attr('x', 55)
        .attr('y', 26)
        .attr('fill', '#1f2937')
        .attr('font-weight', '600')
        .attr('font-size', '12')
        .each(function(d) {
          const text = d3.select(this);
          let name = d.name;
          const maxWidth = 95;
          text.text(name);
          while (this.getComputedTextLength() > maxWidth && name.length > 0) {
            name = name.slice(0, -1);
            text.text(name + '...');
          }
        });
      
      // Add title text
      nodeGroups.append('text')
        .attr('x', 55)
        .attr('y', 43)
        .attr('fill', '#4b5563')
        .attr('font-size', '10')
        .each(function(d) {
          const text = d3.select(this);
          let title = d.title;
          const maxWidth = 95;
          text.text(title);
          while (this.getComputedTextLength() > maxWidth && title.length > 0) {
            title = title.slice(0, -1);
            text.text(title + '...');
          }
        });
      
      // Add company text
      nodeGroups.append('text')
        .attr('x', 30)
        .attr('y', 70)
        .attr('fill', '#6b7280')
        .attr('font-size', '10')
        .text(d => d.company);
      
      // Add location text
      nodeGroups.append('text')
        .attr('x', 30)
        .attr('y', 86)
        .attr('fill', '#6b7280')
        .attr('font-size', '10')
        .text(d => d.location.split(',')[0]);
      
      // Company icon
      nodeGroups.append('foreignObject')
        .attr('x', 12)
        .attr('y', 60)
        .attr('width', 12)
        .attr('height', 12)
        .html(() => `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <path d="M9 9h6v3h-6z"></path>
          <path d="M9 16h6"></path>
        </svg>`);
      
      // Location icon
      nodeGroups.append('foreignObject')
        .attr('x', 12)
        .attr('y', 76)
        .attr('width', 12)
        .attr('height', 12)
        .html(() => `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>`);
      
      // Add drag behavior
      nodeGroups.call(
        // @ts-ignore - Using ts-ignore since the d3.drag typing is complex
        d3.drag<SVGGElement, NodeDatum>()
          .on('start', function(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', function(event, d) {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', function(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );
      
      // Function to compute line positions on each tick
      function ticked() {
        // Helper to find intersection point of line with node rectangle
        function getIntersection(
          x1: number, y1: number, 
          x2: number, y2: number, 
          nodeX: number, nodeY: number
        ) {
          // Node rectangle dimensions
          const width = 160;
          const height = 100;
          const halfWidth = width / 2;
          const halfHeight = height / 2;
          
          // Calculate intersection with rectangle
          const dx = x2 - x1;
          const dy = y2 - y1;
          
          // Handle case where nodes are in the same position
          if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            return { x: x1, y: y1 };
          }
          
          const angle = Math.atan2(dy, dx);
          
          // Find intersection point
          let ix, iy;
          if (Math.abs(Math.cos(angle)) * halfHeight > Math.abs(Math.sin(angle)) * halfWidth) {
            // Intersects vertical edge
            ix = nodeX + (halfWidth * Math.sign(dx));
            iy = y1 + (dy * (ix - x1)) / dx;
          } else {
            // Intersects horizontal edge
            iy = nodeY + (halfHeight * Math.sign(dy));
            ix = x1 + (dx * (iy - y1)) / dy;
          }
          
          return { x: ix, y: iy };
        }
        
        // Update link positions
        linkElements
          .attr('x1', d => {
            const source = d.source as NodeDatum;
            const target = d.target as NodeDatum;
            const intersection = getIntersection(
              source.x ?? 0, source.y ?? 0,
              target.x ?? 0, target.y ?? 0,
              source.x ?? 0, source.y ?? 0
            );
            return intersection.x;
          })
          .attr('y1', d => {
            const source = d.source as NodeDatum;
            const target = d.target as NodeDatum;
            const intersection = getIntersection(
              source.x ?? 0, source.y ?? 0,
              target.x ?? 0, target.y ?? 0,
              source.x ?? 0, source.y ?? 0
            );
            return intersection.y;
          })
          .attr('x2', d => {
            const source = d.source as NodeDatum;
            const target = d.target as NodeDatum;
            const intersection = getIntersection(
              target.x ?? 0, target.y ?? 0,
              source.x ?? 0, source.y ?? 0,
              target.x ?? 0, target.y ?? 0
            );
            return intersection.x;
          })
          .attr('y2', d => {
            const source = d.source as NodeDatum;
            const target = d.target as NodeDatum;
            const intersection = getIntersection(
              target.x ?? 0, target.y ?? 0,
              source.x ?? 0, source.y ?? 0,
              target.x ?? 0, target.y ?? 0
            );
            return intersection.y;
          });
        
        // Update node positions
        nodeGroups.attr('transform', d => {
            // Assert that d has been enhanced by D3 simulation with x and y properties
            const node = d as unknown as NodeDatum;
            return `translate(${(node.x ?? 0) - 80}, ${(node.y ?? 0) - 50})`;
          });
      }
    };
    
    // Set up zoom behavior
    if (!zoomRef.current) {
      zoomRef.current = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          const { x, y, k } = event.transform;
          setTransform({ x, y, k });
          d3.select(graphRef.current).attr('transform', event.transform.toString());
        });
      
      d3.select(svgRef.current).call(zoomRef.current);
    }
    
    // Initial render
    restartSimulation();
    
    // Cleanup function
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [links]); // Rerun when links change
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 flex">
        {/* Left side panel (when selected in panel mode) */}
        {selectedNode && viewMode === 'panel' && (
          <aside className="w-80 bg-white shadow-lg rounded-lg overflow-hidden mr-6 flex-shrink-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
                <button 
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white" 
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.avatar}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{selectedNode.name}</h3>
                  <p className="text-gray-600">{selectedNode.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Briefcase size={18} className="mr-3" />
                  <span>{selectedNode.company}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-3" />
                  <span>{selectedNode.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail size={18} className="mr-3" />
                  <span className="text-sm">{selectedNode.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone size={18} className="mr-3" />
                  <span>{selectedNode.phone}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Bio</h3>
                <p className="text-gray-700 text-sm">{selectedNode.bio}</p>
              </div>
              
              {/* Connected people */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Connections</h3>
                <div className="space-y-2">
                  {getNodeConnections(selectedNode.id).map(connection => {
                    const confidence = getLinkConfidence(selectedNode.id, connection.id);
                    return (
                      <div 
                        key={connection.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: connection.color }}
                          >
                            {connection.avatar}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium">{connection.name}</div>
                            <div className="text-xs text-gray-500">
                              Confidence: {Math.round(confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeLink(connection.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })}
                  
                  {getNodeConnections(selectedNode.id).length === 0 && (
                    <p className="text-sm text-gray-500">No connections</p>
                  )}
                </div>
              </div>
              
              {/* Add new connections */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Add Connection</h3>
                <div className="space-y-2">
                  {getNonConnections(selectedNode.id).map(connection => (
                    <div 
                      key={connection.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: connection.color }}
                        >
                          {connection.avatar}
                        </div>
                        <span className="ml-2 text-sm font-medium">{connection.name}</span>
                      </div>
                      <button 
                        onClick={() => addLink(connection.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Link
                      </button>
                    </div>
                  ))}
                  
                  {getNonConnections(selectedNode.id).length === 0 && (
                    <p className="text-sm text-gray-500">All profiles are already connected</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
        
        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Professional Network Graph</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">View Mode:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'panel' | 'modal')}
                  className="bg-white border border-gray-300 rounded-md text-sm px-3 py-1 text-gray-800"
                >
                  <option value="panel">Side Panel</option>
                  <option value="modal">Modal Overlay</option>
                </select>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden relative"
            style={{ height: '80vh' }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              className="border border-gray-200 rounded-lg"
              onClick={() => setSelectedNode(null)}
            >
              <g ref={graphRef} />
            </svg>
            
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-2 flex space-x-2">
  <button
    className="p-2 hover:bg-gray-100 rounded-md flex items-center justify-center"
    onClick={() => {
      if (!svgRef.current || !zoomRef.current) return;
      
      const newTransform = { ...transform, k: transform.k * 1.2 };
      setTransform(newTransform);
      
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(newTransform.x, newTransform.y).scale(newTransform.k)
        );
    }}
  >
    <ZoomIn size={18} color="#000000" />
  </button>
  <button
    className="p-2 hover:bg-gray-100 rounded-md flex items-center justify-center"
    onClick={() => {
      if (!svgRef.current || !zoomRef.current) return;
      
      const newTransform = { ...transform, k: transform.k * 0.8 };
      setTransform(newTransform);
      
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(newTransform.x, newTransform.y).scale(newTransform.k)
        );
    }}
  >
    <ZoomOut size={18} color="#000000" />
  </button>
  <div className="w-px h-6 bg-gray-200 mx-1"></div>
  <button
    className="p-2 hover:bg-gray-100 rounded-md flex items-center justify-center"
    onClick={resetView}
  >
    <Square size={18} color="#000000" />
  </button>
</div>
          </div>
          
          <div className="mt-4 text-gray-600 text-sm">
            <p>Drag nodes to reposition • Click cards for details • Connections are color-coded by confidence level</p>
            <p className="mt-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> High confidence
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mx-1 ml-4"></span> Medium confidence
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-1 ml-4"></span> Low confidence
            </p>
          </div>
        </div>
      </div>
      
      {/* Modal overlay for profile details */}
      {selectedNode && viewMode === 'modal' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
                <button 
                  onClick={closeDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl text-white" 
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.avatar}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{selectedNode.name}</h3>
                  <p className="text-gray-600">{selectedNode.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Briefcase size={18} className="mr-3" />
                  <span>{selectedNode.company}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-3" />
                  <span>{selectedNode.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail size={18} className="mr-3" />
                  <span className="text-sm">{selectedNode.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone size={18} className="mr-3" />
                  <span>{selectedNode.phone}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Bio</h3>
                <p className="text-gray-700 text-sm">{selectedNode.bio}</p>
              </div>
              
              {/* Connected people */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Connections</h3>
                <div className="space-y-2">
                  {getNodeConnections(selectedNode.id).map(connection => {
                    const confidence = getLinkConfidence(selectedNode.id, connection.id);
                    return (
                      <div 
                        key={connection.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: connection.color }}
                          >
                            {connection.avatar}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium">{connection.name}</div>
                            <div className="text-xs text-gray-500">
                              Confidence: {Math.round(confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeLink(connection.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })}
                  
                  {getNodeConnections(selectedNode.id).length === 0 && (
                    <p className="text-sm text-gray-500">No connections</p>
                  )}
                </div>
              </div>
              
              {/* Add new connections */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Add Connection</h3>
                <div className="space-y-2">
                  {getNonConnections(selectedNode.id).map(connection => (
                    <div 
                      key={connection.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ backgroundColor: connection.color }}
                        >
                          {connection.avatar}
                        </div>
                        <span className="ml-2 text-sm font-medium">{connection.name}</span>
                      </div>
                      <button 
                        onClick={() => addLink(connection.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Link
                      </button>
                    </div>
                  ))}
                  
                  {getNonConnections(selectedNode.id).length === 0 && (
                    <p className="text-sm text-gray-500">All profiles are already connected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}