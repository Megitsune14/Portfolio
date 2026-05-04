const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_EPOCH_MS = 1420070400000;

export interface DiscordProfileDto {
  id: string;
  displayName: string;
  username: string;
  discriminator: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string | null;
  accentColor: string | null;
  accountCreatedAt: string;
  premiumType: 'none' | 'nitro_classic' | 'nitro' | 'nitro_basic';
  premiumLabel: string;
  badges: { id: string; label: string }[];
  avatarDecorationAsset: string | null;
  primaryGuildTag: string | null;
}

interface DiscordApiUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  premium_type?: number;
  public_flags?: number;
  flags?: number;
  avatar_decoration_data?: { sku_id: string; asset: string } | null;
  primary_guild?: {
    tag?: string | null;
    badge?: string | null;
    identity_enabled?: boolean | null;
  } | null;
}

const FLAG_BADGES: { mask: number; id: string; label: string }[] = [
  { mask: 1 << 0, id: 'staff', label: 'Discord Staff' },
  { mask: 1 << 1, id: 'partner', label: 'Partnered Server Owner' },
  { mask: 1 << 2, id: 'hypesquad', label: 'HypeSquad Events' },
  { mask: 1 << 3, id: 'bug_hunter_1', label: 'Bug Hunter Level 1' },
  { mask: 1 << 6, id: 'bravery', label: 'HypeSquad Bravery' },
  { mask: 1 << 7, id: 'brilliance', label: 'HypeSquad Brilliance' },
  { mask: 1 << 8, id: 'balance', label: 'HypeSquad Balance' },
  { mask: 1 << 9, id: 'early_supporter', label: 'Early Nitro Supporter' },
  { mask: 1 << 14, id: 'bug_hunter_2', label: 'Bug Hunter Level 2' },
  { mask: 1 << 17, id: 'verified_dev', label: 'Early Verified Bot Developer' },
  { mask: 1 << 18, id: 'certified_mod', label: 'Moderator Programs Alumni' },
];

function snowflakeToIso(id: string): string {
  const ms = Number(BigInt(id) >> 22n) + DISCORD_EPOCH_MS;
  return new Date(ms).toISOString();
}

function defaultAvatarUrl(userId: string): string {
  const idx = Number((BigInt(userId) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
}

function buildAvatarUrl(userId: string, avatar: string | null): string {
  if (!avatar) return defaultAvatarUrl(userId);
  const ext = avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}?size=256`;
}

function buildBannerUrl(userId: string, banner: string | null): string | null {
  if (!banner) return null;
  const ext = banner.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/banners/${userId}/${banner}.${ext}?size=600`;
}

function intColorToHex(n: number): string {
  return `#${n.toString(16).padStart(6, '0')}`;
}

function decodeBadges(flags: number): { id: string; label: string }[] {
  return FLAG_BADGES.filter((f) => (flags & f.mask) !== 0).map(({ id, label }) => ({ id, label }));
}

function mapPremiumType(t: number | undefined): {
  premiumType: DiscordProfileDto['premiumType'];
  premiumLabel: string;
} {
  switch (t) {
    case 1:
      return { premiumType: 'nitro_classic', premiumLabel: 'Nitro Classic' };
    case 2:
      return { premiumType: 'nitro', premiumLabel: 'Nitro' };
    case 3:
      return { premiumType: 'nitro_basic', premiumLabel: 'Nitro Basic' };
    default:
      return { premiumType: 'none', premiumLabel: 'None' };
  }
}

function buildHandle(user: DiscordApiUser): string {
  if (user.discriminator && user.discriminator !== '0') {
    return `${user.username}#${user.discriminator}`;
  }
  return `@${user.username}`;
}

function mapUserToDto(user: DiscordApiUser): DiscordProfileDto {
  const flags = user.public_flags ?? user.flags ?? 0;
  const { premiumType, premiumLabel } = mapPremiumType(user.premium_type);

  const primaryGuildTag =
    user.primary_guild?.identity_enabled && user.primary_guild.tag
      ? user.primary_guild.tag
      : null;

  return {
    id: user.id,
    displayName: user.global_name?.trim() || user.username,
    username: user.username,
    discriminator: user.discriminator,
    handle: buildHandle(user),
    avatarUrl: buildAvatarUrl(user.id, user.avatar),
    bannerUrl: buildBannerUrl(user.id, user.banner),
    accentColor: user.accent_color != null ? intColorToHex(user.accent_color) : null,
    accountCreatedAt: snowflakeToIso(user.id),
    premiumType,
    premiumLabel,
    badges: decodeBadges(flags),
    avatarDecorationAsset: user.avatar_decoration_data?.asset ?? null,
    primaryGuildTag,
  };
}

export async function fetchDiscordUserProfile(
  userId: string,
  botToken: string
): Promise<DiscordProfileDto> {
  const res = await fetch(`${DISCORD_API_BASE}/users/${encodeURIComponent(userId)}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Discord API returned ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status >= 400 && res.status < 500 ? res.status : 502;
    throw err;
  }

  const user = (await res.json()) as DiscordApiUser;
  return mapUserToDto(user);
}
