<template>
  <q-page class="tw-flex tw-flex-col tw-h-full tw-w-full">
    <q-pull-to-refresh @refresh="refresh">
      <q-tabs
        class="tw-shadow-md tw-mt-auto tw-bg-blue-500 tw-text-white tw-sticky tw-top-[50px] tw-z-10"
        elevated
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
                item?.title_english,
                item?.title,
                item?.title_japanese
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
                {{ item?.score ? item?.score + "/10" : $t("anime.unrated") }}
              </q-chip>
              <q-img
                :src="item?.images.webp.large_image_url"
                :alt="item?.title_english"
                loading="lazy"
                class="md:tw-w-56 sm:tw-w-48 tw-w-32 tw-rounded-lg"
              />
            </q-item-section>

            <div>
              <p class="tw-mt-2">
                <strong>{{ $t("anime.number_of_episodes") }}</strong>
                {{ item?.episodes }}
              </p>
              <p>
                <strong>{{ $t("anime.status") }}</strong> {{ item?.status }}
              </p>
              <p>
                <strong>{{ $t("anime.type") }}</strong> {{ item?.type }}
              </p>
              <p>
                <strong>{{ $t("anime.source") }}</strong> {{ item?.source }}
              </p>
              <p>
                <strong>{{ $t("anime.aired_from") }}</strong>
                {{ convertDate(item?.aired.from) }}
              </p>
              <p>
                <strong>{{ $t("anime.aired_to") }}</strong>
                {{ convertDate(item?.aired.to) }}
              </p>
              <p>
                <strong>{{ $t("anime.duration") }}</strong>
                {{ item?.duration }}
              </p>
              <p>
                <strong>{{ $t("anime.rating") }}</strong>
                {{ item?.rating }}
              </p>
              <p>
                <strong>{{ $t("anime.rank") }}</strong>
                {{ item?.rank }}
              </p>
              <p>
                <strong>{{ $t("anime.popularity") }}</strong>
                {{ item?.popularity }}
              </p>
            </div>
          </div>
          <p class="tw-text-gray-600 tw-my-4 tw-text-justify tw-indent-8">
            {{ item?.synopsis.replace("[Written by MAL Rewrite]", "") }}
          </p>
        </q-tab-panel>

        <q-tab-panel name="episodes" class="tw-p-0">
          <div v-if="episodes.length > 0">
            <q-list>
              <q-item
                v-for="episode in episodes"
                :key="episode.mal_id"
                tag="label"
                v-ripple
              >
                <q-item-section
                  side
                  class="tw-flex tw-justify-center tw-items-center tw-min-w-[40px]"
                >
                  <span class="tw-text-2xl">
                    {{ episode.mal_id }}
                  </span>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ episode.title }}</q-item-label>
                  <q-item-label caption>
                    <q-chip size="sm" color="orange" class="tw-text-white">
                      {{
                        episode?.score
                          ? episode?.score + "/10"
                          : $t("anime.unrated")
                      }}
                    </q-chip>
                    {{ convertDate(episode.aired) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="episode.watched" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-else>{{ $t("no_relations") }}</div>
        </q-tab-panel>

        <q-tab-panel name="timeline">
          <q-timeline>
            <q-timeline-entry
              v-for="relation in relations"
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
            :src="`https://www.youtube.com/embed/${item?.trailer?.youtube_id}`"
          />
        </q-tab-panel>
      </q-tab-panels>
    </q-pull-to-refresh>

    <span
      v-if="fetchingData"
      class="tw-bg-white tw-flex tw-justify-center tw-items-center tw-absolute tw-z-10 tw-top-0 tw-bottom-0 tw-left-0 tw-right-0"
    >
      <q-circular-progress indeterminate rounded size="xl" />
    </span>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApp } from "stores/app";
import axios from "axios";

defineOptions({
  name: "Timeline",
});

const $router = useRouter();
const $route = useRoute();

const { t } = useI18n();
const App = useApp();

const tab = ref("info");
const item = ref(null);
const episodes = ref([]);
const relations = ref([]);
const visited = ref([]);
const fetchingData = ref(false);
const creatingTimelines = ref(false);

const fetchData = async (id) => {
  fetchingData.value = true;
  try {
    // rate limiting doesn't like this
    // const [animeData, episodesData, relationsData] = await Promise.all([
    //   fetchAnimeAndMangaData(id, "anime"),
    //   fetchEpisodes(id),
    //   fetchRelations(id, "anime"),
    // ]);

    // to be removed when rate limiting issue is fixed
    const animeData = await fetchAnimeAndMangaData(id, "anime");
    delay(300);
    const episodesData = await fetchEpisodes(id);
    delay(300);
    const relationsData = await fetchRelations(id, "anime");

    episodesData.map((episode) => {
      episode.watched = false;
      return episode;
    });

    item.value = animeData;
    episodes.value = episodesData;
    relations.value = relationsData;

    relations.value = relations.value.concat(relations.value);

    delay(300);
    await createTimelines();
  } catch (error) {
    console.error("Error fetching anime data:", error);
  }
  fetchingData.value = false;
};

const fetchAnimeAndMangaData = async (id, type) => {
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/${type}/${id}`);
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

const fetchRelations = async (id, type) => {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/${type}/${id}/relations`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching anime data:", error);
    throw error;
  }
};

const createTimelines = async () => {
  try {
    const timelineData = [];
    for (const relation of relations.value) {
      if (!visited.value.includes(relation.entry[0].mal_id)) {
        await delay(500);
        const data = await fetchAnimeAndMangaData(
          relation.entry[0].mal_id,
          relation.entry[0].type
        );

        // Add from date
        const dateField =
          relation.entry[0].type === "anime" ? "aired" : "published";
        if (data[dateField]?.from) {
          relation.entry[0].from = data[dateField].from;
        }

        // Add title, title_english, title_japanese
        relation.entry[0].name = data.title;
        relation.entry[0].title_english = data.title_english;
        relation.entry[0].title_japanese = data.title_japanese;

        timelineData.push(relation);
        visited.value.push(relation.entry[0].mal_id);
        relations.value = timelineData;
      }
    }
  } catch (error) {
    console.error("Error creating timelines:", error);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sortRelationsTimeline = (relations) => {
  return relations.sort((a, b) => {
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
    fetchData($route.params.id);
    done();
  }, 500);
};

const stopWatchingCreateTimelines = watch(
  () => creatingTimelines.value,
  () => {
    if (!creatingTimelines.value)
      relations.value = sortRelationsTimeline(relations.value);
  }
);

const stopWatchingOrder = watch(
  () => App.search.order,
  () => {
    relations.value = sortRelationsTimeline(relations.value);
  }
);

const stopWatchingParams = watch(
  () => $route.params.id,
  () => {
    item.value = null;
    episodes.value = [];
    relations.value = [];
    visited.value = [];
    fetchingData.value = false;
    creatingTimelines.value = false;
    fetchData($route.params.id);
  },
  { immediate: true }
);

onMounted(() => {
  fetchData($route.params.id);
});

onBeforeUnmount(() => {
  stopWatchingCreateTimelines();
  stopWatchingOrder();
  stopWatchingParams();
});
</script>
