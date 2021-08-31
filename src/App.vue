<template>
  <div id="app">
    <mu-flex direction="column" style="height: 100%">
      <headerSide
        @clickDevMode="clickDevMode"
      ></headerSide>
      <div style="height: 100%; width: 100%">
        <mu-dialog :title="default_consent_dialog.title" :esc-press-close="false" :overlay-close="false" :open.sync="default_consent_dialog.open">
          <div slot="default" style="white-space: pre-wrap;">{{ default_consent_dialog.content }}</div>
          <mu-button slot="actions" flat color="primary" @click="default_consent_dialog.btn.negative.callback">{{ default_consent_dialog.btn.negative.text }}</mu-button>
          <mu-button slot="actions" flat color="primary" @click="default_consent_dialog.btn.positive.callback">{{ default_consent_dialog.btn.positive.text }}</mu-button>
        </mu-dialog>
        <scriptSetting
          :isDevMode="isDevMode"
          :devModeMsg="devModeMsg"
          @toggleDevMode="toggleDevMode"
          @openDefaultSnackbar="openDefaultSnackbar"
        ></scriptSetting>
        <mu-snackbar :position="default_snackbar.position" :open.sync="default_snackbar.open">
          {{default_snackbar.message}}
          <mu-button flat slot="action" color="secondary" @click="default_snackbar.open = false">OK</mu-button>
        </mu-snackbar>
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
      devModeClicks: 0,
      isDevMode: false,
      devModeMsg: "当前处于开发模式。\n点击关闭按钮可重启并退出开发模式。",
      default_snackbar: {
        position: 'bottom',
        message: '',
        open: false,
        timeout: 1500,
      },
      default_consent_dialog: {
        title: "",
        content: "",
        open: false,
        btn: {
          positive: {
            text: "确定",
            callback: () => {this.default_consent_dialog.open = false;},
          },
          negative: {
            text: "取消",
            callback: () => {this.default_consent_dialog.open = false;},
          },
        },
      },
    };
  },
  methods: {
    callAJ(functionName, arrParam) {
      //使用JSON传递参数，无法传递函数
      let paramString = "";
      if (arguments.length > 1) {
        let arrParam = [];
        for (let i=1; i<arguments.length; i++) {
          arrParam.push(arguments[i]);
          paramString = JSON.stringify(arrParam);
        }
      }
      let res = undefined;
      try {
        let resString = prompt(functionName, paramString);
        res = JSON.parse(resString);
      } catch (error) {
        console.log(error);
        res = undefined;
      }
      return res;
    },
    openDefaultSnackbar(msg) {
      if (this.default_snackbar.timer) clearTimeout(this.default_snackbar.timer);
      this.default_snackbar.message = msg;
      this.default_snackbar.open = true;
      this.default_snackbar.timer = setTimeout(() => {
        this.default_snackbar.open = false;
      }, this.default_snackbar.timeout);
    },
    closeDefaultConsentDialog() {
      this.default_consent_dialog.open = false;
    },
    openDefaultConsentDialog(title, content, positiveText, negativeText, positiveCallback, negativeCallback) {
      this.default_consent_dialog.title = title == null ? "" : title;
      this.default_consent_dialog.content = content == null ? "" : content;
      this.default_consent_dialog.btn.positive.text = positiveText == null ? "确定" : positiveText;
      this.default_consent_dialog.btn.negative.text = negativeText == null ? "取消" : negativeText;
      this.default_consent_dialog.btn.positive.callback = () => {
        if (positiveCallback != null) positiveCallback();
        this.closeDefaultConsentDialog();
      }
      this.default_consent_dialog.btn.negative.callback = () => {
        if (negativeCallback != null) negativeCallback();
        this.closeDefaultConsentDialog();
      }
      this.default_consent_dialog.open = true;
    },
    toggleDevMode(enable) {
      if (enable == null) enable = !this.isDevMode;
      this.openDefaultSnackbar("即将重启并"+(enable?"进入":"退出")+"开发模式");
      setTimeout(() => {
        this.isDevMode = this.callAJ("toggleDevMode", enable);//会重启整个app
      }, 1500);
      //no return value
    },
    clickDevMode() {
      ++this.devModeClicks;
      if (this.devModeClicks >= 5) {
        if (this.devModeClicks < 10) {
          this.openDefaultSnackbar("再点击"+(10-this.devModeClicks)+"次即可"+(this.isDevMode?"退出":"进入")+"开发模式");
        } else {
          this.devModeClicks = 0;
          if (this.isDevMode) {
            //退出开发模式
            this.toggleDevMode();
          } else {
            this.openDefaultConsentDialog(
              "进入开发模式",
               "如果你不懂下面这是啥意思，请【不要】点击确定，以防万一敏感权限被偷偷获取。\n要切换到开发模式么？",
              "确定",
              "取消",
              () => {this.toggleDevMode();},
              null
            );
          }
        }
      }
    },
  },
  created() {
    //是否处于开发模式
    this.isDevMode = this.callAJ("isDevMode");
    if (this.isDevMode) {
      let devModeType = this.callAJ("getDevModeType");
      switch (devModeType) {
        case "debugUrl":
          this.devModeMsg = "当前处于开发模式。\n不出意外的话，Webpack热重载已启用。\n点击关闭按钮可重启并退出开发模式。";
          break;
        default:
          this.devModeMsg = "当前处于开发模式。\n貌似没有从Vue开发服务器加载Webview（当前使用\""+devModeType+"\"，而不是\"debugUrl\"），故Webpack热重载应该不可用。\n点击关闭按钮可重启并退出开发模式。";
      }
    }
  },
};
</script>
<style>
#app {
  height: 100vh;
}
</style>
