/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var groupProduct = Vue.extend({
    props: ['product', 'showstockout'],
    template: __inline('../../html/group/_groupProduct.html'),
    methods: {
        getIcon: function (status) {
            var img = 'status-1.png';
            if (status == '3') {
                img = 'status-2.png';
            } else if (this.$parent.btnDis()) {
                img = 'status-3.png';
            } else if (status == '1' || status == '2') {
                img = 'status-1.png';
            } else {
                img = 'status-3.png';
            }
            return '/images/app/group/include/' + img;
        }
    }
});
Vue.component('gp', groupProduct);

vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: '拼团详情',
        init: false,
        /**
         * 拼团详情
         */
        _groupDetail: {},
        groupDetail: {},
        shareMask: 0,
        shareMasks: 0,
        /**
         * 商品详情
         */
        product: {},

        cd: {},
        groupMax: 0,
        isEnd: false,
    },
    methods: {
        downloadApp: function () {
            _hmt.push(['_trackEvent', 'group buying_download', '下载APP']);
        },
        /**
         *
         * @param data
         */
        getUrl: function () {
            var $this = this;
            if (this.isAppGroupon()) {
            } else {
                return location.origin + this.page + '/productDetails/productDetails.html#' + $this.product.productId;
            }
        },
        /**
         *
         * @param data
         */
        goDetail: function () {
            var $this = this;
            if (this.isAppGroupon()) {
                this.app_product({productId: $this.product.productId});
            } else {
                location.href = location.origin + this.page + '/productDetails/productDetails.html#' + $this.product.productId;
            }
        },
        userInfoCall: function (data) {
            var $this = this;
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            }
            if (!localStorage.mmToken) {
                setTimeout(function () {
                    $this.app_login();
                }, 100)
            } else {
                $this.initGroup();
            }
        },
        initGroup: function () {
            var $this = this;
            var param = {};
            if ($this.getSearch('grouponId')) {
                param.grouponId = $this.getSearch('grouponId');
            }
            if ($this.getSearch('orderId')) {
                param.orderId = $this.getSearch('orderId');
            }
            $this.httpAjax({
                url: '/h5/newgroupon/detail',
                param: param,
                success: function (data) {

                    $this.groupDetail = data.data;
                    $this.groupDetail.updateTime =  $this.groupDetail.updateTime;
                    $this.product = $this.groupDetail.productInfo;
                    $this.product.grouponType = $this.groupDetail.grouponType;
                    $this.groupDetail.maxNum = Number($this.groupDetail.maxNum);
                    var cd = data.data.endTime - data.data.serverTime;
                    if (cd <= 0) {
                        $this.isEnd = true;
                    }
                    if ($this.btnDis()) {
                        // $this.popup({content: '活动已结束',type:'alert',ok:function(){
                        // }});
                    }
                    $this.countdown(cd, $this.cd);
                    var url = data.data.grouponId ? location.origin + location.pathname + '?grouponId=' + data.data.grouponId : location.href;
                    $this.share = {
                        title: $this.groupDetail.shareTitle,
                        text: $this.groupDetail.shareContent,
                        url: url,
                        image: $this.groupDetail.shareImg
                    }
                    $this.shareGuide();
                    $this.set_share($this.share);
                    $this.app_setShare($this.share);
                    if (!$this.isBuy() && localStorage.grouponId) {
                        setTimeout(function () {
                            $this.app_share($this.share);
                        }, 100)
                        localStorage.removeItem('grouponId');
                        localStorage.removeItem('share');
                    }
                    $this.groupMax = $this.getGroupMax();

                    $this.init = true;
                }

            })
        },
        /**
         * 过期
         * @returns {boolean}
         */
        btnDis: function () {
            var $this = this;
            // || $this.groupDetail.productInfo.stockStatus != 1
            return !$this.groupDetail.productInfo || !$this.groupDetail.productInfo.grouponPrice || parseFloat($this.groupDetail.productInfo.grouponPrice) <= 0 || $this.isEnd;
        },
        againBuy: function () {
            var $this = this;
            if ($this.groupDetail.productInfo.stockStatus == 1) {
                if ($this.isAppGroupon()) {
                    return this.app_product({productId: $this.groupDetail.productInfo.productId})
                    //location.href = $this.domain+'/catalog/product/view/id/'+$this.groupDetail.productInfo.productId;
                } else {
                    location.href = $this.page + '/productDetails/productDetails.html#' + $this.groupDetail.productInfo.productId;
                }
            }
        },
        shareF: function () {
            if (this.isApp()) {
                this.app_share(this.share);
            } else {
                this.shareMask = 1;
                console.log(this.shareMask);
            }
        },
        isPayOk: function (status) {
            return status == 'processing' || status == 'complete';
        },
        shareGuide: function () {
            if (localStorage.grouponId || localStorage.share == 'true') {
                this.shareMask = 1;
            }
        },
        hideGuide: function () {
            this.shareMask = 0;
            this.shareMasks = 0;
        },
        downPHide: function () {
            var $this = this;
            $this.getAppUrl({wx:'https://lnk0.com/UZBZVt'});
            $this.hideGuide();
        },
        isInGroupDetail: function () {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return item.customerId == $this.groupDetail.customerInfo.customerId;
            });
            return newArr.length == 0;
        },
        isMe: function (cid) {
            return cid == this.groupDetail.customerInfo.customerId
        },
        payCount: function () {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return $this.isPayOk(item.processState);
            });
            return newArr.length;
        },
        isBuy: function () {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return item.customerId == $this.groupDetail.customerInfo.customerId && $this.isPayOk(item.processState);
            });
            return newArr.length == 0;
        },
        yf: function () {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return (item.customerId == $this.groupDetail.customerInfo.customerId && $this.isPayOk(item.processState))|| (item.customerId == $this.groupDetail.customerInfo.customerId && !$this.isPayOk(item.processState));
            });
            return newArr.length >0;
        },
        isHidMe: function (info) {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return item.customerId == info.customerId && $this.isPayOk(item.processState);
            });
            return newArr.length == 0;
        },
        getGroupMax: function () {
            var $this = this;
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return $this.isPayOk(item.processState) || $this.isMe(item.customerId);
            });
            console.log($this.groupDetail.maxNum, newArr)
            var m = $this.groupDetail.maxNum - newArr.length;
            m = m < 0 ? 0 : m;
            return m;
        },
        format: function (fmt, date) {
            var d = new Date(date * 1000);
            var o = {
                "M+": d.getMonth() + 1,                 //月份
                "d+": d.getDate(),                    //日
                "h+": d.getHours(),                   //小时
                "m+": d.getMinutes(),                 //分
                "s+": d.getSeconds(),                 //秒
                "q+": Math.floor((d.getMonth() + 3) / 3), //季度
                "S": d.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        /**
         * 弹出选择框
         */
        showSelectOption: function () {
            var $this = this;
            if (!$this.btnDis() && $this.groupDetail.productInfo.stockStatus == 1) {
                $this.product.addCart = false;
                $this.product.grouponId = $this.getSearch('grouponId');
                $this.product.activityType = '1';
                $this.product.activityId = $this.groupDetail.activityId;
                $this.product.orderLimit = $this.groupDetail.orderLimit;
                $this.$refs.productdata.showSelectOption($this.product.grouponPrice);
            }
        },
        /**
         * 查看全部订单../my/orders.html
         */
        goOrderList: function () {
            var $this = this;
            if ($this.isApp()) {
                $this.app_orderList({menu: '0'});
            } else {
                location.href = '../my/orders.html';
            }
        }

    },
    ready: function () {

    },
    created: function () {
        var $this = this;
        // localStorage.grouponId=1;
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        } else {
            $this.initGroup();
        }
    }
});
