'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'
import { useRoutingNavigationStore } from '@/stores/routingNavigationStore'
import { drawGrid, drawEdge, drawNode, NODE_RADIUS } from '@/lib/routing/canvas/renderer'

const ZOOM_STEP = 0.05
const ZOOM_MIN = 0.25
const ZOOM_MAX = 3.0

export default function RoutingMapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const animOffset = useRef<number>(0)
  // Start slightly panned right and at ~75% zoom
  const panRef = useRef({ ox: 120, oy: 60 })
  const zoomRef = useRef(0.75)
  const [zoomLevel, setZoomLevel] = useState(0.75)

  const { building } = useRoutingEditorStore()
  const { path, activeViewFloor, emergencyByNodeId } = useRoutingNavigationStore()

  const activeFloor = building.floors.find(f => f.id === activeViewFloor)

  const pathNodeSet = new Set(path?.nodeIds ?? [])
  const pathEdgeDir = new Map<string, boolean>()

  // Build path edge set and directionality
  if (path && activeFloor) {
    const nm = new Map(activeFloor.nodes.map(n => [n.id, n]))
    const ids = path.nodeIds
    for (let i = 0; i < ids.length - 1; i++) {
      const u = ids[i]; const v = ids[i + 1]
      activeFloor.edges.forEach(e => {
        if (e.from === u && e.to === v) pathEdgeDir.set(e.id, false)
        else if (e.from === v && e.to === u) pathEdgeDir.set(e.id, true)
      })
    }
  }

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const next = Math.min(ZOOM_MAX, parseFloat((zoomRef.current + ZOOM_STEP).toFixed(2)))
    zoomRef.current = next
    setZoomLevel(next)
  }, [])

  const handleZoomOut = useCallback(() => {
    const next = Math.max(ZOOM_MIN, parseFloat((zoomRef.current - ZOOM_STEP).toFixed(2)))
    zoomRef.current = next
    setZoomLevel(next)
  }, [])

  const handleZoomReset = useCallback(() => {
    zoomRef.current = 0.75
    setZoomLevel(0.75)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { ox, oy } = panRef.current
    const zoom = zoomRef.current
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    drawGrid(ctx, w, h, ox, oy)

    if (!activeFloor) return

    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(zoom, zoom)

    const nm = new Map(activeFloor.nodes.map(n => [n.id, n]))
    const anim = animOffset.current
    const hasPath = path !== null

    // Draw edges
    for (const edge of activeFloor.edges) {
      const f = nm.get(edge.from); const t = nm.get(edge.to)
      if (!f || !t) continue
      const highlight = pathEdgeDir.has(edge.id)
      const reverseAnim = pathEdgeDir.get(edge.id) ?? false
      
      if (hasPath && !highlight) {
        ctx.save()
        ctx.globalAlpha = 0.2
        drawEdge(ctx, f, t, edge, false, false, false, anim, 0, 0)
        ctx.restore()
      } else {
        drawEdge(ctx, f, t, edge, false, false, highlight, anim, 0, 0, reverseAnim)
      }
    }

    // Draw nodes
    const pathIds = path?.nodeIds ?? []
    for (const node of activeFloor.nodes) {
      const inPath = pathNodeSet.has(node.id)
      const pathIndex = inPath ? pathIds.indexOf(node.id) : null
      const emergency = emergencyByNodeId[node.id]
      const nodeForDraw = emergency ? { ...node, danger: true } : node
      if (hasPath && !inPath) {
        ctx.save()
        ctx.globalAlpha = 0.25
        drawNode(ctx, nodeForDraw, false, false, false, null, 0, 0)
        ctx.restore()
      } else {
        drawNode(ctx, nodeForDraw, false, false, inPath, pathIndex, 0, 0)
      }

      if (emergency) {
        const marker = emergency === 'fire'
          ? '🔥'
          : emergency === 'medical'
            ? '🚑'
            : emergency === 'security'
              ? '🛡️'
              : emergency === 'smoke'
                ? '💨'
                : '☣️'
        ctx.save()
        ctx.font = '12px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(marker, node.x, node.y - NODE_RADIUS - 8)
        ctx.restore()
      }
    }

    ctx.restore()
  }, [activeFloor, emergencyByNodeId, path, pathEdgeDir, pathNodeSet])

  useEffect(() => {
    const loop = () => {
      animOffset.current = (animOffset.current + 0.4) % 20
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width = e.contentRect.width
        canvas.height = e.contentRect.height
      }
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Pan support (with zoom-aware coordinates)
  const panState = useRef({ panning: false, sx: 0, sy: 0 })
  const onMouseDown = (e: React.MouseEvent) => {
    panState.current = { panning: true, sx: e.clientX - panRef.current.ox, sy: e.clientY - panRef.current.oy }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!panState.current.panning) return
    panRef.current.ox = e.clientX - panState.current.sx
    panRef.current.oy = e.clientY - panState.current.sy
  }
  const onMouseUp = () => { panState.current.panning = false }

  const btnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 6, border: '1px solid var(--routing-border)',
    background: 'rgba(255,255,255,0.85)', color: 'var(--routing-text-secondary)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, transition: 'all 0.15s', backdropFilter: 'blur(8px)',
  }

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', cursor: 'grab', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={e => {
          e.preventDefault()
          const dz = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
          const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseFloat((zoomRef.current + dz).toFixed(2))))
          zoomRef.current = next
          setZoomLevel(next)
        }}
      />

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 32, right: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.85)', padding: '12px 8px', borderRadius: 12,
        border: '1px solid var(--routing-border)', backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      }}>
        <button style={btnStyle} onClick={handleZoomIn} title="Zoom in (+5%)">＋</button>
        <div style={{ height: 120, width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input 
            type="range" min={ZOOM_MIN} max={ZOOM_MAX} step={ZOOM_STEP} value={zoomLevel}
            onChange={e => { zoomRef.current = parseFloat(e.target.value); setZoomLevel(zoomRef.current) }}
            style={{ width: '120px', transform: 'rotate(-90deg)', transformOrigin: 'center', cursor: 'pointer' }}
          />
        </div>
        <button style={btnStyle} onClick={handleZoomOut} title="Zoom out (-5%)">－</button>
        <div style={{
          fontSize: 11, color: 'var(--routing-text-muted)', fontFamily: 'monospace',
          padding: '4px 2px', textAlign: 'center', minWidth: 42,
          cursor: 'pointer', fontWeight: 600, marginTop: 4,
        }} onClick={handleZoomReset} title="Click to reset zoom">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Path stats overlay */}
      {path && (
        <div style={{
          position: 'absolute', bottom: 32, left: 16,
          background: 'rgba(255,255,255,0.85)', border: '1px solid var(--routing-border)',
          borderRadius: 8, padding: '6px 12px', fontSize: 12, fontFamily: 'monospace',
          color: 'var(--routing-text-secondary)',
        }}>
          Total: <span style={{ color: '#0284c7' }}>{path.totalCost.toFixed(1)}</span> units ·
          {' '}<span style={{ color: '#34D399' }}>{path.algorithm.toUpperCase()}</span> ·
          {' '}{path.computeTimeMs.toFixed(2)}ms
        </div>
      )}
    </div>
  )
}
