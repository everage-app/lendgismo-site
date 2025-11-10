import { useEffect, useState } from 'react'

/**
 * useVideoDebugParam - Hook to detect ?videodebug=1 query parameter
 * 
 * Usage:
 *   const isDebug = useVideoDebugParam()
 *   if (isDebug) console.log('Debug info')
 * 
 * Enable by adding ?videodebug=1 to any URL
 */
export function useVideoDebugParam(): boolean {
  const [isDebug, setIsDebug] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const debug = params.get('videodebug') === '1'
    
    setIsDebug(debug)

    if (debug) {
      console.log('[VideoDebug] Enabled - detailed video logs will be shown')
    }
  }, [])

  return isDebug
}
