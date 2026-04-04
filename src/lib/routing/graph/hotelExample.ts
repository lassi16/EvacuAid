import { Building, Floor, MapEdge, MapNode, Scenario } from './types'

const FLOOR_NAMES = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor']

function distanceWeight(a: MapNode, b: MapNode): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.max(2, Math.round(Math.sqrt(dx * dx + dy * dy) / 20))
}

function createFloor(floorId: number): Floor {
  const p = `f${floorId}`
  const nodes: MapNode[] = []
  const nodeMap = new Map<string, MapNode>()
  const edges: MapEdge[] = []

  const addNode = (node: MapNode) => {
    node.x = Math.round(node.x * 1.6)
    node.y = Math.round(node.y * 1.6)
    nodes.push(node)
    nodeMap.set(node.id, node)
  }

  const addEdge = (from: string, to: string, weight?: number) => {
    const fromNode = nodeMap.get(from)
    const toNode = nodeMap.get(to)
    if (!fromNode || !toNode) return
    edges.push({
      id: `e-${from}-${to}`,
      from,
      to,
      weight: weight ?? distanceWeight(fromNode, toNode),
    })
  }

  const corridorSeeds: Array<{ key: string; label: string; x: number; y: number }> = [
    { key: 'nw', label: 'NW Corridor', x: 320, y: 190 },
    { key: 'n', label: 'North Corridor', x: 520, y: 190 },
    { key: 'ne', label: 'NE Corridor', x: 720, y: 190 },
    { key: 'w', label: 'West Corridor', x: 220, y: 330 },
    { key: 'c', label: 'Central Atrium', x: 520, y: 330 },
    { key: 'e', label: 'East Corridor', x: 820, y: 330 },
    { key: 'sw', label: 'SW Corridor', x: 320, y: 470 },
    { key: 's', label: 'South Corridor', x: 520, y: 470 },
    { key: 'se', label: 'SE Corridor', x: 720, y: 470 },
  ]
  
  for (const c of corridorSeeds) {
    addNode({
      id: `${p}-cor-${c.key}`,
      type: 'corridor',
      label: c.label,
      x: c.x,
      y: c.y,
      floorId,
    })
  }

  const roomSeeds: Array<{ x: number; y: number; corridor: string }> = [
    { x: 140, y: 60, corridor: `${p}-cor-nw` },
    { x: 240, y: 60, corridor: `${p}-cor-nw` },
    { x: 340, y: 60, corridor: `${p}-cor-n` },
    { x: 440, y: 60, corridor: `${p}-cor-n` },
    { x: 600, y: 60, corridor: `${p}-cor-n` },
    { x: 700, y: 60, corridor: `${p}-cor-ne` },
    { x: 800, y: 60, corridor: `${p}-cor-ne` },
    { x: 900, y: 60, corridor: `${p}-cor-ne` },
    { x: 140, y: 600, corridor: `${p}-cor-sw` },
    { x: 240, y: 600, corridor: `${p}-cor-sw` },
    { x: 340, y: 600, corridor: `${p}-cor-s` },
    { x: 440, y: 600, corridor: `${p}-cor-s` },
    { x: 600, y: 600, corridor: `${p}-cor-s` },
    { x: 700, y: 600, corridor: `${p}-cor-se` },
    { x: 800, y: 600, corridor: `${p}-cor-se` },
    { x: 900, y: 600, corridor: `${p}-cor-se` },
    { x: 70, y: 220, corridor: `${p}-cor-w` },
    { x: 70, y: 440, corridor: `${p}-cor-w` },
    { x: 970, y: 220, corridor: `${p}-cor-e` },
    { x: 970, y: 440, corridor: `${p}-cor-e` },
  ]

  roomSeeds.forEach((room, index) => {
    const roomNumber = floorId * 100 + index + 1
    const roomId = `${p}-r${roomNumber}`
    addNode({
      id: roomId,
      type: 'room',
      label: `Room ${roomNumber}`,
      x: room.x,
      y: room.y,
      floorId,
    })
    addEdge(roomId, room.corridor)
  })

  addNode({
    id: `${p}-stair-west`,
    type: 'stair',
    label: 'West Stairwell',
    x: 100,
    y: 120,
    floorId,
    linkId: 'stair-west',
  })
  addNode({
    id: `${p}-stair-east`,
    type: 'stair',
    label: 'East Stairwell',
    x: 940,
    y: 540,
    floorId,
    linkId: 'stair-east',
  })
  addNode({
    id: `${p}-lift-north`,
    type: 'elevator',
    label: 'Lift Core North',
    x: 520,
    y: 120,
    floorId,
    linkId: 'lift-north',
  })
  addNode({
    id: `${p}-lift-south`,
    type: 'elevator',
    label: 'Lift Core South',
    x: 520,
    y: 540,
    floorId,
    linkId: 'lift-south',
  })

  // Safety points: two extinguishers per floor for emergency-routing simulations.
  addNode({
    id: `${p}-fx-1`,
    type: 'door',
    label: 'Fire Extinguisher A',
    x: 430,
    y: 330,
    floorId,
  })
  addNode({
    id: `${p}-fx-2`,
    type: 'door',
    label: 'Fire Extinguisher B',
    x: 610,
    y: 330,
    floorId,
  })

  if (floorId === 1) {
    addNode({ id: `${p}-entry-main`, type: 'entry', label: 'Main Entry', x: 30, y: 330, floorId })
    addNode({ id: `${p}-exit-service`, type: 'exit', label: 'Service Exit', x: 1030, y: 330, floorId })
    addNode({ id: `${p}-exit-emergency`, type: 'exit', label: 'Emergency Exit', x: 520, y: 650, floorId })
  }

  const corridorLinks: Array<[string, string]> = [
    [`${p}-cor-w`, `${p}-cor-c`],
    [`${p}-cor-c`, `${p}-cor-e`],
    [`${p}-cor-n`, `${p}-cor-c`],
    [`${p}-cor-c`, `${p}-cor-s`],
    [`${p}-cor-nw`, `${p}-cor-n`],
    [`${p}-cor-n`, `${p}-cor-ne`],
    [`${p}-cor-sw`, `${p}-cor-s`],
    [`${p}-cor-s`, `${p}-cor-se`],
    [`${p}-cor-nw`, `${p}-cor-w`],
    [`${p}-cor-w`, `${p}-cor-sw`],
    [`${p}-cor-ne`, `${p}-cor-e`],
    [`${p}-cor-e`, `${p}-cor-se`],
    [`${p}-cor-nw`, `${p}-cor-c`],
    [`${p}-cor-ne`, `${p}-cor-c`],
    [`${p}-cor-sw`, `${p}-cor-c`],
    [`${p}-cor-se`, `${p}-cor-c`],
    [`${p}-cor-n`, `${p}-cor-s`],
    [`${p}-cor-w`, `${p}-cor-e`],
  ]

  corridorLinks.forEach(([from, to]) => addEdge(from, to))

  addEdge(`${p}-stair-west`, `${p}-cor-nw`)
  addEdge(`${p}-stair-west`, `${p}-cor-w`)
  addEdge(`${p}-stair-east`, `${p}-cor-se`)
  addEdge(`${p}-stair-east`, `${p}-cor-e`)
  addEdge(`${p}-lift-north`, `${p}-cor-n`)
  addEdge(`${p}-lift-north`, `${p}-cor-ne`)
  addEdge(`${p}-lift-south`, `${p}-cor-s`)
  addEdge(`${p}-lift-south`, `${p}-cor-sw`)
  addEdge(`${p}-fx-1`, `${p}-cor-c`, 3)
  addEdge(`${p}-fx-2`, `${p}-cor-c`, 3)

  if (floorId === 1) {
    addEdge(`${p}-entry-main`, `${p}-cor-w`)
    addEdge(`${p}-exit-service`, `${p}-cor-e`)
    addEdge(`${p}-exit-emergency`, `${p}-cor-s`)
  }

  return {
    id: floorId,
    name: FLOOR_NAMES[floorId - 1] ?? `Floor ${floorId}`,
    nodes,
    edges,
  }
}

