/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('../../payment/ga');
var validate = require('vue/vue-validate');
var appTools = require('app/app');
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
    template: __inline('../../template/_idcard.html')
});
vue = new Vue({
    mixins: [common, validate,appTools],
    el: 'html',
    data: {
        init: false,
        title: '预付确认',
        orderAddress: null,
        addressText: null,
        param: {},
        product: {},
        points: null,
        address: null,
        gwpItem: null,
        pay: {
            wx: false,
            ali: false,
            global: false,
            orderId: null,
            totalAmount: 0,
            time: '',
            step:false
        },
        successOrders: [],
        presale: true,
        params: {},
        startPayTime:'',
        Property:{},
        appReport:{},
        notBuyAgain:'',
        proType:""
    },
    methods: {
        /**
         * 获取app里的用户信息
         * @param data
         */
        userInfoCall: function (data) {
            var $this = this;
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            }
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.app_login();
                } else {
                    $this.initOrder();
                }
            }, 100);

        },
        /**
         * 同意购买预售商品
         */
        agreePresale: function () {
            var $this = this;
            $this.presale = !$this.presale;
            console.log($this.presale)
        },
        /*
         价格格式化
         */
        changePrice: function (value) {
            var arr;
            if (value.match('折')) {
                arr = ['', parseInt(value.replace('.', '').slice(0, value.length - 1)), '折'];
            } else {
                arr = ['¥', parseInt(value.slice(1))];
            }
            return arr;
        },
        /**
         * 选择地址
         * @param e
         */
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
            this.initOrder();
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
                    $this.initOrder();
                    //$this.popup({content: data.msg});
                    //$this.orderAddress=$this.address[index];
                }
            })
        },
        changePoints: function () {

            this.initRewardPoints();
        },
        appPayCall: function (data) {
            var $this = this;
            if(data && data.code==1 && data.data && data.data.orderId){
                /**
                 * app预售定金支付成功
                 */
                this.finishReport();
                _maq.push(["_trackEvent", "Depositpay_success", $this.Property]);

                $this.app_orderList({menu:0});
            }
        },
        submitReport: function () {
            this.getReport('?category=1&eventName=submit_order_pay');
        },
        finishReport: function () {
            this.getReport('?category=1&eventName=finish_order&property='+encodeURIComponent(JSON.stringify(this.appReport)));
        },
        getReport: function (url) {
            var $this = this;
            var platform='ios_h5';
            if($this.isApp()){
                var clientVersion=$this.iosVer() || $this.androidVer();
                if($this.isAndroidApp()){
                    platform='android_h5'
                }
                var img=new Image();
                img.src="https://report.cn.memebox.com/index.html"+url+"&time="+parseInt(new Date().getTime()/1000)+"&network=h5&deviceId=h5&platform="+platform+"&channel=h5&model=mobile&clientVersion="+clientVersion+"&userToken="+localStorage.mmToken+"&userId="+localStorage.mmToken+"&useragent="+navigator.userAgent;
            }
        },
        checkout: function () {
            var $this = this;
            $this.params.addressId = $this.orderAddress.addressId;
            /**
             * 标示
             */
            if($this.iosVer()){
                $this.params.remark='iOS';
            }else if($this.androidVer()){
                $this.params.remark='Android';
            }else {
                $this.params.remark='h5';
            }
            if($this.notBuyAgain==true){
                return false;
            }
            if ($this.presale) {
                if ($this.orderAddress && $this.orderAddress.addressId) {
                    if (!$this.orderAddress.idcard && $this.isShowID()) {
                        mui('#idcardPop').popover('toggle');
                    } else {
                        $this.notBuyAgain = true;
                        $this.httpAjax({
                            url: '/h5/presalecheckout/placeorder',
                            param: $this.params,
                            success: function (data) {
                                if(data.data!=''){
                                    console.log(data);
                                    _maq.push(["_trackEvent" , "checkout_Depositpay" , $this.Property]);
                                    var obj = {
                                        grantTotal: $this.product.depositTotal,
                                        time: data.data.closedLeftTime,
                                        type: 2,
                                        orderId: data.data.increment_id,
                                        showCloseBox: true,
                                        step:1
                                    };
                                    if ($this.isAppPay()) {
                                        /*$this.submitReport();
                                        // var tw={
                                        //     4:'FTZ',
                                        //     1:'KR',
                                        //     2:'CN'
                                        // }
                                        $this.appReport={
                                            'inventory':'CN',
                                            'order_id':data.data.increment_id,
                                            'price':$this.product.prePrice,
                                            'pay_type':'alipay'
                                        };*/
                                        $this.app_pay({
                                            orderId: data.data.increment_id
                                        });
                                    } else {
                                        $this.$refs.pay.payBoxInit(obj);
                                        setTimeout(function () {
                                            mui('#select-pay').popover('show');
                                        }, 1000);
                                    }
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
            } else {
                $this.popup({
                    type: 'confirm',
                    title: ' ',
                    content: '请同意预售规则',
                    btn: ['<span style="color:#999">关闭</span>', '同意'],
                    ok: function (e) {
                        $this.presale = true;
                    }
                });
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
        initOrder: function () {
            var $this = this;
            var param = {};
            if ($this.orderAddress && $this.orderAddress.addressId) {
                param.addressId = $this.orderAddress.addressId;
            }
            console.log($this.params)
            $this.httpAjax({
                url: '/h5/presalecheckout/index',
                source:7,
                param: $this.params,
                alert: 2,
                success: function (data) {
                    if (data.code == 1) {
                        $this.initAddress(data.data.addressList);
                        $this.product = data.data.productInfo;
                        $this.product.preTotal = data.data.preTotal;
                        $this.product.depositTotal = data.data.depositTotal;
                        $this.startPayTime = $this.formatDate($this.product.startRetainageTime);
                        $this.Property.Product_id = $this.product.productId;
                        var obj = {
                            1:{
                                text:"韩国仓",
                                name:"korea"
                            },
                            2:{
                                text:"极速仓",
                                name:"china"
                            },
                            4:{
                                text:"保税仓",
                                name:"bonded"
                            },
                            8:{
                                text:"韩国直邮／特快",
                                name:"korea"
                            }
                        };
                        $this.proType = obj[$this.product.warehouse];
                    } else {
                        $this.popup({content: data.msg, type: 'alert'});
                    }
                    $this.init = true;
                },
                complete: function (data) {
                    if (data.code == 0) {
                        $this.popup({
                            content: data.msg, type: 'alert', autoClose: false, ok: function () {
                                mui.back();
                            }
                        });
                    }

                }
            })
        },
        getType: function () {
            var $this = this;
            var obj = {
                1: "韩国仓",
                2: "极速仓",
                4: "保税仓",
                8: "韩国直邮／特快"
            };
            return obj[$this.product.warehouse];
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
        initRewardPoints: function () {

            var $this = this;
            var usePoints = this.points && this.points.is_used_points == 1 ? 0 : 1;
            $this.httpAjax({
                url: '/h5/newcheckout/useRewardPoints',
                param: {usePoints: usePoints},
                success: function (data) {
                    if (data.code == 1) {
                        $this.points = data.data;
                        $this.setPrice(data.data);
                        $this.pageData.rewardBack = data.data.rewardBack;
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            })
        },
        selectCart: function (type) {
            this.sc.type = type;
            this.sc.list = this.cartItems[type];
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
        isShowID: function () {
            /**
             * 身份证必填
             */
            return true;
        },
        changeDesc: function (e) {
            e.target.classList.toggle('show')
        },
        qty: function (v) {
            var n = 0;
            for (var i = 0; i < v.length; i++) {
                n += Number(v[i].qty);
            }
            return n;
        }
    },
    ready: function () {
        var $this = this;
        $this.$nextTick(function () {
            mui.init();
            $this.initView(mui);
        });

    },
    created: function () {
        var $this = this;
        $this.params.qty = $this.getSearch('qty');
        $this.params.productId = $this.getSearch('productId');
        $this.getSearch('option_id')&&$this.getSearch('option_id')!='null'&&($this.params['options['+$this.getSearch('option_id')+']']=$this.getSearch('value'));
        var $this = this;
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        } else {
            if($this.isWeixin()){
                $this.getOpenId();
            }
            $this.initOrder();
        }
    },

});