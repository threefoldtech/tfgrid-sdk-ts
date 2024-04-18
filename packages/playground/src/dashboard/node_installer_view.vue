<template>
  <div>
    <iframe :src="ruta" height="1400" width="100%"></iframe>
  </div>
</template>

<script>
export default {
  data: () => ({
    ruta: "https://bootstrap.grid.tf/",
  }),
};
</script>
