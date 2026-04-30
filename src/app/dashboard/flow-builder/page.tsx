'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  type Connection,
  type NodeTypes,
  type Node,
  type Edge,
  Panel,
  MiniMap,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { createClient } from '@/lib/supabase/client'
import {
  Save, Play, Trash2, Plus, Settings, X, Check,
  MessageSquare, GitBranch, Mail, Calendar, Users, Zap,
  ChevronRight, Workflow, Eye, AlertTriangle,
} from 'lucide-react'

/* ── Node Types ────────────────────────────────── */
interface NodeData {
  label: string
  type: string
  config: Record<string, string>
  [key: string]: unknown
}

const NODE_PALETTE = [
  { type: 'trigger',    label: 'Trigger',         icon: '⚡', color: '#6366f1', desc: 'Inicia el flujo',             bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { type: 'agent',      label: 'Agente IA',        icon: '🤖', color: '#8b5cf6', desc: 'Responde con IA',            bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { type: 'condition',  label: 'Condición',        icon: '🔀', color: '#f59e0b', desc: 'Bifurcación lógica',         bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  { type: 'message',    label: 'Mensaje',          icon: '💬', color: '#10b981', desc: 'Envía un mensaje',           bg: 'bg-emerald-500/10',border: 'border-emerald-500/30'},
  { type: 'schedule',   label: 'Agendar',          icon: '📅', color: '#06b6d4', desc: 'Crea una cita',             bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30'   },
  { type: 'email',      label: 'Email',            icon: '📧', color: '#f97316', desc: 'Envía un email',            bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { type: 'handoff',    label: 'Derivar a Humano', icon: '👤', color: '#ef4444', desc: 'Transfiere la conversación', bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { type: 'webhook',    label: 'Webhook',          icon: '🔗', color: '#84cc16', desc: 'Llama a una API externa',   bg: 'bg-lime-500/10',   border: 'border-lime-500/30'   },
]

/* ── Custom Node Component ─────────────────────── */
function FlowNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const palette = NODE_PALETTE.find(n => n.type === data.type) ?? NODE_PALETTE[0]
  return (
    <div
      className={`min-w-[160px] max-w-[200px] ${palette.bg} border-2 ${selected ? 'border-white/50' : palette.border} rounded-xl shadow-lg transition-all`}
      style={{ boxShadow: selected ? `0 0 0 2px ${palette.color}40` : undefined }}
    >
      <div className="px-3 py-2.5 flex items-center gap-2">
        <span className="text-base leading-none">{palette.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{data.label}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{palette.desc}</div>
        </div>
      </div>
      {data.config?.prompt && (
        <div className="px-3 pb-2 text-[10px] text-white/50 line-clamp-2 border-t border-white/10 pt-1.5">
          {data.config.prompt}
        </div>
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  flowNode: FlowNode as any,
}

/* ── Node Inspector Panel ──────────────────────── */
function NodeInspector({
  node, onUpdate, onDelete, onClose,
}: {
  node: Node<NodeData> | null
  onUpdate: (id: string, data: Partial<NodeData>) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  if (!node) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <Workflow size={28} className="text-white/20 mb-3" />
      <p className="text-xs text-white/30 leading-relaxed">
        Selecciona un nodo para<br />configurar sus propiedades
      </p>
    </div>
  )

  const palette = NODE_PALETTE.find(n => n.type === node.data.type) ?? NODE_PALETTE[0]
  const [label, setLabel] = useState(node.data.label)
  const [config, setConfig] = useState<Record<string, string>>(node.data.config ?? {})

  const handleSave = () => {
    onUpdate(node.id, { label, config })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span>{palette.icon}</span>
          <span className="text-sm font-semibold text-white">{palette.label}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div>
          <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Nombre del nodo</label>
          <input value={label} onChange={e => setLabel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none" />
        </div>

        {node.data.type === 'trigger' && (
          <div>
            <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Canal de entrada</label>
            <select value={config.channel ?? ''} onChange={e => setConfig({...config, channel: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none">
              <option value="chat_web">💬 Chat Web</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="instagram">📸 Instagram</option>
              <option value="any">🌐 Cualquier canal</option>
            </select>
          </div>
        )}

        {node.data.type === 'agent' && (
          <>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Prompt del agente</label>
              <textarea value={config.prompt ?? ''} onChange={e => setConfig({...config, prompt: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none" rows={4}
                placeholder="Eres un asistente especializado en..." />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Modelo</label>
              <select value={config.model ?? 'llama-3.1-8b-instant'} onChange={e => setConfig({...config, model: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none">
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Rápido)</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Preciso)</option>
                <option value="gemma2-9b-it">Gemma 2 9B</option>
              </select>
            </div>
          </>
        )}

        {node.data.type === 'condition' && (
          <div>
            <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Condición</label>
            <input value={config.condition ?? ''} onChange={e => setConfig({...config, condition: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="ej: message.includes('precio')" />
          </div>
        )}

        {node.data.type === 'message' && (
          <div>
            <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Contenido del mensaje</label>
            <textarea value={config.message ?? ''} onChange={e => setConfig({...config, message: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none" rows={3}
              placeholder="Hola {{nombre}}, ¿en qué puedo ayudarte?" />
            <p className="text-[10px] text-white/30 mt-1">Variables: {"{{nombre}}"}, {"{{email}}"}, {"{{phone}}"}</p>
          </div>
        )}

        {node.data.type === 'schedule' && (
          <>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Tipo de cita</label>
              <input value={config.service ?? ''} onChange={e => setConfig({...config, service: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Consulta médica, Demo, etc." />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Duración (min)</label>
              <input type="number" value={config.duration ?? '30'} onChange={e => setConfig({...config, duration: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none" min={5} step={5} />
            </div>
          </>
        )}

        {node.data.type === 'email' && (
          <>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Asunto</label>
              <input value={config.subject ?? ''} onChange={e => setConfig({...config, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Confirmación de tu cita" />
            </div>
            <div>
              <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">Cuerpo del email</label>
              <textarea value={config.body ?? ''} onChange={e => setConfig({...config, body: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none" rows={3}
                placeholder="Hola {{nombre}},..." />
            </div>
          </>
        )}

        {node.data.type === 'webhook' && (
          <div>
            <label className="block text-[10px] text-white/50 mb-1 uppercase tracking-wider">URL del Webhook</label>
            <input value={config.url ?? ''} onChange={e => setConfig({...config, url: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              placeholder="https://hooks.zapier.com/..." />
          </div>
        )}
      </div>
      <div className="p-3 border-t border-white/10 space-y-2">
        <button onClick={handleSave}
          className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
          <Check size={12} /> Aplicar cambios
        </button>
        <button onClick={() => onDelete(node.id)}
          className="w-full flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-1.5 rounded-lg text-xs font-medium transition-colors">
          <Trash2 size={12} /> Eliminar nodo
        </button>
      </div>
    </div>
  )
}

/* ── Flow Name Modal ────────────────────────────── */
function SaveModal({ onSave, onClose }: { onSave: (name: string, desc: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl p-5">
        <h3 className="text-base font-bold text-white mb-4">Guardar Flujo</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre del flujo *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Ej: Flujo de Agendamiento Médico" autoFocus />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none" rows={2}
              placeholder="Descripción opcional del flujo..." />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={() => name.trim() && onSave(name.trim(), desc)}
            disabled={!name.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Initial Flow (Demo Template) ──────────────── */
const INITIAL_NODES: Node<NodeData>[] = [
  { id: 'trigger-1', type: 'flowNode', position: { x: 100, y: 80 },  data: { label: 'Mensaje entrante', type: 'trigger',   config: { channel: 'any' } } },
  { id: 'agent-1',   type: 'flowNode', position: { x: 100, y: 220 }, data: { label: 'Agente de bienvenida', type: 'agent', config: { prompt: 'Eres un asistente de atención al cliente. Da una bienvenida cordial y pregunta en qué puedes ayudar.', model: 'llama-3.1-8b-instant' } } },
  { id: 'cond-1',    type: 'flowNode', position: { x: 100, y: 380 }, data: { label: 'Quiere agendar?', type: 'condition',  config: { condition: "intent === 'schedule'" } } },
  { id: 'sched-1',   type: 'flowNode', position: { x: -80, y: 520 }, data: { label: 'Crear cita',    type: 'schedule',  config: { service: 'Consulta', duration: '30' } } },
  { id: 'msg-1',     type: 'flowNode', position: { x: 280, y: 520 }, data: { label: 'Respuesta libre', type: 'agent',    config: { prompt: 'Responde la consulta del usuario de forma útil y concisa.' } } },
]

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'trigger-1', target: 'agent-1',  animated: true,  style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e2', source: 'agent-1',   target: 'cond-1',   animated: false, style: { stroke: '#6366f1', strokeWidth: 1.5 } },
  { id: 'e3', source: 'cond-1',    target: 'sched-1',  label: 'Sí',     style: { stroke: '#10b981', strokeWidth: 1.5 } },
  { id: 'e4', source: 'cond-1',    target: 'msg-1',    label: 'No',     style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
]

let nodeId = 100

/* ── Main Flow Builder Page ────────────────────── */
export default function FlowBuilderPage() {
  const supabase = createClient()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(INITIAL_NODES as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedFlows, setSavedFlows] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  /* Load saved flows */
  useEffect(() => {
    const loadFlows = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('omnichannel_flows').select('id,name,status,updated_at').eq('client_id', user.id).order('updated_at', { ascending: false }).limit(5)
      if (data) setSavedFlows(data)
    }
    loadFlows()
  }, [])

  const onConnect = useCallback((params: Connection) =>
    setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: any, node: Node<NodeData>) => {
    setSelectedNode(node as Node<NodeData>)
  }, [])

  const addNode = (type: string, label: string) => {
    const id = `node-${nodeId++}`
    const newNode: Node<NodeData> = {
      id,
      type: 'flowNode',
      position: { x: 100 + Math.random() * 200, y: 100 + nodes.length * 80 },
      data: { label, type, config: {} },
    }
    setNodes(ns => [...ns, newNode as any])
  }

  const updateNodeData = (id: string, data: Partial<NodeData>) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    if (selectedNode?.id === id) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : prev)
    }
  }

  const deleteNode = (id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }

  const handleSave = async (name: string, desc: string) => {
    setIsSaving(true)
    setShowSaveModal(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('omnichannel_flows').insert({
          client_id: user.id,
          name,
          description: desc,
          channels: ['chat_web', 'whatsapp'],
          nodes: nodes.map(n => ({ id: n.id, type: n.data.type, position: n.position, data: n.data })),
          edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label })),
          status: 'draft',
        })
        setSaveMsg('✅ Flujo guardado como borrador')
      } else {
        setSaveMsg('✅ Flujo guardado (demo — inicia sesión para persistir)')
      }
    } catch {
      setSaveMsg('❌ Error al guardar')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    await new Promise(r => setTimeout(r, 1500))
    setSaveMsg('🚀 Flujo publicado y activo')
    setIsPublishing(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Workflow size={20} className="text-indigo-400" />
            Flow Builder
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Diseña flujos de conversación con drag & drop</p>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">{saveMsg}</span>
          )}
          <button onClick={() => setShowSaveModal(true)} disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors">
            <Save size={13} /> {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={handlePublish} disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white font-semibold transition-colors shadow-lg shadow-indigo-900/40 disabled:opacity-60">
            <Play size={13} /> {isPublishing ? 'Publicando...' : 'Publicar flujo'}
          </button>
        </div>
      </div>

      {/* ── Canvas Area ────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Node Palette */}
        <div className="w-48 flex-shrink-0 bg-white/[0.02] border border-white/10 rounded-xl p-3 overflow-y-auto flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">Nodos disponibles</p>
          {NODE_PALETTE.map(p => (
            <button key={p.type} onClick={() => addNode(p.type, p.label)}
              draggable
              className={`${p.bg} border ${p.border} rounded-lg px-3 py-2 text-left hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing group`}
              title={p.desc}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs font-semibold text-white">{p.label}</span>
              </div>
              <p className="text-[10px] text-white/30 mt-0.5 group-hover:text-white/50 transition-colors">{p.desc}</p>
            </button>
          ))}
          <div className="mt-auto pt-3 border-t border-white/10">
            <p className="text-[9px] text-white/20 text-center">Haz clic para agregar<br/>o arrastra al canvas</p>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 min-w-0 bg-[#080c14] border border-white/10 rounded-xl overflow-hidden" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#080c14]"
            defaultEdgeOptions={{ animated: false, style: { stroke: '#6366f1', strokeWidth: 1.5 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#ffffff08" />
            <Controls className="!bg-white/5 !border-white/10 !rounded-xl !shadow-none" />
            <MiniMap
              className="!bg-white/5 !border-white/10 !rounded-xl"
              nodeColor={(n: any) => {
                const p = NODE_PALETTE.find(p => p.type === n.data?.type)
                return p?.color ?? '#6366f1'
              }}
              maskColor="rgba(0,0,0,0.5)"
            />
            <Panel position="top-right" className="flex gap-2">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <AlertTriangle size={11} className="text-amber-400" />
                <span className="text-[10px] text-amber-300">{nodes.length} nodos · {edges.length} conexiones</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Node Inspector */}
        <div className="w-56 flex-shrink-0 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <NodeInspector
            node={selectedNode}
            onUpdate={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>

      {showSaveModal && <SaveModal onSave={handleSave} onClose={() => setShowSaveModal(false)} />}
    </div>
  )
}
