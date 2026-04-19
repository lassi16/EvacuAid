"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { useRoutingEditorStore } from "@/stores/routingEditorStore";
import { NodeType } from "@/lib/routing/graph/types";
import {
  drawGrid,
  drawEdge,
  drawNode,
  hitNode,
  hitEdge,
  NODE_RADIUS,
  GRID_SIZE,
} from "@/lib/routing/canvas/renderer";

const ZOOM_STEP = 0.05;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3.0;

function getDefaultLabel(type: NodeType, count: number): string {
  const map: Record<NodeType, string> = {
    room: `Room ${100 + count}`,
    corridor: `Corridor ${String.fromCharCode(65 + (count % 26))}`,
    stair: "Stairs",
    elevator: "Elevator",
    entry: "Entry",
    exit: "Exit",
    door: `Door ${count + 1}`,
  };
  return map[type];
}

function getCursor(tool: string): string {
  if (tool === "pan") return "grab";
  if (tool === "delete") return "crosshair";
  if (tool.startsWith("place-")) return "copy";
  if (tool === "draw-edge") return "cell";
  return "default";
}

export default function RoutingFloorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const animOffset = useRef<number>(0);
  const [zoomLevel, setZoomLevel] = useState(1.2);
  const [floorsOpen, setFloorsOpen] = useState(false);

  const stateRef = useRef({
    isDragging: false,
    dragNodeId: null as string | null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    edgeStartNodeId: null as string | null,
    panOffsetX: 60,
    panOffsetY: 60,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panStartOX: 0,
    panStartOY: 0,
    mouseX: 0,
    mouseY: 0,
    hoverNodeId: null as string | null,
    hoverEdgeId: null as string | null,
    zoom: 1.2,
  });

  const store = useRoutingEditorStore();
  const {
    building,
    activeFloorId,
    activeTool,
    selectedNodeId,
    selectedEdgeId,
    snapToGrid,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    setSelectedNode,
    setSelectedEdge,
    edgeStartNodeId,
    setEdgeStartNode,
    setActiveFloor,
  } = store;

  const activeFloor = building.floors.find((f) => f.id === activeFloorId);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const s = stateRef.current;
    const next = Math.min(
      ZOOM_MAX,
      parseFloat((s.zoom + ZOOM_STEP).toFixed(2)),
    );
    s.zoom = next;
    setZoomLevel(next);
  }, []);

  const handleZoomOut = useCallback(() => {
    const s = stateRef.current;
    const next = Math.max(
      ZOOM_MIN,
      parseFloat((s.zoom - ZOOM_STEP).toFixed(2)),
    );
    s.zoom = next;
    setZoomLevel(next);
  }, []);

  const handleZoomReset = useCallback(() => {
    stateRef.current.zoom = 1.2;
    setZoomLevel(1.2);
  }, []);

  const snap = useCallback(
    (x: number, y: number) => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(y / GRID_SIZE) * GRID_SIZE,
      };
    },
    [snapToGrid],
  );

  const getNodeMap = useCallback(
    () => new Map(activeFloor?.nodes.map((n) => [n.id, n]) ?? []),
    [activeFloor],
  );

  const findNodeAt = useCallback(
    (mapX: number, mapY: number) => {
      if (!activeFloor) return null;
      return (
        activeFloor.nodes
          .slice()
          .reverse()
          .find((n) => hitNode(n, mapX, mapY, 0, 0)) ?? null
      );
    },
    [activeFloor],
  );

  const findEdgeAt = useCallback(
    (mapX: number, mapY: number) => {
      if (!activeFloor) return null;
      const nm = getNodeMap();
      return (
        activeFloor.edges.find((e) => {
          const f = nm.get(e.from);
          const t = nm.get(e.to);
          return f && t && hitEdge(f, t, mapX, mapY, 0, 0);
        }) ?? null
      );
    },
    [activeFloor, getNodeMap],
  );

  // ─── Draw loop ────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const {
      panOffsetX,
      panOffsetY,
      edgeStartNodeId: esn,
      mouseX,
      mouseY,
      hoverNodeId,
      hoverEdgeId,
      zoom,
    } = stateRef.current;
    const w = canvas.width,
      h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx, w, h, panOffsetX, panOffsetY);

    if (!activeFloor) return;

    ctx.save();
    ctx.translate(panOffsetX, panOffsetY);
    ctx.scale(zoom, zoom);

    const nm = new Map(activeFloor.nodes.map((n) => [n.id, n]));
    const anim = animOffset.current;

    // Draw edges
    for (const edge of activeFloor.edges) {
      const f = nm.get(edge.from);
      const t = nm.get(edge.to);
      if (!f || !t) continue;
      drawEdge(
        ctx,
        f,
        t,
        edge,
        edge.id === selectedEdgeId,
        edge.id === hoverEdgeId,
        false,
        anim,
        0,
        0,
      );
    }

    // Edge being drawn (convert mouse to map space)
    if (esn && activeTool === "draw-edge") {
      const startNode = nm.get(esn);
      if (startNode) {
        ctx.save();
        ctx.strokeStyle = "rgba(14,165,233,0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo((mouseX - panOffsetX) / zoom, (mouseY - panOffsetY) / zoom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Draw nodes
    for (const node of activeFloor.nodes) {
      drawNode(
        ctx,
        node,
        node.id === selectedNodeId,
        node.id === hoverNodeId,
        false,
        null,
        0,
        0,
      );
    }

    // Edge start indicator
    if (esn) {
      const sn = nm.get(esn);
      if (sn) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sn.x, sn.y, NODE_RADIUS + 8, 0, Math.PI * 2);
        ctx.strokeStyle = "#0ea5e9";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [activeFloor, activeTool, selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    const loop = () => {
      animOffset.current = (animOffset.current + 0.5) % 20;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // ─── Resize observer ──────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        canvas.width = e.contentRect.width;
        canvas.height = e.contentRect.height;
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // ─── Mouse handlers ───────────────────────────────────────────────────────
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { offsetX, offsetY } = e.nativeEvent;
      const s = stateRef.current;
      // Convert screen → map coordinates (accounting for pan + zoom)
      const mapX = (offsetX - s.panOffsetX) / s.zoom;
      const mapY = (offsetY - s.panOffsetY) / s.zoom;

      const clickedNode = findNodeAt(mapX, mapY);
      const clickedEdge = clickedNode ? null : findEdgeAt(mapX, mapY);

      // Universal Pan on Middle(1) / Right(2) click or explicit Pan tool
      if (e.button === 1 || e.button === 2 || activeTool === "pan") {
        s.isPanning = true;
        s.panStartX = offsetX;
        s.panStartY = offsetY;
        s.panStartOX = s.panOffsetX;
        s.panStartOY = s.panOffsetY;
        return;
      }

      if (activeTool === "select") {
        if (clickedNode) {
          setSelectedNode(clickedNode.id);
          setSelectedEdge(null);
          s.isDragging = true;
          s.dragNodeId = clickedNode.id;
          s.dragOffsetX = mapX - clickedNode.x;
          s.dragOffsetY = mapY - clickedNode.y;
        } else if (clickedEdge) {
          setSelectedEdge(clickedEdge.id);
          setSelectedNode(null);
        } else {
          setSelectedNode(null);
          setSelectedEdge(null);
          // Auto-pan if dragging empty canvas with select tool
          s.isPanning = true;
          s.panStartX = offsetX;
          s.panStartY = offsetY;
          s.panStartOX = s.panOffsetX;
          s.panStartOY = s.panOffsetY;
        }
      } else if (activeTool === "draw-edge") {
        if (clickedNode) {
          const esn = stateRef.current.edgeStartNodeId ?? edgeStartNodeId;
          if (!esn) {
            s.edgeStartNodeId = clickedNode.id;
            setEdgeStartNode(clickedNode.id);
          } else if (esn !== clickedNode.id) {
            const fromNode = activeFloor?.nodes.find((n) => n.id === esn);
            if (fromNode) {
              const dx = clickedNode.x - fromNode.x;
              const dy = clickedNode.y - fromNode.y;
              addEdge({
                from: esn,
                to: clickedNode.id,
                weight: Math.max(
                  1,
                  Math.round(Math.sqrt(dx * dx + dy * dy) / 10),
                ),
              });
            }
            s.edgeStartNodeId = null;
            setEdgeStartNode(null);
          }
        } else {
          s.edgeStartNodeId = null;
          setEdgeStartNode(null);
        }
      } else if (activeTool === "delete") {
        if (clickedNode) deleteNode(clickedNode.id);
        else if (clickedEdge) deleteEdge(clickedEdge.id);
      } else if (activeTool.startsWith("place-")) {
        const type = activeTool.replace("place-", "") as NodeType;
        const snapped = snap(mapX, mapY);
        addNode({
          type,
          label: getDefaultLabel(type, activeFloor?.nodes.length ?? 0),
          x: snapped.x,
          y: snapped.y,
          floorId: activeFloorId,
        });
      }
    },
    [
      activeTool,
      activeFloor,
      activeFloorId,
      edgeStartNodeId,
      addNode,
      addEdge,
      deleteNode,
      deleteEdge,
      setSelectedNode,
      setSelectedEdge,
      setEdgeStartNode,
      findNodeAt,
      findEdgeAt,
      snap,
    ],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { offsetX, offsetY } = e.nativeEvent;
      const s = stateRef.current;
      s.mouseX = offsetX;
      s.mouseY = offsetY;

      if (s.isPanning) {
        s.panOffsetX = s.panStartOX + (offsetX - s.panStartX);
        s.panOffsetY = s.panStartOY + (offsetY - s.panStartY);
        return;
      }

      if (s.isDragging && s.dragNodeId) {
        const mapX = (offsetX - s.panOffsetX) / s.zoom;
        const mapY = (offsetY - s.panOffsetY) / s.zoom;
        const snapped = snap(mapX - s.dragOffsetX, mapY - s.dragOffsetY);
        updateNode(s.dragNodeId, { x: snapped.x, y: snapped.y });
        return;
      }

      const mapX = (offsetX - s.panOffsetX) / s.zoom;
      const mapY = (offsetY - s.panOffsetY) / s.zoom;
      const hn = findNodeAt(mapX, mapY);
      s.hoverNodeId = hn?.id ?? null;
      if (!hn) {
        const he = findEdgeAt(mapX, mapY);
        s.hoverEdgeId = he?.id ?? null;
      } else {
        s.hoverEdgeId = null;
      }
    },
    [updateNode, findNodeAt, findEdgeAt, snap],
  );

  const onMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
    stateRef.current.dragNodeId = null;
    stateRef.current.isPanning = false;
  }, []);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      stateRef.current.edgeStartNodeId = null;
      setEdgeStartNode(null);
    },
    [setEdgeStartNode],
  );

  const btnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "1px solid var(--routing-border)",
    background: "rgba(255,255,255,0.85)",
    color: "var(--routing-text-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    transition: "all 0.15s",
    backdropFilter: "blur(8px)",
  };

  const floorDockStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid var(--routing-border)",
    borderRadius: 12,
    padding: "10px 10px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    minWidth: 140,
    maxWidth: 200,
  };

  const floorBtnStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    textAlign: "left",
    fontSize: 12,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: active ? "rgba(14,165,233,0.12)" : "transparent",
    color: active
      ? "var(--routing-text-primary)"
      : "var(--routing-text-secondary)",
    cursor: "pointer",
  });

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        cursor: getCursor(activeTool),
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={onContextMenu}
        onWheel={(e) => {
          e.preventDefault();
          const dz = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
          const next = Math.max(
            ZOOM_MIN,
            Math.min(
              ZOOM_MAX,
              parseFloat((stateRef.current.zoom + dz).toFixed(2)),
            ),
          );
          stateRef.current.zoom = next;
          setZoomLevel(next);
        }}
      />

      {/* Bottom-right dock: Floor + Zoom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 24,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {/* Floor selector (expand on hover/tap) */}
        <div
          style={floorDockStyle}
          onMouseEnter={() => setFloorsOpen(true)}
          onMouseLeave={() => setFloorsOpen(false)}
        >
          <button
            onClick={() => setFloorsOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--routing-text-secondary)",
              cursor: "pointer",
              background: "transparent",
              border: "0",
              padding: 0,
            }}
            title="Select active floor"
          >
            <span>Floor</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--routing-text-muted)",
              }}
            >
              {activeFloor?.name ?? "—"}
            </span>
          </button>

          {floorsOpen && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {building.floors.map((floor) => (
                <button
                  key={floor.id}
                  style={floorBtnStyle(floor.id === activeFloorId)}
                  onClick={() => setActiveFloor(floor.id)}
                  title={`Edit ${floor.name}`}
                >
                  {floor.name}
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      color: "var(--routing-text-muted)",
                    }}
                  >
                    ({floor.nodes.length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.85)",
            padding: "12px 8px",
            borderRadius: 12,
            border: "1px solid var(--routing-border)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <button style={btnStyle} onClick={handleZoomIn} title="Zoom in (+5%)">
            ＋
          </button>
          <div
            style={{
              height: 120,
              width: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoomLevel}
              onChange={(e) => {
                stateRef.current.zoom = parseFloat(e.target.value);
                setZoomLevel(stateRef.current.zoom);
              }}
              style={{
                width: "120px",
                transform: "rotate(-90deg)",
                transformOrigin: "center",
                cursor: "pointer",
              }}
            />
          </div>
          <button
            style={btnStyle}
            onClick={handleZoomOut}
            title="Zoom out (-5%)"
          >
            －
          </button>
          <div
            style={{
              fontSize: 11,
              color: "var(--routing-text-muted)",
              fontFamily: "monospace",
              padding: "4px 2px",
              textAlign: "center",
              minWidth: 42,
              cursor: "pointer",
              fontWeight: 600,
              marginTop: 4,
            }}
            onClick={handleZoomReset}
            title="Click to reset zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 16,
          fontSize: 11,
          color: "var(--routing-text-muted)",
          fontFamily: "monospace",
          background: "rgba(255,255,255,0.85)",
          padding: "4px 10px",
          borderRadius: 5,
          border: "1px solid var(--routing-border)",
        }}
      >
        {activeFloor?.nodes.length ?? 0} nodes ·{" "}
        {activeFloor?.edges.length ?? 0} edges
        {edgeStartNodeId && (
          <span
            style={{ marginLeft: 8, color: "var(--routing-primary-light)" }}
          >
            ● Connecting…
          </span>
        )}
      </div>

      {/* Tool hint */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "var(--routing-text-muted)",
          background: "rgba(13,21,38,0.8)",
          padding: "4px 12px",
          borderRadius: 5,
          border: "1px solid var(--routing-border)",
          pointerEvents: "none",
        }}
      >
        {activeTool === "select" && "Click to select · Drag to move"}
        {activeTool === "pan" && "Drag to pan canvas"}
        {activeTool === "draw-edge" &&
          (!edgeStartNodeId
            ? "Click first node…"
            : "Click second node to connect")}
        {activeTool === "delete" && "Click node or edge to delete"}
        {activeTool.startsWith("place-") &&
          `Click to place ${activeTool.replace("place-", "")}`}
      </div>
    </div>
  );
}
