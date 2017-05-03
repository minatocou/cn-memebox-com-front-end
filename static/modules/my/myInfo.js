/**
 * Created by Jesse on 16/8/24. 个人信息
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        userData:JSON.parse(localStorage.userData)
    },
    methods: {
        showMask: function (text) {
            var $this = this;
            $this.popup({
                title:' ',
                type:'confirm',
                content:'在APP里才可以修改'+text+'哦',
                btn:['取消','打开APP'],
                ok:$this.goApp
            });
        }
    },
    ready: function () {

    },
    created: function () {

    }
});