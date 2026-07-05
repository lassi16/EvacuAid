'use client'
import { create } from 'zustand'

export type SimulationStep =
  | 'idle'
  | 'intro'
  | 'devices_prompt'
  | 'dashboard_incident'
  | 'chatbot_demo'
  | 'map_demo'
  | 'finished'

interface SimulationState {
  isSimulating: boolean
  step: SimulationStep
  startSimulation: () => void
  setStep: (step: SimulationStep) => void
  stopSimulation: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isSimulating: false,
  step: 'idle',
  startSimulation: () => set({ isSimulating: true, step: 'intro' }),
  setStep: (step) => set({ step }),
  stopSimulation: () => set({ isSimulating: false, step: 'idle' }),
}))
