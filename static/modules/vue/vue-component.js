/**
 * Created by page.xia on 16/6/23.
 */
var Vue = require('vue/vue');
var swipe = require('vue/vue-swipe');
Vue.component('loading', {
    data: function () {
        return {
            show: true,
            text: '努力加载中...'
        }
    },
    template: '<div align="center" v-show="show" class="app-loader"><img class="logo" src="<<<uri:../../img/logo.png>>>"></div>'
});
Vue.component('alert', {
    data: function () {
        return {
            show: false,
            text: ''
        }
    },
    template: '<div align="center" v-show="show" class="ui-loader"><div>{{text}}</div></div>'
});

var ProductList = Vue.extend({
    //产品描述 业务类型 图片 原价 折扣 现价  缺货标志
    props: ['description', 'icon', 'img', 'originPrice', 'discount', 'price', 'url', 'productId', 'stockStatus'],
    template: __inline('../template/product.html')
});
Vue.component('product-list', ProductList);


//banner 轮播
var BannerSlider = Vue.extend({
    props: ['data', 'classify', 'details'],
    template: __inline('../template/slider.html')
});

Vue.component('banner-slider', BannerSlider);


//排序
var Sort = Vue.extend({
    props: ['position', 'positionSort', 'priceSort', 'price'],
    template: __inline('../template/sort.html')
});
Vue.component('sort', Sort);
//搜索分类
var SearchType = Vue.extend({
    //一级类别 一级类别的链接  二级类别的个数  二级类别的名字 二级类别的链接
    props: ['firstLevelName', 'firstLevelUrl', 'secondLevel', 'url', 'firstId'],
    template: __inline('../template/search.html')
});
Vue.component('search-type', SearchType);

