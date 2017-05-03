/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var ga = require('../../payment/ga');
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
    template: __inline('../../template/_idcard.html')
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
        proInfo: "",
        appReport: {},
        notBuyAgain: ''
    },
    methods: {
        /**
         * 获得仓名
         * @param data
         */
        getProType: function () {
            var $this = this;
            var obj = {
                4: 'bonded',
                1: 'korea',
                2: 'china',
                8: "korea"
            };
            return obj[$this.pageData.warehouse];
        },
        userInfoCall: function (data) {
            var $this = this;
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            }
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.app_login({source: 11});
                } else {
                    $this.initOrder();
                }
            }, 100)

        },
        /**
         * app支付成功回调
         * @param data
         */
        appPayCall: function (data) {
            var $this = this;
            if (data && data.code == 1 && data.data && data.data.orderId) {
                /**
                 * 支付成功
                 */
                // this.finishReport();
                _maq.push(["_trackEvent", "Depositpay_success", $this.Property]);
                $this.app_orderList({menu: 0});
            }
        },
        finishReport: function () {
            this.getReport('?category=1&eventName=finish_order&property=' + encodeURIComponent(JSON.stringify(this.appReport)));
        },
        getReport: function (url) {
            var $this = this;
            var platform = 'ios_h5';
            if ($this.isApp()) {
                var clientVersion = $this.iosVer() || $this.androidVer();
                if ($this.isAndroidApp()) {
                    platform = 'android_h5'
                }
                var img = new Image();
                img.src = "https://report.cn.memebox.com/index.html" + url + "&time=" + parseInt(new Date().getTime() / 1000) + "&network=h5&deviceId=h5&platform=" + platform + "&channel=h5&model=mobile&clientVersion=" + clientVersion + "&userToken=" + localStorage.mmToken + "&userId=" + localStorage.mmToken + "&useragent=" + navigator.userAgent;
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
                        } else {
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
                    //$this.initOrder();
                }
            })
        },
        isShowID: function () {
            /**
             * 身份证必填
             */
            return true;
        },
        checkout: function () {
            var $this = this;
            // if ($this.notBuyAgain == true) {
            //     return false;
            // }
            if ($this.orderAddress && $this.orderAddress.addressId) {
                if (!$this.orderAddress.idcard && $this.isShowID()) {
                    mui('#idcardPop').popover('toggle');
                } else {
                    var productId = $this.getSearch('productId');
                    var remark = 'h5';
                    if ($this.isIosApp()) {
                        remark = 'ios';
                    } else if ($this.isAndroidApp()) {
                        remark = 'android';
                    }
                    $this.proInfo.address = $this.orderAddress.addressId;
                    $this.proInfo.remark = remark;
                    $this.notBuyAgain = true;
                    $this.httpAjax({
                        url: '/h5/seckillcheckout/placeOrder',
                        param: $this.proInfo,
                        success: function (data) {
                            if (data.code == 15) {
                                setTimeout(function () {
                                    location.href = '/m/payment/my_orders.html';
                                }, 1000)
                            }
                            if (data.code == 1) {
                                var total = data.data.grandTotal ? parseFloat(data.data.grandTotal).toFixed(2) : data.data.grandTotal;
                                var obj = {
                                    grantTotal: total,
                                    time: data.data.closedLeftTime == 0 ? 'false' : data.data.closedLeftTime,
                                    type: data.data.warehouse,
                                    orderId: data.data.orderId,
                                    showCloseBox: true,
                                    wxOk: function () {
                                        location.href = $this.page + '/m/payment/my_orders.html';
                                    }
                                }
                                if ($this.isAppPay()) {
                                    // //app打点
                                    // $this.submitReport();
                                    // var tw = {
                                    //     8:"Epass",
                                    //     4: 'FTZ',
                                    //     1: 'KR',
                                    //     2: 'CN'
                                    // }
                                    // $this.appReport = {
                                    //     'inventory': tw[data.data.warehouse],
                                    //     'order_id': data.data.orderId,
                                    //     'price': $this.pageData.grouponPrice,
                                    //     'pay_type': 'alipay'
                                    // };
                                    $this.app_pay({
                                        orderId: data.data.orderId
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
                        },
                        complete: function (data) {
                            if (data.code == 0) {
                                $this.notBuyAgain = false;
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
            $this.httpAjax({
                url: '/h5/seckillcheckout/product',
                param: $this.proInfo,
                success: function (data) {
                    if (data.code == 1) {
                        $this.init = true;
                        $this.pageData = data.data;
                        if ($this.pageData.options && $this.pageData.options.length > 0) {
                            var newArr = $this.pageData.options.filter(function (item) {
                                return item.value == $this.value;
                            });
                            if (newArr.length > 0) {
                                console.log(newArr)
                                $this.pageData.option = newArr[0].title;
                            }
                        }
                    } else {
                        $this.popup({content: data.msg, type: 'alert'});
                    }
                    setTimeout(function () {
                        $this.initView(mui);
                    }, 1000)
                },
            })
        },
        initAddress: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/address/list',
                source: 11,
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
            var obj = {
                1: "韩国仓",
                2: "极速仓",
                4: "保税仓",
                8: "韩国直邮 ／特快"
            };
            return obj[$this.pageData.warehouse];
        },
        submitReport: function () {
            this.getReport('?category=1&eventName=submit_order_pay');
        },
        finishReport: function () {
            this.getReport('?category=1&eventName=finish_order&property=' + encodeURIComponent(JSON.stringify(this.appReport)));
        },
        getReport: function (url) {
            var $this = this;
            var platform = 'h5';
            var img = new Image();
            if ($this.isApp()) {
                var clientVersion = $this.iosVer() || $this.androidVer();
                if ($this.isAndroidApp()) {
                    platform = 'android_h5'
                } else {
                    platform = 'ios_h5';
                }
            }
            img.src = "https://report.cn.memebox.com/index.html" + url + "&time=" + parseInt(new Date().getTime() / 1000) + "&network=h5&deviceId=h5&platform=" + platform + "&channel=h5&model=mobile&clientVersion=" + clientVersion + "&userToken=" + localStorage.mmToken + "&userId=" + localStorage.mmToken + "&useragent=" + navigator.userAgent;
        }
    },
    ready: function () {


    },
    created: function () {
        var $this = this;
        $this.proInfo = {
            productId: $this.getSearch('productId'),
            durationId: $this.getSearch('durationId'),
            groupId: $this.getSearch('groupId')
        };
        /**
         * options
         */
        $this.value = $this.getSearch('value');
        $this.getSearch("value") && ($this.proInfo["options[" + $this.getSearch("option_id") + "]"] = $this.getSearch('value'));
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
