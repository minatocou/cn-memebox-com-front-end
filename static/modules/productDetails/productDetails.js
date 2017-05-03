/**
 * Created by Jesse on 16/4/27.
 */

var Vue = require('vue/vue');
// Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var appTools = require('app/app');
var countdown = require('my/countdown');

vue = new Vue({
    mixins: [common, appTools, countdown],
    el: 'html',
    data: {
        title: '商品详情',
        init: false,
        showProduct: '',
        number: '',
        optionImg: [],
        /**
         * 商品数据
         */
        productData: {},
        /**
         * 拼团商品
         */
        grouponInfo: {},
        /**
         * 预售商品
         */
        presaleInfo: {},
        /**
         * 秒杀
         */
        flashSale: {},
        time: {},
        /*
         * 赠品信息
         * */
        promotionInfo: {
            gift: null,
        },
        /*
        * 是否是bundle商品
        * */
        activityInfo: null,
        qty: '',
        cartNumber: '',          //购物车数量
        allDisable: true,         //多品是否全部缺货
        collection: null,
        showTaxMask: false,
        ani: false,
        can: true,
        result: {
            day: '',
            hour: '',
            minute: '',
            second: ''
        },
        _productData: '',
        /**
         * 折扣
         */
        discount: '',
        mbData: null,  ///用户mb返现数据,
        shippingInfo: '',
        commentData: null,
        bestCommentData: null,
        bestCommentLength: 0,
        bigImg: null,
        pageIndex: 1,
        pageSize: 10,
        swiper: null,
        pid: null,
        headerCss: {      //标题栏背景
            'background-color': 'rgba(255, 80, 115,0)'
        },
        iconBg: true,     //标题栏icon
        showTitle: false,   //标题
        imgTextBtn: false,  //图文详情
        toTop: false,       // 返回顶部
        text: '',
        scrollY: 0,
        newComerPrice: null,
        isPb: "",
        canBuySta: 1,
        currentBrandId: null,
        KEYNODE: 0
    },
    methods: {
        /**
         * 预售时间格式化
         * @param i
         * @returns {string}
         */
        presaleFormatTime: function (time) {
            var $this = this;
            var obj = $this.formatDate(time);
            return obj.year + '.' + obj.month + '.' + obj.day + ' ' + obj.hour + ':' + obj.minute;
        },
        getDiscount: function (i) {
            var $this = this;
            var arr = [($this.productData.price) / ($this.productData.originPrice),
                ($this.grouponInfo && $this.grouponInfo.grouponPrice) / ($this.productData.originPrice),
                null,
                ($this.newComerPrice && (!$this.mbData || $this.mbData.isNewcomer != '0') && $this.newComerPrice) ? $this.newComerPrice / ($this.productData.originPrice) : ($this.productData.price) / ($this.productData.originPrice),
            ];
            var _discount = (10 * arr[i]).toFixed(1);
            if (_discount < 10 && _discount >= 0.1) {
                _discount = _discount + '折';
            } else {
                _discount = false;
            }
            return _discount;
        },

        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#s-comment',
                    up: {
                        contentrefresh: '正在加载...',
                        callback: pullupRefresh
                    }
                }
            });
            /**
             * 上拉加载具体业务实现
             */
            function pullupRefresh() {
                setTimeout(function () {
                    if (($this.pageSize * $this.pageIndex) >= $this.commentData.total) {
                        $this.popup({
                            content: '没有更多评价了', time: 1000, autoClose: true
                        });
                        mui('#s-comment').pullRefresh().endPullupToRefresh(true);
                    } else {
                        $this.pageIndex++;
                        $this.getComment();
                        mui('#s-comment').pullRefresh().endPullupToRefresh(false);
                        setTimeout(function () {
                            $this.swiper = new Swiper('.swiper-container', {
                                slidesPerView: 3,
                                paginationClickable: true,
                                spaceBetween: 10,
                                freeMode: true
                            });
                        }, 0)
                    }
                }, 0);
            }
        },
        /**
         * 是否可以购买
         */
        canBuyPro: function () {
            var canBuy = false;
            var $this = this,
                canBuySta = $this.canBuySta;
            if (canBuySta != '1' ) {
                return false;
            }if ($this.productData.options && $this.productData.options.length != 0) {
                if ($this.productData.isEnabled && ($this.productData.isEnabled == '1')) {
                    canBuy = $this.productData.options.some(function (item, index) {
                        return (item.disabled != '1') && (item.qty != 0);
                    });
                }
            }else if($this.productData.bundleOptions && $this.productData.bundleOptions.length > 0){
                if ($this.productData.isEnabled && ($this.productData.isEnabled == '1')) {
                    canBuy = $this.productData.bundleOptions.some(function (item, index) {
                        var bundleOptions = item.options,
                            flag = false;
                        bundleOptions.some(function (ele, n) {
                             if((ele.disabled != '1') && (ele.qty != 0)){
                                flag = true;
                            }
                        });
                        return flag;
                    });
                }
            } else {
                canBuy = true;
            }
            return canBuy;
        },
        goGroupDetail: function (link) {
            var $this = this;
            location.href = link;
        },
        /**
         * 检测秒杀商品状态
         * @param index
         * @returns {string}
         */
        checkFlashStatus: function (index) {
            var ary = [
                "",
                "flash-over",
                "flash-not-start",
                "flash-start"
            ];
            //改变秒杀商品状态
            this.flashSale.secKillStatus && this.flashSale.secKillStatus != index && (this.flashSale.secKillStatus = index);
            return ary[index];
        },
        getDetail: function () {
            var $this = this,
                params = {
                    productId: $this.productData.productId,
                };
            if ($this.getSearch("activityType")) {
                params = $this.getProParams();
            }
            $this.httpAjax({
                url: '/h5/product/detail',
                param: params,
                success: function (data) {
                    var d = data.data;
                    $this.optionImg = [];
                    $this.productData = d;
                    $this.canBuySta = d.stockStatus;
                    $this.grouponInfo = d.grouponInfo;
                    $this.presaleInfo = d.presaleInfo;
                    $this.grouponInfo.grouponList = d.grouponInfo.grouponList;
                    /**
                     * 赠品及促销
                     */

                    $this.promotionInfo.gift = !$this.isEmptyObject(d.gift) ? d.gift : null;
                    $this.activityInfo = !$this.isEmptyObject(d.activityInfo) ? d.activityInfo : null;
                    $this.isPb = d.isPb;
                    localStorage.activityType = $this.productData.activityType;
                    var viewName = '#details';
                    if ($this.productData.activityType == '2') {
                        localStorage.source = '7';
                        viewName = '#presale';
                        _maq.push(["_trackPageView", "presaleProductDetails", {}]);
                    }
                    if ($this.productData.activityType == '1') {
                        viewName = '#group'
                    }
                    if ($this.productData.activityType == 4) {
                        viewName = '#flashsale';
                        localStorage.source = '11';
                        $this.flashSale = data.data.seckillInfo;
                        /**
                         * PV
                         */
                        _maq.push(["_trackPageView", "flash_detail_page", {}]);
                        $this.countdown($this.flashSale.secKillStartTime / 1000, $this.time, false, function () {
                            $this.checkFlashStatus(3);
                            if ($this.flashSale.nextSecKillLeftTime != 0) {
                                $this.countdown($this.flashSale.nextSecKillLeftTime / 1000, $this.time, false, function () {
                                    $this.checkFlashStatus(1);
                                });
                            } else {
                                $this.checkFlashStatus(1);
                            }
                        });
                    } else if ($this.productData.activityType != '0' && $this.productData.activityType != '3') {
                        var type = $this.productData.activityType;
                        var arr = ['', 'grouponInfo', 'presaleInfo'];
                        var time = ($this[arr[type]].endTime || $this[arr[type]].endDepositTime ) - $this[arr[type]].serverTime;
                        var t = time;

                        $this.countdown(time, $this.result, true);
                    } else if (($this.productData.activityType == '0' || $this.productData.activityType == '3') && $this.activityInfo) {
                        if ($this.activityInfo.serverTime < $this.activityInfo.startTime && $this.activityInfo.startTime - $this.activityInfo.serverTime < $this.activityInfo.preStartTime) {
                            var time = $this.activityInfo.startTime - $this.activityInfo.serverTime;
                            $this.countdown(time, $this.result, true);
                        } else if ($this.activityInfo.serverTime > $this.activityInfo.startTime && $this.activityInfo.endTime != '0') {
                            var time = $this.activityInfo.endTime - $this.activityInfo.serverTime;
                            $this.countdown(time, $this.result, true);
                        }
                    }
                    $this.init = true;
                    $this.setTitle(d.brandName + d.name);

                    $this.productData.shippingInfo = $this.productData.shippingInfo && $this.productData.shippingInfo.replace(/\n/g, '/n').split('/n');
                    if ($this.productData.hasOptions == 0) {
                        $this.number = 1;
                    } else {
                        for (var i = 0; i < $this.productData.options.length; i++) {
                            if ($this.productData.options[i].disabled == '0') {
                                $this.allDisable = false;
                                break;
                            }
                        }
                        $this.init = true;
                        $this.isWished();
                        $this.getCart();
                    }

                    if($this.productData.hasBundleOption > 0){
                        var bundleOptions = $this.productData.bundleOptions;
                        for(var l=0; l<bundleOptions.length; l++){
                            if(bundleOptions[l].options.length){
                                $this.optionImg.push(bundleOptions[l].options[0].imgUrl)
                            }
                        }
                    }
                    $this.getPrice();
                    $this.isWished();
                    $this.getCart();
                    $this.getComment();
                    $this.getBestComment();
                    $this.getPromotionInfo();

                    $this.initView(viewName);

                    $this.initScroll();

                    var sharePrice = $this.productData.price;
                    if ($this.productData.activityType == 3 && $this.productData.newcomerInfo && $this.productData.newcomerInfo.newcomerPrice) {
                        $this.newComerPrice = $this.productData.newcomerInfo.newcomerPrice;
                    }

                    var shareTitle = '【MEMEBOX】' + $this.productData.brandName + ' ' + $this.productData.name + ' ' + sharePrice;
                    var shareImg = $this.productData.img[0];
                    var share = {
                        title: shareTitle,
                        text: '我在MEMEBOX发现了一件不错的商品，快来看看吧！',
                        url: location.href,
                        image: shareImg
                    };
                    $this.set_share(share);
                    $this.discount = $this.getDiscount($this.productData.activityType);
                }
            });
        },
        getPrice: function () {
            var $this = this;
            $this.httpAjax({
                url: '/global/price',
                domain: $this.searchDomain,
                param: {productIds: $this.pid},
                success: function (data) {
                    if (data.code == 1) {
                        var pro = data.data[0];
                        for (var k in pro) {
                            pro[k] && ($this.productData[k] = pro[k]);
                        }
                        /**
                         * 秒杀库存
                         */
                        if ($this.productData.activityType == 4) {
                            var arr = [
                                "",
                                "",
                                true,
                                (pro.stockStatus == 1) && (parseInt($this.flashSale.secKillStockStatus)) && $this.canBuyPro()
                            ];
                            $this.flashSale.secKillStockStatus = arr[$this.flashSale.secKillStatus];
                        }
                        // if (data.data[0].price && data.data[0].price != '') {
                        //     $this.productData.price = data.data[0].price;
                        // }
                        // if (data.data[0].originPrice && data.data[0].originPrice != '') {
                        //     $this.productData.originPrice = data.data[0].originPrice;
                        // }
                        // if (data.data[0].specialPrice && data.data[0].specialPrice != '') {
                        //     $this.productData.specialPrice = data.data[0].specialPrice;
                        // }
                    }
                }
            });
        },

        getComment: function () {
            var $this = this;
            $this.httpAjax({
                param: {"product_id": $this.productData.productId, "page": $this.pageIndex, "pageSize": $this.pageSize},
                url: '/h5/comment/reviewList',
                async: false,
                goLogin: false,
                alert: 'false',
                success: function (data) {
                    var list = data.data;
                    if (data.code == 1 && data.total && data.total != 0) {
                        if ($this.pageIndex > 1) {
                            $this.commentData.data = $this.commentData.data.concat(list);
                        } else {
                            $this.commentData = data
                        }
                    }
                }
            });
        },
        toComment: function () {
            var $this = this;
            setTimeout(function () {
                $this.swiper = new Swiper('#comment .swiper-container', {
                    slidesPerView: 3,
                    paginationClickable: true,
                    spaceBetween: 10,
                    freeMode: true
                });
            }, 0)
        },
        preview: function (img) {
            var $this = this;
            $this.bigImg = img;
        },
        closePre: function (event) {
            var $this = this;
            $this.bigImg = null;
        },
        buy: function (event) {
            event.preventDefault();
            var $this = this;
            $this.showProduct = 1;
        },
        cartAn: function () {
            var $this = this;
            $this.ani = true;
            setTimeout(function () {
                $this.ani = false;
                $this.can = true;
            }, 0);
        },
        close: function (event) {
            event.preventDefault();
            var $this = this;
            $this.showProduct = '';
        },
        getCart: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newcart/count',
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
        },
        /**
         * 秒杀商品结算
         */
        goFlashOrder: function () {
            var $this = this;
            $this.productData.orderLimit = 1;
            if ($this.flashSale.secKillStatus == 3 && $this.flashSale.secKillStockStatus == true) {
                _maq.push(["_trackEvent", "flash_detail_buy", {}]);
                if ($this.productData.options.length != '0') {
                    $this.$refs.productdata.showSelectOption($this.flashSale.secKillPrice);
                } else {
                    location.href = "/m/payment/flashsale_order.html?productId=" + this.productData.productId + "&durationId=" + this.flashSale.durationId + "&groupId=" + this.flashSale.groupId;
                }
            }
        },
        /**
         * 预售购买
         */
        presaleBuy: function () {
            var $this = this;
            $this.productData.addCart = false;
            $this.productData.orderLimit = $this.presaleInfo.orderLimit;
            $this.$refs.productdata.showSelectOption($this.presaleInfo.deposit);
        },
        /**
         * 拼团购买
         */
        grouponBuy: function () {
            var $this = this;
            $this.productData.addCart = false;
            $this.productData.orderLimit = $this.grouponInfo.orderLimit;
            $this.$refs.productdata.showSelectOption($this.grouponInfo.grouponPrice);
        },
        newcomerBuy: function () {
            var $this = this;
            if (localStorage.mmToken) {
                $this.productData.addCart = false;
                $this.productData.orderLimit = $this.productData.newcomerInfo.orderLimit;
                $this.$refs.productdata.showSelectOption($this.productData.newcomerInfo.newcomerPrice);
            } else {
                localStorage.ref = location.href;
                if ($this.isApp()) {
                    $this.app_login({source: 10});
                } else {
                    $this.h5_login(null, 10);
                }
            }
        },
        /**
         * 加入购物车
         */
        addCart: function () {
            var $this = this;
            $this.productData.orderLimit = false;
            if ($this.productData.options.length != '0' || $this.productData.bundleOptions.length != 0) {
                $this.productData.addCart = true;
                $this.$refs.productdata.showSelectOption();
            } else {
                var url = '/h5/newcart/add?productId=' + $this.productData.productId;
                $this.can = false;
                $this.httpAjax({
                    url: url,
                    showLoading: true,
                    success: function (data) {
                        $this.cartAn();
                        //购物车数量
                        $this.httpAjax({
                            url: '/h5/newcart/count',
                            showLoading: true,
                            success: function (data) {
                                $this.cartNumber = data['data']['totalQty'];
                                _hmt.push(['_trackEvent', 'add_cart', '加入购物车']);
                                _maq.push(["_trackEvent", "add_cart", {
                                    is_pb: $this.isPb,
                                    brandId: $this.currentBrandId,
                                    keynode_page: $this.KEYNODE
                                }]);

                                // _maq.push(["_trackEvent", "add_cart", {}]);
                                // _maq.push(["_trackEvent", "add_cart", {
                                //     is_pb: $this.isPb,
                                //     brandId: $this.currentBrandId,
                                //     keynode_page: $this.KEYNODE
                                // }]);
                                $this.isFromStockSMS() && _maq.push(["_trackEvent" , "msg_arrival_notice-cart" , '通过到货通知加入购物车']);
                            }
                        });
                    },
                    complete: function () {
                        $this.can = true;
                    }
                });
            }
        },
        isWished: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/account/productwishlist',
                goLogin: false,
                param: {productId: $this.pid},
                success: function (data) {
                    if (data.code == 1) {
                        $this.collection = data.isWished;
                    }
                }
            })
        },
        useCollection: function () {
            var $this = this;
            if ($this.collection == 1) {
                var $this = this;
                $this.httpAjax({
                    url: '/h5/account/removeFromWishlist',
                    param: {productId: $this.pid},
                    success: function (data) {
                        if (data.code == 1) {
                            $this.collection = 0;
                        } else {
                            $this.collection = 1;
                        }
                        $this.popup({content: data.msg});
                    }
                })
            } else {
                var $this = this;
                $this.httpAjax({
                    url: '/h5/account/addToWishlist',
                    param: {productId: $this.pid},
                    success: function (data) {
                        if (data.code == 1) {
                            $this.collection = 1;
                        } else {
                            $this.collection = 0;
                        }
                        $this.popup({content: data.msg});
                    }
                })
            }
            $this.collection = $this.collection == 1 ? 0 : 1;

        },
        takMask: function (event) {
            event.preventDefault();
            this.showTaxMask = !this.showTaxMask;
        },
        /**
         * MB详情弹窗
         */
        toggleMBMasek: function () {
            var $this = this;
            if ($this.isFanliApp()) {
                $this.fanliMask();
            } else {
                $this.popup({
                    content: $this.mbData.rewardDesc,
                    type: 'alert',
                    autoClose: false
                });
            }
        },
        /**
         * 返利
         */
        fanliMask: function () {
            var $this = this;
            $this.popup({
                title: '<p style="margin-bottom: 20px;color:#333">下载APP，蜜豆赚不停！</p>',
                content: '<p style="margin-bottom: 0;font-size:12px;text-align: left;color:#333;line-height: 20px;">注:仅在Memebox网站和APP内下单才可返蜜豆，更多会员权限请登陆Memebox查看。</p>',
                type: 'confirm',
                btn: ['<span style="color:#ccc">知道啦</span>', '去下载'],
                titleClass: 'mini',
                ok: function () {
                    location.href = 'http://pkg-cn1001.memebox.com/android/other/automm.html#flw';
                }
            });
        },
        getMBReward: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/memeclub/productExtra',
                showLoading: true,
                param: {
                    productId: $this.productData.productId
                },
                goLogin: false,
                success: function (res) {
                    $this.mbData = res.data;
                    localStorage.isNew=res.data.isNewcomer;
                }
            });
        },
        /**
         * app里
         */
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.getDetail();
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
                this.getDetail();
            }
        },

        /**
         * 去购物车
         */
        goCart: function () {
            location.href = '../cart/cart.html';

        },
        choiceOption: function () {
            var $this = this;
            if ($this.canBuyPro()) {
                if ($this.productData.activityType == 4) {
                    $this.$refs.productdata.showSelectOption($this.flashSale.secKillPrice);
                } else {
                    $this.$refs.productdata.showSelectOption();
                }
                $this.productData.addCart = true;
            }
        },
        /**
         * 展示预售规则
         */
        showPresaleRule: function () {
            var $this = this;
            var str = '';
            var arr = [];
            arr = $this.presaleInfo.description && $this.presaleInfo.description.replace(/\n/g, '/n').split('/n');
            arr.forEach(function (element, index, array) {
                str += '<p style="text-align: left">' + element + '</p>';
            });
            $this.popup({
                type: 'confirm',
                title: '预售须知',
                content: str,
                btn: ['关闭'],
            });
        },
        getPromotionInfo: function () {
            var $this = this;

            setTimeout(function () {
                $this.swiper = new Swiper('.promotions .swiper-container', {
                    slidesPerView: 2.3,
                    paginationClickable: true,
                    spaceBetween: 10,
                    freeMode: true,
                    /*scrollbar: '.swiper-scrollbar',*/
                    autoplayDisableOnInteraction: false
                });
            }, 0);
        },
        toGiftDetail: function (productId) {
            location.href = "productDetails.html?p=" + productId;
        },
        viewPromotion: function () {
            var $this = this;
            $this.$refs.promotion.showPromotion();
        },
        getBestComment: function () {
            var $this = this;

            $this.httpAjax({
                //url: '/h5/product/comment?productId=' + $this.productData.productId,
                url: '/h5/comment/excellentList?product_id=' + $this.productData.productId,
                async: false,
                goLogin: false,
                alert: 'false',
                success: function (data) {
                    if (data.code == 1) {

                        var thumbListLength = 0;
                        for (var i = 0; i < data.data.length; i++) {
                            if (data.data[i].thumbList.length > 0) {
                                thumbListLength++;
                            }
                        }
                        $this.bestCommentLength = thumbListLength;
                        $this.bestCommentData = data;

                        setTimeout(function () {
                            $this.swiper = new Swiper('.product-comment .swiper-container', {
                                slidesPerView: 'auto',
                                paginationClickable: true,
                                spaceBetween: 10,
                                freeMode: true
                            });
                        }, 500)
                    }
                }
            });

        },
        initScroll: function () {
            var $this = this;
            var timer;
            setTimeout(function () {
                var scrollDom = document.querySelector('#s-details');
                var scroll = mui('#s-details').scroll()
                scrollDom.addEventListener('scroll', function () {
                    timer = setTimeout(function () {
                        $this.scrollY = scroll.y;
                        clearTimeout(timer);
                    }, 50)
                })
            }, 0);
        },
        changePosition: function () {
            var $this = this;
            if (!$this.toTop) {
                var infoDom = document.querySelector('.product-information');
                var detailOffset = infoDom.offsetTop - 44;

                mui("#s-details").scroll().scrollTo(0, -detailOffset, 1000);
                $this.toTop = true;        //返回顶部
            } else {
                mui("#s-details").scroll().scrollTo(0, 0, 1000);
                $this.toTop = false;
            }

        },
        isEmptyObject: function (e) {
            var t;
            for (t in e)
                return !1;
            return !0
        },
        brandIdSta: function (sta, id) {
            var $this = this,
                brandName = $this.productData.brandName;
            $this.currentBrandId = id;
            if (sta == 1) {
                return "/m/brand/home.html?id=" + id;
            } else {
                return "/m/search/search.html?searchInput="+ encodeURIComponent(brandName);
            }
        },
        enterBrand: function () {
            var $this = this,
                brandName = $this.productData.brandName,
                brandId = $this.currentBrandId;
            if (brandId) {
                _maq.push(["_trackEvent", "product_detail_enter_brand_click", {
                    brand_id: brandId,
                    keynode_page: $this.KEYNODE
                }]);
            }else{
                _maq.push(["_trackEvent", "product_detail_enter_brand_click", {
                    brand_name: brandName,
                    keynode_page: $this.KEYNODE
                }]);
            }
        },
        isFromStockSMS: function () {
            return this.getSearch('type') && this.getSearch('type').toLowerCase() === 'stock_notification';
        },
        /**
         * 获取产品参数
         */
        getProParams: function () {
            var $this = this;
            var objFun = {
                4: function () {
                    return {
                        productId: $this.pid,
                        groupId: $this.getSearch("groupId"),
                        durationId: $this.getSearch("durationId"),
                        activityType: 4
                    }
                }
            };
            return objFun[$this.getSearch("activityType")]();
        }
    },
    ready: function () {
        var $this = this,
            keynode,
            obj = {
                productId: $this.pid
            },
            ary = ["", "H5首页", "H5搜索页", "H5品牌页"];
        keynode = sessionStorage.KEYNODE || 0;
        $this.KEYNODE = ary[keynode] || "";

        if ($this.getSearch("activityType")) {
            obj = $this.getProParams();
        }
        // keynode = sessionStorage.KEYNODE ? sessionStorage.KEYNODE : 0;
        // if (keynode == 1) {
        //     $this.KEYNODE = "H5首页";
        // } else if (keynode == 2) {
        //     $this.KEYNODE = "H5搜索页";
        // } else if (keynode == 3) {
        //     $this.KEYNODE = "H5品牌页";
        // } else {
        //     $this.KEYNODE = "";
        // }
        $this.isFromStockSMS()?($this.getSearch('from') && (obj.from = $this.getSearch('from'))):'';
        this.$refs.tdl.url=window.appsdk.global.toAppProduct(obj);
    },
    created: function () {
        var $this = this;
        $this.pid = $this.getSearch('p') || location.hash.slice(1);
        $this.productData.productId = $this.pid;
        $this.isFromStockSMS() && _maq.push(["_trackEvent" , "msg_arrival_notice" , { customer: $this.getSearch('u'), msg: '收到到货通知短信并点击在浏览器打开' }]);
        if ($this.isApp()) {
            appsdk.global.product($this.pid);
        } else {
            $this.getDetail();

            $this.getMBReward();
            $this.initMui();
            _hmt.push(['_trackEvent', 'product_detail', '显示详情页']);
        }
    },
    watch: {
        scrollY: function (val, oldVal) {
            var $this = this;
            var windowH = document.body.clientHeight;
            var scrollH = windowH * 0.6;
            var opacityBg = 0;

            var scrollY = val;

            if (scrollY >= 0) {
                opacityBg = 0;
                $this.showTitle = false;
                $this.iconBg = true;
                $this.imgTextBtn = false;
                $this.$refs.tdl.showDow = true;
            } else if (scrollY < 0 && scrollY >= -(scrollH)) {
                opacityBg = (-scrollY / scrollH).toFixed(2);
                $this.showTitle = true;
                $this.iconBg = false;
                $this.imgTextBtn = false;
                $this.$refs.tdl.showDow = false;
            } else {
                opacityBg = 1;
                $this.showTitle = true;    //标题
                $this.iconBg = false;      //标题栏按钮

                $this.imgTextBtn = true;
                var infoDom = document.querySelector('.product-information');
                var scrollDis = infoDom.offsetTop - 44;
                if (scrollY > -scrollDis) {
                    $this.toTop = false;        //图文详情
                } else {
                    $this.toTop = true;        //返回顶部
                }
                $this.$refs.tdl.showDow = false;
            }

            $this.headerCss = {'background-color': 'rgba(255, 80, 115,' + opacityBg + ')'};     //标题栏背景*/
        },
    }
});
