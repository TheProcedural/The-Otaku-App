<template>
  <div
    class="tw-flex tw-justify-center tw-items-center tw-gap-6 tw-py-2 tw-border-b tw-border-gray-300"
  >
    <q-img :src="logo" class="tw-w-12" />
    <h1 class="tw-text-2xl tw-text-center tw-text-slate-800 tw-font-bold">
      {{ $t("app_title") }}
    </h1>
  </div>

  <!-- <q-separator class="tw-my-4" /> -->

  <q-list class="tw-p-0">
    <q-item-label header>{{ $t("sidebar.languages") }}</q-item-label>
    <q-item>
      <q-item-section class="tw-w-full">
        <q-item-label caption>{{ $t("sidebar.app_language") }}</q-item-label>
        <q-select
          v-model="App.locale.appLanguage"
          :options="App.locale.appLocaleOptions"
          input-debounce="0"
          dense
          rounded
          standout
          emit-value
          map-options
          options-dense
          hide-dropdown-icon
          class="tw-mt-2"
        >
          <template v-slot:selected>
            <span class="">{{
              App.locale.appLocaleOptions.filter(
                (v) => v.value === App.locale.appLanguage
              )[0].label
            }}</span>
          </template>

          <!-- replace with your icon -->
          <template v-slot:append>
            <q-icon name="fa-light fa-sort" size="xs" class="" />
          </template>
        </q-select>
      </q-item-section>
    </q-item>

    <q-item>
      <q-item-section class="tw-w-full">
        <q-item-label caption>{{ $t("sidebar.titles_language") }}</q-item-label>
        <q-select
          v-model="App.locale.itemsLanguage"
          :options="App.locale.itemsLocaleOptions"
          input-debounce="0"
          dense
          rounded
          standout
          emit-value
          map-options
          options-dense
          hide-dropdown-icon
          class="tw-mt-2"
        >
          <template v-slot:selected>
            <span class="">{{
              App.locale.itemsLocaleOptions.filter(
                (v) => v.value === App.locale.itemsLanguage
              )[0].label
            }}</span>
          </template>

          <!-- replace with your icon -->
          <template v-slot:append>
            <q-icon name="fa-light fa-sort" size="xs" class="" />
          </template>
        </q-select>
      </q-item-section>
    </q-item>

    <q-item-label header>{{ $t("sidebar.filters") }}</q-item-label>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>
          {{
            App.search.mangasFirst
              ? $t("sidebar.mangas_first")
              : $t("sidebar.animes_first")
          }}
        </q-item-label>
        <q-item-label caption>
          {{ $t("sidebar.mangas_first_description") }}</q-item-label
        >
      </q-item-section>
      <q-item-section side top>
        <q-toggle
          v-model="App.search.mangasFirst"
          :disable="
            !App.search.filters.searchMangas || !App.search.filters.searchAnimes
          "
        />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>{{ $t("sidebar.search_anime") }}</q-item-label>
        <q-item-label caption>
          {{ $t("sidebar.search_anime_description") }}</q-item-label
        >
      </q-item-section>
      <q-item-section side top>
        <q-checkbox
          v-model="App.search.filters.searchAnimes"
          :disable="!App.search.filters.searchMangas"
        />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>{{ $t("sidebar.search_mangas") }}</q-item-label>
        <q-item-label caption>
          {{ $t("sidebar.search_mangas_description") }}</q-item-label
        >
      </q-item-section>
      <q-item-section side>
        <q-checkbox
          v-model="App.search.filters.searchMangas"
          :disable="!App.search.filters.searchAnimes"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useApp } from "stores/app";
import logo from "assets/logo.svg";

defineOptions({
  name: "Menu",
});

const $q = useQuasar();
const App = useApp();

const { locale } = useI18n({ useScope: "global" });
locale.value = App.locale.appLanguage || $q.lang.getLocale() || "en-GB";

const stopWatchingLanguage = watch(
  () => App.locale.appLanguage,
  (value) => {
    locale.value = value;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopWatchingLanguage();
});
</script>
