<template>
  <q-page class="tw-flex tw-flex-col tw-h-full tw-w-full">
    <q-pull-to-refresh @refresh="refresh">
      <q-tabs
        class="tw-shadow-md tw-mt-auto tw-bg-slate-600 tw-text-white tw-sticky tw-top-[50px] tw-z-10"
        v-model="tab"
        align="justify"
      >
        <q-tab no-caps name="info" :label="$t('manga.details_tab')" />
        <q-tab
          no-caps
          color="primary"
          active-color="primary"
          name="timeline"
          :label="$t('manga.relations_tab')"
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
                manga?.title_english,
                manga?.title,
                manga?.title_japanese
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
                {{ manga?.score ? manga?.score + "/10" : $t("manga.unrated") }}
              </q-chip>
              <q-img
                :src="manga?.images?.webp?.large_image_url"
                :alt="manga?.title_english"
                loading="lazy"
                class="md:tw-w-56 sm:tw-w-48 tw-w-32 tw-rounded-lg"
              />
            </q-item-section>

            <div>
              <p class="tw-mt-2">
                <strong>{{ $t("manga.number_of_volumes") }}</strong>
                {{ manga?.volumes }}
              </p>
              <p>
                <strong>{{ $t("manga.status") }}</strong>
                {{ manga?.status }}
              </p>
              <p>
                <strong>{{ $t("manga.type") }}</strong>
                {{ manga?.type }}
              </p>
              <p>
                <strong>{{ $t("manga.source") }}</strong>
                {{ manga?.source }}
              </p>
              <p>
                <strong>{{ $t("manga.published_from") }}</strong>
                {{ convertDate(manga?.published?.from) }}
              </p>
              <p>
                <strong>{{ $t("manga.published_to") }}</strong>
                {{ convertDate(manga?.published?.to) }}
              </p>
              <p>
                <strong>{{ $t("manga.rank") }}</strong>
                {{ manga?.rank }}
              </p>
              <p>
                <strong>{{ $t("manga.popularity") }}</strong>
                {{ manga?.popularity }}
              </p>
            </div>
          </div>
          <p class="tw-text-gray-600 tw-my-4 tw-text-justify tw-indent-8">
            {{ manga?.synopsis?.replace("[Written by MAL Rewrite]", "") }}
          </p>
        </q-tab-panel>

        <q-tab-panel name="timeline">
          <q-timeline>
            <q-timeline-entry
              v-for="relation in manga.relations"
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
import { ref, onBeforeMount, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApp, useApi } from "stores/stores";
import { getById } from "../utils/idb";

defineOptions({
  name: "MangaDetails",
});

const $router = useRouter();
const $route = useRoute();

const { t } = useI18n();
const App = useApp();
const Api = useApi();

const tab = ref("info");
const fetchingData = ref(false);

const manga = ref(null);

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

  manga.value = getById("manga", id);

  if (manga.value === null) {
    setTimeout(() => {
      loadData(id);
      retries++;
    }, 100);
  }

  if (!Array.isArray(manga.value?.relations))
    Api.fetchRelationsById("manga", id);
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
