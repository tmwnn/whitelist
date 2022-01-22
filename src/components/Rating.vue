<template>
  <div class="text-orange" v-if="rating">
    {{ rating }}
    <q-icon :name="getIcon(1)"/>
    <q-icon :name="getIcon(2)"/>
    <q-icon :name="getIcon(3)"/>
    <q-icon :name="getIcon(4)"/>
    <q-icon :name="getIcon(5)"/>
  </div>
</template>

<style>
</style>

<script>
export default {
  name: 'Rating',
  props: {
    rating: {type: Number, default: 0},
  },
  data: () => {
    return {
      stars: [1,2,3,4,5],
    }
  },
  methods: {
    getIcon(starNumber) {
      let icon = 'star_border';
      if (this.rating >= starNumber) {
        icon = 'star';
      }
      else if (this.rating >= (starNumber - 0.5)) {
        icon = 'star_half';
      }
      return icon;
    }
  }
}
</script>
