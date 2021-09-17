export default {
  callAJSync: function (functionName) {
    //不能在microtask（比如Promise）中使用
    //使用JSON传递参数，无法传递函数
    let paramString = "";
    if (arguments.length > 1) {
      let arrParam = [];
      for (let i=1; i<arguments.length; i++) {
        arrParam.push(arguments[i]);
      }
      paramString = JSON.stringify(arrParam);
    }
    try {
      let resString = prompt(functionName, paramString);
      let res = JSON.parse(resString);
      return res;
    } catch (e) {
      console.error("callAJ \""+functionName+"\" failed");
      console.error(e);
      return undefined;
    }
  },
  callAJAsync: async function (functionName) {
    //使用JSON传递参数，无法传递函数
    let paramString = "";
    if (arguments.length > 1) {
      let arrParam = [];
      for (let i=1; i<arguments.length; i++) {
        arrParam.push(arguments[i]);
      }
      paramString = JSON.stringify(arrParam);
    }
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let resString = prompt(functionName, paramString);
          let res = JSON.parse(resString);
          resolve(res);
        } catch (e) {
          console.error("callAJ \""+functionName+"\" failed");
          console.error(e);
          reject(e);
        }
      }, 0);
    });
  },
}