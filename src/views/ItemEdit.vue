<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-pa-md">

        <q-form
            @submit="save"
            @reset="exitToHome"
            class="q-gutter-md"
        >
          <q-input
              filled
              v-model.trim="item.category"
              label="Категория"
          />
          <q-input
              filled
              v-model.trim="item.name"
              label="Наименование"
          />
          <q-input
              filled
              v-model.trim="item.location"
              label="Адрес"
          />

          <q-input
              filled
              v-model="item.description"
              type="textarea"
              label="Описание"
          />

          <div>
            <q-btn label="Сохранить" type="submit" color="primary"/>
            <q-btn label="Отмена" type="reset" color="primary" flat class="q-ml-sm"/>
            <q-btn label="Показать на карте" type="button" @click="locate()" flat сlass="q-ml-sm"/>
          </div>
        </q-form>
      </div>
      <div class="col">
        <yandex-map :settings="settings"  :coords="item.coords" style="width: 100%;height: 88vh;" zoom="15">
          <ymap-marker v-if="!!item.coords"
                       :key="item.id"
                       :coords="item.coords"
                       :marker-id="item.id"
                       :balloon-template="`<b>${item.name}</b> <br/> ${item.location}`"
                       :hint-content="`<b>${item.name}</b> <br/> ${item.location}`"
          />
        </yandex-map>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import {ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '../store/index';
import { yandexMap, ymapMarker,} from 'vue-yandex-maps'
import {getItem, saveItem} from '../hooks/db';
import MD5 from "crypto-js/md5";
import {getGeoCode, selectCity, settings} from "../hooks/ymap";
import { useQuasar } from 'quasar'

export default {
  name: 'ItemEdit',
  components: { yandexMap, ymapMarker },
  store,
  setup () {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const id = ref(route.params.id);
    let item = ref({
      id:'',
      category: '',
      name: '',
      description: '',
      location: selectCity + ', ',
      coords: [],
      uid: '',
      created_at: '',
    });
    (async () => {
      if (id.value) {
        item.value = await getItem(id.value);
      }
    })();

    const exitToHome = () => {
      router.push({name: 'home'});
    }

    const save = async () => {
      if (!store.getters.userId) {
        $q.notify({message: 'Необходимо авторизоваться!', color: 'red' });
        return;
      }
      if (!item.value.id) {
        item.value.id = MD5(item.value.name + item.value.location).toString();
        item.value.created_at = new Date().getTime();
      }
      item.value.coords = await getGeoCode(item.value.location);
      item.value.uid = store.getters.userEmail;
      await saveItem(item.value);
      exitToHome();
    }
    const locate = async () => {
      item.value.coords = await getGeoCode(item.value.location);
    }
    /*
    if (!store.getters.userId) {
      $q.notify({message: 'Необходимо авторизоваться!', color: 'red' });
      exitToHome();
    }
    */
    return {
      id,
      item,
      save,
      locate,
      exitToHome,
      settings,
    }
  },
}
</script>