function createComplexHotel(): Building {
  const floors = [1, 2, 3, 4].map(createFloor)
  const crossFloorEdges: MapEdge[] = []

  const links = [
    { key: 'stair-west', weight: 13 },
    { key: 'stair-east', weight: 13 },
    { key: 'lift-north', weight: 6 },
    { key: 'lift-south', weight: 6 },
  ]

  for (let floor = 1; floor < 4; floor++) {
    for (const link of links) {
      crossFloorEdges.push({
        id: `cf-${link.key}-${floor}-${floor + 1}`,
        from: `f${floor}-${link.key}`,
        to: `f${floor + 1}-${link.key}`,
        weight: link.weight,
        crossFloor: true,
      })
    }
  }

  return {
    id: 'grand-hotel-complex',
    name: 'Grand Hotel Complex',
    floors,
    crossFloorEdges,
  }
}

const BASE_HOTEL = createComplexHotel()
const normalBuilding: Building = BASE_HOTEL

function makeFireBuilding(): Building {
  const dangerNodes = new Set([
    'f3-cor-n',
    'f3-cor-ne',
    'f3-cor-c',
    'f3-r304',
    'f3-r305',
    'f3-r306',
    'f3-lift-north',
  ])
  const blockedEdges = new Set([
    'e-f3-cor-n-f3-cor-ne',
    'e-f3-cor-n-f3-cor-c',
    'e-f3-lift-north-f3-cor-n',
    'e-f3-r305-f3-cor-n',
  ])

  return {
    ...BASE_HOTEL,
    id: 'grand-hotel-complex-fire',
    floors: BASE_HOTEL.floors.map(floor => {
      if (floor.id !== 3) return floor
      return {
        ...floor,
        nodes: floor.nodes.map(node =>
          dangerNodes.has(node.id) ? { ...node, danger: true } : node
        ),
        edges: floor.edges.map(edge => {
          if (blockedEdges.has(edge.id)) return { ...edge, blocked: true, danger: true }
          if (edge.id.includes('f3-cor-ne') || edge.id.includes('f3-cor-n')) {
            return { ...edge, danger: true, penalty: 35 }
          }
          return edge
        }),
      }
    }),
  }
}

