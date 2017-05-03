/**
 * 品牌馆
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var mySwiper = new Swiper('.swiper-container', {
    resistanceRatio: 0,
    loop: true,
    slidesPerView: 1,
    loopedSlides: 4,
    onSlideChangeEnd: function(swiper){
        var index = $(swiper.wrapper[0]).find(".swiper-slide-active").attr("data-index");
        $('.swiper-group .brand-item').removeClass('active-item');
        $('.swiper-group .brand-item').eq(index).addClass('active-item');
    }
});
var pagination = new Swiper('.brand-pagination', {
    resistanceRatio: 0,
    watchSlidesProgress : true,
    watchSlidesVisibility : true,
    slidesPerView : 4
});

function playVideo(index) {
    var video = $("#videoWrap .swiper-slide").eq(index).find("video")[0],
        progress = $("#videoWrap .swiper-slide").eq(index).find(".playProgress")[0];
    console.log(video+"\n"+progress);
}


var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '品牌馆',
        init: false,
        pageData: {
            ponyef: [],
            imeme: [],
            nooni: [],
            bonvivant: []
        },
        currentItem: null,
    },
    methods: {
        tapItem: function (index) {
            var $this = this;
            var currentBrandId = 0,
                brandName = "";
            if(index == 0){
                currentBrandId = $this.pageData.ponyef.brandId;
                brandName = $this.pageData.ponyef.name;
            }else if(index == 1){
                currentBrandId = $this.pageData.imeme.brandId;
                brandName = $this.pageData.imeme.name;
            }else if(index == 2){
                currentBrandId = $this.pageData.nooni.brandId;
                brandName = $this.pageData.nooni.name;
            }else if(index == 3){
                currentBrandId = $this.pageData.bonvivant.brandId;
                brandName = $this.pageData.bonvivant.name;
            }else{
                currentBrandId = "";
                brandName = "";
            }
            _maq.push(["_trackEvent" , "brandstore_tab" , {brand_id:currentBrandId, brand_name:brandName}]);
            mySwiper.slideTo(index);
        },
        setAudio: function () {

        },
        initBrand: function () {
            var $this = this,
                video1 = $("#videoWrap .swiper-slide:first-child").find("video")[0],
                progress = $("#videoWrap .swiper-slide:first-child").find(".playProgress")[0];
            //关闭视频声音
            //video1.muted=true;
            //开始播放
            //video1.play();
            // setInterval(function(){
            //     progress.max=video1.duration;
            //     progress.value=video1.currentTime;
            // }, 1000);

            $this.httpAjax({
                url: '/h5/brand/center',
                success: function (data) {
                    if(data.code == 1){
                        var sourceData = data.data;
                        $this.pageData = {
                            ponyef: {},
                            imeme: {},
                            nooni: {},
                            bonvivant: {}
                        };
                        $this.init = true;
                        for(var i=0; i<sourceData.length; i++){
                            if(sourceData[i].id == 1){
                                $this.pageData.ponyef = sourceData[i];
                            }else if(sourceData[i].id == 2){
                                $this.pageData.imeme = sourceData[i];
                            }else if(sourceData[i].id == 3){
                                $this.pageData.nooni = sourceData[i];
                            }else if(sourceData[i].id == 4){
                                $this.pageData.bonvivant = sourceData[i];
                            }else{

                            }
                        }
                    }else{
                        $this.popup({content: data.msg});
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            })
        },
        enterBrand: function (code) {
            var allItems = document.querySelector("#videoWrap").children,
                currentClass = null,
                currentItem = null,
                brandName = null,
                flag = false;
            for(var i=0; i<allItems.length; i++){
                currentClass = allItems[i].classList;
                for(var l=0; l<currentClass.length; l++){
                    if(currentClass[l] == "swiper-slide-active"){
                        currentItem = allItems[i].getAttribute("value");
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    break;
                }
            }
            if(currentItem == 1){
                brandName = "PONY EFFECT";
            }else if(currentItem == 2){
                brandName = "I'M MEME";
            }else if(currentItem == 3){
                brandName = "nooni";
            }else if(currentItem == 4){
                brandName = "bonvivant";
            }
            _maq.push(["_trackEvent" , "brandstore_click" , {brand_id:currentItem, brand_name:brandName}]);
            location.href='../brand/home.html?id='+currentItem;
        }
    },
    ready: function () {
    },
    created: function () {
        var $this=this;
        $this.initBrand();
        if(typeof(Storage)!=="undefined") {
            sessionStorage.KEYNODE = 3;
        }
    }
});