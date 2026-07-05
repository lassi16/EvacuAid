'use client'

import { useEffect, useState } from 'react'
import { useSimulationStore } from '@/stores/simulationStore'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowRight, Info, CheckCircle2, X } from 'lucide-react'

export function SimulationOverlay() {
  const { isSimulating, step, setStep, stopSimulation } = useSimulationStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isSimulating) return
    // Auto-routing based on step
    if (step === 'intro' && pathname !== '/dashboard') router.push('/dashboard')
    if (step === 'devices_prompt' && pathname !== '/devices') router.push('/devices')
    if (step === 'dashboard_incident' && pathname !== '/dashboard') router.push('/dashboard')
    if (step === 'map_demo' && pathname !== '/map') router.push('/map')
  }, [step, isSimulating, pathname, router])

  // Setup styles for the target element
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .sim-target {
          position: relative;
          z-index: 50 !important;
          animation: sim-pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes sim-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.3), 0 0 20px rgba(56, 189, 248, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.8), 0 0 30px rgba(56, 189, 248, 0.8); }
        }
      `}} />

      {/* Guide Dialog - Draggable */}
      <div
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          zIndex: 9999,
          width: '90%',
          maxWidth: '400px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(14, 165, 233, 0.2)',
          cursor: 'default',
          animation: 'simOverlayEnter 220ms ease-out both',
        }}
      >
          <button 
            onClick={stopSimulation}
            style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X className="h-5 w-5" />
          </button>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '12px', color: '#38bdf8' }}>
              <Info className="h-6 w-6" />
            </div>
            <div style={{ flex: 1 }}>
              {step === 'intro' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Guided Simulation</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    Currently, the system is monitoring normally. Click Next to simulate an emergency hazard.
                  </p>
                  <button onClick={() => setStep('devices_prompt')} style={btnStyle}>Next <ArrowRight className="h-4 w-4" /></button>
                </>
              )}

              {step === 'devices_prompt' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Triggering an IoT Alert</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    Please click the highlighted <strong>TEST</strong> button on the Fire Sensor.
                  </p>
                  {/* No next button here, the user must click the highlighted device button */}
                </>
              )}

              {step === 'dashboard_incident' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Incident Logged</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    The payload was validated and appears on the Global Dashboard.
                  </p>
                  <button onClick={() => setStep('chatbot_demo')} style={btnStyle}>See AI Response <ArrowRight className="h-4 w-4" /></button>
                </>
              )}

              {step === 'chatbot_demo' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Gemini AI Orchestration</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    The system fed the sensor data to Gemini. Check the chat widget for the generated evacuation plan.
                  </p>
                  <button onClick={() => setStep('map_demo')} style={btnStyle}>View Pathfinding <ArrowRight className="h-4 w-4" /></button>
                </>
              )}

              {step === 'map_demo' && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Dynamic A* Pathfinding</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                    We automatically injected a fire hazard on Floor 2. Click the highlighted <strong>Start Node</strong> and <strong>Destination Node</strong> on the map to see the reroute.
                  </p>
                  <button onClick={() => {
                    stopSimulation();
                    router.push('/dashboard');
                  }} style={{...btnStyle, background: '#10b981', color: 'white'}}>Finish Simulation <CheckCircle2 className="h-4 w-4" /></button>
                </>
              )}
            </div>
          </div>
      </div>
    </>
  )
}

const btnStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'white',
  color: '#0f172a',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
}
