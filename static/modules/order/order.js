/**
 * Created by page on 2016/4/27.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('../payment/ga');
var validate = require('vue/vue-validate');
Vue.use(require('vue/vue-validator'));
Vue.filter('pcc', function (value, index) {
    if (value.match('¥')) {
        return index == 0 ? value.slice(index, 1) : parseInt(value.slice(index));
    } else {
        return index == 0 ? '' : value.replace('.', '');
    }
});


Vue.component('idcard', {
    mixins: [validate],
    props: ['address'],
    data: function () {
        return {
            ID: null
        }
    },
    methods: {
        close: function () {
            mui('#idcardPop').popover('toggle');
        },
        addIdcard: function () {
            var $this = this;
            $this.$parent.valiForm(function () {
                var obj = JSON.parse(JSON.stringify($this.address));
                obj.idcard = $this.ID;
                $this.$parent.saveAddress(true, obj, function () {
                    mui('#idcardPop').popover('toggle');
                    setTimeout(function () {
                        $this.$parent.checkout();
                    }, 500)
                })
            }, $this.$idvali)
        }
    },
    template: __inline('../template/_idcard.html')
});
var vue = new Vue({
    mixins: [common, validate],
    el: 'html',
    data: {
        title: '订单确认',
        init: false,
        pageData: { },
        cartItems: {
            china: [],
            korea: [],
            bonded: [],
            epass:[]
        },
        cartCount: {
            china: null,
            korea: null,
            bonded: null,
            epass:null
        },
        cartTotal: {
            china: null,
            korea: null,
            bonded: null,
            epass:null
        },
        couponText: {
            china: null,
            korea: null,
            bonded: null,
            epass:null
        },
        shippingFee: {
            china: null,
            korea: null,
            bonded: null,
            epass:null
        },
        checkoutList: {
            china: null,
            korea: null,
            bonded: null,
            epass:null
        },
        sc: {
            type: null,
            list: null
        },
        orderAddress: null,

        addressText:null,
        couponCode:null,
        param:{},
        priceData:{
            grandTotal:null, //总价
            usedRewardTotal: null,  //用了优惠券后总价
            reward: null,   //可返回的蜜豆
            notReward:null, //没有用蜜豆支付是可返回的蜜豆
            shippingFee:null,
            discountAmount:null, // 优惠券
            spent_points_amount:null,//蜜豆
            duePaid:null,
            totalQty:null,
            subtotal:null,
            is_used_points:null,
            allowedPoints:null,//当前订单最大可使用的蜜豆数量
            promotionAmount : null //立减

        },
        points: null,
        address: null,
        coupon: [],
        disCoupon: [],
        couponType: 1,
        warehouType: null,
        chkStatus: true,
        selStatus: false,
        couponTotal:0,
        couponPage:1,
        gwpItem: null,
        is_used_points :1,
            pay: {
            wx: false,
                ali: false,
                global: false,
                orderId: null,
                totalAmount: 0,
                time: ''
        },
        successOrders: []

    },
    methods: {
        /*
         价格改变样式
         */
        priceChangesClass: function (type, valid) {
            if(type == 2){
                if(valid == 1){
                    return "coupon_china.png";
                }
                return "coupon_chinaOut.png";
            }else if(type == 1){
                if(valid == 1){
                    return "coupon_kr.png";
                }
                return "coupon_krOut.png";
            }else if(type == 4){
                if(valid == 1){
                    return "coupon_bonded.png";
                }
                return "coupon_bondedOut.png";
            }else if(type == 7){
                if(valid == 1){
                    return "coupon_com.png";
                }
                return "coupon_comOut.png";
            }else{
                return "coupon_out.png";
            }
        },
        /*
         价格格式化
         */
        changePrice: function (type, val) {
            var arr;
            if (type == 1 && val) {
                arr = ['¥', parseFloat(val), ""];
            } else if(type == 2 && val){
                arr = ["", parseFloat(val), '折'];
            }else{
                arr = [];
            }
            return arr;
        },
        //优惠券文字颜色
        changeTxtColor: function (type) {
            if(type == 2){
                return "txt-china";
            }else if(type == 1){
                return "txt-kr";
            }else if(type == 4){
                return "txt-bond";
            }else if(type == 7){
                return "txt-com";
            }else{
                return "";
            }
        },
        showCouponInfo: function (val) {
            if(val == 2){
                return "仅限极速仓使用";
            }else if(val == 1){
                return "仅限韩国仓使用";
            }else if(val == 4){
                return "仅限保税仓使用";
            }else if(val == 7){
                return "全场通用券";
            }else{
                return false;
            }
        },
        /**
         * MB详情弹窗
         */
        toggleMBMasek: function () {
            var $this = this;
            $this.popup({
                content: $this.pageData.rewardDesc,
                type: 'alert',
                autoClose: false
            });
        },
        setPrice: function(data){
            this.priceData.grandTotal=data.usedReward.duePaid;
            this.priceData.reward = data.usedReward.payback;
            this.priceData.notRewardTotal = data.notUsedReward.duePaid;
            this.priceData.notReward = data.notUsedReward.payback;
            this.priceData.allowedPoints = parseFloat(data.totalReward ? data.totalReward :this.priceData.spent_points_amount);
        },
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
        addClick: function () {
            this.param = {};
            this.addressText = null;
        },
        editAddress: function (index) {
            var $this = this;
            var address = $this.address[index];
            $this.param = _.clone(address);
            $this.addressText = address.province + " " + address.city + " " + address.district;
        },
        selectAddress: function (index) {
            this.orderAddress = this.address[index];
            mui.back();
        },
        removeAddress: function (id, index) {
            var $this = this;
            $this.popup({
                type: 'confirm', content: '确认删除？', ok: function () {
                    $this.address.$remove($this.address[index]);
                    $this.httpAjax({
                        url: '/h5/address/delete',
                        param: {addressId: id},
                        success: function (data) {
                            if ($this.orderAddress && id == $this.orderAddress.addressId) {
                                $this.orderAddress = null;
                            }
                            $this.param = {};
                            if (mui('.add-address .address-box').length != 0) {
                                $this.da(0);
                                location.reload();
                            }
                            $this.popup({content: data.msg});
                        }
                    })
                }
            })
        },
        sendSave: function (orderPage, address, callback) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/address/save',
                param: address,
                success: function (data) {
                    if (data.code == 1) {
                        $this.initOrder();
                        if (!orderPage) {
                            mui.back();
                        }else{
                            $this.orderAddress.idcard = $this.$refs.idcard.ID;
                        }
                        callback && callback(data);
                    }
                    $this.popup({content: data.msg});
                }
            })
        },
        saveAddress: function (orderPage, address, callback) {
            var $this = this;
            if (address) {
                $this.sendSave(orderPage, address, callback);
            } else {
                $this.valiForm(function () {
                    $this.sendSave(orderPage, $this.param, callback);
                })
            }
        },
        da: function (index) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/address/setdefault',
                param: {addressId: $this.address[index].addressId},
                success: function (data) {
                    $this.orderAddress=$this.address[index];
                }
            })
        },

        changePoints: function(){
            var $this=this;
            $this.is_used_points ? ($this.is_used_points = 0) : ($this.is_used_points=1);
            if($this.is_used_points == 1){
                $this.cartTotal.china = $this.couponText.china ? $this.couponText.china.total:null;
                $this.cartTotal.korea = $this.couponText.korea ? $this.couponText.korea.total:null;
                $this.cartTotal.bonded = $this.couponText.bonded ? $this.couponText.bonded.total:null;
                $this.cartTotal.epass = $this.couponText.epass ? $this.couponText.epass.total:null;
            }else{
                $this.cartTotal.china = $this.couponText.china ? $this.couponText.china.notTotal:null;
                $this.cartTotal.korea = $this.couponText.korea ? $this.couponText.korea.notTotal:null;
                $this.cartTotal.bonded = $this.couponText.bonded ? $this.couponText.bonded.notTotal:null;
                $this.cartTotal.epass = $this.couponText.epass ? $this.couponText.epass.notTotal:null;
            }
        },
        checkout: function (type) {
            var $this = this;
            if ($this.orderAddress && $this.orderAddress.addressId) {
                if (!$this.orderAddress.idcard && $this.isShowID()) {
                    mui('#idcardPop').popover('toggle');
                } else {
                    var couponCode = $this.couponCode ;
                    sessionStorage.removeItem('couponCode');
                    $this.httpAjax({
                        url: '/h5/scheckout/placeorder',
                        param: {addressId:$this.orderAddress.addressId, couponCode :couponCode, isUsePoints : $this.is_used_points},
                        success: function (data) {
                            if (data.code == 1) {
                                $this.successOrders = data.data.successOrders;
                                _hmt.push(['_trackEvent', 'submit_order_pay', '去支付']);

                                var num = 0;
                                for (var k in $this.cartItems) {
                                    if ($this.cartItems[k].length > 0) {
                                        num++;
                                    }
                                }
                                if (num == 1&&Number($this.successOrders[0].grandTotal)!=0) {
                                    var obj ={
                                        grantTotal:$this.successOrders[0].grandTotal,
                                        time:$this.successOrders[0].closedLeftTime==0?'false':$this.successOrders[0].closedLeftTime,
                                        type:$this.successOrders[0].warehouse,
                                        orderId:$this.successOrders[0].orderId,
                                        showCloseBox:true
                                    }
                                    $this.$refs.pay.payBoxInit(obj);
                                    mui('#select-pay').popover('show');
                                } else {
                                    var arr = $this.successOrders;
                                    var arrOrderIds = [];
                                    for (var i = 0; i < arr.length; i++) {
                                        arrOrderIds.push(arr[i].orderId);
                                    }
                                    location.href = '../payment/payment.html?orderIds=' + arrOrderIds.join(',');
                                }
                            }else if(data.code==4){
                                $this.popup({content: data.msg});
                            }
                        },
                        error: function (err) {
                            $this.popup({content: "程序出错了，支付失败"});
                        },
                        complete: function (data) {
                            if (data.code == 0) {
                                $this.popup({content: data.msg});
                            }
                        }
                    })
                }

            } else {
                if ($this.address && $this.address.length > 0) {
                    $this.popup({content: '请选择地址'});
                } else {
                    $this.popup({content: '请填写地址信息'});
                }

            }
        },
        showPayBox: function () {
            var $this = this;
            mui('#select-pay').popover('toggle');
            var order = $this.successOrders[0];
            order.type = order.warehouse;
            var orderId = order.orderId;
            if ($this.isWeixin() && (order.type == '2')) {
                $this.pay.wx = true;
                $this.pay.ali = false;
                $this.pay.wxOk = function () {
                    location.href = "/m/payment/payment.html?orderIds=" + $this.getOrderIds('orderIds') + '&orderId=' + orderId;
                }
            } else {
                $this.pay.wx = false;
                $this.pay.ali = true;
            }
            $this.pay.global = order.type == '1' ? true : false;

        },
        initOrder: function (code) {
            var $this = this;
            var param = code ? code:'';
            this.getSearch('itemIds') ? (param.itemIds = this.getSearch('itemIds')) : '';
            if ($this.orderAddress && $this.orderAddress.addressId) {
                param.addressId = $this.orderAddress.addressId;
            }
            $this.httpAjax({
                url: '/h5/scheckout/index',
                param: param,
                alert: 2,
                success: function (data) {
                    if (data.code == 1) {
                        $this.initAddress(data.data.addressList);
                        $this.pageData = data.data.warehouses;
                        for(var i=0; i<$this.pageData.length; i++){
                            var val = $this.pageData[i];
                            if(val.origin == "2"){
                                $this.cartItems.china = val.items || [];
                                $this.cartCount.china = val.count || 0;
                                $this.cartTotal.china = val.useReward.total || "￥0.00";
                                $this.checkoutList.china = val.info || [];
                                $this.couponText.china = {
                                    type: '极速仓',
                                    reward: val.useReward.reward,
                                    total: val.useReward.total,
                                    notReward: val.notUseReward.reward,
                                    notTotal: val.notUseReward.total,
                                    couponCount: val.couponCount,
                                    selCoupon: val.selectedCouponTitle
                                };
                            }else if(val.origin == "1"){
                                $this.cartItems.korea = val.items || [];
                                $this.cartCount.korea = val.items || [];
                                $this.cartTotal.korea = val.useReward.total || "￥0.00";
                                $this.checkoutList.korea = val.info || [];
                                $this.couponText.korea = {
                                    type: '韩国仓',
                                    reward: val.useReward.reward,
                                    total: val.useReward.total,
                                    notReward: val.notUseReward.reward,
                                    notTotal: val.notUseReward.total,
                                    couponCount: val.couponCount,
                                    selCoupon: val.selectedCouponTitle
                                };
                            }else if(val.origin == "4"){
                                $this.cartItems.bonded = val.items || [];
                                $this.cartCount.bonded = val.items || [];
                                $this.cartTotal.bonded = val.useReward.total || "￥0.00";
                                $this.checkoutList.bonded = val.info || [];
                                $this.couponText.bonded = {
                                    type: '保税仓',
                                    reward: val.useReward.reward,
                                    total: val.useReward.total,
                                    notReward: val.notUseReward.reward,
                                    notTotal: val.notUseReward.total,
                                    couponCount: val.couponCount,
                                    selCoupon: val.selectedCouponTitle
                                };
                            }else if(val.origin == "8"){
                                $this.cartItems.epass = val.items || [];
                                $this.cartCount.epass = val.items || [];
                                $this.cartTotal.epass = val.useReward.total || "￥0.00";
                                $this.checkoutList.epass = val.info || [];
                                $this.couponText.epass = {
                                    type: '韩国仓 ／特快',
                                    reward: val.useReward.reward,
                                    total: val.useReward.total,
                                    notReward: val.notUseReward.reward,
                                    notTotal: val.notUseReward.total,
                                    couponCount: val.couponCount,
                                    selCoupon: val.selectedCouponTitle
                                };
                            }else{
                                return false;
                            }
                        }
                        $this.setPrice(data.data.total);
                    } else {
                        $this.popup({content: data.msg, type: 'alert'});
                    }
                    $this.init = true;
                },
                complete: function (data) {
                    if (data.code == 0) {
                        $this.popup({
                            content: data.msg, type: 'alert', autoClose: false, ok: function () {
                                location.href = '../cart/cart.html';
                            }
                        });
                    }

                }
            })
        },
        initAddress: function (data) {
            var $this = this;
            $this.address = data;
            if (!$this.orderAddress) {
                for (var i = 0; i < $this.address.length; i++) {
                    if ($this.address[i] && $this.address[i].isDefault == 1) {
                        $this.orderAddress = $this.address[i];
                    }
                }
                if ($this.address[0] && !$this.orderAddress) {
                    $this.orderAddress = $this.address[0];
                    $this.da(0);
                    $this.address[0].isDefault = 1;
                }
            }

        },
        selectCart: function (type) {
            this.sc.type = type;
            this.sc.list = this.cartItems[type];
        },
        initCouon: function (type) {
            var $this = this,
                origin;
            $this.coupon = [];
            $this.couponPage = 1;
            $this.getCoupon(function (data) {
                $this.couponTotal = data.total;
                mui('#couponMore').pullRefresh({
                    up: {
                        contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
                        contentnomore: '没有更多数据了',
                        indicators: false,
                        callback: function () {
                            $this.getCoupon();
                        }
                    }
                })
            });
        },
        getCoupon: function (callback) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/scheckout/couponList',
                param: {warehouses: type},
                success: function (data) {
                    if (data.code == 1) {
                        $this.coupon.push(data.data.list);
                        $this.couponPage++
                        callback && callback(data.data);
                        if ($this.coupon.length * 6 >= data.data.total) {
                            mui('#couponMore').pullRefresh().endPullupToRefresh(true);
                        } else {
                            mui('#couponMore').pullRefresh().endPullupToRefresh();
                        }

                    } else {
                        return false;
                    }
                }
            })
        },
        getCouponList: function (code) {
            var $this = this,
                type;
            if(code == "china"){
                $this.warehouType = type = 2;
            }else if(code == "korea"){
                $this.warehouType = type = 1;
            }else if(code == "bonded"){
                $this.warehouType = type = 4;
            }else if(code=="epass"){
                $this.warehouType = type = 8;
            }else{
                $this.warehouType = type = 0;
            }
            $this.httpAjax({
                url: '/h5/scheckout/couponList',
                param: {warehouse: type},
                success: function (data) {
                    $this.coupon = [];
                    $this.disCoupon = [];
                    if (data.code == 1) {
                        if(data.data.length == 0){
                            $this.popup({content: "无可使用的优惠券", type: 'alert'});
                        }else{
                            var i = 0;
                            while(i < data.data.length){
                                if(data.data[i].is_selected == 1){
                                    $this.chkStatus = false;
                                    $this.selStatus = false;
                                    break;
                                }
                                i++;
                            }
                            for(var l=0; l<data.data.length; l++){
                                if(data.data[l].valid == 1){
                                    $this.coupon.push(data.data[l]);
                                }else{
                                    $this.disCoupon.push(data.data[l]);
                                }
                            }
                        }
                    }
                },
                error: function (err) {
                    $this.popup({content: "优惠券加载失败"});
                },
                complete: function (data) {
                    if (data.code == 0) {
                        $this.popup({content: "无可使用的优惠券"});
                    }
                }
            })
        },
        disUseCoupon: function () {
            this.popup({content: "无可使用的优惠券"});
        },
        useCoupon: function (warehouse, code) {
            var $this = this;
            var id = code,
                type = warehouse,
                couponTitle = "",
                couponList = $this.coupon,
                sourceWare = $this.pageData;
            if (code && warehouse) {
                $this.httpAjax({
                    url: '/h5/scheckout/selectCoupon',
                    param: {coupon_id:id, warehouse: type},
                    success: function (data) {
                        if (data.code == 1) {
                            var i = 0, l = 0;
                            while(i < couponList.length){
                                if(couponList[i].id == id){
                                    $this.coupon[i].is_selected = 1;
                                    couponTitle = couponList[i].name;
                                }else{
                                    $this.coupon[i].is_selected = 0;
                                }
                                i++;
                            }
                            while(l < sourceWare.length){
                                if(sourceWare[l].origin == type){
                                    $this.pageData[l].selectedCouponTitle = couponTitle;
                                    break;
                                }
                                l++;
                            }
                            $this.chkStatus = false;
                            document.getElementById("chk").checked = false;
                            $this.initOrder({"get_the_best": 0});
                        } else {
                            $this.$set('couponCode', null);
                            sessionStorage.removeItem('couponCode');
                        }
                    },
                    complete: function (data) {
                        if (data.code == 0) {
                            $this.popup({content: "优惠券使用失败"});
                        }
                    }
                })
            }else if(code == null){
                $this.httpAjax({
                    url: '/h5/scheckout/selectCoupon',
                    param: {coupon_id:"", coupon_code:"", warehouse: type},
                    success: function (data) {
                        if (data.code == 1) {
                            var i = 0, l = 0;
                            while(i < couponList.length){
                                $this.coupon[i].is_selected = 0;
                                i++;
                            }
                            while(l < sourceWare.length){
                                $this.pageData[l].selectedCouponTitle = "";
                                l++;
                            }
                            $this.chkStatus = true;
                            document.getElementById("chk").checked = false;
                            $this.initOrder({"get_the_best": 0});
                            mui.back();
                        }
                    },
                    complete: function (data) {
                        if (data.code == 0) {
                            $this.popup({content: "优惠券使用失败"});
                        }
                    }
                })
            }else{
                return false;
            }
        },
        //用兑换码
        useCouponCode: function (warehouse, code) {
            var $this = this;
            var couponCode = code,
                type = warehouse,
                couponList = $this.coupon;
            if (!code || code == "") {
                $this.popup({content: "优惠码不能为空"});
                return;
            }
            $this.httpAjax({
                url: '/h5/scheckout/selectCoupon',
                param: {coupon_code:couponCode, warehouse: type},
                success: function (data) {
                    if (data.code == 1 && data.data.is_success == 1) {
                        $this.chkStatus = false;
                        document.getElementById("chk").checked = false;
                        mui.back();
                        $this.initOrder({"get_the_best": 0});
                    } else {
                        sessionStorage.removeItem('couponCode');
                        $this.popup({content: data.msg});
                    }
                    $this.$set('couponCode', null);
                }
            })
        },
        initView: function ($) {
            var viewApi = mui('#app').view({
                defaultPage: '#order'
            });
            //初始化单页的区域滚动
            mui('.mui-scroll-wrapper').scroll();
            var view = viewApi.view;
            //处理view的后退与webview后退
            var oldBack = $.back;
            $.back = function () {
                if (viewApi.canBack()) { //如果view可以后退，则执行view的后退
                    viewApi.back();
                } else { //执行webview后退
                    oldBack();
                }
            };
            //监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
            //第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
            view.addEventListener('pageBeforeShow', function (e) {
                //				console.log(e.detail.page.id + ' beforeShow');
            });
            view.addEventListener('pageShow', function (e) {
                //				console.log(e.detail.page.id + ' show');
            });
            view.addEventListener('pageBeforeBack', function (e) {
                //				console.log(e.detail.page.id + ' beforeBack');
            });
            view.addEventListener('pageBack', function (e) {
                //				console.log(e.detail.page.id + ' back');
            });
        },
        isBonded: function () {
            //return this.cartItems.korea.length==0 && this.cartItems.china.length==0  && this.cartItems.bonded.length>0 ? true : false;
            return false;
        },
        isShowID: function () {
            /**
             * 身份证必填
             */
            return true;
        },
        changeDesc: function (e) {
            e.target.classList.toggle('show')
        },
        isShowCart: function () {

            return this.cartItems.bonded.length >  0 || this.cartItems.china.length > 0 || this.cartItems.korea.length >0||this.cartItems.epass.length >0
        },
        qty: function (v) {
            var n = 0;
            for (var i = 0; i < v.length; i++) {
                n += Number(v[i].stock);
            }
            return n;
        }
    },
    ready: function () {
        var $this = this;
        $this.$nextTick(function () {
            mui.init();
            //初始化单页view
            $this.initView(mui);
        })
    },
    created: function () {
        var $this = this;
        //__inline('_data.js');
        $this.initOrder({"get_the_best": 1});
        if($this.isWeixin()){
            $this.getOpenId();
        }
        // if($this.getSearch('orderId') && $this.getSearch('code')){
        //     $this.pay($this.getSearch('orderId'));
        // }
    },
    
});