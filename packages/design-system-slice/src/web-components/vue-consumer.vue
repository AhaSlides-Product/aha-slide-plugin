<script setup lang="ts">
// The SAME compiled element the React consumer imports — registered once by
// side effect, then used as a plain custom element in the template.
import './aha-button';
</script>

<template>
  <aha-button variant="primary">Save changes</aha-button>
</template>
