import { useEffect } from 'react'

export function useNexusPageTitle(page: string) {
  useEffect(() => {
    document.title = `Nexus | ${page}`
  }, [page])
}
