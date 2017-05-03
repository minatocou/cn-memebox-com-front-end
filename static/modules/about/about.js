/**
 * Created by curtis on 16/7/21.
 */


var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var vue = new Vue({
    mixins: [common,appTools],
    el: '#app',
    data:{
        version:null,
        activeIndex:0,
        title:'关于美美箱',
        tab:{
            0:{
                title:"美美全球"
            },
            1:{
                title:"品牌优势"
            },
            2:{
                title:"消费保证"
            }
        },
        authImg:[
            __uri("../../html/about/include/auth/auth1.JPG"),
            __uri("../../html/about/include/auth/auth2.JPG"),
            __uri("../../html/about/include/auth/auth3.JPG"),
            __uri("../../html/about/include/auth/auth4.JPG"),
            __uri("../../html/about/include/auth/auth5.jpg"),
            __uri("../../html/about/include/auth/auth6.JPG"),
            __uri("../../html/about/include/auth/auth7.jpg"),
            __uri("../../html/about/include/auth/auth8.jpg"),
            __uri("../../html/about/include/auth/auth9.JPG"),
            __uri("../../html/about/include/auth/auth10.JPG"),
            __uri("../../html/about/include/auth/auth11.JPG"),
            __uri("../../html/about/include/auth/auth12.JPG"),
            __uri("../../html/about/include/auth/auth13.JPG"),
            __uri("../../html/about/include/auth/auth14.jpg"),
            __uri("../../html/about/include/auth/auth15.JPG")
        ]
    },
    methods: {
        init:function () {
            this.version = this.iosVer() || this.androidVer();
            this.init =  true;
            this.$refs.loading.show = false;
            this.initEcho();

        },

        onTabClick:function (index) {
            this.activeIndex = index;
            window.scrollTo(0,1);
            window.scrollTo(0,0);
            if(index == 1){
                this.initSwiper();
            }
            // $('tab-item').removeClass('a')
        },

        initSwiper:function () {
            setTimeout(function () {
                var swiper = new Swiper('.swiper-container', {
                    slidesPerView: 1,
                    paginationClickable: true,
                    spaceBetween: 0,
                    freeMode: false,
                    preloadImages:false,
                    autoplayDisableOnInteraction: false,
                    lazyLoading : true,
                    lazyLoadingInPrevNext : true,
                    lazyLoadingInPrevNextAmount : 3
                });
            }, 100)
        }
    },
    ready: function () {
        this.init();

    },
    created: function () {
        if(location.host=='cn.memebox.com'){
            location.href='http://cn.m.memebox.com'+location.pathname
        }else{
            var app_share= {
                title: document.title,
                text: '全球知名化妆品平台- 美美箱MEMEBOX',
                url: location.href,
                image: 'http://img-cn1001.memebox.com/media/app/default/icon-old-180_1.png'
            }
            this.app_setShare(app_share);
        }
    }
});
