/**
 * Created by page on 2016/4/20.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('payment/ga');
var vue = new Vue({
    mixins: [common, ga],
    el: 'html',
    param: null,
    data: {
        title: '支付',
        init: false,
        money: '0',
        orderId: null,
        addressData: {},
        orderList: {},
        gift: '',
        times: [],
        pay: {
            wx: false,
            ali: false,
            global: false,
            orderId: null,
            totalAmount: 0,
            time: ''
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
        nowTime: new Date().getTime(),
        prompt: {
            type: '',
            show: '',
            price: ''
        }
    },
    methods: {
        closePromptBox: function () {
            var $this = this;
            $this.prompt.show = false;
        },
        initPromptBox: function () {
            var $this = this;
            var orderId = $this.getOrderIds();
            if (orderId&&!localStorage[orderId]) {
                $this.httpAjax({
                    url: '/h5/order/detail',
                    param: {
                        orderId: orderId
                    },
                    success:function (data) {
                        //2017/1/3 
                        $this.codeToLabel[data.data.statusCode] && (data.data.statusLabel = $this.codeToLabel[data.data.statusCode]);
                        
                        var data = data.data;
                        if(data.statusCode==2){
                            $this.prompt.price = data.grantTotal;
                            data.paymentMethod.match('支付宝')?$this.prompt.type=0:$this.prompt.type=1;
                            localStorage[orderId]=orderId;
                            (Number(data.grantTotal)!=0)&&($this.prompt.show = true);
                        }
                    }
                });
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
        },
        getOrderId: function (obj) {
            var $this = this;
            if (obj.time > 0) {
                var nowTime = new Date().getTime();
                obj.time = parseInt((obj.time - nowTime) / 1000);
                mui('#select-pay').popover('toggle');
                obj.orderIds=$this.getSearch('orderIds')||$this.getOrderIds('orderIds');
                $this.$refs.pay.payBoxInit(obj);
            }

        },
        closeLeftTime: function (index, closedLeftTime) {
            var $this = this;
            $this.times.push(closedLeftTime);
            var i = setTimeout(function () {
                if ($this.times[index] > 0) {
                    --$this.times[index];
                    var t = $this.times[index];
                    $this.$nextTick(function () {
                        // closedLeftTime--;
                        $this.closeLeftTime(index, t);
                    })
                } else {
                    clearInterval(i);
                }
            }, 1000);
        },
        //时间转换
        timer: function (ts) {
            var $this = this;
            // var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
            var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
            var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
            var ss = parseInt(ts % 60, 10);//计算剩余的秒数
            var time = {};
            time.hh = $this.checkTime(hh)[0] + '' + $this.checkTime(hh)[1];
            time.mm = $this.checkTime(mm)[0] + '' + $this.checkTime(mm)[1];
            time.ss = $this.checkTime(ss)[0] + '' + $this.checkTime(ss)[1];
            // $this.dd = $this.checkTime(dd);
            // $this.hh = $this.checkTime(hh);
            // $this.mm = $this.checkTime(mm);
            // $this.ss = $this.checkTime(ss);

            return time;

        },
        checkTime: function (i) {
            i += "";
            if (i < 10) {
                i = ["0", i];
            } else {
                i = [i.slice(0, 1), i.slice(1, 2)];
            }
            return i;
        },
        type: function (type) {
            var product = {
                '0': ['拼 团', 'group'],
                '1': ['韩国仓', 'korea'],
                '2': ['极速仓', 'china'],
                '4': ['保税仓', 'ftz'],
                "8":['韩国直邮／特快', 'korea']
            };
            var t = [];
            t[0] = product[type][0];
            t[1] = product[type][1];
            return t;
        },
        getList: function (oid) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newcheckout/orderlist',
                param: {orderIds: oid},
                success: function (d) {
                    var data = d.data;
                    if (data.orderList.length == 0 && $this.getSearch('orderIds')) {
                        // location.href = $this.page + '/payment/my_orders.html?orderId=' + $this.getOrderIds();
                        if(!data.groupon_id){
                            setTimeout(function () {
                                if ($this.getOrderIds()) {
                                    location.href = $this.page + '/payment/my_order.html?orderId=' + $this.getOrderIds();
                                } else {
                                    location.href = $this.page + '/payment/my_orders.html'
                                }
                            }, 1000);
                        }
                    }
                    var pending = true;
                    if (data.orderList[1] && data.orderList[0].type == '1' && data.orderList[1].type == '2') {
                        var arr = data.orderList[0];
                        data.orderList[0] = data.orderList[1];
                        data.orderList[1] = arr;
                    }
                    $this.addressData = data.addressData;
                    $this.orderList = data.orderList;
                    $this.gift = data.gift;
                    for (var o = 0; o < $this.orderList.length; o++) {
                        $this.closeLeftTime(o, $this.orderList[o].closedLeftTime);
                        // $this.orderList[o].closedLeftTime=0;
                        if ($this.orderList[o].orderStatus == 'pending') {
                            pending = false;
                        }
                    }
                    if (pending == true && !data.groupon_id) {
                        location.href = $this.page + '/payment/my_orders.html?orderId=' + $this.getOrderIds();
                    }
                    $this.init = true;
                    $this.$refs.loading.show = false;
                }
            });
        },
        orderListF: function () {
            var $this = this;
            var oid = $this.getOrderIds('orderIds');
            // $this.init = true;
            // $this.$refs.loading.show = false;
            if (oid) {
                if ($this.getOrderIds()) {
                    $this.payOk($this.getOrderIds(), function () {
                        $this.getList(oid);
                        /**
                         * 支付宝支付之后,主动改变订单状态
                         */
                        if(!$this.isWeixin()){
                            $this.notifyStatus();
                        }
                        if(oid!='undefined'){
                            $this.initPromptBox();
                        }
                    });
                } else {
                    $this.getList(oid);
                }
            }
        },
        notifyStatus: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/notify/status',
                goLogin:false,
                alert:'false',
                param:{
                    tradeNo:$this.getOrderIds(),
                    type:'alipay'
                }
            });
        }
    },
    ready: function () {
        var $this = this;
        $this.orderListF();
    },
    created: function () {
        if (this.isWeixin() && this.getOrderIds('orderIds') && !this.openId) {
            //alert(this.getSearch('code'))
            this.wxPay();
        }
    }
})