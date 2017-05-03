/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('../payment/ga');
var validate = require('vue/vue-validate');
Vue.use(require('vue/vue-validator'));
var appTools = require('app/app');
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
            ID: null,
            qty: null,
            total: null
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
vue = new Vue({
    mixins: [common, validate, appTools],
    el: 'html',
    data: {
        title: '确认订单',
        init: false,
        pageData: {},
        orderAddress: null,
        addressText: null,
        param: {},
        address: null,
        pay: {
            wx: false,
            ali: false,
            global: false,
            orderId: null,
            totalAmount: 0,
            time: ''
        },
        successOrders: [],
        qty: null,
        productId: null,
        optionId: null,
        value: null,
        appReport:{},
        notBuyAgain: '',
        newcomerPrice:null
    },
    methods: {
        /**
         * 获得仓名
         * @param data
         */
        getProType: function () {
            var $this = this;
            var obj = {
                isFTZProduct: 'bonded',
                isGlobalProduct: 'korea',
                isLocalProduct: 'china',
            };
            for(var k in obj){
                if($this.pageData[k]=='1'){
                    return obj[k];
                }
            }
        },
        userInfoCall: function (data) {
            var $this = this;
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            }
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.app_login({source:10});
                } else {
                    $this.initOrder();
                }
            }, 100);
        },

        appPayCall: function (data) {
            if(data && data.code==1 && data.data && data.data.orderId){
                this.finishReport();
                this.app_orderList({menu:0});
            }else{

            }
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
            //this.initOrder();
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
                        $this.initAddress();
                        if (!orderPage) {
                            mui.back();
                        }else{
                            try{
                                $this.orderAddress.idcard = $this.$refs.idcard.ID;
                            }catch (e){
                                console.log(e);
                            }
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
                    //$this.initOrder();
                }
            })
        },
        isShowID: function () {
            return true;
        },
        checkout: function () {
            var $this = this;
            // if($this.notBuyAgain==true){
            //     return false;
            // }
            if ($this.orderAddress && $this.orderAddress.addressId) {
                if (!$this.orderAddress.idcard && $this.isShowID()) {
                    //$this.popup({content: '请编辑地址,填写身份证信息'});
                    mui('#idcardPop').popover('toggle');
                } else {
                    var productId = $this.getSearch('productId');
                    var configId = $this.getSearch('configId');
                    var remark='h5';
                    if($this.isIosApp()){
                        remark='ios';
                    }else if($this.isAndroidApp()){
                        remark='android';
                    }
                    var param = {
                        qty: $this.qty,
                        addressId: $this.orderAddress.addressId,
                        productId: productId,
                        configId: configId,
                        remark: remark
                    }
                    if ($this.optionId && $this.value) {
                        param.options = param.options || {};
                        param.options[$this.optionId] = $this.value;
                    }
                    $this.notBuyAgain = true;
                    $this.httpAjax({
                        url: '/h5/newcomercheckout/placeOrder',
                        param: param,
                        success: function (data) {
                            if(data.code==15){
                                setTimeout(function () {
                                    location.href = '/m/payment/my_orders.html';
                                },1000)
                            }
                            if (data.code == 1) {
                                var total = data.data.grandTotal ? parseFloat(data.data.grandTotal).toFixed(2) : data.data.grandTotal;
                                var obj = {
                                    grantTotal: total,
                                    time: data.data.closedLeftTime == 0 ? 'false' : data.data.closedLeftTime,
                                    type: data.data.warehouse,
                                    orderId: data.data.increment_id,
                                    showCloseBox: true,
                                    wxOk: function () {
                                        location.href = $this.page + '/payment/my_order.html?orderId='+data.data.increment_id;
                                    }
                                }
                                if ($this.isAppPay()) {
                                    //app打点
                                    $this.submitReport();
                                    var tw={
                                        4:'FTZ',
                                        1:'KR',
                                        2:'CN'
                                    }
                                    $this.appReport={
                                        'inventory':tw[data.data.warehouse],
                                        'order_id':data.data.increment_id,
                                        'price':$this.pageData.newcomerPrice,
                                        'pay_type':'alipay'
                                    };
                                    $this.app_pay({
                                        orderId: data.data.increment_id
                                    })
                                } else {
                                    $this.$refs.pay.payBoxInit(obj);
                                    setTimeout(function () {
                                        mui('#select-pay').popover('show');
                                    }, 1000)
                                }
                            } else {
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
        reducer: function add(sumSoFar, item) {
            return sumSoFar + item.grouponPrice * this.qty;
        },
        getOption: function () {
            var newArr = $this.groupDetail.grouponerInfo.filter(function (item) {
                return item.customerId == $this.groupDetail.customerInfo.customerId && $this.isPayOk(item.processState);
            });
        },
        initOrder: function () {
            var $this = this;
            $this.initAddress();
            var param={productId: $this.productId};
            if($this.optionId && $this.value){
                param.options={};
                param.options[$this.optionId]=$this.value;
            }
            $this.httpAjax({
                url: '/h5/customer/info',
                source:10,
                complete: function(data){
                    if(data.data && data.data.isNew==1){
                        $this.httpAjax({
                            url: '/h5/newcomer/product',
                            param: param,
                            success: function (data) {
                                if (data.code == 1) {
                                    $this.pageData = data.data;
                                    if($this.pageData && $this.pageData.newcomerPrice){
                                        $this.init = true;
                                        if ($this.pageData.options && $this.pageData.options.length > 0) {
                                            var newArr = $this.pageData.options.filter(function (item) {
                                                return item.value == $this.value;
                                            });
                                            if (newArr.length > 0) {
                                                $this.pageData.option = newArr[0].title;
                                            }
                                        }
                                    }else{
                                        // $this.popup({content: '活动已过期', type: 'alert',ok:function () {
                                        //     history.back();
                                        // }});
                                    }

                                } else {
                                    $this.popup({content: data.msg, type: 'alert'});
                                }
                                setTimeout(function () {
                                    $this.initView(mui);
                                },10)
                            },
                        })
                    }else{
                        $this.popup({content: '您不符合新人专享条件', type: 'alert',autoClose: false,
                            ok: function() {
                                if($this.isApp()){
                                    $this.app_back();
                                }else{
                                    history.back();
                                }
                            }
                        });
                    }
                }
            });

        },
        initAddress: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/address/list',
                source:10,
                success: function (data) {
                    //$this.initOrder();
                    $this.address = data.data;

                    if (!$this.orderAddress && $this.address) {
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
        },
        changeDesc: function (e) {
            e.target.classList.toggle('show')
        },
        getType: function () {
            var $this = this;
            var name = '中国仓';
            if ($this.pageData.isFTZProduct == 1) {
                name = '保税仓'
            } else if ($this.pageData.isGlobalProduct == 1) {
                name = '韩国仓'
            }
            return name;
        },
        submitReport: function () {
            this.getReport('?category=1&eventName=submit_order_pay');
        },
        finishReport: function () {
            this.getReport('?category=1&eventName=finish_order&property='+encodeURIComponent(JSON.stringify(this.appReport)));
        },
        getReport: function (url) {
            var $this = this;
            var platform='h5';
            var img=new Image();
            if($this.isApp()){
                var clientVersion=$this.iosVer() || $this.androidVer();
                if($this.isAndroidApp()){
                    platform='android_h5'
                }else{
                    platform='ios_h5';
                }
            }
            img.src="https://report.cn.memebox.com/index.html"+url+"&time="+parseInt(new Date().getTime()/1000)+"&network=h5&deviceId=h5&platform="+platform+"&channel=h5&model=mobile&clientVersion="+clientVersion+"&userToken="+localStorage.mmToken+"&userId="+localStorage.mmToken+"&useragent="+navigator.userAgent;
        }
    },
    ready: function () {


    },
    created: function () {
        var $this = this;
        $this.qty = $this.getSearch('qty') || 1 ;
        $this.productId = $this.getSearch('productId');
        if($this.productId){
            $this.productId = $this.productId.replace(/_.*/,'');
        }
        $this.optionId = $this.getSearch('option_id');
        $this.value = $this.getSearch('value');
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        } else {
            if ($this.isWeixin()) {
                $this.getOpenId();
            }
            $this.initOrder();
        }
    }
});
