/**
 * Created by Jesse on 16/10/13.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        init: false,
        title: '预售列表',
        banner: "",
        festivalImg:"",
        description: "",
        dataProductList: [],
        pageIndex: 1,
        time: {},
        startTime:"",
        /*nowTime :"",*/
        endTime :"",
        startedFlag:"",
        countdownText:""
    },
    methods: {
        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
                    up: {
                        contentnomore: '没有更多产品了',
                        callback: function () {
                            $this.getList({more: true, self: this});
                        }
                    }
                }
            });
        },
        getList: function (setting) {
            var $this = this;
            setting = setting || {};
            $this.httpAjax({
                url: '/h5/presale/list',
                token:false,
                param: {
                    pageIndex: $this.pageIndex
                },
                success: function (data) {
                    var productList,
                        listIdArr = [],
                        listIds;
                    if (data.code == 1) {/*
                     if(setting.refresh){
                     mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
                     }else */
                        if (setting.more) {
                            $this.dataProductList.push(data.data.list);
                            $this.pageIndex++;
                            if (data.data.list.length > 0) {
                                setting.self.endPullupToRefresh();
                            } else {
                                setting.self.endPullupToRefresh(true);
                            }
                        } else {
                            productList = data.data.list;
                            $this.banner = data.data.banner;
                            $this.festivalImg = data.data.festivalImg;

                            $this.startTime = data.data.startTime;
                            //$this.nowTime = data.data.serverTime;
                            $this.endTime = data.data.endTime;
                            $this.description = data.data.description;
                            $this.dataProductList.push(data.data.list);

                            var startTime = parseInt(data.data.startTime);
                            var endTime = parseInt(data.data.endTime);
                            var nowTime;
                            var timeTamp;
                            productList.some(function (item, index) {
                                if(item.productId){
                                    listIdArr.push(item.productId);
                                }
                            });
                            listIds = listIdArr.join(",");

                            $this.httpAjax({
                                domain: $this.searchDomain,
                                url: '/global/price',
                                param: {"productIds": listIds},
                                success: function (data) {
                                    if (data.code=='1') {
                                        nowTime = data.data[0].serverTime;

                                        if(nowTime<startTime){
                                            timeTamp = startTime - nowTime;
                                            $this.startedFlag = "0";
                                            $this.countdownText = "开始";
                                        }else if(nowTime>startTime&&nowTime<endTime){
                                            timeTamp = endTime - nowTime;
                                            $this.startedFlag = "1";
                                            $this.countdownText = "结束";
                                        }else{
                                            timeTamp = 0;
                                            $this.startedFlag = "2";
                                        }
                                        $this.preCountdown(timeTamp, $this.time);
                                    }
                                }
                            });

                            $this.init = true;
                            var share = {
                                title: 'MEMEBOX双11预售火热开启！',
                                text: '预售低至5折还包邮，全年最低价！水光针面膜75元，预定更多爆款商品',
                                url:location.href,
                                image:location.origin+'/images/app/special/presale/include/11.jpg'
                            };
                            $this.set_share(share);
                            $this.app_setShare(share);
                            setTimeout(function () {
                                $this.initMui();
                            }, 100);
                            $this.pageIndex++;
                        }

                    }
                }
            });
        },
        showPresaleRule: function () {
            var $this = this;
            var str = '';
            var arr = [];
            console.log($this.description)
            arr = $this.description && $this.description.replace(/\n/g, '/n').split('/n');

            arr.forEach(function (element, index, array) {
                str += '<p style="text-align: left">' + element + '</p>';
            });
            $this.popup({
                type: 'confirm',
                title: '预售须知',
                content: str,
                btn: ['知道啦'],
            });
        },
        goDetail: function (item) {
            var $this = this;
            if($this.startedFlag != '0'){
                if (item.stockStatus == 1) {
                    if (this.isAppPresale()) {
                        this.app_product({productId: item.productId})
                        //return location.href =  this.domain+'/catalog/product/view/id/'+item.productId;
                    } else {
                        location.href = location.origin + this.page + '/productDetails/productDetails.html?p=' + item.productId;
                    }
                }
            }
            
        },
        getUrl: function (item) {
            var $this = this;
            if($this.startedFlag != '0'){
                if (item.stockStatus == 1) {
                    if (this.isAppPresale()) {
                        //return this.app_product({productId:item.productId})
                        //return this.domain+'/catalog/product/view/id/'+item.productId;
                    } else {
                        return location.origin + this.page + '/productDetails/productDetails.html?p=' + item.productId;
                    }
                }
            }
        },
        preCountdown: function (time, result) {
            var $this = this;
            var countdown;

            function init(time) {
                countdown = setInterval(function () {
                    if (time >= 0) {
                        formatTime(time);
                        time--;
                    } else {
                        clearInterval(countdown);
                        if($this.startedFlag=='0'){
                            var timeTamp = parseInt($this.endTime) - parseInt($this.startTime);
                            $this.preCountdown(timeTamp, $this.time);
                            $this.startedFlag = '1';
                            $this.countdownText = "结束";
                        }else if($this.startedFlag=='1'){
                            $this.startedFlag = '2';
                        }

                    }
                }, 1000);
            }

            function formatTime(t) {
                var day = parseInt(t / 60 / 60 / 24, 10);
                var hour = parseInt(t / 60 / 60 % 24, 10);
                var minute = parseInt(t / 60 % 60, 10);
                var second = parseInt(t % 60, 10);

                function time(t) {
                    if (t < 10) {
                        return '0' + t;
                    } else {
                        return t.toString();
                    }
                }

                Vue.set(result, 'day', day);
                Vue.set(result, 'hour', time(hour));
                Vue.set(result, 'minute', time(minute));
                Vue.set(result, 'second', time(second));
            }

            init(time);
        }
    },
    ready: function () {
        var $this = this;


        setTimeout(function () {
            $this.initMui();
        }, 100);
    },
    created: function () {
        this.getList();
    }
});