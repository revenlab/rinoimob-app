<template>
  <div id="app">
    <nav class="bg-white shadow">
      <div class="px-4 py-4">
        <h1 class="text-2xl font-bold">Rinoimob</h1>
      </div>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
