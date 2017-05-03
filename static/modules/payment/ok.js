/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('payment/ga');
var vue = new Vue({
    mixins: [common,ga],
    el: 'html',
    param:null,
    data: {
        title: '支付成功',
        init: false,
        money:'0',
        orderId:null,
    },
    methods: {
        goBack:function () {
            this.popup({
                type:'confirm',
                title:' ',
                content:'真的要停止付款吗？',
                btn:['去意已决','我再看看'],
                n:function (e) {
                    location.href='/';
                }
            });
        },
    },
    ready: function () {
        this.payOk(this.getOrderIds());
    },
    created: function () {
    }
})