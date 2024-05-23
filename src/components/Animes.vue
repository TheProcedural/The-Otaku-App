<template>
  <q-list
    v-if="App.search.filters.searchAnimes"
    :class="`
          ${App.search.filters.searchMangas ? 'md:tw-w-1/2' : 'tw-w-full'}
          ${App.search.fetchingAnimes && '!tw-flex !tw-justify-center'}
          `"
  >
    <!-- Results -->
    <template
      v-if="
        !App.search.fetchingAnimes &&
        App.search.animeResults.length &&
        App.search.value.trim() !== ''
      "
    >
      <q-item-label
        header
        class="tw-text-center tw-text-2xl tw-border-t tw-border-gray-300"
      >
        {{ $t("discover.anime") }}
      </q-item-label>

      <q-item
        v-for="result in App.search.animeResults"
        :key="result?.mal_id"
        :to="'anime/' + result?.mal_id"
        clickable
        v-ripple
        class="tw-border-t tw-border-gray-300 tw-p-0 tw-min-h-[120px]"
      >
        <q-item-section
          avatar
          class="tw-pb-1 tw-pt-0 tw-px-1 tw-flex tw-justify-center"
        >
          <q-chip
            size="sm"
            color="orange"
            class="tw-text-white tw-mx-auto -tw-mb-2 tw-z-10"
          >
            {{ result?.score ? result?.score + "/10" : $t("discover.unrated") }}
          </q-chip>
          <q-img
            loading="lazy"
            :src="result?.images.webp.image_url"
            class="tw-rounded-md tw-w-16"
          />
        </q-item-section>
        <q-item-section class="tw-truncate tw-px-2 tw-overflow-hidden tw-my-6">
          <span class="tw-text-left tw-text-wrap">
            {{
              App.getTitle(
                result?.title_english,
                result?.title,
                result?.title_japanese
              )
            }}
          </span>
        </q-item-section>
        <div
          class="tw-absolute tw-top-[2px] tw-right-0 tw-text-gray-500 tw-text-xs tw-w-full tw-h-5 tw-flex tw-justify-end tw-items-center"
        >
          <span
            class="tw-border-b tw-border-l tw-border-gray-300 tw-py-1 tw-px-2 tw-rounded-bl"
          >
            {{ result?.type }}
          </span>
          <span
            class="tw-border-b tw-border-x tw-border-gray-300 tw-py-1 tw-px-2"
          >
            {{ result?.status }}
          </span>
          <span class="tw-border-b tw-border-gray-300 tw-py-1 tw-px-2">
            {{ result?.aired.prop.from.year || "TBD" }}
            -
            {{ result?.aired.prop.to.year || "TBD" }}
          </span>
        </div>
      </q-item>
    </template>

    <!-- No results -->
    <div
      v-else-if="!App.search.fetchingAnimes && App.search.value.trim() !== ''"
      class="tw-h-full tw-flex tw-items-center tw-justify-center tw-my-10"
    >
      <h1 class="tw-text-2xl tw-text-center tw-text-slate-800 tw-font-bold">
        {{ $t("discover.no_anime_results") }}
      </h1>
    </div>
  </q-list>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import { useApp } from "stores/app";

defineOptions({
  name: "Animes",
});

const $q = useQuasar();
const App = useApp();

const fetchAnimes = async () => {
  App.search.fetchingAnimes = true;

  if (App.search.value.trim() === "") {
    App.search.animeResults = [];
    App.search.fetchingAnimes = false;
    return;
  }

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?page=1&limit=10&q=${App.search.value}`
    );
    if (response.ok) {
      const data = await response.json();

      // if "mal_id" is repeated delete one
      const uniqueData = [];
      const seen = new Map();

      for (const item of data.data) {
        if (!seen.has(item.mal_id)) {
          seen.set(item.mal_id, true);
          uniqueData.push(item);
        }
      }

      App.search.animeResults = uniqueData;

      // Sort by timestamp
      App.search.animeResults.sort((a, b) => {
        // If true, sort descending
        if (App.search.order)
          return new Date(b.aired.from) - new Date(a.aired.from);

        return new Date(a.aired.from) - new Date(b.aired.from);
      });
    } else {
      $q.notify({
        type: "negative",
        message: "Failed to fetch animes",
      });
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "An error occurred while fetching animes",
    });
  }

  App.search.fetchingAnimes = false;
};

const stopWatchingSearch = watch(
  () => App.search.value,
  () => {
    if (App.search.value.trim() !== "") {
      if (App.search.filters.searchAnimes) fetchAnimes();
    } else {
      App.search.animeResults = [];
    }
  }
);

const stopWatchingSearchAnimes = watch(
  () => App.search.filters.searchAnimes,
  () => {
    if (App.search.filters.searchAnimes && App.search.value.trim() !== "")
      fetchAnimes();
  }
);

const stopWatchingOrder = watch(
  () => App.search.order,
  () => {
    // Sort by timestamp
    App.search.animeResults.sort((a, b) => {
      // If true, sort descending
      if (App.search.order)
        return new Date(b.aired.from) - new Date(a.aired.from);

      return new Date(a.aired.from) - new Date(b.aired.from);
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopWatchingSearch();
  stopWatchingSearchAnimes();
  stopWatchingOrder();
});
</script>
