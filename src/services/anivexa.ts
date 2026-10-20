import { Episode, StreamSource } from '../types/anime';

export const ANIVEXA_BASE_URL = 'https://anivexa-api-production-e783.up.railway.app';

// Internal provider priority order (hidden from users)
const PROVIDER_CANDIDATES = ['anizone', 'kaa', 'reanime', 'senshi'];

export async function fetchEpisodesForAnime(
  anilistId: number
): Promise<{ sub: Episode[]; dub: Episode[] }> {
  // Try candidates in order until episodes are found
  for (const candidate of PROVIDER_CANDIDATES) {
    try {
      const url = `${ANIVEXA_BASE_URL}/episodes/${candidate}/${anilistId}?map=true`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const providerData = data[candidate] || data.episodes || data;
      const episodesObj = providerData.episodes || providerData;

      const parseList = (list: any[]): Episode[] => {
        if (!Array.isArray(list)) return [];
        return list.map((item, index) => ({
          id: item.id || `watch/${candidate}/${anilistId}/${item.audio || 'sub'}/${candidate}-${item.number || index + 1}`,
          number: item.number ?? index + 1,
          title: item.title || `Episode ${item.number ?? index + 1}`,
          image: item.image || null,
          audio: item.audio || 'sub',
          duration: item.duration || null,
          filler: Boolean(item.filler),
          recap: Boolean(item.recap),
          description: item.description || null,
        }));
      };

      const subList = parseList(episodesObj.sub || []);
      const dubList = parseList(episodesObj.dub || []);

      if (subList.length > 0 || dubList.length > 0) {
        return { sub: subList, dub: dubList };
      }
    } catch {
      // try next candidate silently
    }
  }

  // Fallback: try general episodes route
  try {
    const fallbackUrl = `${ANIVEXA_BASE_URL}/episodes/${anilistId}`;
    const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const fallbackData = await res.json();
      const firstKey = Object.keys(fallbackData).find(
        (k) => fallbackData[k]?.episodes?.sub || fallbackData[k]?.sub
      );
      if (firstKey) {
        const epData = fallbackData[firstKey].episodes || fallbackData[firstKey];
        return {
          sub: (epData.sub || []).map((item: any, i: number) => ({
            id: item.id,
            number: item.number ?? i + 1,
            title: item.title || `Episode ${item.number ?? i + 1}`,
            image: item.image || null,
            audio: 'sub',
            duration: item.duration || null,
            filler: Boolean(item.filler),
          })),
          dub: (epData.dub || []).map((item: any, i: number) => ({
            id: item.id,
            number: item.number ?? i + 1,
            title: item.title || `Episode ${item.number ?? i + 1}`,
            image: item.image || null,
            audio: 'dub',
            duration: item.duration || null,
            filler: Boolean(item.filler),
          })),
        };
      }
    }
  } catch {
    // ignore
  }

  return { sub: [], dub: [] };
}

export async function resolveStreamSource(episodeId: string): Promise<StreamSource> {
  const cleanPath = episodeId.startsWith('/') ? episodeId.slice(1) : episodeId;
  const url = `${ANIVEXA_BASE_URL}/${cleanPath}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`Streaming server returned code ${response.status}`);
  }

  const data = await response.json();

  let rawStreamUrl =
    data.stream_url ||
    data.streams?.[0]?.url ||
    '';

  // If streams array contains active unencrypted streams, select best stream
  if (data.streams && Array.isArray(data.streams)) {
    const activeStream = data.streams.find((s: any) => s.url && (s.url.endsWith('.m3u8') || s.type === 'hls'));
    if (activeStream?.url) {
      rawStreamUrl = activeStream.url;
    }
  }

  if (!rawStreamUrl && !data.embed && !data.embeds?.[0]?.url) {
    throw new Error('No playable stream found for this episode.');
  }

  // When running in web context, pipe HLS stream through /api/proxy to resolve headers, keys, and CORS
  const proxiedStreamUrl = rawStreamUrl
    ? `/api/proxy?url=${encodeURIComponent(rawStreamUrl)}`
    : '';

  return {
    anime: data.anime || 'Anime',
    ep: data.ep || data.episode || 1,
    audio: data.audio || 'sub',
    server: 'HD-1',
    stream_url: proxiedStreamUrl || rawStreamUrl,
    type: data.streams?.[0]?.type || 'hls',
    embed: data.embeds?.[0]?.url || data.allServers?.[0]?.embed || data.streams?.[0]?.embed || data.embed,
    subtitles: data.subtitles || [],
    intro: data.intro || null,
    outro: data.outro || null,
  };
}
