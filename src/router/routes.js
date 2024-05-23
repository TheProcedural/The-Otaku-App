const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },
  {
    path: "/library",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Library.vue") }],
  },
  {
    path: "/anime/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Anime.vue") }],
  },
  {
    path: "/manga/:id",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Manga.vue") }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
