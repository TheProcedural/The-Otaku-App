import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useApp = defineStore("counter", {
  state: () => ({
    // App
    drawer: false,
    // i18n
    locale: {
      appLanguage: useStorage("language", "en-GB"),
      appLocaleOptions: useStorage("localeOptions", [
        { value: "en-GB", label: "🇬🇧 English" },
        { value: "es-ES", label: "🇪🇸 Español" },
        { value: "fr-FR", label: "🇫🇷 Français" },
        { value: "it-IT", label: "🇮🇹 Italiano" },
        { value: "ro-RO", label: "🇷🇴 Română" },
      ]),
      itemsLanguage: useStorage("itemsLanguage", "english"),
      itemsLocaleOptions: useStorage("itemsLocaleOptions", [
        { value: "english", label: "🇬🇧 English" },
        { value: "romaji", label: "🇯🇵 Romaji" },
        { value: "japanese", label: "🇯🇵 日本語" },
      ]),
    },
    // Search & filters
    search: useStorage("search", {
      value: "",
      animeResults: [],
      fetchingMangas: false,
      mangaResults: [],
      fetchingAnimes: false,
      order: true,
      mangasFirst: false,
      filters: {
        searchMangas: true,
        searchAnimes: true,
      },
    }),
  }),

  getters: {},

  actions: {
    getTitle(english, romaji, japanese) {
      let title = "Title not found";

      if (this.locale.itemsLanguage === "english" && english) {
        return english;
      } else if (this.locale.itemsLanguage === "romaji" && romaji) {
        return romaji;
      } else if (this.locale.itemsLanguage === "japanese" && japanese) {
        return japanese;
      }

      // Fallback options if the preferred language is not available
      if (english) {
        return english;
      } else if (romaji) {
        return romaji;
      } else if (japanese) {
        return japanese;
      }

      return title;
    },
  },
});
