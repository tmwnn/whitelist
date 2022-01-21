import { createStore } from "vuex";
export default createStore({
    state: () => ({
        user: {},
    }),
    mutations: {
        setUser(state, user) {
            state.user = user;
        }
    },
    actions: {
        fetchUser(state, user) {
            state.user = user;
        }
    },
    getters: {
        user(state) {
            return state.user;
        },
        userEmail(state) {
            return state.user ? state.user.email : '';
        },
        userName(state) {
            return state.user ? state.user.displayName : '';
        },
        userId(state) {
            return state.user ? state.user.uid : '';
        },
    }
});
