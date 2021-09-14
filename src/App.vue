<template>
  <div id="app">
    <mu-flex direction="column" style="height: 100%">
      <headerSide
        :versionString="versionString"
        @clickDevMode="clickDevMode"
        @checkForUpdates="checkForUpdates"
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
          @snackBarMsg="snackBarMsg"
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
import callAJ from './utils/callAJ.js';
import headerSide from "./Components/headerAndSide.vue";
import scriptSetting from "./Components/scriptSetting.vue";
export default {
  components: {
    headerSide,
    scriptSetting,
  },
  data() {
    return {
      versionString: "",
      devModeClicks: 0,
      isDevMode: false,
      devModeType: null,
      devModeMsg: "当前处于开发模式。\n点击关闭按钮可重启并退出开发模式。",
      default_snackbar: {
        position: 'bottom',
        message: '',
        open: false,
        timeout: 3000,
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
      isUpgradeInProgress: false,
      newerVersionString: "",
      upgradeUrlBase: {
        debug: "http://0.0.0.0",
        release: "http://0.0.0.0",
      },
    };
  },
  watch: {
    isUpgradeInProgress: function (oldIsUpgradeInProgress, newIsUpgradeInProgress) {
      //避免下载更新出错时webview切换页面
      (async () => {
        await this.callAJAsync("setIgnoreWebviewError", newIsUpgradeInProgress ? true : false);
      })();
    },
  },
  methods: {
    async callAJAsync() {
      return await callAJ.callAJAsync.apply(this, arguments);
    },
    snackBarMsg(msg) {
      if (this.default_snackbar.timer) clearTimeout(this.default_snackbar.timer);
      this.default_snackbar.message = msg;
      this.default_snackbar.open = true;
      this.default_snackbar.timer = setTimeout(() => {
        this.default_snackbar.open = false;
      }, this.default_snackbar.timeout);
    },
    snackBarLog(msg) {
      this.snackBarMsg(msg);
      console.log(msg);
    },
    snackBarErr(msg) {
      this.snackBarMsg(msg);
      console.error(msg);
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
    async toggleDevMode(enable) {
      if (enable == null) enable = !this.isDevMode;
      this.snackBarMsg("即将重启并"+(enable?"进入":"退出")+"开发模式");
      setTimeout(async () => {
        await this.callAJAsync("toggleDevMode", enable);//会重启整个app
      }, 1500);
      //no return value
    },
    async clickDevMode() {
      ++this.devModeClicks;
      if (this.devModeClicks >= 5) {
        if (this.devModeClicks < 10) {
          this.snackBarMsg("再点击"+(10-this.devModeClicks)+"次即可"+(this.isDevMode?"退出":"进入")+"开发模式");
        } else {
          this.devModeClicks = 0;
          if (this.isDevMode) {
            //退出开发模式
            await this.toggleDevMode(false);
          } else {
            this.openDefaultConsentDialog(
              "进入开发模式",
               "如果你不懂下面这是啥意思，请【不要】点击确定，以防万一敏感权限被偷偷获取。\n要切换到开发模式么？",
              "确定",
              "取消",
              async () => {await this.toggleDevMode(true);},
              null
            );
          }
        }
      }
    },
    async blobToTextAsync(blob) {
      return await new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (e) {
          resolve(e.target.result);
        }
        reader.readAsText(blob);
      });
    },
    async blobToDataURIAsync(blob) {
      return await new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function (e) {
          resolve(e.target.result);
        }
        reader.readAsDataURL(blob);
      });
    },
    async downloadFileAsync(fileInfo) {
      let urlBase =
        this.upgradeUrlBase[this.isDevMode ? "debug" : "release"] + (
          this.isDevMode
            ? ""
            : this.newerVersionString === ""
              ? "@latest"
              : "@" + this.newerVersionString
        );
      let url =
        fileInfo.src.match(/^(http|https)\:\/\/.+/)
          ? fileInfo.src
          : fileInfo.src.startsWith("/")
            ? urlBase + fileInfo.src
            : urlBase + "/" + fileInfo.src;
      let integrity = fileInfo.integrity;
      let options = {mode: 'cors'};
      if (integrity != null && typeof integrity === "string") options.integrity = integrity;
      let request = new Request(url, options);
      //console.log("fetch request: url=["+request.url+"]"+(request.integrity==null||request.integrity===""?"":" integrity=["+request.integrity+"]"));
      let response;
      try {
        response = await fetch(request);
      } catch (e) {
        console.error("Caught error, fetching ["+request.url+"] failed. message=["+e.message+"]", e);
        throw e;
      }
      if (!response.ok) throw new Error("response.ok is not true", response);;
      return response;
    },
    generateUpdateDataString(updateData) {
      //TLV encoding
      let bundleString = "";
      updateData.forEach((item) => {
        if (typeof item !== "object" || Array.isArray(item)) {
          this.snackBarErr("处理更新数据时出错");
          console.error("typeof item "+(typeof item)+" Array.isArray(item) "+Array.isArray(item));
          return "";
        }
        let fileItemString = "";
        for (let key in item) {
          let val = item[key];
          if (typeof val !== "string") continue;
          let kvString = "";
          kvString += ",K"+key.length+"_"+key;
          kvString += ",V"+val.length+"_"+val;
          kvString = ",KV"+kvString.length+"_"+kvString;
          fileItemString += kvString;
        }
        fileItemString = ",F"+fileItemString.length+"_"+fileItemString;
        bundleString += fileItemString;
      });
      bundleString = ",B"+bundleString.length+"_"+bundleString;
      return bundleString;
    },
    async sendUpdateDataFragment(dataFrag) {
      let updateDataStringFragBlob = new Blob([dataFrag], {type: 'application/json'});
      let updateDataStringFragDataUri = await this.blobToDataURIAsync(updateDataStringFragBlob);
      let a = document.createElement('a');
      a.setAttribute('download', "updateData.json");
      a.setAttribute('href', updateDataStringFragDataUri);
      a.click();
      a.remove();
    },
    async upgrade() {
      if (this.isUpgradeInProgress) {
        this.snackBarMsg("更新正在进行中，请耐心等待");
        return;
      }
      this.isUpgradeInProgress = true;
      if (!this.isDevMode && this.newerVersionString === "") {
        this.snackBarErr("不知道要更新到哪个版本，放弃");
        this.isUpgradeInProgress = false;
        return;
      }
      this.snackBarMsg("下载更新...");
      let updateListLayeredJson;
      try {
        let resp = await this.downloadFileAsync({src: "update/updateList.json"});
        let blob = await resp.blob();
        updateListLayeredJson = await this.blobToTextAsync(blob);
      } catch (e) {
        this.snackBarMsg("下载更新列表时出错");
        this.isUpgradeInProgress = false;
        return;
      }
      //gen.js生成的JSON是有层级的，需要转换一下
      let updateListLayered;
      try {
        updateListLayered = JSON.parse(updateListLayeredJson);
      } catch (e) {
        this.snackBarErr("解析updateList.json失败");
        console.error(e);
        this.isUpgradeInProgress = false;
        return;
      }
      let updateList = [];
      function walkThrough(data) {
        if (Array.isArray(data)) {
          data.forEach((item) => walkThrough(item));
        } else {
          updateList.push(data);
        }
      }
      walkThrough(updateListLayered);
      //异步下载每一个文件
      try {
        await Promise.all(updateList.map((fileInfo) => (async (fileInfo) => fileInfo.data = await this.downloadFileAsync(fileInfo))(fileInfo)));
        await Promise.all(updateList.map((fileInfo) => (async (fileInfo) => fileInfo.data = await fileInfo.data.blob())(fileInfo)));
        await Promise.all(updateList.map((fileInfo) => (async (fileInfo) => fileInfo.data = await this.blobToDataURIAsync(fileInfo.data))(fileInfo)));
        const PART_SIZE = 320 * 1024;
        let updateDataString = this.generateUpdateDataString(updateList);
        let remainder = updateDataString.length % PART_SIZE;
        let quotient = (updateDataString.length - remainder) / PART_SIZE;
        let totalParts = remainder > 0 ? quotient + 1 : quotient;
        for (let i=1; i<=totalParts; i++) {
          let beginOffset = (i - 1) * PART_SIZE;
          let curPartSize = remainder > 0 && i == totalParts ? remainder : PART_SIZE;
          let endOffset = beginOffset + curPartSize;
          let updateDataStringFrag = updateDataString.substring(beginOffset, endOffset);
          let partInfo = ""+i+","+totalParts+";"
          await this.sendUpdateDataFragment(partInfo+updateDataStringFrag);
        }
      } catch (e) {
        this.snackBarErr("更新时遇到问题");
        console.error(e);
      }
      this.isUpgradeInProgress = false;
    },
    compareVersionStringWithCurrent(aotherVersionString) {
      let currentVer;
      let latestVer;
      try {
        currentVer = this.versionString.split('.');
        latestVer = aotherVersionString.split('.');
      } catch (e) {
        console.error(e);
        return {result: false, hasError: true, msg: "处理版本字符串时出错"};
      }
      //靠近开头的数字认为是大版本号，后面则是小版本号，逐个比对
      for (let i=0; i<currentVer.length||i<latestVer.length; i++) {
        let latestNum = parseInt(latestVer[i]);
        let currentNum = parseInt(currentVer[i]);
        if (latestNum > currentNum) {
          //最新版比当前新
          return {result: true, newerVerStr: latestVer.join('.')};
        } else if (latestNum < currentNum) {
          return {result: false, msg: "当前版本号高于服务器上的最新版"};
        } else if (latestNum == currentNum) {
          let next_i = i + 1;
          if (next_i >= latestVer.length || next_i >= currentVer.length) {
            //已经比对到最后（当前和最新，哪个数字少按哪个）一个数字了，还是相等，已经没有下一个数字可供比对了
            if (latestVer.length > currentVer.length) {
              //最新版的数字个数更多，判定为比当前版本新
              return {result: true, newerVerStr: latestVer.join('.')};
            } else {
              return {result: false, msg: "当前已是最新版本"};
            }
          }
          //还没到最后一个数字，不break，继续往后比对
        } else {
          return {result: false, hasError: true, msg: "比对第"+(i+1)+"个版本数字时出错"};
        }
      }
      return {result: false, hasError: true, msg: "比对版本时出错"};
    },
    async checkForUpdates() {
      if (this.isUpgradeInProgress) {
        this.snackBarMsg("更新正在进行中，请耐心等待");
        return;
      }
      this.isUpgradeInProgress = true;
      this.newerVersionString = "";
      this.snackBarLog("检查更新...");
      let projectJson;
      try {
        let resp = await this.downloadFileAsync({src: "project.json"});
        let blob = await resp.blob();
        projectJson = await this.blobToTextAsync(blob);
      } catch (e) {
        this.snackBarErr("检查更新时出错");
        console.error(e);
        this.isUpgradeInProgress = false;
        return;
      }
      let projectObj;
      try {
        projectObj = JSON.parse(projectJson);
      } catch (e) {
        this.snackBarErr("解析project.json失败");
        console.error(e);
        this.isUpgradeInProgress = false;
        return;
      }
      if (typeof projectObj.versionName !== "string") {
        this.snackBarErr("project.json里未找到版本号");
        this.isUpgradeInProgress = false;
        return;
      }
      let comparingResult = this.compareVersionStringWithCurrent(projectObj.versionName);
      let comparingResultStr = "";
      if (this.isDevMode) {
        this.snackBarLog("当前处于开发模式，版本号会被忽略");
        comparingResultStr = "\n版本比对结果:";
        for (let key of ["result", "newerVerStr", "hasError", "msg"])
          comparingResultStr += " "+key+"=["+comparingResult[key]+"]";
      } else {
        if (comparingResult.hasError) {
          this.snackBarErr(comparingResult.msg);
          this.isUpgradeInProgress = false;
          return;
        }
        if (!comparingResult.result) {
          this.snackBarLog(comparingResult.msg);
          this.isUpgradeInProgress = false;
          return;
        } else {
          this.newerVersionString = comparingResult.newerVerStr;
        }
      }
      this.openDefaultConsentDialog(
        "有更新可用",
        "要升级到最新版 ["+(
          this.isDevMode
            ? projectObj.versionName
            : this.newerVersionString
        )+"] 吗？"+(
          this.isDevMode
            ? "\n当前处于开发模式，版本号会被忽略。"
              +comparingResultStr
            : ""
        ),
        "确定",
        "取消",
        () => {
          this.isUpgradeInProgress = false;//检查更新和下载更新共用一个变量
          (async () => {await this.upgrade();})();
        },
        () => {
          this.snackBarLog("取消更新");
          this.isUpgradeInProgress = false;
        }
      );
    },
  },
  created() {(async () => {
    //获取当前版本号
    this.versionString = await this.callAJAsync("getVersionString");
    //是否处于开发模式
    this.isDevMode = await this.callAJAsync("isDevMode");
    if (this.isDevMode) {
      this.devModeType = await this.callAJAsync("getDevModeType");
      switch (this.devModeType) {
        case "debugUrl":
          this.devModeMsg = "当前处于开发模式。\n不出意外的话，Webpack热重载已启用。\n点击关闭按钮可重启并退出开发模式。";
          break;
        default:
          this.devModeMsg = "当前处于开发模式。\n貌似没有从Vue开发服务器加载Webview（当前使用\""+this.devModeType+"\"，而不是\"debugUrl\"），故Webpack热重载应该不可用。\n点击关闭按钮可重启并退出开发模式。";
      }
    }
    //从AutoJS端获取更新网址
    this.upgradeUrlBase = await this.callAJAsync("getUpgradeUrlBase");
  })();},
};
</script>
<style>
#app {
  height: 100vh;
}
</style>
