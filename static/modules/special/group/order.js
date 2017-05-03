/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
Vue.use(require('vue/vue-validator'));
var validate = require('vue/vue-validate');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common, appTools, validate],
    el: 'html',
    data: {
        title: '拼团确认',
        init: false,
        param: {},
        addressText: null,
        pay: {
            wx: false,
            ali: false,
            global: false,
            orderId: null,
        },
        historyOrder: {}
    },
    methods: {
        selectCity: function (e) {
            e.target.focus();
            var $this = this;
            var cityPicker3 = new mui.PopPicker({
                layer: 3
            });
            cityPicker3.setData(cityData3);
            cityPicker3.show(function (items) {
                $this.addressText = ((items[0] || {}).text + " " + (items[1] || {}).text + " " + (((items[2] || {}).text) || ((items[1] || {}).text)));
                $this.param.province = (items[0] || {}).text;
                $this.param.postcode = (items[0] || {}).value;
                $this.param.city = (items[1] || {}).text;
                $this.param.district = ((items[2] || {}).text) || ((items[1] || {}).text);
                $this.param.provinceId = (items[0] || {}).value;
            });
        },
        userInfoCall: function (data) {
            if(data && data.data && data.data.token){
                this.errorMsg=data.data.token;
                localStorage.mmToken = data.data.token;
                location.href='#';
            }else{
                try{
                    this.errorMsg=JSON.stringify(data);
                }catch(e){
                    alert(e);
                }
                location.href='#';
            }
        },
        check: function () {
            var $this = this;
            if ($this.getSearch('grouponId')) {
                console.log($this.getSearch('grouponId'));
                $this.param.grouponId = $this.getSearch('grouponId');
            }
            $this.valiForm(function () {
                if (!$this.pay || !$this.historyOrder[$this.param.phone]) {
                    localStorage.groupParam = JSON.stringify($this.param);
                    localStorage.addressText = $this.addressText;
                    $this.httpAjax({
                        url: '/h5/grouponcheckout/placeOrder',
                        param: $this.param,
                        complete: function (data) {
                            if (data.code == 3) {
                                $this.popup({
                                    content: data.msg, type: 'alert', autoClose: false, ok: function () {
                                        if ($this.isApp()) {
                                            localStorage.removeItem('mmToken');
                                            $this.app_userinfo();
                                            setTimeout(function () {
                                                if (!localStorage.mmToken) {
                                                    $this.app_login();
                                                } else {
                                                    $this.go($this.page + '/payment/my_order.html?orderId=' + data.joinedOrderId);
                                                    // $this.go($this.page + '/special/group/list.html');
                                                }
                                            }, 500);
                                        } else {
                                            $this.go($this.page + '/payment/my_order.html?orderId=' + data.joinedOrderId);
                                        }
                                    }
                                });
                            }
                            if (data.code == 4) {
                                $this.popup({
                                    content: data.msg, type: 'alert', autoClose: false, ok: function () {
                                        $this.go($this.page + '/special/group/list.html');
                                    }
                                });
                            }
                        },
                        success: function (data) {
                            if (data.code == 1 && data.data.order) {
                                mui('#select-pay').popover('show');
                                var orderId = data.data.order.increment_id;
                                $this.pay.orderId = orderId;
                                $this.historyOrder[$this.param.phone] = orderId;
                                if ($this.isWeixin()) {
                                    $this.pay.wx = true;
                                    $this.pay.ali = false;
                                    $this.pay.wxOk = function () {
                                        location.href = "/m/special/group/success.html?orderId=" + orderId;
                                    }
                                } else {
                                    $this.pay.wx = false;
                                    $this.pay.ali = true;
                                    $this.pay.aliUrl = $this.port + '/h5/payment/grouponPayment?orderId=' + orderId;
                                }
                            }
                            // if (data.code == 1 && data.data.order) {
                            //     var payUrl=$this.port + '/h5/payment/grouponPayment'
                            //     $this.httpAjax({
                            //         url: payUrl,
                            //         param:{orderId:data.data.order.increment_id},
                            //         success: function (d) {
                            //             if (d.code == 1) {
                            //                 location.href=d.data.url;
                            //             }else{
                            //                 $this.popup({content: d.msg});
                            //             }
                            //         }
                            //     })
                            // }
                            // data.msg && $this.popup({content: data.msg});
                        }
                    })
                } else {
                    mui('#select-pay').popover('show');
                }
            })
        }
    },
    ready: function () {
        this.$refs.loading.show = false;
    },
    created: function () {
        if (this.isWeixin() && !this.getOpenId() && !this.getSearch('code')) {
            this.wxPay();
        }
        this.param.productId = this.getSearch('productId');
        // alert(this.param.productId)
        if (this.param.productId) {
            this.param.productId = this.param.productId.replace(/_.*/,'');
            sessionStorage.productId = this.param.productId;
        } else {
            this.param.productId = sessionStorage.productId;
        }
        if (this.getSearch('grouponId')) {
            this.param.grouponId = this.getSearch('grouponId');
        } else {
            if (localStorage.groupParam) {
                var obj = JSON.parse(localStorage.groupParam);
                delete obj.grouponId;
                localStorage.groupParam = JSON.stringify(obj);
                localStorage.removeItem('grouponId');
            }
        }
        localStorage.groupParam && (this.param = JSON.parse(localStorage.groupParam));
        localStorage.addressText && (this.addressText = localStorage.addressText);
    }
})