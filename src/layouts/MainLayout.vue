<template>
  <q-layout view="lHh LpR fFf" class="non-selectable">
    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar align="center">
        <q-btn
          flat
          dense
          v-if="$router.currentRoute.value.path !== '/'"
          class="!tw-py-3 !tw-p-[12px] tw-rounded-full"
          icon="fa-light fa-chevron-left"
          @click="goBack()"
        />

        <q-toolbar-title>
          {{ $t("app_title") }}
        </q-toolbar-title>

        <q-btn
          dense
          flat
          round
          class="!tw-py-3 !tw-p-[12px] tw-rounded-full"
          icon="fa-light fa-bars"
          @click="App.drawer = !App.drawer"
        />
      </q-toolbar>

      <q-toolbar v-if="$router.currentRoute.value.path === '/'">
        <transition appear enter-active-class="animated pulse delay-1s">
          <q-input
            dense
            rounded
            standout
            :placeholder="getSearchPlaceholder()"
            class="tw-w-full tw-rounded-3xl tw-mx-2"
            input-class="tw-text-center tw-text-white"
            debounce="400"
            v-model="App.search.value"
          >
            <template #prepend>
              <q-icon color="white" name="fa-light fa-search" size="xs" />
            </template>

            <template v-if="App.search.value" v-slot:append>
              <q-icon
                name="fa-light fa-times"
                @click.stop.prevent="
                  App.search.mangaResults = [];
                  App.search.animeResults = [];
                  App.search.value = '';
                "
                class="tw-cursor-pointer tw-text-white"
              />
            </template>
          </q-input>
        </transition>
        <q-btn
          flat
          dense
          size="sm"
          style="background: rgba(0, 0, 0, 0.05)"
          class="!tw-py-3 !tw-p-[12px] tw-rounded-full"
          :icon="`fa-light fa-${
            App.search.order ? 'arrow-down-wide-short' : 'arrow-up-wide-short'
          }`"
          @click="App.search.order = !App.search.order"
        />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="App.drawer" side="left" bordered>
      <Menu />
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition appear :enter-active-class="enterAnimation">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useApp } from "stores/app";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import Menu from "components/Menu.vue";

defineOptions({
  name: "MainLayout",
});

const $router = useRouter();
const { t } = useI18n();
const $q = useQuasar();
const App = useApp();

const enterAnimation = ref("animated slideInRight");

const getSearchPlaceholder = () => {
  if (App.search.filters.searchAnimes && App.search.filters.searchMangas) {
    if (App.search.mangasFirst) {
      return t("header.search_both_reversed");
    } else {
      return t("header.search_both");
    }
  }

  if (App.search.filters.searchMangas) {
    return t("header.search_mangas");
  }

  if (App.search.filters.searchAnimes) {
    return t("header.search_animes");
  }
};

const goBack = () => {
  enterAnimation.value = "animated slideInLeft";
  const currentPath = $router.currentRoute.value.path;

  if (currentPath != "/") $router.push("/");

  setTimeout(() => {
    enterAnimation.value = "animated slideInRight";
  }, 350);
};
</script>
