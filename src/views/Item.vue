<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-pa-md" style="height: 88vh; overflow-y: scroll;" v-show="!showMap">
        <q-btn @click="exitToHome" icon="arrow_back">Вернуться к списку</q-btn>
        <div class="text-h4 q-mt-md">{{ item.name }}</div>
        <rating :rating="+item.rating"></rating>

        <div class="text-subtitle1 desktop-only">{{ item.location }}</div>
        <div class="text-subtitle1 mobile-only"><a href="#" @click="showMap = 1;">{{ item.location }}</a></div>

        <div class="text-subtitle1" v-if="item.url">
          <a :href="item.url" target="_blank" >{{ item.url }}</a>
        </div>

        <div class="text-subtitle2"><i>Категория: {{ item.category }}</i></div>
        <div class="text-body1">{{ item.description }}</div>

        <q-separator class="q-mt-md q-mb-md" />
        <div class="text-subtitle2">Отзывы:</div>
        <q-form
            @submit="saveRev"
            @reset="clearRev"
            class="q-gutter-md q-mb-md"
        >
          <q-input
              filled
              v-model.trim="newReview.text"
              type="textarea"
              label="Текст отзыва"
          />

          <div>
            <span class="q-mr-sm">Выберите рейтинг:</span>
            <span class="text-orange">
              <q-icon :name="newReview.rating > 0 ? 'star' : 'star_border'" @click="newReview.rating = 1"/>
              <q-icon :name="newReview.rating > 1 ? 'star' : 'star_border'" @click="newReview.rating = 2"/>
              <q-icon :name="newReview.rating > 2 ? 'star' : 'star_border'" @click="newReview.rating = 3"/>
              <q-icon :name="newReview.rating > 3 ? 'star' : 'star_border'" @click="newReview.rating = 4"/>
              <q-icon :name="newReview.rating > 4 ? 'star' : 'star_border'" @click="newReview.rating = 5"/>
            </span>

            <q-btn @click="newReview.rating -= (newReview.rating >= 0 ? 1 : 0);" push round size="xs" class="q-ml-md" icon="remove" />
            <q-btn @click="newReview.rating += (newReview.rating <= 5 ? 1 : 0);" push round size="xs" class="q-ml-md" icon="add" />

          </div>

          <div>
            <q-btn label="Добавить" type="submit" color="primary"/>
            <q-btn label="Очистить" type="reset" color="primary" flat class="q-ml-sm"/>
          </div>
        </q-form>

        <q-list>
          <template v-for="(review,index) in reviews" :key="index">
            <q-separator />
            <q-item >
              <q-item-section>
                <q-item-label>{{ review.text }}</q-item-label>
                <q-item-label caption><a :href="`mailto:${review.uid}`" style="color:green">{{review.uid}}</a></q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption>{{ getDate(review.created_at) }}</q-item-label>
                <rating :rating="+review.rating"></rating>
                <q-item-label v-if="userId && review.uid === userEmail">
                  <q-btn icon="delete" size="xs" @click="delRev(review.id)"></q-btn>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>

        </q-list>

      </div>
      <div class="col" :class="{'desktop-only': !showMap}">
        <q-btn @click="showMap = 0" icon="arrow_back" v-if="showMap" class="q-mb-md">К описанию</q-btn>
        <yandex-map :settings="settings"
                    :coords="item.coords"
                    :style="'width: 100%;height: ' + (showMap ? '78' : '88' )+ 'vh;'"
                    zoom="15"
        >
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
import {getItem, getReviews, saveReview, deleteReview} from '../hooks/db';
import MD5 from "crypto-js/md5";
import {selectCity, settings} from "../hooks/ymap";
import Rating from "../components/Rating";
import { useQuasar } from 'quasar'
import moment from "moment";

export default {
  name: 'ItemEdit',
  components: { yandexMap, ymapMarker, Rating },
  store,
  setup () {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const id = ref(route.params.id);
    const showMap = ref(0);
    let item = ref({
      id:'',
      category: '',
      name: '',
      description: '',
      rating: '',
      location: selectCity + ', ',
      url: '',
      coords: [],
      uid: '',
      created_at: '',
    });

    let newReview = ref({
      id: '',
      item_id: id.value,
      text: '',
      rating: 4,
      uid: '',
      created_at: '',
    });


    let reviews = ref([]);
    (async () => {
      if (id.value) {
        item.value = await getItem(id.value);
        reviews.value = await getReviews(id.value);
      }
    })();

    const exitToHome = () => {
      router.push({name: 'home'});
    }

    const saveRev = async () => {
      if (!store.getters.userId) {
        $q.notify({message: 'Необходимо авторизоваться!', color: 'red' });
        return;
      }
      newReview.value.id = MD5(newReview.value.item_id + newReview.value.text).toString();
      newReview.value.created_at = new Date().getTime();
      newReview.value.uid = store.getters.userEmail;
      await saveReview(newReview.value);
      reviews.value = await getReviews(item.value.id);
      item.value = await getItem(item.value.id);
      $q.notify({message: 'Отзыв добавлен', color: 'green' });
      clearRev();
    }

    const delRev = async (reviewId) => {
      await deleteReview(reviewId);
      reviews.value = await getReviews(item.value.id);
      item.value = await getItem(item.value.id);
      $q.notify({message: 'Отзыв удален', color: 'green' });
    }

    const clearRev = () => {
      newReview.value = {
        id: '',
        item_id: id.value,
        text: '',
        rating: 4,
        uid: '',
        created_at: '',
      };
    }

    const getDate = (ts) => {
      return ts ? moment(ts).format('DD.MM.YYYY HH:mm') : '';
    }

    return {
      id,
      item,
      reviews,
      newReview,
      saveRev,
      delRev,
      clearRev,
      exitToHome,
      settings,
      getDate,
      showMap,
    }
  },
  computed: {
    userId() {
      return this.$store.getters.userId;
    },
    userEmail() {
      return this.$store.getters.userEmail;
    }
  }
}
</script>
