/**
 * Created by Jesse on 16/4/29.
 */


var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: '#app',
    data: {
        arr: []
    },
    methods: {
        logout: function () {
            var $this = this;
            $this.popup({
                type: 'confirm',title:' ', content:'你确定要退出登录吗？',btn:['取消','确定'], ok: function () {
                    console.log('ok')
                }
            })
        }
    },
    ready: function () {
        this.init = true;
        this.$refs.loading.show = false;
        this.$nextTick(function () {
            mui.init();
        })
        var $this = this;
        $this.arr = [1, 12]
    },
    created: function () {

    }
});