/**
 * Created by page on 2016/4/27.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '个人中心',
        init: false,
        orderInit: false,
        initOuts: false,
        pageIndex: null,
        orders: null,
        pageOrders: [],
        isEnd: false,
        wishList: [],                   //收藏列表
        wishPageIndex: 1,             //列表页码
        initPage:null,
        userData:{}                     //用户信息
        
    },
    methods: {
        initHome: function ($) {
            var $this = this;
            var hash = location.hash || '#home';
            hash=='#homel'&&$('#home-scroll').scroll().refresh();
            //页面加载默认初始化事件
            $this.initPage={
                '#order':$this.goOrder,
                '#collection':$this.getWishList,
                //'#orders':$this.orderList
            };
            $this.initPage[hash] && $this.initPage[hash]();
            $this.initView(hash);
        },
        // goPro: function (proId, price) {
        //     if (price && price > 0) {
        //         if (this.order.groupon_id || this.order.isGroupon == 1) {
        //             var param = '?productId=' + this.order.orderProductInfo[0].productId + '&from=myorder';
        //             if (this.order.orderState != '等待付款') {
        //                 param += '&grouponId=' + this.order.groupon_id;
        //             }
        //             location.href = this.page + '/special/group/details.html' + param;
        //         } else {
        //             location.href = this.page + '/productDetails/productDetails.html#' + proId;
        //         }
        //     }
        // },
        goOrder: function (index, i) {
            var $this = this;
            var oid = null;
            if (index >= 0 || i >= 0) {
                if (i || i == 0) {
                    oid = $this.pageOrders[index][i].realOrderId;
                } else {
                    oid = $this.orders[index].realOrderId;
                }
            } else {
                oid = $this.getSearch('orderId');
            }
            location.href='/m/payment/my_order.html?orderId='+oid;
        },
        // orderList: function (self, reload) {
        //     var $this = this;
        //     reload ? delete this.pageIndex : null;
        //     if ($this.isEnd == false) {
        //         $this.httpAjax({
        //             url: '/h5/order/list',
        //             param: {pageIndex: $this.pageIndex},
        //             success: function (data) {
        //                 if (data.code == 1) {
        //                     if (!$this.pageIndex || reload) {
        //                         $this.orders = data.data;
        //                         mui('#more').pullRefresh({
        //                             up: {
        //                                 contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
        //                                 contentnomore: '没有更多数据了',
        //                                 indicators: false,
        //                                 callback: function () {
        //                                     $this.more();
        //                                 }
        //                             }
        //                         })
        //                         if (reload) {
        //                             mui.back();
        //                         } else {
        //                         }
        //                         $this.pageIndex = 2;
        //                         setTimeout(function () {
        //                             var swiper = new Swiper('.swiper-container', {
        //                                 slidesPerView: 4,
        //                                 paginationClickable: true,
        //                                 spaceBetween: 10,
        //                                 freeMode: true,
        //                                 scrollbar: '.swiper-scrollbar',
        //                                 autoplayDisableOnInteraction: false
        //                             });
        //                         }, 100)
        //                     } else {
        //                         if ($this.pageOrders.length * 6 + $this.orders.length >= data.orderTotal) {
        //                             $this.isEnd = true;
        //                             mui('#more').pullRefresh().endPullupToRefresh(false);
        //                         } else {
        //                             $this.pageOrders.push(data.data);
        //                             mui('#more').pullRefresh().endPullupToRefresh();
        //                             $this.pageIndex++;
        //                             //mui('.mui-scroll-wrapper').scroll();
        //                             setTimeout(function () {
        //                                 var swiper = new Swiper('.swiper-container', {
        //                                     slidesPerView: 4,
        //                                     paginationClickable: true,
        //                                     spaceBetween: 10,
        //                                     freeMode: true,
        //                                     scrollbar: '.swiper-scrollbar',
        //                                     autoplayDisableOnInteraction: false
        //                                 });
        //                             }, 100)
        //                         }

        //                     }

        //                 } else {
        //                     $this.popup({content: data.msg});
        //                 }

        //             }
        //         })
        //     }

        // },

        logout: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/customer/logout',
                success: function (data) {
                    if (data.code == 1) {
                        localStorage.clear();
                        $this.go('../home/home.html');

                    } else {

                    }
                    $this.popup({content: data.msg});

                }
            })
        },

        // more: function (self) {
        //     this.orderList(self);
        // },
        getUserInfo:function () {
            var $this = this;
            $this.httpAjax({
                url:'/h5/newaccount/index',
                success:function (data) {
                    $this.userData = data.data;
                    $this.userData.level--;
                    $this.userData.vipImg = $this.userData.vipImg = '/images/app/my/include/vip'+$this.userData.level.toString()+'.png';
                    localStorage.userData = JSON.stringify($this.userData);
                    $this.init = true;
                    $this.$refs.loading.show = false;
                },
                complete: function (data) {
                    if(data.code==0){
                        localStorage.removeItem('mmToken');
                        location.reload();
                    }
                }
            });
        },

        getWishList: function (more) {
            var $this = this;
            !more ? $this.wishList=[]: null;
            $this.httpAjax({
                url: '/h5/account/wishlist',
                param: {pageIndex: $this.wishPageIndex},
                success: function (data) {
                    $this.wishList.push(data.data);
                    mui('#wish-list').pullRefresh({
                        up: {
                            contentrefresh: "正在加载...",//可选，正在加载状态时，上拉加载控件上显示的标题内容
                            contentnomore: '没有更多数据了',
                            indicators: false,
                            callback: pullupRefresh
                        }
                    });
                    function pullupRefresh() {
                        setTimeout(function () {
                            mui('#wish-list').pullRefresh().endPullupToRefresh(false);
                            if ((6 * $this.wishList.length) >= data.total) {
                                $this.popup({
                                    content: '没有更多商品了', time: 1000, autoClose: true
                                });
                                mui('#wish-list').pullRefresh().endPullupToRefresh(true);
                            } else {
                                $this.wishPageIndex++;
                                $this.getWishList(true);
                            }
                        }, 0);
                   }
                    setTimeout($this.initEcho,50);
                }
            });
        },
        goMyInfo:function () {
            var $this = this;
            location.href = 'myInfo.html';
        },
        fanliMask:function () {
            var $this = this;
            $this.popup({
                title:'<p style="margin-bottom: 20px;color:#333">下载APP，蜜豆赚不停！</p>',
                content: '<p style="margin-bottom: 0;font-size:12px;text-align: left;color:#333;line-height: 20px;">注:仅在Memebox网站和APP内下单才可返蜜豆，更多会员权限请登陆Memebox查看。</p>',
                type:'confirm',
                btn:['<span style="color:#ccc">关闭</span>','去下载'],
                titleClass:'mini',
                ok:function () {
                    location.href='http://pkg-cn1001.memebox.com/android/other/automm.html#flw';
                }
            });
        }
    },
    ready: function () {
        var $this = this;
    },
    created: function () {
        var $this = this;
        //__inline('_data.js');
        if(!localStorage.mmToken){
            localStorage.removeItem('ref');
            location.href='../account/login.html';
        }else{
            mui.init();
            $this.initHome(mui);
            $this.getUserInfo();
        }
    },
    watch: {}

});