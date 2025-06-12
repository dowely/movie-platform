import "./styles/index.scss";
import { createApp } from "vue";

if (module.hot) {
  module.hot.accept();
}

if (document.querySelector("#login-app")) {
  import(
    /* webpackChunkName: "login" */ "./modules/login/login.component.vue"
  ).then((module) => {
    createApp(module.default).mount("#login-app");
  });
}
