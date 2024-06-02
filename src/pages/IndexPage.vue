<template>
  <q-page
    :class="`tw-flex tw-justify-center ${
      (Api.fetching.manga || Api.fetching.anime) && 'tw-items-center'
    }`"
  >
    <!-- reverse order here based on App.search.mangasFirst (boolean) -->
    <div
      :class="`tw-w-full tw-flex ${
        App.search.mangasFirst
          ? 'tw-flex-col md:tw-flex-row'
          : 'tw-flex-col-reverse md:tw-flex-row-reverse tw-justify-end'
      }
    `"
    >
      <Mangas />

      <q-separator
        v-if="
          App.search.filters.searchAnimes &&
          App.search.filters.searchMangas &&
          App.search.value.trim() !== '' &&
          !Api.fetching.anime &&
          !Api.fetching.manga
        "
        vertical
        class="tw-hidden md:tw-flex"
      />

      <Animes />
    </div>

    <!-- Fetching results -->
    <span
      v-if="Api.fetching.anime || Api.fetching.manga"
      class="tw-w-full tw-h-full tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-flex tw-justify-center tw-items-center"
    >
      <q-circular-progress indeterminate rounded size="xl" class="q-ma-md" />
    </span>

    <!-- Start hint -->
    <template
      v-if="
        App.search.value.trim() === '' &&
        ![...App.search.results.anime, ...App.search.results.manga].length
      "
      class="tw-w-full"
    >
      <q-icon
        name="fa-light fa-arrow-up-long fa-bounce"
        class="tw-text-8xl tw-text-slate-800 tw-top-16 tw-absolute"
      />
      <img
        v-if="$q.screen.height > 550"
        class="tw-absolute tw-bottom-0 tw-w-32"
        :src="searchImage"
      />
    </template>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useApp, useApi } from "stores/stores";
import searchImage from "assets/search.webp";

import Mangas from "../components/Mangas.vue";
import Animes from "../components/Animes.vue";

defineOptions({
  name: "Discover",
});

const $q = useQuasar();
const App = useApp();
const Api = useApi();
</script>
