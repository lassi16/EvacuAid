import { Building } from '@/lib/routing/graph/types'

const STORAGE_KEY = 'evacuaid-indoor-map-building-v2'

export async function saveBuilding(building: Building): Promise<void> {
  try {
    await fetch('/api/map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(building)
    })
  } catch (e) {
    console.error('Failed to save building:', e)
  }
}

export async function loadBuilding(retryCount = 0): Promise<Building | null> {
  try {
    const res = await fetch('/api/map')
    if (!res.ok) {
      if (res.status === 500 && retryCount < 3) {
        console.warn('Database waking up, retrying map fetch...')
        await new Promise(r => setTimeout(r, 3000))
        return loadBuilding(retryCount + 1)
      }
      return null
    }
    return (await res.json()) as Building
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
