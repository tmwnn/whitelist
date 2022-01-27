<template>
    <div class="q-pa-md ">

      <div class="row q-mb-md">
        <div class="col q-mr-md">
          <q-input
              label="Название"
              v-model.trim="filterName"
          />
        </div>
        <div class="col q-mr-md">
          <!--
          <q-input
              label="Категория"
              v-model.trim="filterCategory"
          />
          -->
          <q-select
              label="Категория"
              v-model="filterCategory"
              use-input
              input-debounce="0"
              :options="catOptions"
              @filter="filterCat"
          />
        </div>

        <div class="col q-mr-md">

          <q-range
              class="q-mt-md"
              v-model="filterRating"
              color="teal"
              :left-thumb-color="filterRating.min === 0 ? 'grey' : 'teal'"
              :right-thumb-color="filterRating.max === 5 ? 'black' : 'teal'"
              snap
              :min="0"
              :max="5"
              :step="0.5"
              marker-labels
              label-always
          >
            <template v-slot:marker-label-group="{ markerMap }">
              <div
                  class="row items-center no-wrap"
                  :class="markerMap[filterRating.min].classes"
                  :style="markerMap[filterRating.min].style"
              >
                <q-icon
                    v-if="filterRating.min === 0"
                    size="xs"
                    color="teal"
                    name="star_outline"
                />

                <template v-else>
                  <q-icon
                      v-for="i in Math.floor(filterRating.min)"
                      :key="i"
                      size="xs"
                      color="teal"
                      name="star_rate"
                  />

                  <q-icon
                      v-if="filterRating.min > Math.floor(filterRating.min)"
                      size="xs"
                      color="teal"
                      name="star_half"
                  />
                </template>
              </div>

              <div
                  class="row items-center no-wrap"
                  :class="markerMap[filterRating.max].classes"
                  :style="markerMap[filterRating.max].style"
              >
                <q-icon
                    v-for="i in Math.floor(filterRating.max)"
                    :key="i"
                    size="xs"
                    color="teal"
                    name="star_rate"
                />

                <q-icon
                    v-if="filterRating.max > Math.floor(filterRating.max)"
                    size="xs"
                    color="teal"
                    name="star_half"
                />
              </div>
            </template>
          </q-range>
          <q-badge color="secondary">
            Рейтинг (от 0 до 5)
          </q-badge>
        </div>
        <div class="col q-mr-md q-ml-md desktop-only" v-if="userId">
          <q-btn push color="primary" title="Добавить" round icon="add" @click="$router.replace(`/add/`)" />
        </div>
      </div>

      <div class="row q-mb-sm">
        <div class="col">
          <q-btn-group push >
            <q-btn push label="Комбо" @click="viewType = 0" class="desktop-only"/>
            <q-btn push label="Список" @click="viewType = 1" icon="list" />
            <q-btn push label="Карта" @click="viewType = 2" icon="map" />
          </q-btn-group>
        </div>
      </div>

      <div class="row">
        <div class="col" v-if="!viewType || viewType == 1">

          <q-list style="height: 76vh; overflow-y: scroll;">

              <q-item v-for="(item,index) in filtredItems" :key="index">
                <q-item-section>
                  <q-item-label><a :href="`/item/${item.id}/`" class="text-weight-bold">{{ item.name }}</a></q-item-label>
                  <q-item-label>{{ item.category }}</q-item-label>
                  <q-item-label caption>{{ item.location }}</q-item-label>
                  <q-item-label caption v-if="item.url">
                    <a :href="item.url" target="_blank" >{{ item.url }}</a>
                  </q-item-label>
                  <q-item-label caption :style="'color:green'">Модератор: <a :href="`mailto:${item.uid}`">{{item.uid}}</a></q-item-label>
                </q-item-section>

                <q-item-section side top>
                  <q-item-label caption>{{ getDate(item.created_at) }}</q-item-label>
                  <rating :rating="+item.rating"></rating>
                  <q-item-label v-if="userId && item.uid === userEmail">
                    <q-btn icon="edit" size="xs"  @click="$router.replace(`/edit/${item.id}/`)"></q-btn>
                    <q-btn icon="delete" size="xs" @click="delPlace(item.id)" class="q-ml-sm"></q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>

          </q-list>


        </div>
        <div class="col" v-if="!viewType || viewType == 2">

          <yandex-map :settings="settings"
                      :coords="coords"
                      :style="'width: 100%;height: ' + (isMobile ? '66' : '76') + 'vh;'"
                      zoom="15"
                      v-if="coords.length"
                      @boundschange="boundsChange"
          >
            <ymap-marker
                         :coords="coords"
                         marker-id="my"
                         :icon = "{
                            layout: 'default#imageWithContent',
                            imageHref: '/img/location.png',
                            imageSize: [24, 24],
                            imageOffset: [0, 0],
                         }"
                         marker-type="placemark"
                         hint-content="Ваше местоположение"
            />
            <template v-for="item in filtredItems" >
              <ymap-marker v-if="!!item.coords"
                           :key="item.id"
                           :coords="item.coords"
                           :marker-id="item.id"
                           :balloon-template="`<b><a href='/item/${item.id}/'>${item.name}</a> ` + mapRating(item.rating) + `</b><br/><i>${item.category}</i><br/>${item.location}`"
                           :hint-content="`<b>${item.name} `  + mapRating(item.rating) + `</b> <br/><i>${item.category}</i><br/> ${item.location}`"
              />
            </template>
          </yandex-map>
        </div>
      </div>
    </div>

