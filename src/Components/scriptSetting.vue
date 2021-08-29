<template>
  <mu-flex direction="column">
    <mu-alert color="warning" @delete="isAJObsolete = false" delete v-if="isAJObsolete" transition="mu-scale-transition">
      <mu-icon left value="warning"></mu-icon>
      <div slot="default" class="text-wrapper">{{ AJObsoleteWarningMsg }}</div>
    </mu-alert>
    <mu-list textline="two-line">
      <mu-list-item button :ripple="true" @click="toggleAutoService">
        <mu-list-item-content>
          <mu-list-item-title v-if="isAutoServiceEnabled">无障碍服务已开启</mu-list-item-title>
          <mu-list-item-title v-else><b>请先开启无障碍服务</b></mu-list-item-title>
          <mu-list-item-sub-title>用于抓取控件信息和模拟点击操作</mu-list-item-sub-title>
        </mu-list-item-content>
        <mu-list-item-action>
          <mu-icon value="done" v-if="isAutoServiceEnabled"></mu-icon>
          <mu-icon value="navigate_next" v-else></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-list-item button :ripple="true" @click="toggleForegroundService">
        <mu-list-item-content>
          <mu-list-item-title v-if="isForegroundServiceEnabled">前台服务已开启</mu-list-item-title>
          <mu-list-item-title v-else>前台服务未开启</mu-list-item-title>
          <mu-list-item-sub-title>尽量防止脚本进程被系统杀死</mu-list-item-sub-title>
        </mu-list-item-content>
        <mu-list-item-action>
          <mu-icon value="done" v-if="isForegroundServiceEnabled"></mu-icon>
          <mu-icon value="navigate_next" v-else></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-list-item button :ripple="true" @click="toggleStopOnVolUp">
        <mu-list-item-content>
          <mu-list-item-title v-if="isStopOnVolUpEnabled">紧急停止键已开启</mu-list-item-title>
          <mu-list-item-title v-else>紧急停止键未开启</mu-list-item-title>
          <mu-list-item-sub-title>按音量上键停止所有脚本</mu-list-item-sub-title>
        </mu-list-item-content>
        <mu-list-item-action>
          <mu-icon value="done" v-if="isStopOnVolUpEnabled"></mu-icon>
          <mu-icon value="navigate_next" v-else></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
    </mu-list>
    <mu-divider></mu-divider>
    <!-- 脚本 -->
    <mu-flex class="settingContent" align-items="center">
      <mu-select
        label="默认执行脚本:"
        v-model="config.selectOptions"
        full-width
      >
        <mu-option
          v-for="(option, index) in scripts"
          :key="index"
          :label="option.name"
          :value="index"
        ></mu-option>
      </mu-select>
    </mu-flex>
    <!-- 参数 -->
    <div style="padding: 0; width: 100%">
      <mu-expansion-panel :expand="true" :zDepth="0" style="width: 100%">
        <div slot="header">参数设置</div>
        <mu-flex direction="column">
          <!-- ap使用 -->
          <mu-flex
            direction="column"
            v-if="'ap50' in scripts[config.selectOptions].config"
            style="width: 100%"
          >
            <div>ap回复设置：</div>
            <mu-flex
              class="settingAp"
              justify-content="between"
              align-items="center"
            >
              <mu-checkbox
                v-model="config.ap50"
                label="AP回复50(绿药)"
                @change="change_config('ap50')"
              ></mu-checkbox>
              <mu-text-field
                v-if="config.ap50"
                prefix="次数限制："
                type="number"
                v-model="config.ap50Count"
                style="width: 110px; font-size: 12px"
                @change="change_config('ap50Count')"
              ></mu-text-field>
            </mu-flex>
            <mu-flex
              class="settingAp"
              justify-content="between"
              align-items="center"
            >
              <mu-checkbox
                v-model="config.apfull"
                label="AP回复全(红药)"
                @change="change_config('apfull')"
              ></mu-checkbox>
              <mu-text-field
                v-if="config.apfull"
                prefix="次数限制："
                type="number"
                v-model="config.apfullCount"
                style="width: 110px; font-size: 12px"
                @change="change_config('apfullCount')"
              ></mu-text-field>
            </mu-flex>
            <mu-flex
              class="settingAp"
              justify-content="between"
              align-items="center"
            >
              <mu-checkbox
                v-model="config.apmo"
                label="魔法石"
                @change="change_config('apmo')"
              ></mu-checkbox>
              <mu-text-field
                v-if="config.apmo"
                prefix="次数限制："
                type="number"
                v-model="config.apmoCount"
                style="width: 110px; font-size: 12px"
                @change="change_config('apmoCount')"
              ></mu-text-field>
            </mu-flex>
          </mu-flex>
          <!-- 只使用NPC -->
          <mu-flex
            class="settingContent2"
            justify-content="between"
            align-items="center"
            v-if="'justnpc' in scripts[config.selectOptions].config"
          >
            <div>只使用NPC（不选则优先互关好友）</div>
            <mu-switch
              v-model="config.justnpc"
              @change="change_config('justnpc')"
            ></mu-switch>
          </mu-flex>
          <!-- 防短线 -->
          <!-- <mu-flex
            class="settingContent2"
            justify-content="between"
            align-items="center"
          >
            <div>防短线（不断自动点击短线重连按钮）</div>
            <mu-switch v-model="config.keepclick"></mu-switch>
          </mu-flex> -->
          <!-- bp -->
          <!-- <mu-flex
            class="settingAp"
            justify-content="between"
            align-items="center"
          >
            <mu-checkbox v-model="config.bpfull" label="BP回复"></mu-checkbox>
            <mu-flex align-items="center" v-if="config.bpfull">
              <div>次数限制</div>
              <input
                type="number"
                v-model="config.apfullCount"
                class="settingInput"
                maxlength="3"
              />
            </mu-flex>
          </mu-flex> -->
        </mu-flex>
      </mu-expansion-panel>
      <!-- 功能介绍 -->
      <mu-expansion-panel :expand="true" :zDepth="0">
        <div slot="header">功能介绍</div>
        <!-- 参考： Vue插值文本换行问题 https://www.cnblogs.com/leegent/p/9274424.html -->
        <div slot="default" class="text-wrapper">{{ scripts[config.selectOptions].introduction }}</div>
      </mu-expansion-panel>
    </div>
  </mu-flex>
