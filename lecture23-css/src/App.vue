<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand href="#">
        CSS Demo
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item href="/scrollable">Scrollable</b-nav-item>
        <b-nav-item href="/grid">Grid</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
</script>