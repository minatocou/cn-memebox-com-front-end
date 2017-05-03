/**
 * Created by Jesse on 16/9/30.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('payment/ga');
var vue = new Vue({
    mixins: [common, ga],
    el:'html',
    data:{
        init:false,
        pay:{
            time:'',
            ali:true,
            totalAmount:'',
            wx:'',
            type:1
        },

        //添加前台显示的statusCode与statusLabel的映射关系，2017/1/3
        codeToLabel : {
            1 : '待支付',
            2 : '待发货',
            3 : '待收货',
            4 : '已取消',
            5 : '已完成',
            6 : '待付尾款',
            7 : '关闭',
        },
        showFail:true
    },
    methods:{
        checkout: function (e) {
            var $this = this;
            $this.showFail = false;
            if ($this.pay.ali) {
                $this.pay.globalUrl = $this.pay.globalUrl || '/h5/payment/globalAlipayPayment?orderId=' + $this.pay.orderId + '&orderIds=' + $this.pay.orderIds || '';
                if ($this.pay.global) {
                    this.httpAjax({
                        url: $this.pay.globalUrl,
                        param: $this.pay.param,
                        success: function (data) {
                            if ($this.pay.globalOk) {
                                $this.pay.globalOk(data);
                            } else {
                                location.href = data.data.url;
                            }
                        }
                    });
                } else {
                    $this.pay.aliUrl = $this.pay.aliUrl || '/h5/payment/alipayPayment?orderId=' + $this.pay.orderId + '&orderIds=' + $this.pay.orderIds || '';
                    this.httpAjax({
                        url: $this.pay.aliUrl,
                        success: function (data) {
                            if ($this.pay.aliOk) {
                                $this.pay.aliOk(data);
                            } else {
                                location.href = data.data.url;
                            }
                        }
                    });
                }
            } else {
                $this.wxPay({
                    orderId: $this.pay.orderId, wxOk: function (data) {
                        if ($this.pay.wxOk) {
                            $this.pay.wxOk(data);
                        }
                    }
                });
            }

        },
        initOrder:function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/order/detail',
                param: {orderId: $this.getSearch('orderId')},
                success:function (d) {
                    //2017/1/3 
                    $this.codeToLabel[d.data.statusCode] && (d.data.statusLabel = $this.codeToLabel[d.data.statusCode]);

                    var data = d.data;
                    $this.pay.orderId = data.realOrderId;
                    $this.pay.totalAmount = data.duePaid;
                    $this.$refs.loading.show = false;
                    if(data.closedLeftTime>0){
                        $this.initTime(data.closedLeftTime);
                    }else{
                        $this.pay.time = false;
                    }
                    if(data.orderProductInfo[0].isLocalProduct==1){
                        $this.pay.type=2;
                    }
                    if ($this.isWeixin()) {
                        $this.wxPay();
                    }
                    if ($this.isWeixin() && ($this.pay.type == 2)) {
                        $this.pay.wx = true;
                        $this.pay.ali = false;
                        $this.pay.wxOk = function () {
                            location.href = "/m/payment/payment.html?orderIds=" + $this.getOrderIds('orderIds') + '&orderId=' + $this.pay.orderId;
                        }
                    } else {
                        $this.pay.wx = false;
                        $this.pay.ali = true;
                    }
                    $this.pay.global = $this.pay.type == '1' ? true : false;
                    $this.init = true;
                }
            })
        },
        initTime:function (_time) {
            var $this = this;
            countDown(_time);
            function countDown(_time) {
                var countdown = setInterval(function () {
                    if (_time >=0) {
                        formatTime(_time);
                        _time--;
                    } else {
                        $this.pay.time = false;
                        clearInterval(countdown);
                    }
                }, 1000);
            }
            function formatTime(t) {
                var day = parseInt(t / 60 / 60 / 24, 10);
                var hour = parseInt(t / 60 / 60 % 24, 10);
                var minute = parseInt(t / 60 % 60, 10);
                var second = parseInt(t % 60, 10);
                if (t >= 86400) {
                    $this.pay.time = time(day) + '天' + time(hour) + '时' + time(minute) + '分' + time(second) + '秒';
                } else if (t < 86400 && t >= 3600) {
                    $this.pay.time = time(hour) + '时' + time(minute) + '分' + time(second) + '秒';
                } else if (t < 3600 && t >= 60) {
                    $this.pay.time = time(minute) + '分' + time(second) + '秒';
                } else {
                    $this.pay.time = time(second) + '秒';
                }
            }

            function time(t) {
                if (t < 10) {
                    return '0' + t;
                } else {
                    return t;
                }
            }
        },
        goBack: function () {
            var $this = this;
            this.popup({
                type: 'confirm',
                title: ' ',
                content: '真的要停止付款吗？',
                btn: ['去意已决', '我再看看'],
                n: function (e) {
                    location.href = $this.page + '/payment/my_orders.html';
                }
            });
        }
    },
    ready:function () {
        var $this = this;
        $this.getSearch('orderId')&&$this.initOrder();
    },
    created:function () {

    }
});