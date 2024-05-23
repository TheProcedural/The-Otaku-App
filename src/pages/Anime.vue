<template>
  <q-page class="tw-flex tw-flex-col tw-h-full tw-w-full">
    <q-pull-to-refresh @refresh="refresh">
      <q-tabs
        class="tw-shadow-md tw-mt-auto tw-bg-slate-600 tw-text-white tw-sticky tw-top-[50px] tw-z-10"
        elevated
        dense
        v-model="tab"
        align="justify"
      >
        <q-tab
          no-caps
          icon="fa-light fa-tachograph-digital"
          name="info"
          :label="$t('anime.details_tab')"
        />
        <q-tab
          no-caps
          icon="fa-light fa-list-check"
          name="episodes"
          :label="$t('anime.episodes_tab')"
        />
        <q-tab
          no-caps
          icon="fa-light fa-timeline-arrow"
          color="primary"
          active-color="primary"
          name="timeline"
          :label="$t('anime.timeline_tab')"
        />
        <q-tab
          no-caps
          icon="fa-brands fa-youtube"
          name="trailer"
          :label="$t('anime.trailer_tab')"
        />
      </q-tabs>
      <q-tab-panels
        animated
        swipeable
        infinite
        v-model="tab"
        class="!tw-min-h-[550px]"
      >
        <q-tab-panel name="info">
          <h2 class="tw-text-lg tw-font-medium tw-text-left">
            {{
              App.getTitle(
                idb.animes[$route.params.id]?.title_english,
                idb.animes[$route.params.id]?.title,
                idb.animes[$route.params.id]?.title_japanese
              )
            }}
          </h2>
          <q-separator class="tw-my-4" />
          <div class="tw-flex tw-justify-between tw-items-center">
            <q-item-section avatar class="tw-flex tw-justify-center">
              <q-chip
                size="md"
                color="orange"
                class="tw-text-white tw-mx-auto -tw-mb-4 tw-z-10"
              >
                {{
                  idb.animes[$route.params.id]?.score
                    ? idb.animes[$route.params.id]?.score + "/10"
                    : $t("anime.unrated")
                }}
              </q-chip>
              <q-img
                :src="
                  idb.animes[$route.params.id]?.images?.webp?.large_image_url
                "
                :alt="idb.animes[$route.params.id]?.title_english"
                loading="lazy"
                class="md:tw-w-56 sm:tw-w-48 tw-w-32 tw-rounded-lg"
              />
            </q-item-section>

            <div>
              <p class="tw-mt-2">
                <strong>{{ $t("anime.number_of_episodes") }}</strong>
                {{ idb.animes[$route.params.id]?.number_of_episodes }}
              </p>
              <p>
                <strong>{{ $t("anime.status") }}</strong>
                {{ idb.animes[$route.params.id]?.status }}
              </p>
              <p>
                <strong>{{ $t("anime.type") }}</strong>
                {{ idb.animes[$route.params.id]?.type }}
              </p>
              <p>
                <strong>{{ $t("anime.source") }}</strong>
                {{ idb.animes[$route.params.id]?.source }}
              </p>
              <p>
                <strong>{{ $t("anime.aired_from") }}</strong>
                {{ convertDate(idb.animes[$route.params.id]?.aired?.from) }}
              </p>
              <p>
                <strong>{{ $t("anime.aired_to") }}</strong>
                {{ convertDate(idb.animes[$route.params.id]?.aired?.to) }}
              </p>
              <p>
                <strong>{{ $t("anime.duration") }}</strong>
                {{ idb.animes[$route.params.id]?.duration }}
              </p>
              <p>
                <strong>{{ $t("anime.rating") }}</strong>
                {{ idb.animes[$route.params.id]?.rating }}
              </p>
              <p>
                <strong>{{ $t("anime.rank") }}</strong>
                {{ idb.animes[$route.params.id]?.rank }}
              </p>
              <p>
                <strong>{{ $t("anime.popularity") }}</strong>
                {{ idb.animes[$route.params.id]?.popularity }}
              </p>
            </div>
          </div>
          <p class="tw-text-gray-600 tw-my-4 tw-text-justify tw-indent-8">
            {{
              idb.animes[$route.params.id]?.synopsis?.replace(
                "[Written by MAL Rewrite]",
                ""
              )
            }}
          </p>
        </q-tab-panel>

        <q-tab-panel name="episodes" class="tw-p-0">
          <div v-if="idb.animes[$route.params.id]?.episodes?.length > 0">
            <q-list>
              <q-item
                v-for="episode in idb.animes[$route.params.id]?.episodes"
                :key="episode?.mal_id"
                tag="label"
                v-ripple
              >
                <q-item-section
                  side
                  class="tw-flex tw-justify-center tw-items-center tw-min-w-[40px]"
                >
                  <span class="tw-text-2xl">
                    {{ episode?.mal_id }}
                  </span>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ episode?.title }}</q-item-label>
                  <q-item-label caption>
                    <q-chip size="sm" color="orange" class="tw-text-white">
                      {{
                        episode?.score
                          ? episode?.score + "/10"
                          : $t("anime.unrated")
                      }}
                    </q-chip>
                    {{ convertDate(episode?.aired) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox
                    v-model="episode.watched"
                    @update:model-value="
                      updateWatchedStatus(episode.mal_id, episode.watched)
                    "
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-else>{{ $t("no_relations") }}</div>
        </q-tab-panel>

        <q-tab-panel name="timeline">
          <q-timeline>
            <q-timeline-entry
              v-for="relation in idb.animes[$route.params.id].relations"
              :key="relation.entry[0]?.mal_id"
              :subtitle="relation.relation"
            >
              <RouterLink
                :to="`/${relation.entry[0]?.type}/${relation.entry[0]?.mal_id}`"
              >
                <q-card>
                  <q-card-section>
                    <div class="tw-text-h6">
                      {{
                        App.getTitle(
                          relation.entry[0]?.title_english,
                          relation.entry[0]?.name,
                          relation.entry[0]?.title_japanese
                        )
                      }}
                    </div>
                    <div>{{ relation.entry[0]?.type }}</div>
                    <div>
                      {{ convertDate(relation.entry[0]?.from) }}
                    </div>
                  </q-card-section>
                </q-card>
              </RouterLink>
            </q-timeline-entry>
          </q-timeline>
        </q-tab-panel>

        <q-tab-panel name="trailer">
          <q-video
            class="tw-rounded-lg"
            :ratio="16 / 9"
            :src="`https://www.youtube.com/embed/${
              idb.animes[$route.params.id]?.trailer?.youtube_id
            }`"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-pull-to-refresh>

    <q-inner-loading :showing="fetchingData">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { useI18n } from "vue-i18n";
import { useApp } from "stores/app";
import axios from "axios";

defineOptions({
  name: "Timeline",
});

const { data: idb, isFinished } = useIDBKeyval("idb", {
  animes: [],
  mangas: [],
});
const $router = useRouter();
const $route = useRoute();

const { t } = useI18n();
const App = useApp();

const tab = ref("info");
const visited = ref([]);
const fetchingData = ref(false);
const creatingTimelines = ref(false);

const fetchData = async (refresh) => {
  try {
    if (!refresh) {
      fetchingData.value = false;
      return;
    }
    fetchingData.value = true;
    const [animeAndMangaData, episodesData] = await Promise.all([
      fetchAnimeAndMangaData($route.params.id, "anime", true),
      fetchEpisodes($route.params.id),
    ]);

    animeAndMangaData.number_of_episodes = animeAndMangaData.episodes;
    animeAndMangaData.episodes = prepareEpisodes(
      episodesData,
      idb.value.animes[$route.params.id]?.episodes || []
    );

    console.log("before: ", animeAndMangaData.relations);
    animeAndMangaData.relations = await createTimelines(
      animeAndMangaData.relations
    );
    console.log("after: ", animeAndMangaData.relations);
    idb.value.animes[$route.params.id] = JSON.parse(
      JSON.stringify(animeAndMangaData)
    ); // Ensure no Proxy object is stored
  } catch (error) {
    fetchingData.value = false;
    console.error("Error fetching anime data:", error);
  }
  fetchingData.value = false;
};

const fetchAnimeAndMangaData = async (id, type, full) => {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/${type}/${id}${full ? "/full" : ""}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching anime data:", error);
    throw error;
  }
};

const fetchEpisodes = async (id) => {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime/${id}/episodes`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching anime data:", error);
    throw error;
  }
};

