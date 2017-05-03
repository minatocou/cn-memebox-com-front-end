/**
 * Created by Jesse on 16/4/21.
 */


var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '全球知名化妆品平台- 美美箱MEMEBOX',
        isPreview: false,
        init: false,
        homeData: [],
        flashData: false,
        favorData: {},
        noMore: false,
        pageIndex: 1,
        dataBottom: {},
        dataLayer: null,
        bottomFix: false,                //底部浮层
        cartNumber: '',                 //购物车数量
        classify: '/m/productClassify/productClassify.html#',
        details: '/m/productDetails/productDetails.html#',
        dMask: null,
        dcd: 5,
    },
    methods: {
        closeBottom: function (event) {
            event.preventDefault();
            this.bottomFix = false;
        },
        initCart: function (showLoading) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newcart/count',
                showLoading: showLoading,
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
        },
        getFavorList: function (callBack) {
            var $this = this;
            var uid;
            if (localStorage.user) {
                var user = JSON.parse(localStorage.user);
                uid = user['userId'];
            } else {
                uid = '';
            }

            var param = {
                "page": $this.pageIndex,
                "pageSize": "10",
                "pageType": 3,
                "userId": uid
            };

            var url = '/mobilev44/recommend/index';
            $this.httpAjax({
                url: url,
                param: param,
                success: function (data) {
                    if (callBack) {
                        callBack(data);
                    } else {
                        if (data.code == 1) {
                            $this.favorData = data.data;
                        }
                    }

                }
            });

        },
        initHome: function () {
            var $this = this;
            var param = {
                type: 1
            };

            var url = '/h5/view/index';
            if ($this.isPreview) {
                url = '/h5/view/preindex'
            }

            $this.httpAjax({
                url: '/h5/customer/info',
                complete: function (data) {
                    param.isNew = data.data.isNew;
                    $this.httpAjax({
                        url: url,
                        token: false,
                        forCache: true,
                        param: param,
                        success: function (data) {
                            if (data.code == 1) {
                                $this.homeData = data.data.components;
                                $this.dataLayer = data.data.layerImgUrl;
                                $this.dataBottom = data.data.bottomImgUrl;
                                for (var i = 0, l = $this.homeData.length; i < l; i++) {
                                    if ($this.homeData[i].component_type == 10) {
                                        $this.getFlash(i);
                                        break;
                                    }
                                }
                                $this.getFavorList();
                                $this.initCart(true);
                                setTimeout(function () {
                                    $this.bottomFix = true;
                                    $this.init = true;
                                    $this.$refs.loading.show = false;
                                    $this.initScroll();
                                }, 500);
                            }
                        }
                    });
                }
            })

        },
        /**
         * 获取秒杀商品
         */
        getFlash: function () {
            var $this = this;
            $this.httpAjax({
                url: "/h5/seckill/index",
                token: false,
                alert: "false",
                success: function (data) {
                    if (data.code == 1) {
                        console.log(data.data);
                        /**
                         * 后端漏洞
                         */
                        if (data.data.secKillStatus == 1||data.data.secKillStatus == 0) {
                            $this.flashData = false;
                        } else {
                            $this.flashData = data.data;
                            getStock($this.flashData);
                            Vue.set($this.flashData, "time", {});
                            $this.countdown($this.flashData.secKillLeftTime / 1000, $this.flashData.time, false, function () {
                                if ($this.flashData.nextSecKillLeftTime != 0) {
                                    $this.flashData.secKillStatus = 3;
                                    $this.countdown($this.flashData.nextSecKillLeftTime / 1000, $this.flashData.time, false, function () {
                                        $this.getFlash();
                                    });
                                }
                            });
                        }
                    }
                }
            });
            function getStock(list) {
                var proIds = "";
                if (list.secKillStatus!= 3) return false;
                for (var i = 0, l = list.productList.length; i < l; i++) {
                    proIds += "," + list.productList[i].productId;
                }
                proIds = proIds.slice(1);
                $this.httpAjax({
                    domain: $this.searchDomain,
                    url: "/global/price",
                    param: {
                        productIds: proIds
                    },
                    success: function (data) {
                        var proList = data.data;
                        for (var i = 0, l = proList.length; i < l; i++) {
                            if (proList[i].stockStatus == 1 && list.productList[i].seckillStock == 1) {
                                list.productList[i].seckillStock = true;
                            } else {
                                list.productList[i].seckillStock = false;
                            }
                        }
                    }
                });
            }
        },
        initScroll: function () {
            var $this = this;
            var favor = document.getElementById("home-index").getElementsByClassName('favor');
            if (favor.length > 0) {
                window.onscroll = function () {
                    if ((window.innerHeight + window.scrollY) >= document.body.clientHeight) {
                        if ($this.favorData.hasNext == 0) {
                            if (!$this.noMore) {
                                $this.noMore = true;
                                $this.popup({
                                    content: '没有更多商品了', time: 1000, autoClose: true
                                });
                            }
                        } else if ($this.favorData.hasNext == 1 && !$this.noMore) {
                            $this.noMore = true;
                            $this.pageIndex++;
                            $this.getFavorList(function (data) {
                                if (data.code == 1) {
                                    if (data.data.items) {
                                        $this.favorData.items = $this.favorData.items.concat(data.data.items);
                                    }

                                    if (data.data.hasNext == 1) {
                                        $this.noMore = false;
                                    }
                                    $this.favorData.hasNext = data.data.hasNext;
                                }

                            });
                        }
                    }
                };

            }
        },
        hideDMask: function (event) {
            this.dMask = 1;
            localStorage.dMask = 1;
        },
        downloadApp: function () {
            _maq.push(["_trackEvent", "popup_click_h5", {}]);
            this.getAppUrl();
        }
    },
    ready: function () {
        var $this = this;
        _hmt.push(['_trackEvent', 'main_page', '进入首页']);

    },
    created: function () {
        var $this = this;

        $this.isPreview = decodeURI(window.location.href).indexOf("preview") > 0 ? true : false;

        $this.initHome();
        $this.dMask = sessionStorage.dMask || localStorage.dMask;
        sessionStorage.dMask = 1;
        var ds = setInterval(function () {
            $this.dcd--;
            if ($this.dcd <= 0) {
                clearInterval(ds);
                $this.dMask = 1;
            }
        }, 1000)

        if ($this.getSearch('d') == 1) {
            setTimeout(function () {
                $this.getAppUrl()
            }, 1000)
        }
        $this.isFanliApp();
        if (typeof(Storage) !== "undefined") {
            sessionStorage.KEYNODE = 1;
        }
    }
});
