<template>
  <q-page class="tw-w-full tw-flex tw-flex-col tw-h-full">
    <q-pull-to-refresh @refresh="refresh">
      <q-tabs
        class="tw-shadow-md tw-mt-auto tw-bg-blue-500 tw-text-white tw-sticky tw-top-[50px] tw-z-10"
        elevated
        v-model="tab"
      >
        <q-tab
          no-caps
          icon="fa-light fa-list-ol"
          name="info"
          :label="$t('details_tab')"
        />
        <q-tab
          no-caps
          icon="fa-light fa-list-ol"
          name="episodes"
          :label="$t('episodes_tab')"
        />
        <q-tab
          no-caps
          icon="fa-light fa-timeline-arrow"
          name="timeline"
          :label="$t('timeline_tab')"
        />
      </q-tabs>

      <q-tab-panels
        animated
        swipeable
        infinite
        v-model="tab"
        class="tw-flex-grow"
      >
        <q-tab-panel name="info">
          <div class="tw-p-2">
            <h2 class="tw-text-lg tw-font-medium tw-text-center">
              {{
                (App.locale.itemsLanguage === "japanese" &&
                  anime?.title_japanese) ||
                (App.locale.itemsLanguage === "english" &&
                  anime?.title_english) ||
                (App.locale.itemsLanguage === "romaji" && anime?.title)
              }}
            </h2>
            <div class="tw-flex tw-justify-between tw-items-center">
              <q-img
                :src="anime?.images.webp.large_image_url"
                :alt="anime?.title_english"
                loading="lazy"
                class="tw-w-32 tw-h-48 tw-mx-auto tw-rounded-md"
              />
              <div>
                <p class="tw-mt-2">
                  <strong>{{ $t("episodes") }}:</strong> {{ anime?.episodes }}
                </p>
                <p>
                  <strong>{{ $t("status") }}:</strong> {{ anime?.status }}
                </p>
                <p>
                  <strong>{{ $t("score") }}:</strong> {{ anime?.score }}
                </p>
              </div>
            </div>
            <p class="tw-text-gray-600">{{ anime?.synopsis }}</p>
          </div>
        </q-tab-panel>

        <q-tab-panel name="episodes">
          <div v-if="episodes.length > 0">
            <q-list>
              <q-item v-for="episode in episodes" :key="episode.mal_id">
                <q-item-section>
                  <q-item-label>{{ episode.title }}</q-item-label>
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
              :key="relation.entry[0].mal_id"
              :to="`/anime/${relation.mal_id}`"
              :subtitle="relation.relation"
            >
              <q-card>
                <q-card-section>
                  <div class="tw-text-h6">{{ relation.entry[0].name }}</div>
                  <div>{{ relation.entry[0].type }}</div>
                </q-card-section>
              </q-card>
            </q-timeline-entry>
          </q-timeline>
        </q-tab-panel>
      </q-tab-panels>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useApp } from "stores/app";
import axios from "axios";

defineOptions({
  name: "Timeline",
});

const tab = ref("info");
const anime = ref(null);
const episodes = ref([]);
const relations = ref([]);
const route = useRoute();
const { t } = useI18n();
const App = useApp();

const fetchAnimeData = async (id) => {
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
    anime.value = response.data.data;

    // Fetch episodes
    const episodesResponse = await axios.get(
      `https://api.jikan.moe/v4/anime/${id}/episodes`
    );
    episodes.value = episodesResponse.data.data;

    // Fetch relations
    const relationsResponse = await axios.get(
      `https://api.jikan.moe/v4/anime/${id}/relations`
    );
    relations.value = relationsResponse.data.data;
  } catch (error) {
    console.error("Error fetching anime data:", error);
  }
};

const refresh = (done) => {
  fetchAnimeData(route.params.animeId);
  done();
};

onMounted(() => {
  fetchAnimeData(route.params.animeId);
});
</script>
