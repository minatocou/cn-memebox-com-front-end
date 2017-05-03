/**
 * Created by Jesse on 16/5/4.
 */
var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '',
        init: false,
        price: null,
        position:true,
        dataProductList: {},
        productList: {},
        showList: true,
        categoryId: '',
        cartNumber: '',
        pageIndex: 1,
        orderTotal:''
    },
    methods: {
        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
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
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
                    if ((10 * $this.pageIndex) >= $this.orderTotal) {
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                    } else {
                        $this.pageIndex++;
                        $this.getList({}, function (data) {
                            $this.dataProductList.data=$this.dataProductList.data.concat(data.data);
                        });
                    }
                }, 0);
            }
        },
        //综合排序
        positionSort:function () {
            var $this = this;
            $this.position = true;
            $this.price = null;
            $this.pageIndex = 1;
            mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
            mui('#pullrefresh').pullRefresh().refresh(true);
            $this.getList({});
        },
        //价格排序
        priceSort:function () {
            var $this = this;
            var param = {};
            $this.pageIndex = 1;
            $this.price = $this.price=='asc'?'desc':'asc';
            $this.position = false;
            mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
            mui('#pullrefresh').pullRefresh().refresh(true);
            $this.getList(param);
        },
        //购物车
        getCart: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newcart/count',
                showLoading: true,
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
        },
        //获得列表
        getList: function (param, callBack) {
            var $this = this;
            param = param || {};
            param.pageIndex=$this.pageIndex;
            param.categoryId = $this.categoryId;
            param.order = 1;
            if($this.price){
                $this.price == 'asc'?param.order='3':param.order='4';
            }
            $this.httpAjax({
                url: '/global/search',
                domain: $this.searchDomain,
                param: param,
                success: function (data) {
                    $this.orderTotal = data.orderTotal;
                    if (callBack) {
                        callBack(data);
                    } else {
                        $this.dataProductList = data;
                    }
                    $this.init = true;
                    $this.$nextTick(function () {
                        $this.initMui();
                    });
                    setTimeout(function () {
                        $this.initEcho()
                    }, 10);
                }
            });
        }
    },
    ready: function () {

    },
    created: function () {
        var $this = this;
        $this.categoryId = location.hash.slice(1);
        $this.getList({}, function (data) {
            if (data['total'] == '0') {
                $this.popup({
                    content: '已被抢空', time: 1000, autoClose: true, ok: function () {
                        window.location.href = '../home/home.html';
                    }
                });
            } else {
                $this.dataProductList = data;
                $this.setTitle($this.dataProductList['categoryName']);
                $this.title = $this.dataProductList['categoryName'];
            }
        });
    }
})