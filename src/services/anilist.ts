import { Anime, AiringScheduleItem } from '../types/anime';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    medium
  }
  bannerImage
  genres
  averageScore
  episodes
  format
  seasonYear
  status
  description
`;

async function executeAniListQuery<T>(query: string, variables: Record<string, any>): Promise<T> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`AniList GraphQL Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'GraphQL Query Error');
  }

  return json.data;
}

export async function fetchTrendingAnime(page = 1, perPage = 20): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { media: Anime[] } }>(query, { page, perPage });
  return data.Page.media || [];
}

export async function fetchPopularAnime(page = 1, perPage = 20): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { media: Anime[] } }>(query, { page, perPage });
  return data.Page.media || [];
}

export async function fetchTopRatedAnime(page = 1, perPage = 20): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { media: Anime[] } }>(query, { page, perPage });
  return data.Page.media || [];
}

export async function fetchGenreAnime(genre: string, perPage = 20): Promise<Anime[]> {
  const query = `
    query ($genre: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { media: Anime[] } }>(query, { genre, perPage });
  return data.Page.media || [];
}

export async function searchAnime(searchStr: string, perPage = 25): Promise<Anime[]> {
  const query = `
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { media: Anime[] } }>(query, { search: searchStr, perPage });
  return data.Page.media || [];
}

export async function fetchAnimeDetails(id: number): Promise<Anime> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  const data = await executeAniListQuery<{ Media: Anime }>(query, { id });
  return data.Media;
}

export async function fetchAiringSchedule(
  airingAtGreater: number,
  airingAtLesser: number,
  page = 1,
  perPage = 50
): Promise<AiringScheduleItem[]> {
  const query = `
    query ($airingAtGreater: Int, $airingAtLesser: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
          id
          airingAt
          timeUntilAiring
          episode
          media {
            ${MEDIA_FIELDS}
          }
        }
      }
    }
  `;
  const data = await executeAniListQuery<{ Page: { airingSchedules: AiringScheduleItem[] } }>(query, {
    airingAtGreater,
    airingAtLesser,
    page,
    perPage,
  });
  return data.Page.airingSchedules || [];
}
