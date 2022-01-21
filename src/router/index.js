import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/add/",
    name: "item_add",
    component: () =>
        import(/* webpackChunkName: "item" */ "../views/ItemEdit.vue"),
  },
  {
    path: "/edit/:id",
    name: "item_edit",
    component: () =>
        import(/* webpackChunkName: "item" */ "../views/ItemEdit.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
