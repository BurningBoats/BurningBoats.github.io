/**
 * Mindaro — facts, links and media slots. Studio-confirmed values only.
 * `null` renders as "To be announced" (labels.tbd) — flip here when confirmed.
 */
import { SITE } from '~/config/site';

export const MINDARO = {
  name: 'Mindaro',
  steam: {
    appId: SITE.steamAppId,
    url: SITE.socials.steam,
    widget: `https://store.steampowered.com/widget/${SITE.steamAppId}/`,
  },
  discord: { invite: SITE.discord.invite, serverId: SITE.discord.serverId },
  facts: {
    players: '1–6',
    coop: true,
    platforms: ['PC (Steam)'],
    status: 'in-development' as const,
    release: null as string | null,
    price: null as string | null,
    languages: null as string[] | null,
    onlineCoop: null as boolean | null,
  },
  media: {
    /** 11-char YouTube id of the official trailer. null → "Trailer coming soon" slot. */
    youtubeId: null as string | null,
    /** Muted hero loop (public/ paths). null → static key art. */
    heroLoop: null as { webm: string; mp4: string } | null,
  },
  /** Ten named layers, top → bottom. Order not yet confirmed by the studio. */
  biomes: ['Archiland', 'Lush', 'Base', 'Fungi', 'Saturn', 'Titan Forest', 'Middle Quarry', 'Galvanic', 'Crystal', 'The Core'],
  biomesOrderConfirmed: false,
  /** Creature ids must match `mindaro.creatures.items[].id` in the dictionaries and the imported art. */
  creatures: [
    { id: 'denator', name: 'Denator', art: 'denator' },
    { id: 'bungus', name: 'Bungus', art: 'bungus' },
    { id: 'vorkula', name: 'Vorkula', art: 'vorkula' },
    { id: 'wadook', name: 'Wadook', art: 'wadook' },
    { id: 'hirustagua', name: 'Hirustagua', art: 'hirustagua' },
  ],
  loreConfirmed: false,
  hashtags: ['#Mindaro', '#JuegosDeTerror', '#CoopFails', '#GamerMexicano', '#GamingLatam', '#SurvivalHorror', '#CoopGaming', '#IndieDev', '#Gamedev'],
} as const;

export type MindaroData = typeof MINDARO;
