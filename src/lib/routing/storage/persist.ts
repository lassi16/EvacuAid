import { Building } from '@/lib/routing/graph/types'

const STORAGE_KEY = 'evacuaid-indoor-map-building-v2'

export function saveBuilding(building: Building): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(building))
  } catch (e) {
    console.error('Failed to save building:', e)
  }
}

export function loadBuilding(): Building | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Building
  } catch (e) {
    console.error('Failed to load building:', e)
    return null
  }
}

export function exportBuildingJSON(building: Building): void {
  const json = JSON.stringify(building, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${building.name.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBuildingJSON(file: File): Promise<Building> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const building = JSON.parse(e.target?.result as string) as Building
        resolve(building)
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}
