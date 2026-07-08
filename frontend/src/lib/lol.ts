import type { RiotRank } from '@/types/api'

export function formatRankTier(tier: string) {
  return tier.charAt(0) + tier.slice(1).toLowerCase()
}

export function formatRankLabel(rank: RiotRank) {
  return `${formatRankTier(rank.tier)} ${rank.division}`
}
