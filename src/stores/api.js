import { defineStore } from "pinia";
import axios from "axios";
import { addItems, addRelations, addEpisodes } from "../utils/idb";

const API_BASE_URL = "https://api.jikan.moe/v4";

export const useApi = defineStore("api", {
  state: () => ({
    fetching: {
      anime: false,
      manga: false,
      relations: {
        anime: false,
        manga: false,
      },
      episodes: false,
    },
    error: {
      anime: false,
      manga: false,
      relations: {
        anime: false,
        manga: false,
      },
      episodes: false,
    },
  }),
  actions: {
    delay(ms) {
      new Promise((resolve) => setTimeout(resolve, ms));
    },
    async search(type, query) {
      this.fetching[type] = true;
      this.error[type] = null;
      try {
        const response = await axios.get(`${API_BASE_URL}/${type}`, {
          params: query,
        });

        // remove duplicates due to a bug in jikan
        const data = response.data.data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.mal_id === item.mal_id)
        );

        addItems(type, data);
      } catch (error) {
        this.error[type] = error;
      } finally {
        this.fetching[type] = false;
      }
    },
    async fetchRelationsById(type, id) {
      this.fetching.relations[type] = true;
      this.error.relations[type] = null;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/${type}/${id}/relations`
        );

        addRelations(type, id, response.data.data);
      } catch (error) {
        this.error.relations[type] = error;
      } finally {
        this.fetching.relations[type] = false;
      }
    },
    async fetchById(type, id, full) {
      this.fetching[type] = true;
      this.error[type] = null;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/${type}/${id}${full ? "/full" : ""}`
        );
        addItems(type, [response.data.data]);
      } catch (error) {
        this.error[type] = error;
      } finally {
        this.fetching[type] = false;
      }
    },

    // Anime specific
    async fetchEpisodesById(id) {
      this.fetching.episodes = true;
      this.error.episodes = null;

      try {
        let page = 1;
        let hasNextPage = true;

        let data = [];

        while (hasNextPage) {
          const response = await axios.get(
            `${API_BASE_URL}/anime/${id}/episodes?page=${page}`
          );

          data = data.concat(response.data.data);

          hasNextPage = response.data.pagination.has_next_page;
          page++;

          console.log(hasNextPage);
          console.log(page);
          this.delay(1000);
        }

        const result = addEpisodes(id, data);

        // If 404 then fetchById and retry
        if (result === 404) {
          this.delay(300);
          await this.fetchById("anime", id, true);

          this.delay(400);
          await this.fetchEpisodesById(id);
          return;
        }
      } catch (error) {
        this.error.episodes = error;
      } finally {
        this.fetching.episodes = false;
      }
    },
  },
});
