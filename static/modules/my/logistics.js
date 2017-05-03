/**
 * Created by page.xia on 16/6/29.
 */
/**
 * Created by page on 2016/4/27.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '物流信息',
        init: false,
        outs: null,
        outsid: null
    },
    methods: {
        initOuts: function () {
            var $this = this;
            $this.outsid=$this.getSearch('outsid');
            $this.httpAjax({
                url: '/h5/tracker/info',
                param: {number: $this.outsid},
                success: function (data) {
                    if (data.code == 1) {
                        $this.outs = data.data;
                        $this.init = true;
                    } else {
                        $this.popup({content: data.msg});
                    }

                }
            })
        },

    },
    created: function () {
        var $this = this;
        if(!localStorage.mmToken){
            location.href='../account/login.html'
        }else{
            $this.initOuts();
        }
        //__inline('_data.js');
    },
});