function makeMedicalBuilding(): Building {
  return {
    ...BASE_HOTEL,
    id: 'grand-hotel-complex-medical',
    floors: BASE_HOTEL.floors.map(floor => {
      if (floor.id !== 2) return floor
      return {
        ...floor,
        nodes: floor.nodes.map(node =>
          ['f2-r213', 'f2-r214', 'f2-cor-s', 'f2-fx-2'].includes(node.id)
            ? { ...node, danger: true }
            : node
        ),
        edges: floor.edges.map(edge =>
          edge.id.includes('f2-cor-s')
            ? { ...edge, danger: true, penalty: 30 }
            : edge
        ),
      }
    }),
  }
}

function makeBlockedBuilding(): Building {
  return {
    ...BASE_HOTEL,
    id: 'grand-hotel-complex-blocked',
    floors: BASE_HOTEL.floors.map(floor => ({
      ...floor,
      nodes: floor.nodes.map(node =>
        ['f2-lift-south', 'f3-lift-south'].includes(node.id)
          ? { ...node, blocked: true }
          : node
      ),
      edges: floor.edges.map(edge =>
        edge.id.includes('lift-south') || edge.id.includes('cor-e-f')
          ? { ...edge, blocked: true }
          : edge
      ),
    })),
    crossFloorEdges: BASE_HOTEL.crossFloorEdges.map(edge =>
      edge.id.includes('lift-south')
        ? { ...edge, blocked: true }
        : edge
    ),
  }
}

export const HOTEL_SCENARIOS: Scenario[] = [
  {
    id: 'normal',
    name: 'Complex Normal Ops',
    description: '4 floors, 20 rooms per floor, dual stairwells, dual lifts, and extinguisher points on every floor.',
    icon: '🏨',
    building: normalBuilding,
  },
  {
    id: 'fire',
    name: 'Fire Emergency (Floor 3)',
    description: 'North-east cluster on Floor 3 is hazardous and partially blocked to force meaningful rerouting.',
    icon: '🔥',
    building: makeFireBuilding(),
  },
  {
    id: 'medical',
    name: 'Medical Response (Floor 2 South Wing)',
    description: 'South corridor on Floor 2 has elevated risk cost to test danger-aware path selection.',
    icon: '🚑',
    building: makeMedicalBuilding(),
  },
  {
    id: 'blocked',
    name: 'Lift Maintenance Bottleneck',
    description: 'South lift core is unavailable, forcing stair/lift-north alternatives across the building.',
    icon: '🚧',
    building: makeBlockedBuilding(),
  },
]

export const DEFAULT_BUILDING: Building = normalBuilding
