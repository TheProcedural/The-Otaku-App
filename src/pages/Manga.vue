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
          :label="$t('manga.details_tab')"
        />
        <q-tab
          no-caps
          icon="fa-light fa-timeline-arrow"
          color="primary"
          active-color="primary"
          name="timeline"
          :label="$t('manga.timeline_tab')"
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
                idb.mangas[$route.params.id]?.title_english,
                idb.mangas[$route.params.id]?.title,
                idb.mangas[$route.params.id]?.title_japanese
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
                  idb.mangas[$route.params.id]?.score
                    ? idb.mangas[$route.params.id]?.score + "/10"
                    : $t("manga.unrated")
                }}
              </q-chip>
              <q-img
                :src="
                  idb.mangas[$route.params.id]?.images?.webp?.large_image_url
                "
                :alt="idb.mangas[$route.params.id]?.title_english"
                loading="lazy"
                class="md:tw-w-56 sm:tw-w-48 tw-w-32 tw-rounded-lg"
              />
            </q-item-section>

            <div>
              <p class="tw-mt-2">
                <strong>{{ $t("manga.number_of_volumes") }}</strong>
                {{ idb.mangas[$route.params.id]?.volumes }}
              </p>
              <p>
                <strong>{{ $t("manga.status") }}</strong>
                {{ idb.mangas[$route.params.id]?.status }}
              </p>
              <p>
                <strong>{{ $t("manga.type") }}</strong>
                {{ idb.mangas[$route.params.id]?.type }}
              </p>
              <p>
                <strong>{{ $t("manga.source") }}</strong>
                {{ idb.mangas[$route.params.id]?.source }}
              </p>
              <p>
                <strong>{{ $t("manga.published_from") }}</strong>
                {{ convertDate(idb.mangas[$route.params.id]?.published?.from) }}
              </p>
              <p>
                <strong>{{ $t("manga.published_to") }}</strong>
                {{ convertDate(idb.mangas[$route.params.id]?.published?.to) }}
              </p>
              <p>
                <strong>{{ $t("manga.rank") }}</strong>
                {{ idb.mangas[$route.params.id]?.rank }}
              </p>
              <p>
                <strong>{{ $t("manga.popularity") }}</strong>
                {{ idb.mangas[$route.params.id]?.popularity }}
              </p>
            </div>
          </div>
          <p class="tw-text-gray-600 tw-my-4 tw-text-justify tw-indent-8">
            {{
              idb.mangas[$route.params.id]?.synopsis?.replace(
                "[Written by MAL Rewrite]",
                ""
              )
            }}
          </p>
        </q-tab-panel>

        <q-tab-panel name="timeline">
          <q-timeline>
            <q-timeline-entry
              v-for="relation in idb.mangas[$route.params.id].relations"
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
  name: "MangaDetails",
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
    const mangaData = await fetchMangaData($route.params.id, "manga", true);
    console.log("before: ", mangaData.relations);
    mangaData.relations = await createTimelines(mangaData.relations);
    console.log("after: ", mangaData.relations);
    idb.value.mangas[$route.params.id] = JSON.parse(JSON.stringify(mangaData)); // Ensure no Proxy object is stored
  } catch (error) {
    fetchingData.value = false;
    console.error("Error fetching manga data:", error);
  }
  fetchingData.value = false;
};

const fetchMangaData = async (id, type, full) => {
  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/${type}/${id}${full ? "/full" : ""}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching manga data:", error);
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
          const data = await fetchMangaData(entry.mal_id, entry.type, false);

          // Add from date
          const dateField = entry.type === "manga" ? "published" : "aired";
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

const sortRelationsTimeline = () => {
  if (!idb.value.mangas[$route.params.id].relations) return;

  idb.value.mangas[$route.params.id].relations.sort((a, b) => {
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

const stopWatchingCreateTimelines = watch(
  () => creatingTimelines.value,
  () => {
    if (!creatingTimelines.value && idb.value.mangas[$route.params.id])
      sortRelationsTimeline();
  }
);

const stopWatchingOrder = watch(
  () => App.search.order,
  () => {
    if (idb.value.mangas[$route.params.id]) sortRelationsTimeline();
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
