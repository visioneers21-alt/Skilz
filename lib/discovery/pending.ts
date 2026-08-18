import type { DiscoveryEngineState } from '@/lib/discovery/engine'

const PENDING_DISCOVERY_KEY = 'skilz_pending_discovery'

export function savePendingDiscovery(engine: DiscoveryEngineState): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PENDING_DISCOVERY_KEY, JSON.stringify(engine))
  } catch {
    /* ignore quota errors */
  }
}

export function loadPendingDiscovery(): DiscoveryEngineState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PENDING_DISCOVERY_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DiscoveryEngineState
  } catch {
    return null
  }
}

export function clearPendingDiscovery(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(PENDING_DISCOVERY_KEY)
}