</template>

<script>
import scriptsPlaceHolder from "../Scripts/placeholder.js";
export default {
  data() {
    return {
      isAJObsolete: false,
      AJObsoleteWarningMsg: "",
      scripts: scriptsPlaceHolder,
      isAutoServiceEnabled: false,
      isForegroundServiceEnabled: false,
      isStopOnVolUpEnabled: false,
      config: { selectOptions: 0 },
    };
  },
  methods: {
    callAJ(functionName) {
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
    toggleAutoService() {
      let alreadyEnabled = this.isAutoServiceEnabled ? true : false;
      let result = this.callAJ("toggleAutoService", !alreadyEnabled);
      this.isAutoServiceEnabled = result;
    },
    toggleForegroundService() {
      let alreadyEnabled = this.isForegroundServiceEnabled ? true : false;
      let result = this.callAJ("toggleForegroundService", !alreadyEnabled);
      this.isForegroundServiceEnabled = result;
    },
    toggleStopOnVolUp() {
      let alreadyEnabled = this.isStopOnVolUpEnabled ? true : false;
      let result = this.callAJ("toggleStopOnVolUp", !alreadyEnabled);
      this.isStopOnVolUpEnabled = result;
    },
    getScripts() {
      let result = this.callAJ("getScripts");
      if (result == null || result.length == 0) result = scriptsPlaceHolder;
      result.forEach(element => {
        if (element.config == null) element.config = scriptsPlaceHolder[0].config;
      });
      return result;
    },
    change_config(one_config) {
      /* TODO 为保持兼容，不应使用webview里的localstorage，还是应该继续从AutoJS的storages里读取参数
      // 对于有存储的特殊处理
      if (
        this.scripts[this.config.selectOptions].config[one_config] &&
        this.scripts[this.config.selectOptions].config[one_config].save
      ) {
        let save_data = localStorage.getItem(one_config);
        if (save_data) {
          localStorage.setItem(one_config, this.config[one_config]);
        }
      }
      // 改变设置
      let data = { config: this.config };
      this.callAJ("change_config", data);
      */
    },
  },
  created() {
    //可在F12或AutoJS端更新UI状态
    let vueInstance = this;
    window.updateSettingsUI = function (key, value) {
      switch (typeof value) {
        case "string":
        case "number":
        case "boolean":
          break;
        default:
          console.error("updateSettingsUI: unacceptable value type");
          return;
      }
      if (typeof vueInstance[key] !== typeof value) {
        console.error("updateSettingsUI: value type mismatch");
        return;
      }
      vueInstance[key] = value;
    }
    //脚本启动时检查无障碍服务/前台服务/按音量上键停止所有脚本是否开启
    for (let name of ["isAutoServiceEnabled", "isForegroundServiceEnabled", "isStopOnVolUpEnabled"])
      if (this.callAJ(name))
        this[name] = true;
    //检测AutoJS引擎版本
    let AJVersionInfo = this.callAJ("detectAutoJSVersion");
    this.isAJObsolete = AJVersionInfo.isAJObsolete;
    this.AJObsoleteWarningMsg = AJVersionInfo.AJObsoleteWarningMsg;
    /* TODO 为保持兼容，不应使用webview里的localstorage，还是应该继续从AutoJS的storages里读取参数 */
    //config
    let one = {};
    for (let i = 0; i < this.scripts.length; i++) {
      let configs = Object.keys(this.scripts[i].config);
      for (let i2 = 0; i2 < configs.length; i2++) {
        if (configs[i2] in one) {
        } else {
          one[configs[i2]] = this.scripts[i].config[configs[i2]].default;
          // 存储值
          if (this.scripts[i].config[configs[i2]].save) {
            let save_data = localStorage.getItem(configs[i2]);
            if (save_data) {
              if (save_data == "true") {
                save_data = true;
              } else if (save_data == "false") {
                save_data = false;
              }
              one[configs[i2]] = save_data;
            } else {
              localStorage.setItem(
                configs[i2],
                this.scripts[i].config[configs[i2]].default
              );
            }
          }
        }
      }
    }
    one["selectOptions"] = this.config.selectOptions;
    this.config = one;
    //给默认执行脚本下拉选单实际填入数据
    this.scripts = this.getScripts();
  },
};
</script>
<style>
.settingAp .mu-input {
  min-height: 0px;
  margin-bottom: 0px;
  padding-bottom: 0px;
  padding-top: 0px;
}
.settingAp .mu-text-field-input {
  height: 24px;
}
.settingContent {
  width: 100%;
  padding: 10px 15px 0 15px;
}
.settingContent2 {
  width: 100%;
  padding: 10px 0 0 0;
}
.setting-font {
  font-size: 14px;
  font-weight: 600;
}
.settingAp {
  width: 100%;
  padding: 5px 0 5px 0;
}
.settingInput {
  border: none;
  border-bottom: 1px solid #000;
  width: 50px;
  margin-left: 10px;
  outline: none;
}
.text-wrapper {
  white-space: pre-wrap;
}
</style>