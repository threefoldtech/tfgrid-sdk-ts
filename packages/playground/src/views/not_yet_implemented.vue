<template>
  <img class="centered-img" src="images/404.png" />
  <p class="text1">Oops. The page you were looking for doesn't exist.</p>
  <p class="text2">You may have mistyped address or the page may have been moved</p>
  <div style="text-align: center">
    <a href="/" class="link-text"> Take me back to the home page</a>
  </div>
</template>

<script lang="ts">
export default {
  name: "NotYetImplemented",
};
</script>

<style>
.centered-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 65%;
}

.text1 {
  font-size: 30px;
  text-align: center;
  font-weight: 500;
  margin-top: 50px;
}

.text2 {
  font-size: 20px;
  text-align: center;
  font-weight: 400;
}

.link-text {
  font-size: 20px;
  text-align: center;
  font-weight: 400;
  color: #3d7ad4;
}
</style>
