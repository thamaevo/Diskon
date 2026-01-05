<template>
  <div>
    <nav class="nav">
      <!-- <router-link to="/discounts">Diskon</router-link> -->
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.nav { display:flex; gap:12px; padding:12px; background:#f5f5f5 }
.nav a { text-decoration:none }
</style>