</template>

<style>
</style>

<script>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar'

import store from '../store/index';
import { yandexMap, ymapMarker,} from 'vue-yandex-maps'
import {settings, selectCity, getGeoLocation} from "../hooks/ymap";
import {getItems, deleteItem, getCategories} from '../hooks/db';
import Rating from "../components/Rating";
import moment from 'moment';

export default {
  name: 'Home',
  store,
  components: { yandexMap, ymapMarker, Rating },
  setup() {
    const $q = useQuasar();
    let defaultView = 0;
    let isMobile = 0;
    if( screen.width <= 760 ) {
      defaultView = 2;
      isMobile = 1;
    }
    let viewType = ref(defaultView);
    let items = ref([]);
    let categories = [];
    let filterName = ref('');
    let filterCategory = ref('');
    let filterRating = ref({min: 0, max: 5});
    let coords = ref([]);
    let mapBounds = ref([]);

    const loadItems = async () => {
      items.value = await getItems();
    }
    (async () => {
      await loadItems();
      categories = await getCategories();
      coords.value = await getGeoLocation();
    })();

    const filtredItems = computed(() => {
      return items.value.filter((item) => {
        let checkName = !filterName.value || !item.name || item.name.toLowerCase().includes(filterName.value.toLowerCase());
        let checkCategory = !filterCategory.value || !item.category || item.category.toLowerCase().includes(filterCategory.value.toLowerCase());
        let checkRating = true;
        if (filterRating.value.min > 0 || filterRating.value.max < 5) {
          let itemRating = typeof (item.rating) !== 'undefined' ? item.rating : 0;
          checkRating = itemRating >= filterRating.value.min && itemRating <= filterRating.value.max;
        }
        let checkBounds = true;
        if (mapBounds.value.length) {
          if (item.coords[0] < mapBounds.value[0][0] || item.coords[0] > mapBounds.value[1][0]) {
            checkBounds = false;
          }
          if (item.coords[1] < mapBounds.value[0][1] || item.coords[1] > mapBounds.value[1][1]) {
            checkBounds = false;
          }
        }
        return checkName && checkCategory && checkRating && checkBounds;
      });
    })

    const delPlace = async (placeId) => {
      await deleteItem(placeId);
      await loadItems();
      $q.notify({message: 'Удаление прошло успешно', color: 'green' });
    }

    const coordsItems = computed(() => {
      let coordsItems = [];
      filtredItems.value.forEach((item) => {
        if (item.coords) {
          item.coordsArr = [item.coords.split(' ')[1], item.coords.split(' ')[0]];
          coordsItems.push(item);
        }
      });
      return coordsItems;
    });

    const getDate = (ts) => {
      return ts ? moment(ts).format('DD.MM.YYYY HH:mm') : '';
    }

    const mapRating = (rating) => {
      let ratingHtml = '';
      if (rating) {
        ratingHtml = `<span style='color:orange'>${rating}</span>`
      }
      return ratingHtml;
    }
    const boundsChange = (map) => {
      mapBounds.value = typeof map.originalEvent.newBounds != 'undefined' ? map.originalEvent.newBounds : [];
    }

    const catOptions = ref(categories);

    const filterCat = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        catOptions.value = categories.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    }

    return {
      items,
      delPlace,
      settings,
      coords,
      coordsItems,
      filterName,
      filterCategory,
      filterRating,
      filtredItems,
      selectCity,
      getDate,
      mapRating,
      viewType,
      isMobile,
      mapBounds,
      boundsChange,
      categories,
      catOptions,
      filterCat,
    }
  },
  computed: {
    userId() {
      return this.$store.getters.userId;
    },
    userEmail() {
      return this.$store.getters.userEmail;
    },
  }
}
</script>
