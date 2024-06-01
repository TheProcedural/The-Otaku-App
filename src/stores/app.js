import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useApp = defineStore("counter", {
  state: () => ({
    // App
    drawer: false,
    // i18n
    locale: {
      appLocaleOptions: [
        { value: "en-GB", label: "🇬🇧 English" },
        { value: "es-ES", label: "🇪🇸 Español" },
        { value: "fr-FR", label: "🇫🇷 Français" },
        { value: "it-IT", label: "🇮🇹 Italiano" },
        { value: "ro-RO", label: "🇷🇴 Română" },
      ],
      itemsLocaleOptions: [
        { value: "english", label: "🇬🇧 English" },
        { value: "romaji", label: "🇯🇵 Romaji" },
        { value: "japanese", label: "🇯🇵 日本語" },
      ],
      appLanguage: useStorage("language", "en-GB"),
      itemsLanguage: useStorage("itemsLanguage", "english"),
    },
    // Search & filters
    search: useStorage("search", {
      value: "",
      limit: 10,
      order: true,
      mangasFirst: false,
      results: {
        anime: [],
        manga: [],
      },
      filters: {
        showUnrated: true,
        searchMangas: true,
        searchAnimes: true,
      },
    }),
  }),

  actions: {
    delay(ms) {
      new Promise((resolve) => setTimeout(resolve, ms));
    },
    getTitle(english, romaji, japanese) {
      let title = "Title not found";

      if (this.locale.itemsLanguage === "english" && english) {
        return english;
      } else if (this.locale.itemsLanguage === "romaji" && romaji) {
        return romaji;
      } else if (this.locale.itemsLanguage === "japanese" && japanese) {
        return japanese;
      }

      if (english) {
        return english;
      } else if (romaji) {
        return romaji;
      } else if (japanese) {
        return japanese;
      }

      return title;
    },
    sort(type) {
      const sortBy = type === "anime" ? "aired" : "published";
      this.search.results[type].sort((a, b) => {
        if (this.search.order)
          return new Date(b[sortBy].from) - new Date(a[sortBy].from);

        return new Date(a[sortBy].from) - new Date(b[sortBy].from);
      });
    },
  },
});
