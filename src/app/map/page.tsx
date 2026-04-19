"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRoutingNavigationStore } from "@/stores/routingNavigationStore";
import { useRoutingEditorStore } from "@/stores/routingEditorStore";
import { useIncidentStore } from "@/stores/incidentStore";

import { FloatingPanel } from "@/components/routing/FloatingPanel";

// Dynamically import all canvas/Zustand components (client-only)
const RoutingFloorManager = dynamic(
  () => import("@/components/routing/editor/RoutingFloorManager"),
  { ssr: false },
);
const RoutingToolbar = dynamic(
  () => import("@/components/routing/editor/RoutingToolbar"),
  { ssr: false },
);
const RoutingFloorCanvas = dynamic(
  () => import("@/components/routing/editor/RoutingFloorCanvas"),
  { ssr: false },
);
const RoutingNodePanel = dynamic(
  () => import("@/components/routing/editor/RoutingNodePanel"),
  { ssr: false },
);
const RoutingEdgePanel = dynamic(
  () => import("@/components/routing/editor/RoutingEdgePanel"),
  { ssr: false },
);
const RoutingPathControls = dynamic(
  () => import("@/components/routing/navigate/RoutingPathControls"),
  { ssr: false },
);
const RoutingMapViewer = dynamic(
  () => import("@/components/routing/navigate/RoutingMapViewer"),
  { ssr: false },
);
const RoutingStepList = dynamic(
  () => import("@/components/routing/navigate/RoutingStepList"),
  { ssr: false },
);

type Tab = "editor" | "navigate";

const EMERGENCY_COLORS: Record<string, string> = {
  fire: "#EF4444",
  medical: "#F97316",
  security: "#EAB308",
  smoke: "#94A3B8",
  hazmat: "#A855F7",
};
const EMERGENCY_ICONS: Record<string, string> = {
  fire: "🔥",
  medical: "🚑",
  security: "🛡️",
  smoke: "💨",
  hazmat: "☣️",
};

/** Bridge component: reads map state and syncs to incident store */
function MapIncidentBridge() {
  const { emergencyByNodeId } = useRoutingNavigationStore();
  const { building } = useRoutingEditorStore();
  const { syncFromMap } = useIncidentStore();

  useEffect(() => {
    const allNodes = building.floors.flatMap((f) => f.nodes);
    const nodeNames: Record<string, string> = {};
    const floorNames: Record<string, string> = {};
    for (const floor of building.floors) {
      for (const node of floor.nodes) {
        nodeNames[node.id] = node.label;
        floorNames[node.id] = floor.name;
      }
    }
    syncFromMap(emergencyByNodeId, nodeNames, floorNames);
  }, [emergencyByNodeId, building, syncFromMap]);

  return null;
}

export default function MapPage() {
  const [activeTab, setActiveTab] = useState<Tab>("navigate");

  // Live emergency sidebar data
  const { emergencyByNodeId } = useRoutingNavigationStore();
  const { building } = useRoutingEditorStore();
  const {
    incidents,
    activeCount,
    criticalCount,
    unreadCount,
    pendingTaskCount,
  } = useIncidentStore();

  const allNodes = building.floors.flatMap((f) => f.nodes);
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const floorMap = new Map(building.floors.map((f) => [f.id, f]));

  const activeEmergencies = Object.entries(emergencyByNodeId).map(
    ([nodeId, type]) => ({
      nodeId,
      type,
      node: nodeMap.get(nodeId),
      floor: floorMap.get(nodeMap.get(nodeId)?.floorId ?? -1),
    }),
  );

  // Recent map-linked incidents
  const recentIncidents = incidents.filter((i) => i.mapLinked).slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-50 overflow-hidden flex flex-col font-sans"
      style={{ background: "var(--routing-bg-base)" }}
    >
      <MapIncidentBridge />

      {/* Background Canvas spanning full area */}
      <div className="absolute inset-0 z-0">
        {activeTab === "editor" ? <RoutingFloorCanvas /> : <RoutingMapViewer />}
      </div>

      {/* Top Left: Exit Button */}
      <div className="absolute top-4 left-4 z-[75]">
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm shadow-xl hover:bg-slate-800 transition-colors inline-block w-max"
        >
          ← Exit Map to Dashboard
        </Link>
      </div>

      {/* Top Center: Mode Toggle & Badges */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[75] flex flex-col items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === "editor" ? "bg-sky-100 text-sky-700 border-sky-300" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100"}`}
            >
              ✏️ Map Editor
            </button>
            <button
              onClick={() => setActiveTab("navigate")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${activeTab === "navigate" ? "bg-sky-100 text-sky-700 border-sky-300" : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100"}`}
            >
              🧭 Navigate & Route
            </button>
          </div>

          <div className="flex gap-2 border-l border-slate-200 pl-3">
            <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold border border-red-200">
              🔥 {criticalCount()} Critical
            </span>
            <span className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-xs font-bold">
              🚨 {activeCount()} Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Feature Panels via FloatingPanel wrappers */}
      {activeTab === "editor" && (
        <>
          <FloatingPanel
            title="Floor Manager"
            position="bottom-left"
            icon="🏢"
            defaultMinimized={false}
          >
            <RoutingFloorManager />
          </FloatingPanel>
          <FloatingPanel
            title="Map Drawing Tools"
            position="top-right"
            icon="🛠️"
            width={180}
            contentMaxHeight="42vh"
          >
            <RoutingToolbar />
          </FloatingPanel>
          <FloatingPanel
            title="Node Properties"
            position="top-right"
            icon="⚙️"
            width={260}
            defaultMinimized={true}
            containerStyle={{ right: 16 + 180 + 12 }}
          >
            <RoutingNodePanel />
            <div className="mt-4">
              <RoutingEdgePanel />
            </div>
          </FloatingPanel>
        </>
      )}

      {activeTab === "navigate" && (
        <>
          <FloatingPanel
            title="Routing Controls"
            position="bottom-left"
            icon="🎮"
            width={280}
          >
            <RoutingPathControls />
          </FloatingPanel>
          <FloatingPanel
            title="Step-by-Step Directions"
            position="top-right"
            icon="🗺️"
            width={320}
          >
            <RoutingStepList />
          </FloatingPanel>
        </>
      )}

      {/* Live Alerts - Floating Bottom Center */}
      {(activeEmergencies.length > 0 || recentIncidents.length > 0) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl overflow-hidden min-w-[500px]">
          <div className="px-5 py-3 border-b border-slate-100 bg-red-50/50 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-xs font-bold text-red-500 tracking-wider uppercase">
              Live Alerts · {activeEmergencies.length} Active
            </span>
          </div>
          <div className="p-4 flex gap-3 flex-wrap items-center">
            {activeEmergencies.map(({ nodeId, type, node, floor }) => (
              <div
                key={nodeId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: `rgba(${type === "fire" ? "239,68,68" : type === "medical" ? "249,115,22" : type === "hazmat" ? "168,85,247" : type === "security" ? "234,179,8" : "148,163,184"},0.15)`,
                  color: EMERGENCY_COLORS[type] ?? "#94A3B8",
                }}
              >
                <span>{EMERGENCY_ICONS[type]}</span>
                <span className="capitalize">{type}</span>
                <span className="opacity-50">·</span>
                <span>{node?.label ?? nodeId}</span>
                <span className="text-slate-500 ml-1">{floor?.name ?? ""}</span>
              </div>
            ))}
            {activeEmergencies.length === 0 && (
              <span className="text-xs text-slate-500">
                No active map emergencies automatically created yet.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
