<template>
  <div id="app">
    <mu-flex direction="column" style="height: 100%">
      <headerSide></headerSide>
      <div style="height: 100%; width: 100%">
        <scriptSetting></scriptSetting>
      </div>
    </mu-flex>
  </div>
</template>

<script>
import headerSide from "./Components/headerAndSide.vue";
import scriptSetting from "./Components/scriptSetting.vue";
export default {
  components: {
    headerSide,
    scriptSetting,
  },
  data() {
    return {
    };
  },
  methods: {
    callAJ(functionName, arrParam) {
      let res = undefined;
      try {
        res = prompt(functionName, arrParam);
      } catch (error) {
        layToast(error);
      }
      return res;
    },
  },
  created() {
  },
};
</script>
<style>
#app {
  height: 100vh;
}
</style>
