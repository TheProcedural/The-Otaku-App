import Fuse from "fuse.js";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";

const fuseOptions = {
  isCaseSensitive: false,
  includeScore: false,
  shouldSort: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.4,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
};

const { data: db, isFinished } = useIDBKeyval("otaku-app", {
  anime: [],
  manga: [],
  library: {
    anime: [],
    manga: [],
  },
});

export function addRelations(type, id, relations) {
  db.value[type].find((item) => item.mal_id === parseInt(id)).relations =
    relations;
}

export function addEpisodes(id, episodes) {
  if (!db.value.anime) return `Anime DB not initialised`;
  if (!episodes) return "Fetched episodes not found";

  // Initialize watched status for new episodes
  for (let i = 0; i < episodes.length; i++) {
    episodes[i].watched = false;
  }

  const item = db.value.anime.find((item) => item.mal_id === parseInt(id));
  if (!item) return 404;

  const existingEpisodesMap = new Map();
  if (Array.isArray(item.episodes)) {
    item.episodes.forEach((episode) => {
      existingEpisodesMap.set(episode.mal_id, episode);
    });
  } else {
    item.episodes = [];
  }

  let action = "added";

  episodes.forEach((newEpisode) => {
    if (existingEpisodesMap.has(newEpisode.mal_id)) {
      newEpisode.watched = existingEpisodesMap.get(newEpisode.mal_id).watched;
      existingEpisodesMap.set(newEpisode.mal_id, newEpisode);

      action = "updated";
    } else {
      existingEpisodesMap.set(newEpisode.mal_id, newEpisode);
    }
  });

  item.episodes = Array.from(existingEpisodesMap.values());

  return `Episodes for anime with ID ${type_id} were ${action}`;
}

export async function addItems(type, data) {
  if (db.value.manga.length === 0 && type === "manga") {
    db.value.manga = data;
    return `Initial manga data seeded`;
  }

  if (db.value.anime.length === 0 && type === "anime") {
    db.value.anime = data;
    return `Initial anime data seeded`;
  }

  const itemMap = new Map(db.value[type].map((item) => [item.mal_id, item]));

  data.forEach((newItem) => {
    if (itemMap.has(newItem.mal_id)) {
      const existingItem = itemMap.get(newItem.mal_id);
      Object.assign(existingItem, newItem);
    } else {
      db.value[type].push(newItem);
    }
  });

  return `New ${type} data added`;
}

export async function search(type, query) {
  const fuse = new Fuse(db.value[type], {
    ...fuseOptions,
    keys: ["title_english", "title_japanese", "title", "title_synonyms"],
  });
  return fuse.search(query).map((i) => i.item);
}

export function getById(type, id) {
  // wait for the data to be loaded
  if (!isFinished.value) return null;

  return db.value[type].find((item) => item.mal_id === parseInt(id));
}

export default isFinished;
