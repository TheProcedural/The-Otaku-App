<template>
  <q-page class="tw-h-full tw-w-full">
    <q-tabs
      class="tw-shadow-md tw-mt-auto tw-bg-[#1976d2] tw-text-white tw-sticky tw-top-[50px] tw-z-20"
      v-model="tab"
      color="primary"
      align="justify"
    >
      <q-tab no-caps name="info" :label="$t('anime.details_tab')" />
      <q-tab
        no-caps
        name="episodes"
        :label="$t('anime.episodes_tab')"
        v-if="anime?.episodes?.length > 0"
      />
      <q-tab
        no-caps
        color="primary"
        active-color="primary"
        name="relations"
        :label="$t('anime.relations_tab')"
      />
    </q-tabs>

    <transition
      appear
      enter-active-class="animated zoomIn faster"
      leave-active-class="animated zoomOut faster"
    >
      <q-tab-panels
        animated
        swipeable
        infinite
        v-model="tab"
        class="!tw-min-h-[550px]"
        v-if="triggerTransition"
      >
        <q-tab-panel class="tw-px-0" name="info">
          <q-pull-to-refresh @refresh="refreshDetails">
            <h2 class="tw-text-lg tw-font-medium tw-text-center tw-px-4">
              {{
                App.getTitle(
                  anime?.title_english,
                  anime?.title,
                  anime?.title_japanese
                )
              }}
            </h2>
            <q-separator class="tw-my-4" />
            <div class="tw-flex tw-justify-between tw-items-center">
              <q-item-section avatar class="tw-flex tw-justify-center">
                <q-chip
                  size="md"
                  color="amber-10"
                  class="tw-text-white tw-mx-auto -tw-mb-4 tw-z-10"
                >
                  {{
                    anime?.score ? anime?.score + "/10" : $t("anime.unrated")
                  }}
                </q-chip>
                <q-img
                  :src="anime?.images?.webp?.large_image_url"
                  :alt="anime?.title_english"
                  loading="lazy"
                  class="md:tw-w-56 sm:tw-w-48 tw-w-32 tw-rounded-lg"
                />
              </q-item-section>

              <div>
                <p class="tw-mt-2">
                  <strong>{{ $t("anime.number_of_episodes") }}</strong>
                  {{ anime?.number_of_episodes }}
                </p>
                <p>
                  <strong>{{ $t("anime.status") }}</strong>
                  {{ anime?.status }}
                </p>
                <p>
                  <strong>{{ $t("anime.type") }}</strong>
                  {{ anime?.type }}
                </p>
                <p>
                  <strong>{{ $t("anime.source") }}</strong>
                  {{ anime?.source }}
                </p>
                <p>
                  <strong>{{ $t("anime.aired_from") }}</strong>
                  {{ convertDate(anime?.aired?.from) }}
                </p>
                <p>
                  <strong>{{ $t("anime.aired_to") }}</strong>
                  {{ convertDate(anime?.aired?.to) }}
                </p>
                <p>
                  <strong>{{ $t("anime.duration") }}</strong>
                  {{ anime?.duration }}
                </p>
                <p>
                  <strong>{{ $t("anime.rating") }}</strong>
                  {{ anime?.rating }}
                </p>
                <p>
                  <strong>{{ $t("anime.rank") }}</strong>
                  {{ anime?.rank }}
                </p>
                <p>
                  <strong>{{ $t("anime.popularity") }}</strong>
                  {{ anime?.popularity }}
                </p>
              </div>
            </div>
            <p class="tw-text-gray-600 tw-my-4 tw-text-justify tw-indent-8">
              {{ anime?.synopsis?.replace("[Written by MAL Rewrite]", "") }}
            </p>
            <div class="tw-relative tw-pb-[56.25%] tw-w-full">
              <q-video
                class="tw-rounded-xl tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full"
                :src="`https://www.youtube-nocookie.com/embed/${anime?.trailer?.youtube_id}`"
                frameborder="0"
              />
            </div>
          </q-pull-to-refresh>
        </q-tab-panel>

        <q-tab-panel
          v-if="anime?.episodes?.length > 0"
          class="tw-px-0"
          name="episodes"
        >
          <q-pull-to-refresh @refresh="refreshEpisodes">
            <h2 class="tw-text-lg tw-font-medium tw-text-center tw-px-4">
              {{
                App.getTitle(
                  anime?.title_english,
                  anime?.title,
                  anime?.title_japanese
                )
              }}
            </h2>
            <q-separator class="tw-mt-4" />
            <div>
              <q-list>
                <q-item v-ripple tag="label" dense class="tw-bg-gray-200">
                  <q-item-section>
                    <q-item-label>
                      {{ $t("anime.select_all") }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-checkbox
                      v-model="allSelected"
                      @update:model-value="toggleAllEpisodes"
                    />
                  </q-item-section>
                </q-item>

                <q-item
                  v-for="(episode, index) in paginatedEpisodes"
                  :key="episode?.mal_id"
                  tag="label"
                  v-ripple
                  @click.stop="selectEpisode(index, $event)"
                  :class="`${index % 2 ? 'tw-bg-gray-100' : ''}`"
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
                      <q-chip size="sm" color="amber-10" class="tw-text-white">
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
                      @click.stop="selectEpisode(index, $event)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="tw-flex tw-justify-center tw-mt-4">
                <q-pagination
                  v-if="totalPages > 1"
                  v-model="currentPage"
                  :max="totalPages"
                  boundary-numbers
                  input
                  class="tw-mt-4 tw-mb-4"
                  color="primary"
                />
              </div>
            </div>
          </q-pull-to-refresh>
        </q-tab-panel>

        <q-tab-panel class="tw-px-0" name="relations">
          <q-pull-to-refresh @refresh="refreshRelations">
            <h2 class="tw-text-lg tw-font-medium tw-text-center tw-px-4">
              {{
                App.getTitle(
                  anime?.title_english,
                  anime?.title,
                  anime?.title_japanese
                )
              }}
            </h2>
            <q-separator class="tw-my-4" />
            <q-timeline layout="dense" class="tw-px-4">
              <q-timeline-entry
                v-for="relation in anime.relations"
                :key="relation.entry[0]?.mal_id"
                :subtitle="relation.relation"
                :icon="relationsData[relation.relation]?.icon"
                :color="relationsData[relation.relation]?.color"
              >
                <RouterLink
                  :to="`/${relation.entry[0]?.type}/${relation.entry[0]?.mal_id}`"
                >
                  <q-card class="tw-shadow-xl">
                    <q-card-section>
                      <div class="tw-capitalize">
                        {{ relation.entry[0]?.type }}
                      </div>
                      <div class="tw-text-h6">
                        {{
                          App.getTitle(
                            relation.entry[0]?.title_english,
                            relation.entry[0]?.name,
                            relation.entry[0]?.title_japanese
                          )
                        }}
                      </div>
                      <div>
                        {{ convertDate(relation.entry[0]?.from) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </RouterLink>
              </q-timeline-entry>
            </q-timeline>
          </q-pull-to-refresh>
        </q-tab-panel>
      </q-tab-panels>
    </transition>

    <q-inner-loading :showing="fetchingData">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, onBeforeUnmount, watch, onMounted, computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApp, useApi } from "stores/stores";
import { getById, isFinished } from "../utils/idb";

defineOptions({
  name: "Anime",
});

const $route = useRoute();

const { t } = useI18n();
const App = useApp();
const Api = useApi();

const triggerTransition = ref(true);
const tab = ref("info");
const fetchingData = ref(false);

const allSelected = ref(false);
const lastSelectedIndex = ref(null);

const relationsData = ref({
  Sequel: {
    icon: "fa-light fa-forward",
    color: "green-7",
  },
  Prequel: {
    icon: "fa-light fa-backward",
    color: "orange-7",
  },
  "Alternative Setting": {
    icon: "fa-light fa-diagram-nested",
    color: "teal-9",
  },
  "Alternative Version": {
    icon: "fa-light fa-diagram-sankey",
    color: "cyan-8",
  },
  "Side Story": {
    icon: "fa-light fa-diagram-next",
    color: "pink-7",
  },
  "Parent Story": {
    icon: "fa-light fa-diagram-previous",
    color: "red-10",
  },
  Character: {
    icon: "fa-light fa-user-shakespeare",
    color: "yellow-8",
  },
  Summary: {
    icon: "fa-light fa-list-timeline",
    color: "purple-7",
  },
  "Full Story": {
    icon: "fa-light fa-chart-radar",
    color: "deep-purple",
  },
  "Spin-Off": {
    icon: "fa-light fa-arrows-split-up-and-left",
    color: "indigo-6",
  },
  Adaptation: {
    icon: "fa-light fa-diagram-successor",
    color: "blue-4",
  },
  Other: {
    icon: "fa-light fa-diagram-cells",
    color: "blue-grey-8",
  },
});

const episodesPerPage = ref(10);
const currentPage = ref(1);

const paginatedEpisodes = computed(() => {
  if (!anime.value?.episodes) return [];
  const start = (currentPage.value - 1) * episodesPerPage.value;
  const end = start + episodesPerPage.value;
  return anime.value.episodes.slice(start, end);
});

const totalPages = computed(() => {
  return anime.value?.episodes
    ? Math.ceil(anime.value.episodes.length / episodesPerPage.value)
    : 1;
});

const toggleAllEpisodes = (value) => {
  anime.value.episodes.forEach((episode) => {
    episode.watched = value;
  });
  lastSelectedIndex.value = null;
};

const selectEpisode = (pageIndex, event) => {
  const actualIndex =
    (currentPage.value - 1) * episodesPerPage.value + pageIndex;
  if (event.shiftKey && lastSelectedIndex.value !== null) {
    const [start, end] = [lastSelectedIndex.value, actualIndex].sort(
      (a, b) => a - b
    );
    for (let i = start; i <= end; i++) {
      anime.value.episodes[i].watched = true;
    }
  }
  lastSelectedIndex.value = actualIndex;
};

const anime = ref(null);

const convertDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : "";
};

const loadData = async (id) => {
  fetchingData.value = true;

  try {
    let data = getById("anime", id);

    if (!data) {
      await Api.fetchById("anime", id, true);
      data = getById("anime", id);
    }

    anime.value = data;
    loadRelations(id);
    loadEpisodes(id);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    fetchingData.value = false;
  }
};

const loadRelations = async (id) => {
  if (!Array.isArray(anime.value?.relations)) {
    try {
      await Api.fetchRelationsById("anime", id);
    } catch (error) {
      console.error("Error loading relations:", error);
    }
  }
};

const loadEpisodes = async (id) => {
  if (
    !Array.isArray(anime.value?.episodes) &&
    (parseInt(anime.value?.episodes) > 0 || anime.value?.episodes === null)
  ) {
    try {
      await Api.fetchEpisodesById(id);
    } catch (error) {
      console.error("Error loading episodes:", error);
    }
  }
};

const refreshDetails = (done) => {
  Api.fetchById("anime", $route.params.id, true).then(done);
};

const refreshEpisodes = (done) => {
  Api.fetchEpisodesById($route.params.id).then(() => {
    lastSelectedIndex.value = null;
    done();
  });
};

const refreshRelations = (done) => {
  Api.fetchRelationsById("anime", $route.params.id).then(done);
};

const stopWatchingEpisodesWatched = watch(
  () => anime.value?.episodes,
  () => {
    if (!Array.isArray(anime.value?.episodes)) {
      return;
    }
    const watchedCount = anime.value.episodes.filter(
      (episode) => episode.watched
    ).length;

    if (watchedCount === anime.value.episodes.length) {
      allSelected.value = true;
    } else if (watchedCount === 0) {
      allSelected.value = false;
    } else {
      allSelected.value = null;
    }
  },
  { immediate: true, deep: true }
);

const stopWatchingDBStatus = watch(
  () => isFinished.value,
  (newVal) => {
    if (newVal) loadData($route.params.id);
  },
  { immediate: true }
);

const stopWatchingRouteChange = watch(
  () => $route.params.id,
  () => {
    triggerTransition.value = false;
    setTimeout(() => {
      triggerTransition.value = true;
    }, 300);
    // tab.value = "info"; // Switch back to info tab on route change
    loadData($route.params.id);
  }
);

onBeforeUnmount(() => {
  stopWatchingRouteChange();
  stopWatchingDBStatus();
  stopWatchingEpisodesWatched();
});
</script>
