/**
 * Created by page on 2016/4/27.
 */
//order statusCode
//      'pending' => 1, 未付款
//      'processing' => 2, 已付款
//      'ready_shipement' => 3,
//      'complete' => 4,
//      'canceled' => 5
var Vue = require('vue/vue');
var common = require('vue/vue-common');
require('my/countdown');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '我的订单',
        init: false,
        pageIndex: 1,
        orders: [],
        isEnd: false,
        tabActiveIndex: 0,
        PAGE_SIZE: 10,
        ORDER_STATUS: {
            "0": "",
            "1": "pending",
            "2": "ready_shipement",
            "3": "complete"
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
        tabsInfo: {
            "total": 0,
            "statusCount": {
                "pending": 0,
                "ready_shipement": 0,
                "complete": 0
            }
        },
        tabs: {
            0: {
                name: "全部订单",     //tab name
                hasIconCount: false, //is show icon count
                hasIconNew: false,   //is show icon new
                orders: [],         //orders data
                pageIndex: 1
            },
            1: {
                name: "待支付",
                hasIconCount: true,
                hasIconNew: false,
                orders: [],
                pageIndex: 1
            },
            2: {
                name: "待发货",
                hasIconCount: false,
                hasIconNew: true,
                orders: [],
                pageIndex: 1,
                hasClicked: false
            },
            3: {
                name: "待收货",
                hasIconCount: false,
                hasIconNew: true,
                orders: [],
                pageIndex: 1,
                hasClicked: false
            }
        },
        pay: {
            wx: false,
            ali: false,
            global: false,
            orderId: null,
            totalAmount: 0,
            time: '',
            step: false
        },
        nowTime: new Date().getTime(),
        prompt: {
            type: '',
            show: '',
            price: ''
        },
        /**
         * 防止重复点击顶端tab
         * true->可以点击
         * false->不可以点击
         */
        canClickTab: true,
        Property: {}
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
        // /**
        //  * 判断商品支付类型
        //  */
        // getProPayType: function (o) {
        //     console.log(o);
        //     if (o.productInfo) {
        //         if (o.productInfo.isFtzProduct) {
        //             return 2;
        //         } else if (o.productInfo.isGlobalProduct) {
        //             return 1;
        //         } else if (o.productInfo.isLocalProduct) {
        //             return 4;
        //         }
        //     }
        // },
        /**
         * 获取产品类型
         * 判断商品支付类型
         * @param proId
         * @param price
         */
        getProPayType: function (pro,imageUrlsAndLabel) {
            var obj = {
                isGlobalProduct: '1',
                isLocalProduct: '2',
                isFtzProduct: '4'
            };
            if(imageUrlsAndLabel&&imageUrlsAndLabel.length!=0){
                return imageUrlsAndLabel[0].warehouse;
                // for (var k in obj) {
                //     if (imageUrlsAndLabel[0][k] == 1) {
                //
                //         return obj[k];
                //     }
                // }
            }else{
                return pro.warehouse;
                // for (var k in obj) {
                //     if (pro[k] == 1) {
                //         return obj[k];
                //     }
                // }
            }
        },
        initPromptBox: function () {
            var $this = this;
            var orderId = $this.getSearch('orderId');
            if (orderId && !localStorage[orderId]) {
                $this.httpAjax({
                    url: '/h5/order/detail',
                    param: {
                        orderId: orderId
                    },
                    success: function (data) {
                        //2017/1/3 
                        $this.codeToLabel[data.data.statusCode] && (data.data.statusLabel = $this.codeToLabel[data.data.statusCode]);

                        var data = data.data;
                        $this.prompt.price = data.grantTotal;
                        data.paymentMethod.match('支付宝') ? $this.prompt.type = 0 : $this.prompt.type = 1;
                        localStorage[orderId] = orderId;
                        (Number(data.grantTotal) != 0) && ($this.prompt.show = true);
                        /**
                         * h5预售定金支付成功
                         */
                        if (data.statusCode == 6) {
                            $this.Property.Product_id = data.orderProductInfo[0].productId;
                            _maq.push(["_trackEvent", "Depositpay_success", $this.Property]);
                            console.log($this.Property);
                        }
                    }
                });
            }
        },
        closePromptBox: function () {
            var $this = this;
            $this.prompt.show = false;
        },
        showPayBox: function (obj) {
            var $this = this;
            console.log(obj)
            /**
             * 定金支付方式
             * step:2
             * 0:->支付宝支付
             * 1:->微信支付
             */
            if ((obj.step == '2') && (($this.isWeixin() && obj.paymentMethod.match('支付宝')) || (!$this.isWeixin() && !obj.paymentMethod.match('支付宝')))) {
                $this.popup({
                    type: 'alert',
                    title: ' ',
                    content: '尾款支付方式需与定金一致，请回美美箱app进行操作',
                    btn: ['知道啦']
                });
            } else {
                var nowTime = new Date().getTime();
                obj.time = parseInt((obj.time - nowTime) / 1000);
                obj.time <= 0 && (obj.time = false);
                mui('#select-pay').popover('toggle');
                $this.$refs.pay.payBoxInit(obj);
            }
        },

        goOrder: function (realOrderId) {
            location.href = '/m/payment/my_order.html?orderId=' + realOrderId;
        },
        orderList: function (callback) {
            var $this = this;
            var params = {
                pageIndex: $this.tabs[$this.tabActiveIndex].pageIndex,
                pageSize: $this.PAGE_SIZE
            };
            // if ($this.ORDER_STATUS[$this.tabActiveIndex]) {
            //     params.orderStatus = $this.ORDER_STATUS[$this.tabActiveIndex];
            // }
            params.orderStatusCode = $this.tabActiveIndex;
            $this.httpAjax({
                url: '/h5/order/list',
                param: params,
                showLoading: true,
                success: function (data) {
                    if (data.code == 1) {
                        if (!data.data) {
                            $this.tabsInfo.total = 0;
                        }
                        else {
                            if (data.data.presaleInfo) {
                                $this.tabsInfo.total = data.data.total;
                                document.getElementsByClassName('mui-pull')[0] && (document.getElementsByClassName('mui-pull')[0].style.visibility = 'visible');
                            }
                        }
                        data.data = data.data || {};

                        //2017/1/3 
                        Array.isArray(data.data.orders) && data.data.orders.forEach(function (item,index) {
                           $this.codeToLabel[item.statusCode] && (item.statusLabel = $this.codeToLabel[item.statusCode]); 
                        });
                        

                        $this.tabsInfo.statusCount = data.data.statusCount;
                        $this.tabs[$this.tabActiveIndex].orders.push(data.data.orders);
                        $this.tabs[$this.tabActiveIndex].pageIndex++;
                        setTimeout(function () {
                            var swiper = new Swiper('.swiper-container', {
                                slidesPerView: 4,
                                paginationClickable: true,
                                spaceBetween: 10,
                                freeMode: true,
                                scrollbar: '.swiper-scrollbar',
                                autoplayDisableOnInteraction: false
                            });
                        }, 100);
                        $this.checkIcon();
                        callback && callback(data);
                        if (10 * params.pageIndex >= data.orderTotal) {
                            mui('#more').pullRefresh().endPullupToRefresh(true);
                        } else {
                            mui('#more').pullRefresh().endPullupToRefresh(false);
                        }
                        $this.$refs.loading.show = false;
                        $this.canClickTab = true;
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            })
        },
        initOrders: function () {
            var $this = this;
            $this.orderList(function () {
                $this.init = true;
                mui('#more').pullRefresh({
                    up: {
                        contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
                        contentnomore: '没有更多数据了',
                        indicators: false,
                        callback: function () {
                            $this.orderList();
                        }
                    }
                })
            })
        },

        /**
         * 顶部tab点击事件
         */
        tabClick: function (index) {
            var $this = this;
            if ($this.canClickTab) {
                $this.canClickTab = false;
                document.getElementsByClassName('mui-pull')[0] && (document.getElementsByClassName('mui-pull')[0].style.visibility = 'hidden');
                $this.clearOldData();
                mui('#more').pullRefresh().scrollTo(0, 0, 100); //回到顶部
                this.tabActiveIndex = index;
                if (!$this.tabs[$this.tabActiveIndex].orders.length) {
                    $this.orderList();
                    $this.$refs.loading.show = true;
                }
            }
        },

        clearOldData: function () {
            this.tabs[this.tabActiveIndex].orders = [];
            this.tabs[this.tabActiveIndex].pageIndex = 1; //重置之前的pageindex为初始值
        },

        /**
         * 判断当前tab的icon是否显示
         */
        checkIcon: function () {
            var that = this;
            switch (parseInt(that.tabActiveIndex)) {
                case 2 :
                    that.tabs[that.tabActiveIndex].hasIconNew = false;
                    that.tabs[2].hasClicked = true;
                    break;
                case 3 :
                    that.tabs[that.tabActiveIndex].hasIconNew = false;
                    that.tabs[3].hasClicked = true;
                    break;
                default:
                    if (that.tabsInfo.statusCount) {
                        that.tabs[2].hasIconNew = (!that.tabs[2].hasClicked && that.tabs[2].hasIconNew && that.tabsInfo.statusCount.ready_shipement) ? true : false;
                        that.tabs[3].hasIconNew = (!that.tabs[3].hasClicked && that.tabs[3].hasIconNew && that.tabsInfo.statusCount.complete) ? true : false;
                        if (that.tabs[that.tabActiveIndex].orders &&
                            that.tabsInfo.statusCount.pending) {
                            that.tabs[1].hasIconCount = true;
                        }
                        else {
                            that.tabs[1].hasIconCount = false;
                        }
                    }
                    else {
                        that.tabs[2].hasIconNew = false;
                        that.tabs[3].hasIconNew = false;
                    }
            }
        },

        addToCart: function (isSingglePro, data) {
            var orderArray = [];
            var proObj;
            var $this = this;
            if (isSingglePro) {
                proObj = {};
                proObj = {
                    productId: data.productId,
                    qty: data.qty
                };

                if (data.option && data.option.option_id) {
                    proObj.options = {};
                    proObj.options[data.option.option_id] = data.option.value;
                }
                if(data.bundleOption.length && data.hasBundleOption > 0){
                    var len = data.bundleOption,
                        arr = [];
                    arr.push(data.productId);
                    for(var l=0; l<len.length; l++){
                        if(len[l].productId){
                            arr.push(len[l].productId);
                        }
                    }
                    arr = arr.join("_");
                    proObj.productId = arr;
                }
                orderArray.push(proObj);
            }else {
                for (var i = 0; i < data.length; i++) {
                    proObj = {};
                    proObj = {
                        productId: data[i].productId,
                        qty: data[i].qty
                    };
                    if (Object.keys(data[i].option).length!=0) {
                        proObj.options = {};
                        proObj.options[data[i].option.option_id] = data[i].option.value;
                    }
                    orderArray.push(proObj);
                }
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

        cancelOrder: function (orderId) {
            var $this = this;
            if (!orderId) {
                return;
            }
            $this.popup({
                content: '确认取消?', type: 'confirm', ok: function () {
                    $this.httpAjax({
                        url: '/h5/order/cancel',
                        param: {orderId: orderId},
                        success: function (data) {
                            if (data.code == 1) {
                                location.href = $this.page + '/payment/my_orders.html'
                            } else {
                                $this.popup({content: data.msg});
                            }

                        }
                    })
                }
            });
        },
        isGroupon: function (order) {
            return order.activityType == 1;
        },
        toGroup: function (grouponId, share) {
            share&&(localStorage.share = true);
            location.href = location.origin + this.page + '/payment/group.html?grouponId=' + grouponId ;
        },
        toDetail: function (productId) {
            location.href = location.origin + this.page + '/productDetails/productDetails.html#' + productId;
        },
        /**
         * 获取单价
         * @param o
         * @returns {string}
         */
        getPrice: function (o) {
            var price = o.productInfo.price;
            if (o.is_GWP == '1') {
                price = '0.00'
            }
            if (o.activityType == 1) {
                price = o.productInfo.grouponPrice;
            }
            if (o.activityType == '2') {
                price = o.presaleInfo.prePrice;
            }
            return price;
        },
        /**
         * 获取订单总额:预售订单->总额,其他订单->实付款
         * @param o
         * @returns {null|*}
         */
        getDuePaid:function (o) {
            var price = o.duePaid;
            if(o.activityType == '2'){
                price = o.presaleInfo.totalPrice;
            }
            return price;
        },
        /**
         *展示拼团详情按钮
         */
        showGroupDetailBtn:function (o) {
            if(o.activityType=='1'){
                if(o.groupoInfo.grouponStatusCode!='9'&&o.groupoInfo.grouponStatusCode!='7'){
                    return true;
                }
            }
        }
    },
    ready: function () {
        mui.back = function () {
            location.href = '../my/home.html';
        }
    },
    created: function () {
        var $this = this;
        if (!localStorage.mmToken) {
            location.href = '../account/login.html'
        } else {
            $this.initOrders();
            $this.initPromptBox();
        }
    }
});
