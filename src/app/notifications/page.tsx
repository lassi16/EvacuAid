"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useIncidentStore } from "@/stores/incidentStore";

const ROLE_COLORS: Record<string, string> = {
  "Global Admin": "#0284c7",
  "Fire Dept": "#EF4444",
  "Medical Staff": "#F97316",
  "Security Team": "#EAB308",
  "Hazmat Unit": "#A855F7",
  "IT Dept": "#3B82F6",
  Operations: "#94A3B8",
};

const INCIDENT_SEVERITY_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  critical: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    text: "#F87171",
  },
  high: {
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
    text: "#FB923C",
  },
  medium: {
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.3)",
    text: "#FCD34D",
  },
  low: {
    bg: "rgba(148,163,184,0.07)",
    border: "rgba(148,163,184,0.15)",
    text: "#94A3B8",
  },
};

export default function NotificationsPage() {
  const {
    notifications,
    incidents,
    acknowledgeNotification,
    markNotificationRead,
    unreadCount,
  } = useIncidentStore();
  const [search, setSearch] = useState("");
  const [filterAck, setFilterAck] = useState<"all" | "ack" | "unack">("all");
  const [filterEsc, setFilterEsc] = useState(false);
  const [filterMap, setFilterMap] = useState(false);

  // Enrich with incident data
  const enriched = notifications.map((n) => ({
    ...n,
    incident: incidents.find((i) => i.id === n.incidentId),
  }));

  const filtered = enriched.filter((n) => {
    if (filterAck === "ack" && !n.ack) return false;
    if (filterAck === "unack" && n.ack) return false;
    if (filterEsc && !n.escalated) return false;
    if (filterMap && !n.incident?.mapLinked) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !n.user.toLowerCase().includes(q) &&
        !n.role.toLowerCase().includes(q) &&
        !n.incidentId.toLowerCase().includes(q) &&
        !n.message.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const escalatedCount = notifications.filter((n) => n.escalated).length;
  const ackRate =
    notifications.length > 0
      ? Math.round(
          (notifications.filter((n) => n.ack).length / notifications.length) *
            100,
        )
      : 0;
  const mapLinkedCount = notifications.filter(
    (n) => incidents.find((i) => i.id === n.incidentId)?.mapLinked,
  ).length;

  return (
    <div className="space-y-4 flex flex-col h-full min-w-0 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            Notification Center
          </h1>
          <p className="text-slate-500 text-sm">
            Track delivery and response rates for critical alerts.
            {mapLinkedCount > 0 && (
              <span
                style={{ marginLeft: 10, color: "#0284c7", fontWeight: 500 }}
              >
                · {mapLinkedCount} from Building Map
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              background: "rgba(14,165,233,0.15)",
              border: "1px solid rgba(14,165,233,0.35)",
              color: "#0284c7",
            }}
          >
            🗺 Open Map
          </Link>
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "#475569",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, role, incident…"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(14,165,233,0.2)",
                borderRadius: 8,
                padding: "7px 12px 7px 32px",
                fontSize: 12,
                color: "#0f172a",
                outline: "none",
                width: 220,
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        {[
          {
            label: "Total Alerts",
            value: notifications.length,
            color: "#0284c7",
            icon: "🔔",
          },
          {
            label: "Unread",
            value: unreadCount(),
            color: "#F59E0B",
            icon: "📬",
          },
          {
            label: "Escalated",
            value: escalatedCount,
            color: "#EF4444",
            icon: "🚨",
          },
          {
            label: "ACK Rate",
            value: `${ackRate}%`,
            color: "#34D399",
            icon: "✅",
          },
          {
            label: "Map-Linked",
            value: mapLinkedCount,
            color: "#0284c7",
            icon: "🗺",
          },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            style={{
              background: "#ffffff",
              border: `1px solid ${color}30`,
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              {icon} {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Bell className="h-3 w-3 text-slate-500" />
        {(
          [
            ["all", "All"],
            ["unack", "Unacknowledged"],
            ["ack", "Acknowledged"],
          ] as [string, string][]
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterAck(val as "all" | "ack" | "unack")}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              background:
                filterAck === val ? "rgba(14,165,233,0.15)" : "transparent",
              color: filterAck === val ? "#0284c7" : "#475569",
              border: `1px solid ${filterAck === val ? "rgba(14,165,233,0.35)" : "rgba(14,165,233,0.1)"}`,
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setFilterEsc((e) => !e)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            background: filterEsc ? "rgba(239,68,68,0.15)" : "transparent",
            color: filterEsc ? "#F87171" : "#475569",
            border: `1px solid ${filterEsc ? "rgba(239,68,68,0.35)" : "rgba(14,165,233,0.1)"}`,
          }}
        >
          🚨 Escalated Only
        </button>
        <button
          onClick={() => setFilterMap((m) => !m)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            background: filterMap ? "rgba(14,165,233,0.15)" : "transparent",
            color: filterMap ? "#0284c7" : "#475569",
            border: `1px solid ${filterMap ? "rgba(14,165,233,0.35)" : "rgba(14,165,233,0.1)"}`,
          }}
        >
          🗺 Map Only
        </button>
        <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>
          {filtered.length} records
        </span>
      </div>

      {/* Notification cards */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {filtered.map((n) => {
          const incSev = n.incident
            ? INCIDENT_SEVERITY_COLORS[n.incident.severity]
            : null;
          const roleColor = ROLE_COLORS[n.role] ?? "#94A3B8";

          return (
            <div
              key={n.id}
              style={{
                width: "100%",
                minWidth: 0,
                minHeight: 96,
                background: n.opened ? "#ffffff" : "#f0f9ff",
                border: n.escalated
                  ? "1px solid rgba(239,68,68,0.35)"
                  : n.opened
                    ? "1px solid rgba(14,165,233,0.12)"
                    : "1px solid rgba(14,165,233,0.3)",
                borderRadius: 10,
                overflow: "hidden",
                transition: "border-color 0.15s",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                cursor: "pointer",
              }}
              onClick={() => {
                if (!n.opened) markNotificationRead(n.id);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "nowrap",
                  minWidth: 0,
                  minHeight: 28,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: n.opened ? "transparent" : "#0ea5e9",
                    boxShadow: n.opened
                      ? "none"
                      : "0 0 6px rgba(14,165,233,0.6)",
                  }}
                />

                <div style={{ minWidth: 0, flex: "1 1 260px" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.25,
                    }}
                  >
                    {n.user}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: roleColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginTop: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.15,
                    }}
                  >
                    {n.role}
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {n.incident && incSev ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: incSev.text,
                        background: incSev.bg,
                        border: `1px solid ${incSev.border}`,
                      }}
                    >
                      {n.incidentId} · {n.incident.type} {n.incident.mapLinked ? "🗺" : ""}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#475569",
                        lineHeight: 1,
                      }}
                    >
                      {n.incidentId}
                    </span>
                  )}
                </div>

              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  minWidth: 0,
                  minHeight: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#475569",
                    flexShrink: 0,
                  }}
                >
                  {n.time}
                </div>

                <div style={{ flexShrink: 0 }}>
                  {n.ack ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 animate-pulse" />
                  )}
                </div>

                {n.escalated && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 800,
                      flexShrink: 0,
                      color: "#F87171",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <AlertTriangle className="h-2 w-2" /> ESCALATED
                  </span>
                )}

                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    flex: 1,
                    minWidth: 0,
                    minHeight: 24,
                  }}
                >
                  {n.message}
                </div>
              </div>

            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
            No notifications match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
