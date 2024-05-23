import { boot } from "quasar/wrappers";
// required
import "@fortawesome/fontawesome-pro/css/fontawesome.css";
import "@fortawesome/fontawesome-pro/css/light.css";

import "@fortawesome/fontawesome-pro/css/brands.css";

// import "@fortawesome/fontawesome-pro/css/thin.css";
// import "@fortawesome/fontawesome-pro/css/solid.css";
// import "@fortawesome/fontawesome-pro/css/regular.css";
// import "@fortawesome/fontawesome-pro/css/duotone.css";

// import "@fortawesome/fontawesome-pro/css/sharp-light.css";
// import "@fortawesome/fontawesome-pro/css/sharp-thin.css";
// import "@fortawesome/fontawesome-pro/css/sharp-solid.css";
// import "@fortawesome/fontawesome-pro/css/sharp-regular.css";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.config.globalProperties.$q.iconSet.chip.remove = "fas fa-times-circle";
  app.config.globalProperties.$q.iconSet.chip.add = "fas fa-plus-circle";
});
