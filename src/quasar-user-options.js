
import './styles/quasar.sass'
import lang from 'quasar/lang/ru.js'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import { Notify } from "quasar";

// To be used on app.use(Quasar, { ... })
export default {
  config: {},
  plugins: {
    Notify
  },
  lang: lang,
  extras: [
    'material-icons'
  ]
}