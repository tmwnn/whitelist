<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        />

        <q-toolbar-title>
          White List
        </q-toolbar-title>
        <q-tabs align="left" shrink>
          <q-route-tab :to="{ name: 'home'}"  label="Главная" />
        </q-tabs>
        <div>
          <!--Quasar v{{ $q.version }}-->
          <template v-if="userId">
            {{ userName }}
            <q-btn @click="logout" title="Выйти">
              <q-icon name="logout"/>
            </q-btn>
          </template>
          <template v-else>
            <q-btn @click="login" >
              <q-icon name="login" title="Войти"/>
            </q-btn>
          </template>

        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged} from "firebase/auth";
import { useQuasar } from 'quasar'
import store from './store/index';
export default {
  name: 'LayoutDefault',
  store,
  setup () {
    const $q = useQuasar();

    (async () => {
      await onAuthStateChanged(getAuth(), user => {
        store.commit("setUser", user);
      });
    })();
    const auth = getAuth();
    const login = () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
          .then(() => {
            $q.notify({message: 'Вы успешно вошли в систему', color: 'green'});
            //this.$router.push('/home')
          })
          .catch((error) => {
            $q.notify({message: 'Возникла ошибка при входе в систему: '  + error, color: 'red'});
            console.log('error', error);
          });
    };
    const logout = () => {
      signOut(auth)
          .then(() => {
            $q.notify({message: 'Вы разлогинились'});
            //this.$router.push('/home')
          });
    };
    return {
      login,
      logout,
      leftDrawerOpen: ref(false)
    }
  },
  computed: {
    userName() {
      return this.$store.getters.userName;
    },
    userId() {
      return this.$store.getters.userId;
    }
  }
}
</script>
