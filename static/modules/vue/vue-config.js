/**
 * Created by page on 2016/4/20.
 */
var Vue = require('vue/vue');
var dev=function () {
    return /^dev|qa|cdn/.test(location.hostname);
}
if(dev()){
    Vue.config.debug = true;//只有开发版本可以使用调试模式。
    Vue.config.silent = false;//取消 Vue.js 所有的日志与警告
    Vue.config.devtools = true;//配置是否允许 vue-devtools 检查代码。开发版默认为 true， 生产版默认为 false。
}
