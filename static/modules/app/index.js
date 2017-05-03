/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common,appTools],
    el: 'html',
    data: {

    },
    methods: {
    },
    ready: function () {
        var $this=this;
        $this.getAppUrl();
    }
});
