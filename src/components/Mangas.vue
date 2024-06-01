<template>
  <q-list
    v-if="App.search.filters.searchMangas"
    :class="`
          ${App.search.filters.searchMangas ? 'md:tw-w-1/2' : 'tw-w-full'}
          ${Api.fetching.manga && '!tw-flex !tw-justify-center'}
          `"
  >
    <!-- Results -->
    <template
      v-if="
        !Api.fetching.manga &&
        App.search.results.manga.slice(0, App.search.limit).length &&
        App.search.value.trim() !== ''
      "
    >
      <q-item-label
        header
        class="tw-text-center tw-text-2xl tw-border-t tw-border-gray-300"
      >
        {{ $t("discover.manga") }}
      </q-item-label>

      <q-item
        v-for="result in App.search.results.manga.slice(0, App.search.limit)"
        :key="result?.mal_id"
        :to="'manga/' + result?.mal_id"
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
            {{ result?.published.prop.from.year || "TBD" }}
            -
            {{ result?.published.prop.to.year || "TBD" }}
          </span>
        </div>
      </q-item>
    </template>

    <!-- No results -->
    <div
      v-else-if="!Api.fetching.manga && App.search.value.trim() !== ''"
      class="tw-h-full tw-flex tw-items-center tw-justify-center tw-my-10"
    >
      <h1 class="tw-text-2xl tw-text-center tw-text-slate-800 tw-font-bold">
        {{ $t("discover.no_manga_results") }}
      </h1>
    </div>
  </q-list>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";
import { useApp, useApi } from "stores/stores";
import { search } from "../utils/idb";

defineOptions({
  name: "Mangas",
});

const App = useApp();
const Api = useApi();

const fetchMangas = async () => {
  if (App.search.value.trim() === "") {
    App.search.results.manga = [];
    return;
  }

  await Api.search("manga", { q: App.search.value, page: 1, limit: 10 });

  App.search.results.manga = await search("manga", App.search.value);

  App.sort("manga");
};

const stopWatchingSearch = watch(
  () => App.search.value,
  () => {
    if (App.search.value.trim() !== "") {
      if (App.search.filters.searchMangas) fetchMangas();
    } else {
      App.search.results.manga = [];
    }
  }
);

const stopWatchingSearchMangasFilter = watch(
  () => App.search.filters.searchMangas,
  () => {
    if (App.search.filters.searchMangas && App.search.value.trim() !== "")
      fetchMangas();
  }
);

const stopWatchingOrder = watch(
  () => App.search.order,
  () => {
    App.sort("manga");
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopWatchingSearch();
  stopWatchingSearchMangasFilter();
  stopWatchingOrder();
});
</script>
