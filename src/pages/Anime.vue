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
                color="orange"
                class="tw-text-white tw-mx-auto -tw-mb-4 tw-z-10"
              >
                {{ anime?.score ? anime?.score + "/10" : $t("anime.unrated") }}
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
        </q-tab-panel>

        <q-tab-panel name="episodes" class="tw-p-0">
          <div v-if="anime?.episodes?.length > 0">
            <q-list>
              <q-item
                v-for="episode in anime?.episodes"
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
              v-for="relation in anime.relations"
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
            :src="`https://www.youtube.com/embed/${anime?.trailer?.youtube_id}`"
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
import { ref, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApp, useApi } from "stores/stores";
import { getById } from "../utils/idb";

defineOptions({
  name: "Anime",
});

const $router = useRouter();
const $route = useRoute();

const { t } = useI18n();
const App = useApp();
const Api = useApi();

const tab = ref("info");
const fetchingData = ref(false);

const anime = ref(null);

const convertDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : "";
};

const refresh = (done) => {
  setTimeout(() => {
    // fetchData(true);
    done();
  }, 500);
};

let retries = 0;
const loadData = (id) => {
  if (retries > 19) {
    // TODO: write give up logic
    return;
  }

  anime.value = getById("anime", id);

  if (anime.value === null) {
    setTimeout(() => {
      loadData(id);
      retries++;
    }, 100);
  }

  if (!Array.isArray(anime.value?.relations))
    Api.fetchRelationsById("anime", id);

  if (!Array.isArray(anime.value?.episodes)) Api.fetchEpisodesById(id);
};

const stopWatchingRouteChange = watch(
  () => $route.params.id,
  () => {
    tab.value = "info";
    loadData($route.params.id);
  }
);

onBeforeMount(() => {
  loadData($route.params.id);
});

onBeforeUnmount(() => {
  stopWatchingRouteChange();
});
</script>
