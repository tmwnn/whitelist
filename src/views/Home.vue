<template>
    <div class="q-pa-md ">

      <div class="row">
        <div class="col">

          <div class="row">

            <div class="col q-mr-md">
              <q-input
                  label="Поиск по названию"
                  v-model.trim="filterName"
              />
            </div>
            <div class="col q-mr-md">
              <q-input
                  label="Поиск по категории"
                  v-model.trim="filterCategory"
              />
            </div>
            <div class="col q-mr-md" v-if="userId">
              <q-btn icon="add" @click="$router.replace(`/add/`)">Добавить</q-btn>
            </div>
          </div>


          <q-list style="height: 80vh; overflow-y: scroll;">

              <q-item v-for="(item,index) in filtredItems" :key="index">
                <q-item-section>
                  <q-item-label><a :href="`/item/${item.id}/`" class="text-weight-bold">{{ item.name }}</a></q-item-label>
                  <q-item-label>{{ item.category }}</q-item-label>
                  <q-item-label caption>{{ item.location }}</q-item-label>
                  <q-item-label caption :style="'color:green'">{{ item.uid }}</q-item-label>
                  <q-item-label caption>{{ item.coords }}</q-item-label>
                </q-item-section>

                <q-item-section side top>
                  <q-item-label caption>{{ getDate(item.created_at) }}</q-item-label>
                  <div class="text-orange">
                    <q-icon name="star" />
                    <q-icon name="star" />
                    <q-icon name="star" />
                  </div>
                  <q-item-label v-if="userId">
                    <q-btn icon="edit" size="xs"  @click="$router.replace(`/edit/${item.id}/`)"></q-btn>
                    <q-btn icon="delete" size="xs" @click="delPlace(item.id)"></q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>

          </q-list>


        </div>
        <div class="col">

          <yandex-map :settings="settings"  :coords="coords" style="width: 100%;height: 88vh;" zoom="11">
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
            <template v-for="item in filtredItems" :key="item.id" >
              <ymap-marker v-if="!!item.coords"
                           :key="item.id"
                           :coords="item.coords"
                           :marker-id="item.id"
                           :balloon-template="`<b>${item.name}</b> <br/> ${item.location}`"
                           :hint-content="`<b>${item.name}</b> <br/> ${item.location}`"
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
import {settings, selectCity, getGeoCode, getGeoLocation} from "../hooks/ymap";
import {getItems, saveItem, deleteItem} from '../hooks/db';
import MD5 from "crypto-js/md5";
import moment from 'moment';

export default {
  name: 'Home',
  store,
  components: { yandexMap, ymapMarker },
  setup() {
    const $q = useQuasar();

    let newPlace = ref({
      id:'',
      category: '',
      name: '',
      location: '',
      coords: [],
      uid: '',
      created_at: '',
    });
    let items = ref([]);
    let filterName = ref('');
    let filterCategory = ref('');
    let coords = ref([60,30]);

    const loadItems = async () => {
      items.value = [];

      let itemsLoaded = await getItems();

      itemsLoaded.forEach((doc) => {
          items.value.push({ id: doc.id, ...doc.data() });
      });
    }
    (async () => {
      await loadItems();
      coords.value = await getGeoLocation();
      newPlace.value.location = `${selectCity}, `;
    })();

    const filtredItems = computed(() => {
      return items.value.filter((item) => {
        let checkName = !filterName.value || !item.name || item.name.toLowerCase().includes(filterName.value.toLowerCase());
        let checkCategory = !filterCategory.value || !item.category || item.category.toLowerCase().includes(filterCategory.value.toLowerCase());
        return checkName && checkCategory;
      });
    })

    const addPlace = async () => {
      if (!store.getters.userId) {
        $q.notify({message: 'Необходимо авторизоваться!', color: 'red' });
        return;
      }
      newPlace.value.id = MD5(newPlace.value.name + newPlace.value.location).toString();
      newPlace.value.uid = store.getters.userEmail;
      newPlace.value.coords = await getGeoCode(newPlace.value.location);
      newPlace.value.created_at = new Date().getTime();
      await saveItem(newPlace.value);
      await loadItems();
    }

    const delPlace = async (placeId) => {
      await deleteItem(placeId);
      await loadItems();
    }

    const test = async () => {
      console.log('test');
    };

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

    return {
      items,
      addPlace,
      newPlace,
      delPlace,
      test,
      settings,
      coords,
      coordsItems,
      filterName,
      filterCategory,
      filtredItems,
      selectCity,
      getDate,
    }
  },
  computed: {
    userId() {
      return this.$store.getters.userId;
    }
  }
}
</script>