//选择支付方式
var SelectPay = Vue.extend({
    props: ['pay'],
    template: __inline('../template/selectPay.html'),
    data: function () {
        return {
            href: null,
            pay: {},
            countdown: ''
        }
    },
    methods: {
        deal: function () {
            this.agree = !this.agree;
        },
        closePay: function () {
            var $this = this;
            var $parent = $this.$parent;
            if ($this.pay.showCloseBox) {
                $parent.popup({
                    type: 'confirm',
                    title: ' ',
                    content: '真的要停止付款吗？',
                    btn: ['<span style="color:#999">去意已决</span>', '我再看看'],
                    n: function (e) {
                        location.href = $parent.page + '/payment/my_orders.html';
                    }
                });
            } else {
                mui('#select-pay').popover('toggle');
            }
        },
        checkout: function (e) {
            var $this = this;
            if ($this.pay.ali) {
                $this.pay.globalUrl = $this.pay.globalUrl || '/h5/payment/alipayPayment?orderId=' + $this.pay.orderId + '&orderIds=' + ($this.pay.orderIds || '');
                // $this.pay.globalUrl = $this.pay.globalUrl || '/h5/payment/globalAlipayPayment?orderId=' + $this.pay.orderId + '&orderIds=' + ($this.pay.orderIds || '');
                if ($this.pay.global) {
                    this.$parent.httpAjax({
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
                    $this.pay.aliUrl = $this.pay.aliUrl || '/h5/payment/alipayPayment?orderId=' + $this.pay.orderId + '&orderIds=' + ($this.pay.orderIds || '');//+($this.pay.step&&'&step='+$this.pay.step);
                    this.$parent.httpAjax({
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
                this.$parent.wxPay({
                    orderId: $this.pay.orderId,
                    wxOk: function (data) {
                        if ($this.pay.wxOk) {
                            $this.pay.wxOk(data);
                        }
                    }
                });
            }

        },
        payBoxInit: function (obj) {
            console.log(obj)
            /*
             obj.type:
             1: 韩国仓->国际支付宝
             2: 极速仓->国内支付宝或微信
             其他: 保税仓->国内支付宝
             */
            var $this = this;
            $this.pay.time = false;
            init();
            if (obj.clear) {
                clearInterval($this.countdown);
                formatTime(obj.time);
                countDown();
            } else {
                if (obj.time) {
                    countDown();
                } else {
                    $this.pay.time = false;
                }
            }
            function countDown() {
                $this.countdown = setInterval(function () {
                    if (obj.time >= 0) {
                        formatTime(obj.time);
                        obj.time--;
                    } else {
                        $this.pay.time = false;
                        clearInterval($this.countdown);
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

            function init() {
                $this.pay.totalAmount = obj.grantTotal;
                $this.pay.showCloseBox = obj.showCloseBox;
                $this.pay.orderId = obj.orderId;
                $this.pay.orderIds = obj.orderIds;
                $this.pay.step = obj.step;
                if ($this.$parent.isWeixin() && (obj.type == 2)) {
                    $this.pay.wx = true;
                    $this.pay.ali = false;
                    $this.pay.wxOk = function () {
                        location.href = "/m/payment/payment.html?orderIds=" + $this.$parent.getOrderIds('orderIds') + '&orderId=' + obj.orderId;
                    }
                } else {
                    $this.pay.wx = false;
                    $this.pay.ali = true;
                }
                $this.pay.global = (obj.type == '1'||obj.type=="8") ? true : false;
            }
        },
    },
});
Vue.component('select-pay', SelectPay);
/**
 * 选择产品种类
 */
var SelectOption = Vue.extend({
    props: ['productData'],
    template: __inline('../template/selectOption.html'),
    data: function () {
        return {
            productData: {},
            number: '1',
            price: '',
        }
    },
    methods: {
        minusNumber: function () {
            var $this = this;
            if ($this.number > 1) {
                $this.number--;
            }
        },
        addNumber: function () {
            var $this = this;
            console.log($this.productData.orderLimit)

            if (parseInt($this.number) == parseInt($this.productData.orderLimit)) {
                $this.$parent.popup({
                    content: '最大购买数量为' + $this.productData.orderLimit
                });
            } else {
                $this.number++;
                console.log($this.number)
            }
        },
        getImg: function () {
            var $this = this;
            if ($this.productData.img) {
                if ($this.productData.img instanceof Array) {
                    return $this.productData.img[0]
                } else {
                    return $this.productData.img
                }
            } else {
                return $this.productData.imgUrl
            }
        },
        addCart: function (url, addCart) {
            var $this = this;
            var params = {
                grouponId: $this.productData.grouponId,
                productId: $this.productData.productId,
                activityId: $this.productData.activityId || ($this.productData.grouponInfo && $this.productData.grouponInfo.activityId),
                configId: $this.productData.configId || ($this.productData.newcomerInfo && $this.productData.newcomerInfo.configId),
                qty: $this.number,
                option_id: '',
                value: ''
            };
            var arr = [];
            if ($this.productData.options && $this.productData.options.length > 0) {
                var checkedLabel = document.querySelector('[name=color]:checked+label');
                if (checkedLabel == null) {
                    $this.$parent.popup({
                        content: '请选择颜色',
                        time: 1000
                    });
                } else {
                    var index = checkedLabel.getAttribute('index');
                    var option_id = $this.productData.options[index].option_id;
                    var value = $this.productData.options[index].value;
                    if (Number($this.productData.options[index].qty) < Number($this.number)) {
                        $this.$parent.popup({
                            content: addCart ? '加入购物车失败，该商品库存不足' : '该商品库存不足', time: 1000, autoClose: true
                        });
                    } else {
                        if (addCart) {
                            var options = 'options[' + option_id + ']';
                            $this.$parent.httpAjax({
                                url: url + '?' + options + '=' + value,
                                param: {
                                    productId: $this.productData.productId,
                                    qty: $this.number,
                                },
                                showLoading: true,
                                success: function (data) {
                                    $this.$parent.number = $this.number;
                                    $this.closeSelectOption();
                                    $this.$parent.cartAn();
                                    //购物车数量
                                    $this.$parent.httpAjax({
                                        url: '/h5/newcart/count',
                                        showLoading: true,
                                        success: function (data) {
                                            setTimeout(function () {
                                                $this.$parent.cartNumber = data['data']['totalQty'];
                                            }, 50);
                                            _hmt.push(['_trackEvent', 'add_cart', '加入购物车']);
                                            _maq.push(["_trackEvent", "add_cart", {}]);
                                        }
                                    });
                                }
                            });
                            return;
                        } else {
                            params.option_id = option_id;
                            params.value = value;
                            for (var i in params) {
                                if (params[i]) {
                                    arr.push(i + '=' + params[i]);
                                }
                            }
                            url += arr.join('&');
                            location.href = url;
                        }
                    }
                }
            }else if ($this.productData.bundleOptions && $this.productData.bundleOptions.length > 0) {
                var checkedLabel = document.querySelectorAll(".bundle");
                var checkedRadio = true;
                for(var l=0; l<checkedLabel.length; l++){
                    if(!checkedLabel[l].querySelector("input[type='radio']:checked")){
                        checkedRadio = false;
                    }
                }
                if (checkedRadio == false) {
                    $this.$parent.popup({
                        content: '请选择规格',
                        time: 1000
                    });
                } else {
                    var allBundleProducts = document.querySelectorAll(".bundle input[type='radio']:checked");
                        bundleProductIds = $this.getAllProductId(allBundleProducts);
                    if (addCart) {
                        $this.$parent.httpAjax({
                            url: url,
                            param: {
                                productId: bundleProductIds,
                                qty: $this.number
                            },
                            showLoading: true,
                            success: function (data) {
                                $this.$parent.number = $this.number;
                                $this.closeSelectOption();
                                $this.$parent.cartAn();
                                //购物车数量
                                $this.$parent.httpAjax({
                                    url: '/h5/newcart/count',
                                    showLoading: true,
                                    success: function (data) {
                                        setTimeout(function () {
                                            $this.$parent.cartNumber = data['data']['totalQty'];
                                        }, 50);
                                        _hmt.push(['_trackEvent', 'add_cart', '加入购物车']);
                                        _maq.push(["_trackEvent", "add_cart", {}]);
                                    }
                                });
                            }
                        });
                        return;
                    } else {
                        params.productId = bundleProductIds;
                        params.qty = $this.number;
                        for (var i in params) {
                            if (params[i]) {
                                arr.push(i + '=' + params[i]);
                            }
                        }
                        url += arr.join('&');
                        location.href = url;
                    }
                }
            } else {
                for (var i in params) {
                    if (params[i]) {
                        arr.push(i + '=' + params[i]);
                    }
                }
                url += arr.join('&');
                location.href = url;
            }

        },
        getAllProductId: function (obj) {
            var theProductList = obj ? obj:null,
                boudleProductId = [],
                simpleOption;
            boudleProductId[0] = this.productData.productId;
            if(theProductList){
                for(var i=0; i<theProductList.length; i++){
                    boudleProductId.push(theProductList[i].getAttribute("value"));
                }
            }
            simpleOption = document.querySelectorAll(".simpleOption");
            if(simpleOption){
                for(var l=0; l<simpleOption.length; l++){
                    boudleProductId.push(simpleOption[l].getAttribute("data-val"));
                }
            }
            return boudleProductId.join("_");
        },
        trimName: function (str) {
            var str = str.replace(/(^\s+)|(\s+$)/g,'');
            if(str){
                return true;
            }else{
                return false;
            }
        },
        sureBtn: function (event) {
            event.preventDefault();
            var $this = this,
                ary = [
                    ['/h5/newcart/add?', true, function () {
                        _maq.push(["_trackEvent", "join_group_detail", {grouponId: $this.productData.grouponId}]);
                    }],
                    ['/m/payment/group_order.html?', false],
                    ['/m/payment/presale_order.html?', false],
                    ['/m/payment/newcomer_order.html?', false],
                    ["/m/payment/flashsale_order.html?groupId=", false, function () {
                        var seckillInfo = $this.productData.seckillInfo;
                        ary[4][0] += seckillInfo.groupId + "&durationId=" + seckillInfo.durationId+"&";
                    }]
                ],
                activeType = $this.productData.activityType || 0;
                activeType=activeType ==3 && localStorage.isNew==0 ? 0 : activeType;
            if ($this.number > $this.productData.orderLimit && $this.productData.orderLimit) {
                $this.$parent.popup({
                    content: '最大购买数量为' + $this.productData.orderLimit
                });
            } else {
                typeof ary[activeType][2] === "function" && ary[activeType][2]();
                $this.addCart.apply(null, ary[activeType].slice(0, 2));
                console.log(this.productData);
                // if ($this.productData.addCart == false) {
                //     if ($this.productData.activityType == '1') {
                //         _maq.push(["_trackEvent", "join_group_detail", {grouponId: $this.productData.grouponId}])
                //         $this.addCart('/m/payment/group_order.html?', false);
                //     } else if ($this.productData.activityType == '2') {
                //         $this.addCart('/m/payment/presale_order.html?', false);
                //     } else if ($this.productData.activityType == '3') {
                //         $this.addCart('/m/payment/newcomer_order.html?', false);
                //     }
                // } else {
                //     $this.addCart('/h5/newcart/add?', true);
                // }
            }
        },
        closeSelectOption: function () {
            document.querySelector('#selectOption .select-option').style.transform = 'translateY(100%)';
            setTimeout(function () {
                document.getElementById('selectOption').style.display = 'none';
            }, 500);

            var a = document.querySelector('.show-options.color-kind input:checked');
            var text = a && a.parentNode.getElementsByClassName('option-name')[0].innerHTML;
            var allItem = document.querySelectorAll(".bundle");
            var allItemStr = "";
            var simpleOption = document.querySelectorAll(".simpleOption");
            this.$parent.text = text;
            if(allItem.length){
                for(var l=0; l<allItem.length; l++){
                    var theItem = allItem[l].querySelector("input[type='radio']:checked");
                    if(theItem && theItem.getAttribute("itemName")){
                        allItemStr += '"'+theItem.getAttribute("itemName")+'" ';
                    }
                }
                this.$parent.text = allItemStr;
            }
            if(simpleOption.length){
                for(var l=0; l<simpleOption.length; l++){
                    var theItem = simpleOption[l].querySelector('.options-item-name').innerHTML;
                    if(theItem){
                        allItemStr += '"'+theItem+'"';
                    }
                }
                this.$parent.text = allItemStr;
            }
        },
        showSelectOption: function (price) {
            var $this = this;
            if ($this.productData.orderLimit) {
                $this.number = '1';
            }
            price ? ($this.price = price) : ($this.price = $this.productData.price);
            document.getElementById('selectOption').style.display = 'block';
            setTimeout(function () {
                document.querySelector('#selectOption .select-option').style.transform = 'translateY(0)';
            }, 10);

            var bundleOptions = this.productData.bundleOptions;
            var allItem = document.querySelectorAll(".options-item");
            var theItem;
            for(var l=0; l<bundleOptions.length; l++){
                if(bundleOptions[l].options.length > 1){
                    theItem = allItem[l].querySelector("input[type='radio']:checked");
                    if(!theItem){
                        Vue.set(bundleOptions[l],'optionImg', bundleOptions[l].options[0].imgUrl);
                    }
                }
            }
        },
        /**
         * 获取折扣
         * @param i
         */
        getDiscount: function (p1, p2) {
            var _discount = (10 * p1 / p2).toFixed(1);
            if (_discount < 10 && _discount >= 0.1) {
                _discount = _discount + '折';
            } else {
                _discount = false;
            }
            return _discount;
        },
        selectItem: function (item, index) {
            var $this = this,
                options=item.options;
            if(options.length && options[index].disabled==0){
                Vue.set(item,'optionImg',options[index].imgUrl);
                Vue.set(item,'title',options[index].title);
                Vue.set(item,'qty',"x"+options[index].qty);
            }
        }
    }
});
Vue.component('select-option', SelectOption);
/**
 * 头部引导
 */
var topDownload = Vue.extend({
    props: [],
    template: __inline('../template/topDownload.html'),
    data: function () {
        return {
            showDow: true,
            url: '/m/app/'
        }
    },
    methods: {
        showDowF: function () {
            var $this = this;
            $this.showDow = false;
        },
        down: function () {
            setTimeout(function () {
                location.href = '/m/app/'
            }, 500)
        }
    }
});
Vue.component('top-download', topDownload);

/**
 * 头部引导
 */
var newDownload = Vue.extend({
    props: [],
    template: __inline('../template/newDownload.html'),
    data: function () {
        return {
            showDow: true,
            url: '/m/app/'
        }
    },
    methods: {
        showDowF: function () {
            var $this = this;
            $this.showDow = false;
        },
        down: function () {
            setTimeout(function () {
                location.href = '/m/app/'
            }, 500)
        }
    }
});
Vue.component('new-download', newDownload);

/*
 * 促销信息
 * */
var promotion = Vue.extend({
    props: ["promotionInfo"],
    template: __inline("../template/promotion.html"),
    data: function () {
        return {
            show: false,
        }
    },
    methods: {
        closePromotion: function () {
            document.querySelector('#promotion .promotion-list').style.transform = 'translateY(100%)';
            setTimeout(function () {
                document.getElementById('promotion').style.display = 'none';
            }, 500);
        },
        showPromotion: function () {
            var $this = this;
            document.getElementById('promotion').style.display = 'block';
            setTimeout(function () {
                document.querySelector('#promotion .promotion-list').style.transform = 'translateY(0)';
            }, 10);

            $this.swiper = new Swiper('#promotion .swiper-container', {
                slidesPerView: 2.5,
                paginationClickable: true,
                spaceBetween: 10,
                freeMode: true,
                /*scrollbar: '.swiper-scrollbar',*/
                autoplayDisableOnInteraction: false
            });
        },
        toGiftDetail: function (productId) {           /////////////////////////////////////////////////
            location.href = 'productDetails.html?p=' + productId;
        },
    }
});
Vue.component('promotion', promotion);

var discount = Vue.extend({
    props: ['coupon'],
    template: __inline('../template/_discount.html'),
    data: function () {
        return {
            coupon: [],
        }
    },
    methods: {
        changePrice: function (value) {
            var arr;
            if (value.match('折')) {
                arr = ['', parseInt(value.replace('.', '').slice(0, value.length - 1)), '折'];
            } else {
                arr = ['¥', parseInt(value.slice(1))];
            }
            return arr;
        },
        priceChangesClass: function (price) {
            if (price.match('¥')) {
                price = parseInt(price.slice(1));
            } else {
                return 'coupon-box-discount';
            }
            if (price < 30) {
                return 'red';
            } else if (price >= 30 && price <= 50) {
                return 'blue';
            } else {
                return 'purple';
            }
        },
    },
    ready: function () {
        console.log(this.coupon);
    }
});
Vue.component('discount', discount);


/*首页组件*/
//banner
var banner = Vue.extend({
    props: ['bannerData'],
    template: __inline('../template/home/_banner.html'),
    components: {
        'swipe': swipe.Swipe,
        'swipe-item': swipe.SwipeItem
    },
    data: function () {
        return {}
    },
    methods: {
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
        var $this = this;
        var time = setTimeout(function () {
            $this.$parent.initSwipe();
            clearTimeout(time);
        }, 100);
    }
});
Vue.component('home-banner', banner);

//icon
var icon = Vue.extend({
    props: ['iconData'],
    template: __inline('../template/home/_icon.html'),
    data: function () {
        return {}
    },
    methods: {
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
    }
});
Vue.component('home-icon', icon);

//special
var special = Vue.extend({
    props: ['specialData'],
    template: __inline('../template/home/_special.html'),
    data: function () {
        return {}
    },
    methods: {
        getClass: function (index) {
            return 'area' + index;
        },
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
    }
});
Vue.component('home-special', special);

//discount
var discountHome = Vue.extend({
    props: ['discountData'],
    template: __inline('../template/home/_discount.html'),
    data: function () {
        return {
            dd: null,
            hh: null,
            mm: null,
            ss: null,
        }
    },
    methods: {
        getFloat2: function (num) {
            var str = num.toString().slice(-2);
            return str;
        },
        initTime: function () {
            var $this = this;
            var ts = $this.discountData.detail.timeLeft;
            if (ts && ts >= 0) {
                $this.timer(ts);
                var i = setInterval(function () {
                    if (ts > 0) {
                        $this.timer(ts);
                        ts--;
                    } else {
                        clearInterval(i);
                    }
                }, 1000);
            }
        },
        //时间转换
        timer: function (ts) {
            var $this = this;
            var dd = parseInt(ts / 60 / 60 / 24, 10);//计算剩余的天数
            var hh = parseInt(ts / 60 / 60 % 24, 10);//计算剩余的小时数
            var mm = parseInt(ts / 60 % 60, 10);//计算剩余的分钟数
            var ss = parseInt(ts % 60, 10);//计算剩余的秒数
            $this.dd = $this.checkTime(dd);
            $this.hh = $this.checkTime(hh);
            $this.mm = $this.checkTime(mm);
            $this.ss = $this.checkTime(ss);
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
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
        var $this = this;
        $this.initTime();
    }
});
Vue.component('home-discount', discountHome);

//flashsale
var flashsale = Vue.extend({
    props: ['flashsaleData'],
    template: __inline('../template/home/_flashsale.html'),
    data: function () {
        return {
            time: {},
            showFlash:""
        }
    },
    methods: {
        /**
         * 检测秒杀活动状态
         * @param status    secKillStatus
         * @returns {string}     返回class->改变class
         */
        checkStatus: function (status) {
            var ary = [
                "",
                "",
                "no-start",
                "start"
            ];
            return ary[status];
        },
        goFlashDetail: function () {
            var argus = arguments;
            _maq.push(["_trackEvent", "home_cmp_click", {}]);
            location.href = "/m/productDetails/productDetails.html?from=h5home&p=" + argus[0] + "&groupId=" + argus[1] + "&durationId=" + argus[2] + "&activityType=4";
        }
    },
    ready: function () {
        var $this = this;
        // this.$parent.countdown($this.flashsaleData.secKillLeftTime/1000, $this.time, false,function () {
        //     if($this.flashsaleData.nextSecKillLeftTime!=0){
        //         // $this.checkStatus(3);
        //         $this.flashsaleData.secKillStatus = 3;
        //         $this.$parent.countdown($this.flashsaleData.nextSecKillLeftTime/1000, $this.time, false,function () {
        //             $this.$parent.getFlash();
        //         });
        //     }
        // });
        console.log($this.flashsaleData.time)
        $this.showFlash = true;
    }
});
Vue.component('home-flashsale', flashsale);


//activity
var activity = Vue.extend({
    props: ['activityData'],
    template: __inline('../template/home/_activity.html'),
    data: function () {
        return {}
    },
    methods: {
        getFloat2: function (num) {
            var str = num.toString().slice(-2);
            return str;
        },
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
        var $this = this;
    }
});
Vue.component('home-activity', activity);

//groupon
var groupon = Vue.extend({
    props: ['grouponData'],
    template: __inline('../template/home/_groupon.html'),
    data: function () {
        return {}
    },
    methods: {
        getFloat2: function (num) {
            var str = num.toString().slice(-2);
            return str;
        },
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }

            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
        var $this = this;
    }
});
Vue.component('home-groupon', groupon);

//space
var space = Vue.extend({
    props: ['spaceData'],
    template: __inline('../template/home/_space.html'),
    data: function () {
        return {}
    },
    methods: {
        revertHeight: function (height) {
            var h = (height / 2) * 0.0625;
            return h + 'rem';
        },
        toH5Url: function (string) {
            var $this = this;
            var obj = $this.appUrlDecode(string);
            var type = obj.type;
            var text = obj.word;
            var h5UrlInfo = {
                url: '',
                channel: '/m/productClassify/productClassify.html#',    //频道id
                detail: '/m/productDetails/productDetails.html#',    //productId
                brand: '/m/brand/home.html?id=',               //品牌id
                category: '/m/search/search.html?searchInput=',
                function: '/m/search/search.html?searchInput=',
                search: '/m/search/search.html?searchInput='
            }

            if (type == "brand" && text == "0") {
                return "/m/brand/index.html";
            }


            return h5UrlInfo[type] + text;
        },
        appUrlDecode: function (string) {
            var appLinkInfo = {
                url: {domain: 'h5page', action: 'to_h5page', data: {url: ''}},
                channel: {domain: 'channel', action: 'channel', data: {channelId: ''}},
                detail: {domain: 'product', action: 'detail', data: {productId: ''}},
                brand: {domain: 'brand', action: 'to_brand', data: {brandId: ''}},
                category: {domain: 'search', action: 'search_type', data: {type: 0, keyword: ''}},
                function: {domain: 'search', action: 'search_type', data: {type: 1, keyword: ''}},
                search: {domain: 'search', action: 'search_keyword', data: {keyword: ''}}
            }

            var inputInfo = {
                url: 'url',
                channel: 'channelId',
                detail: 'productId',
                brand: 'brandId',
                category: 'keyword',
                function: 'keyword',
                search: 'keyword'
            }

            var obj;
            if (string) {
                var link = decodeURIComponent(string);
                var linkJson = JSON.parse(link.replace("memebox://", ""));

                var type, word;

                var data = linkJson['data'];
                var domain = linkJson['domain'];
                for (var k in appLinkInfo) {
                    if (appLinkInfo[k]['domain'] == domain) {
                        if ((data['type'] == undefined && appLinkInfo[k]['data']['type'] == undefined) || appLinkInfo[k]['data']['type'] == data['type']) {
                            type = k;
                        }
                    }
                }
                var wordKey = inputInfo[type];
                word = data[wordKey];

                obj = {
                    type: type,
                    word: word
                };
            }


            return obj;
        },
    },
    ready: function () {
        var $this = this;
    }
});
Vue.component('home-space', space);

//favor
var favor = Vue.extend({
    props: ['favorData'],
    template: __inline('../template/home/_favor.html'),
    data: function () {
        return {
            favor: {}
        }
    },
    methods: {
        getFloat2: function (num) {
            var str = num.toString().slice(-2);
            return str;
        },
    },
    ready: function () {
        var $this = this;
        // $this.getList();
    }
});
Vue.component('home-favor', favor);