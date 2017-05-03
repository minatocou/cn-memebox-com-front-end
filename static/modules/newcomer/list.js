/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        appData: null,
        init: false,
        errorMsg: null,
        dataProductList: [],
        pageIndex: 1,
        bannerUrl: '',
        title: '新人专享商品',
        activityNum: '',
        grouponType: '',
        expired: false,
        notYet: false,
        isNewcomer: null,
    },
    methods: {
        downloadApp: function () {
            _hmt.push(['_trackEvent', 'group buying_download', '下载APP']);
        },
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
        getShareData: function (obj) {
            return {
                title: obj.title,
                text: obj.text,
                url: location.href,
                image: obj.image || 'http://cn.m.memebox.com/images/app/favicon.png'
            }
        },
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.getList();
            } else {
                this.getList();
            }
        },
        goDetail: function (item) {
            if (item.stockStatus == 1) {
                if (this.isAppGroupon()) {
                    this.app_product({productId: item.productId})
                    //return location.href =  this.domain+'/catalog/product/view/id/'+item.productId;
                } else {
                    location.href = location.origin + this.page + '/productDetails/productDetails.html?p=' + item.productId;
                }
            }
        },
        getUrl: function (item) {
            if (item.stockStatus == 1) {
                if (this.isAppGroupon()) {
                    //return this.app_product({productId:item.productId})
                    //return this.domain+'/catalog/product/view/id/'+item.productId;
                } else {
                    return location.origin + this.page + '/productDetails/productDetails.html?p=' + item.productId;
                }
            }
        },
        /**
         * 设置微信和app分享
         */
        appShare: function (obj) {
            var $this = this;
            $this.set_share(this.getShareData(obj));
            $this.app_setShare(this.getShareData(obj));
        },
        getList: function (setting) {
            var $this = this;
            setting = setting || {};
            $this.httpAjax({
                url: '/h5/newcomer/list',
                alert: true,
                param: {
                    pageIndex: $this.pageIndex,
                    // activityId: $this.getSearch('activityId')
                },
                success: function (data) {
                    console.log(data.data.serverTime >= data.data.startTime )
                    if (data.code == 1 && data.data.list  && data.data.serverTime >= data.data.startTime && data.data.serverTime <= data.data.endTime) {
                        $this.$refs.loading.show = false;
                        $this.isNewcomer=data.data.isNewcomer;
                        // $this.title = data.data.title;
                        // $this.activityNum = data.data.activityNum;
                        // $this.bannerUrl = data.data.banner_img;
                        // $this.setTitle($this.title);
                        if (setting.more) {
                            $this.dataProductList = $this.dataProductList.concat(data.data.list);
                            if (6 * $this.pageIndex >= data.data.total) {
                                setting.self.endPullupToRefresh(true);
                            } else {
                                setting.self.endPullupToRefresh(false);
                            }
                            $this.pageIndex++;
                        }
                        else {
                            $this.dataProductList = $this.dataProductList.concat(data.data.list);
                            $this.init = true;
                            var obj = {
                                title: $this.title,
                                text: 'MEMEBOX活动分享',
                                url: location.href,
                                image: location.origin + '/images/app/newcomer/include/newcomer-icon.png'
                            };
                            $this.appShare(obj);
                            setTimeout(function () {
                                $this.initMui();
                            }, 100);
                            $this.pageIndex++;
                        }

                    }
                    else if (data.code == 3 || data.data.list.length <= 0 || data.data.serverTime < data.data.startTime) {
                        $this.expired = true;
                    }
                    else if (data.code == 4 || data.data.serverTime > data.data.endTime) {
                        $this.expired = true;
                        $this.notYet = true;
                    }
                    console.log($this.dataProductList);
                },
                complete: function (argument) {
                    if(argument.code == 0){
                        $this.expired = true;
                    }
                    $this.init = true;
                }
            })
        }

    },
    created: function () {
        var $this = this;
        try {
            if ($this.isApp()) {
                localStorage.removeItem('mmToken');
                setTimeout(function () {
                    $this.app_userinfo();
                }, 0)
            } else {
                $this.getList();
            }
        } catch (e) {
            alert(e);
            $this.getList();
        }
    }
});
