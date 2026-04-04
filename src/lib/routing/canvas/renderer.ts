import { MapNode, MapEdge, NodeType } from '@/lib/routing/graph/types'

export const NODE_RADIUS = 30
export const GRID_SIZE = 20

export const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; text: string }> = {
  room:      { fill: '#e0f2fe', stroke: '#0284c7', text: '#0c4a6e' },
  corridor:  { fill: '#f8fafc', stroke: '#94a3b8', text: '#475569' },
  stair:     { fill: '#ffedd5', stroke: '#ea580c', text: '#7c2d12' },
  elevator:  { fill: '#f3e8ff', stroke: '#9333ea', text: '#581c87' },
  entry:     { fill: '#dcfce7', stroke: '#16a34a', text: '#14532d' },
  exit:      { fill: '#fee2e2', stroke: '#dc2626', text: '#7f1d1d' },
  door:      { fill: '#fef9c3', stroke: '#ca8a04', text: '#713f12' },
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number
) {
  const startX = (offsetX % GRID_SIZE + GRID_SIZE) % GRID_SIZE
  const startY = (offsetY % GRID_SIZE + GRID_SIZE) % GRID_SIZE

  ctx.save()
  for (let x = startX; x < width; x += GRID_SIZE) {
    const isMajor = Math.round((x - startX) / GRID_SIZE + Math.floor(offsetX / GRID_SIZE)) % 5 === 0
    ctx.strokeStyle = isMajor ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.06)'
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = startY; y < height; y += GRID_SIZE) {
    const isMajor = Math.round((y - startY) / GRID_SIZE + Math.floor(offsetY / GRID_SIZE)) % 5 === 0
    ctx.strokeStyle = isMajor ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.06)'
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  ctx.restore()
}

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  from: MapNode,
  to: MapNode,
  edge: MapEdge,
  selected: boolean,
  hovered: boolean,
  pathHighlight: boolean,
  animOffset: number,
  ox: number,
  oy: number,
  reverseAnim?: boolean
) {
  const fx = from.x + ox, fy = from.y + oy
  const tx = to.x + ox, ty = to.y + oy
  const mx = (fx + tx) / 2, my = (fy + ty) / 2

  ctx.save()
  if (edge.blocked) {
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
  } else if (pathHighlight) {
    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 4; ctx.setLineDash([8, 4])
    ctx.lineDashOffset = reverseAnim ? animOffset : -animOffset
    ctx.shadowColor = '#0ea5e9'; ctx.shadowBlur = 8
  } else if (edge.danger) {
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
  } else if (selected) {
    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 3; ctx.setLineDash([])
  } else if (hovered) {
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.setLineDash([])
  } else {
    ctx.strokeStyle = 'rgba(100,116,139,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([])
  }
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke()
  ctx.setLineDash([])

  // Weight label
  if (!pathHighlight) {
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.fillStyle = edge.blocked ? '#EF4444' : edge.danger ? '#F59E0B' : 'rgba(100,116,139,0.8)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText(String(edge.weight), mx, my - 4)
  }
  ctx.restore()
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  selected: boolean,
  hovered: boolean,
  pathHighlight: boolean,
  pathIndex: number | null,
  ox: number,
  oy: number
) {
  const cx = node.x + ox, cy = node.y + oy
  const colors = NODE_COLORS[node.type]

  ctx.save()

  if (node.danger) {
    ctx.shadowColor = '#F59E0B'; ctx.shadowBlur = 12
  } else if (node.blocked) {
    ctx.shadowColor = '#EF4444'; ctx.shadowBlur = 12
  } else if (pathHighlight) {
    ctx.shadowColor = '#0ea5e9'; ctx.shadowBlur = 16
  } else if (selected) {
    ctx.shadowColor = colors.stroke; ctx.shadowBlur = 14
  }

  // Selection ring
  if (selected || pathHighlight) {
    ctx.beginPath()
    ctx.arc(cx, cy, NODE_RADIUS + 5, 0, Math.PI * 2)
    ctx.strokeStyle = pathHighlight ? '#0284c7' : colors.stroke
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Node circle fill
  ctx.beginPath()
  ctx.arc(cx, cy, NODE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = node.blocked ? '#fecaca' : node.danger ? '#fef3c7' : colors.fill
  ctx.fill()
  ctx.strokeStyle = node.blocked ? '#EF4444' : node.danger ? '#F59E0B' : colors.stroke
  ctx.lineWidth = hovered ? 2.5 : 1.5
  ctx.stroke()

  // Path index bubble
  if (pathIndex !== null) {
    ctx.beginPath()
    ctx.arc(cx + NODE_RADIUS - 8, cy - NODE_RADIUS + 8, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#0284c7'
    ctx.fill()
    ctx.font = 'bold 11px Inter, sans-serif'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(pathIndex + 1), cx + NODE_RADIUS - 8, cy - NODE_RADIUS + 8)
  }

  // Icon
  ctx.font = '20px serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(getNodeIcon(node.type), cx, cy + 2)

  // Label
  ctx.font = '500 12px Inter, sans-serif'
  const maxLen = 15
  const label = node.label.length > maxLen ? node.label.slice(0, maxLen) + '…' : node.label
  const tw = ctx.measureText(label).width
  
  const labelY = cy + NODE_RADIUS + 16
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.roundRect(cx - tw / 2 - 4, labelY - 2, tw + 8, 16, 4)
  ctx.fill()

  ctx.fillStyle = node.blocked ? '#991b1b' : node.danger ? '#92400e' : colors.text
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(label, cx, labelY)

  ctx.restore()
}

function getNodeIcon(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    room: '🚪', corridor: '⬛', stair: '🪜', elevator: '🛗',
    entry: '➡️', exit: '🚪', door: '🔒',
  }
  return icons[type] ?? '●'
}

export function hitNode(node: MapNode, mx: number, my: number, ox: number, oy: number): boolean {
  const dx = node.x + ox - mx
  const dy = node.y + oy - my
  return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 6
}

export function hitEdge(
  from: MapNode, to: MapNode, mx: number, my: number, ox: number, oy: number
): boolean {
  const fx = from.x + ox, fy = from.y + oy
  const tx = to.x + ox, ty = to.y + oy
  const dx = tx - fx, dy = ty - fy
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return false
  const t = Math.max(0, Math.min(1, ((mx - fx) * dx + (my - fy) * dy) / len2))
  const px = fx + t * dx, py = fy + t * dy
  return Math.sqrt((mx - px) ** 2 + (my - py) ** 2) <= 8
}
