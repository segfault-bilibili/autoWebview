<template>
  <div style="width: 100%">
    <mu-appbar id="appbar" style="width: 100%" color="primary">
      <mu-button icon slot="left" @click="open = true">
        <mu-icon value="menu"></mu-icon>
      </mu-button>
      全自动小彩羽v{{versionString}}
    </mu-appbar>

    <mu-drawer :open.sync="open" :docked="false">
      <mu-list>
        <div class="ava">
          <mu-avatar @click="clickDevMode()" :size="56">
            <img src="../img/1.png" />
          </mu-avatar>
          <div style="margin-top: 5px; font-weight: 600">
            全自动小彩羽v{{versionString}}
          </div>
        </div>
        <mu-divider></mu-divider>
        <mu-list-item button @click="openURL('https://magireco.moe/wiki/%E9%A6%96%E9%A1%B5')">
          <mu-list-item-title>魔纪wiki</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button @click="openURL('http://rika.ren/~kuro/workspace/playground/')">
          <mu-list-item-title>模拟抽卡</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button @click="upgrade">
          <mu-list-item-title>检查更新</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button @click="reportBug">
          <mu-list-item-title>报告问题</mu-list-item-title>
        </mu-list-item>
        <mu-list-item button @click="openLogConsole">
          <mu-list-item-title>日志</mu-list-item-title>
        </mu-list-item>
        <mu-list-item @click="open = false" button>
          <mu-list-item-title>返回</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-drawer>
  </div>
</template>

<script>
import callAJ from '../utils/callAJ.js';
export default {
  data() {
    return {
      open: false,
      devModeClicks: 0,
    };
  },
  props: [
    'versionString',
  ],
  methods: {
    async callAJAsync() {
      return await callAJ.callAJAsync.apply(this, arguments);
    },
    async openURL(url) {
      if (typeof url == "string") {
        await this.callAJAsync("openURL", url);
      }
    },
    async reportBug() {
      await this.callAJAsync("reportBug");
    },
    async openLogConsole(){
      await this.callAJAsync("openLogConsole");
    },
    upgrade() {
      this.$emit("upgrade");
    },
    clickDevMode() {
      this.$emit("clickDevMode");
    },
  },
  created() {(async () => {
    //设置状态栏颜色
    //FIXME 这是直接从Muse UI官网看到的light主题primary颜色的十六进制数值，万一以后加了切换主题，就又对不上了
    await this.callAJAsync("setStatusBarColor", "#ff2196f3");
  })();},
};
</script>
<style>
.ava {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15px;
}
</style>