const createTimelines = async (relations) => {
  creatingTimelines.value = true;
  try {
    const timelineData = [];
    for (const relation of relations) {
      for (const entry of relation.entry) {
        if (!visited.value.includes(entry.mal_id)) {
          await delay(500);
          const data = await fetchAnimeAndMangaData(
            entry.mal_id,
            entry.type,
            false
          );

          // Add from date
          const dateField = entry.type === "anime" ? "aired" : "published";
          if (data[dateField]?.from) {
            entry.from = data[dateField].from;
          }

          // Add title, title_english, title_japanese
          entry.name = data.title;
          entry.title_english = data.title_english;
          entry.title_japanese = data.title_japanese;

          timelineData.push(relation);
          visited.value.push(entry.mal_id);
        }
      }
    }
    return timelineData;
  } catch (error) {
    console.error("Error creating timelines:", error);
  }
  creatingTimelines.value = false;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prepareEpisodes = (episodes, existingEpisodes) => {
  const existingEpisodesMap = Object.fromEntries(
    existingEpisodes.map((ep) => [ep.mal_id, ep.watched])
  );

  return episodes.map((episode) => {
    episode.watched = existingEpisodesMap[episode.mal_id] || false;
    return episode;
  });
};

const sortRelationsTimeline = () => {
  if (!idb.value.animes[$route.params.id].relations) return;

  idb.value.animes[$route.params.id].relations.sort((a, b) => {
    const dateA = new Date(a.entry[0].from);
    const dateB = new Date(b.entry[0].from);
    if (App.search.sort) return dateB - dateA;
    return dateA - dateB;
  });
};

const convertDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : "";
};

const refresh = (done) => {
  setTimeout(() => {
    fetchData(true);
    done();
  }, 500);
};

const updateWatchedStatus = (mal_id, watched) => {
  const episodes = idb.value.animes[$route.params.id]?.episodes;
  if (episodes) {
    const episode = episodes.find((ep) => ep.mal_id === mal_id);
    if (episode) {
      episode.watched = watched;
      // Update the anime data in the database
      idb.value.animes[$route.params.id].episodes = JSON.parse(
        JSON.stringify(episodes)
      ); // Ensure no Proxy object is stored
    }
  }
};

const stopWatchingCreateTimelines = watch(
  () => creatingTimelines.value,
  () => {
    if (!creatingTimelines.value && idb.value.animes[$route.params.id])
      sortRelationsTimeline();
  }
);

const stopWatchingOrder = watch(
  () => App.search.order,
  () => {
    if (idb.value.animes[$route.params.id]) sortRelationsTimeline();
  }
);

const stopWatchingParams = watch(
  () => $route.params.id,
  () => {
    fetchData(true);
  }
);

onMounted(() => {
  fetchData(false);
});

onBeforeUnmount(() => {
  stopWatchingCreateTimelines();
  stopWatchingOrder();
  stopWatchingParams();
});
</script>
