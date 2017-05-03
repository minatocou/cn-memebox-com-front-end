/**
 * Created by page on 2016/4/27.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '订单详情',
        init: false,
        order: null,
        pay: {
            wx: false,
            ali: false,
            orderId: null,
            global: false,
            totalAmount: null,
            time: '',
            step: false
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

        presaleInfo: '',
        /**
         * step:
         * 1->支付定金
         * 2->支付尾款
         */
        step: ''
    },
    methods: {
        /**
         * 预售格式化时间js
         * @param obj
         */
        presaleFormatTime: function (time) {
            var $this = this;
            var obj = $this.formatDate(time);
            return obj.year + '.' + obj.month + '.' + obj.day + '. ' + obj.hour + ':' + obj.minute + ':' + obj.second;
        },
        showMyPayBox: function () {
            var $this = this;
            /**
             * 定金支付方式
             * step:2
             * 0:->支付宝支付
             * 1:->微信支付
             */
            $this.order.paymentMethod.match('支付宝') ? $this.paymentMethod = 0 : $this.paymentMethod = 1;
            if (($this.step == 2) && (($this.isWeixin() && $this.paymentMethod == '0') || (!$this.isWeixin() && $this.paymentMethod == '1'))) {
                $this.popup({
                    type: 'alert',
                    title: ' ',
                    content: '尾款支付方式需与定金一致，请回美美箱app进行操作',
                    btn: ['知道啦']
                });
            } else {
                mui('#select-pay').popover('toggle');
            }
        },
        initOrder: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/order/detail',
                param: {orderId: $this.getSearch('orderId')},
                success: function (data) {
                    if (data.code == 1) {
                        if (data.data) {
                            //2017/1/3 
                            $this.codeToLabel[data.data.statusCode] && (data.data.statusLabel = $this.codeToLabel[data.data.statusCode]);

                            $this.order = data.data;
                            $this.presaleInfo = $this.order && $this.order.orderProductInfo[0].presaleInfo;
                            var obj = {
                                grantTotal: $this.order.grantTotal,
                                time: $this.order.closedLeftTime == 0 ? 'false' : $this.order.closedLeftTime,
                                type: $this.order.orderProductInfo[0].warehouse,
                                orderId: $this.order.realOrderId,
                                showCloseBox: false
                            };
                            $this.setPresalePro($this.order, obj);
                            // obj.type = $this.getProType(obj.type);
                            $this.$refs.pay.payBoxInit(obj);
                            $this.init = true;
                        } else {
                            location.href = '../payment/my_orders.html'
                        }
                    } else {
                        $this.popup({content: data.msg});
                        mui.back();
                    }

                }
            })
        },
        /**
         * 设置预售产品
         */
        setPresalePro: function (order, obj) {
            var $this = this;
            if (order.isPresale==1) {
                if (order.statusCode == '1') {
                    obj.step = 1;
                    obj.grantTotal = $this.order.orderProductInfo[0].presaleInfo.deposit;
                } else if (order.statusCode == '6') {
                    obj.step = 2;
                    $this.step = 2;
                    obj.grantTotal = $this.order.orderProductInfo[0].presaleInfo.restPrice;
                    obj.time = $this.presaleInfo.endRetainageTime - $this.presaleInfo.serverTime;
                }
            }
        },
        /**
         * 获取产品类型
         * @param proId
         * @param price
         */
        getProType: function (type) {
            var obj = {
                isGlobalProduct: '1',
                isLocalProduct: '2',
                isFtzProduct: '4'
            };
            for (var k in obj) {
                if (type[k] == 1) {
                    return obj[k];
                }
            }
        },
        goPro: function (proId, price) {
            if (price && price > 0) {
                location.href = this.page + '/productDetails/productDetails.html#' + proId;
            }
        },
        cancelOrder: function (orderId) {
            var $this = this;
            $this.popup({
                content: '确认取消?', type: 'confirm', ok: function () {
                    $this.httpAjax({
                        url: '/h5/order/cancel',
                        param: {orderId: orderId},
                        success: function (data) {
                            if (data.code == 1) {
                                //$this.order=data.data;
                                // mui.back();
                                location.href = $this.page + '/payment/my_orders.html'
                            } else {
                                $this.popup({content: data.msg});
                            }

                        }
                    })
                }
            });
        },
        goOuts: function (outsid) {
            location.href = '/m/my/logistics.html?outsid=' + outsid;
        },
        checkout: function () {
            var $this = this;
            var payUrl = '/h5/payment/alipayPayment'
            if (!$this.isBonded()) {
                payUrl = '/h5/payment/globalAlipayPayment';
            }
            $this.httpAjax({
                url: payUrl,
                param: {orderId: $this.order.realOrderId},
                success: function (d) {
                    if (d.code == 1) {
                        location.href = d.data.url;
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            })
        },
        isBonded: function () {
            //return this.order.orderProductInfo ? true : false;
            return false;
        },
        getOutsAttr: function (attr) {
            if (this.order.localChildOrders && this.order.krChildOrders && this.order.localChildOrders[attr] && this.order.krChildOrders[attr]) {
                return null;
            } else if (this.order.localChildOrders && this.order.localChildOrders[attr]) {
                return this.order.localChildOrders[attr];
            } else if (this.order.krChildOrders && this.order.krChildOrders[attr]) {
                return this.order.krChildOrders[attr];
            } else {
                return this.order[attr];
            }
        },
        // getOrderId: function (e) {
        //     var $this = this;
        //     $this.pay.orderId = $this.order.realOrderId;
        //     $this.pay.global = $this.order.orderProductInfo[0].isGlobalProduct == '1' ? true : false;
        //     if ($this.isWeixin() && $this.order.orderProductInfo[0].isLocalProduct) {
        //         $this.pay.wx = true;
        //         $this.pay.ali = false;
        //     } else {
        //         $this.pay.wx = false;
        //         $this.pay.ali = true;
        //     }
        // },
        addToCart: function () {
            var orderArray = [];
            var proObj;
            var $this = this;
            var products = this.order.orderProductInfo;
            for (var i = 0; i < products.length; i++) {
                proObj = {};
                proObj = {
                    productId: products[i].productId,
                    qty: products[i].qty
                };
                if (products[i].options[0]) {
                    proObj.options = {};
                    proObj.options[products[i].options[0].option_id] = products[i].options[0].value;
                }
                if(products[i].bundleOption.length){
                    var len = products[i].bundleOption,
                        arr = [];
                    arr.push(products[i].productId);
                    for(var l=0; l<len.length; l++){
                        if(len[l].productId){
                           arr.push(len[l].productId);
                        }
                    }
                    arr = arr.join("_");
                    proObj.productId = arr;
                }
                orderArray.push(proObj);
            }
            this.httpAjax({
                url: "/h5/newcart/batchadd",
                param: {
                    product: orderArray
                },
                success: function (data) {
                    if (data.code == 1) {
                        // 跳转到购物车
                        window.location.href = "/m/cart/cart.html";
                    } else {
                        $this.popup({
                            content: '部分商品已失效，未成功加入购物车',
                            ok: function () {
                                window.location.href = "/m/cart/cart.html";
                            }
                        });
                    }
                }
            });
        },
        toDetail: function () {
            var product = this.order.orderProductInfo[0];
            location.href = location.origin + this.page + '/productDetails/productDetails.html#' + product.productId;
        },
        isGroupon: function (order) {
            return order.groupon_id;
        },
        /**
         * 获取产品价格
         */
        getPrice: function (o) {
            var $this = this;
            var price = o.price;
            if (o.is_GWP == '1') {
                price = '0.00'
            }
            if ($this.order.isGroupon == 1) {
                price = o.grouponPrice;
            }
            return price;
        },
        /**
         * 商品总额
         */
        getPriceTotal: function (o) {
            var $this = this;
            var price;
            if (o.isGroupon != '1') {
                if (o.is_GWP == '1') {
                    price = '0.00';
                } else if ($this.presaleInfo && $this.presaleInfo.totalPrice) {
                    price = $this.presaleInfo.totalPrice;
                } else {
                    price = $this.order.subtotal;
                }
            } else {
                price = o.grantTotal;
            }
            return price;
        },
        /**
         * 预售支付
         * 1.待支付定金  pending
         * 2.可以支付尾款,时间在支付尾款的范围内 presale_waiting
         * 3.可以支付尾款,没有到支付尾款的时间  presale_waiting
         * 4.再次购买
         * 5.已注销
         */
        presalePay: function () {
            var $this = this;
            if ($this.order.statusCode == 4) {
                return '5';
            }
            if ($this.presaleInfo) {
                if ($this.order.statusCode == 1) {
                    return '1';
                } else if (($this.presaleInfo.serverTime > $this.presaleInfo.startRetainageTime) && $this.order.statusCode == 6) {
                    return '2';
                } else if (($this.presaleInfo.serverTime < $this.presaleInfo.startRetainageTime) && $this.order.statusCode == 6) {
                    return '3';
                } else if ($this.order.statusCode != 1 && $this.order.statusCode != 6) {
                    return '4';
                }
            }
        },
        /**
         * 接口数据:0 其他，1 pending待支付，2 reading_shipment待发货, 3 processing  已支付, 4 complete待收货 5canceled已注销 6 待评价 7 待付尾款
         * new 2017/1/3 接口数据:1 - '待支付'   2 -'待发货'   3 - '待收货'    4 - '取消'   5- '待评价就是已完成？'     6 -'待付尾款'   7 - '关闭' 
         * 预售订单支付状态
         * 1.pendding
         * 2.presale_waiting
         * 3.processing
         * 4.cancel
         */
        presaleStatus: function () {
            var $this = this,
                statusCode = $this.order.statusCode,
                ary=[4,1,false,false,4,false,2];

            return ary[statusCode]||3;
            // if (statusCode == 1) {
            //     return 1;
            // } else if (statusCode == 6) {
            //     return 2;
            // } else if (statusCode == 0 || statusCode == 4) {
            //     return 4;
            // } else {
            //     return 3;
            // }
        }
    },

    created: function () {
        var $this = this;
        if (!localStorage.mmToken) {
            location.href = '../account/login.html';
        } else {
            $this.initOrder();
        }
        //__inline('_data.js');
    },
});