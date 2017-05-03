var Vue = require('vue/vue');
var common = require('vue/vue-common');
var $ = require('libs/mui');
var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '品牌馆',
        headerColorSta: false,
        headerCss:{      //标题栏背景
            'background-color':'rgba(255, 255, 255,0)'
        },
        brandFourCate: [],
        categoryfourList: [
            {   imgUrl: "",
                price: "",
                productId: ""
            },{ imgUrl: "",
                price: "",
                productId: ""
            },{ imgUrl: "",
                price: "",
                productId: ""
            },{ imgUrl: "",
                price: "",
                productId: ""
            }
        ],
        categoryList: [],
        brandCateImg: "",
        brandList: [],
        pageData: {},
        thisBrand: null,
        init: false,
        isEmpty: false,
        toTop:false,       // 返回顶部
        scrollY:0,
        nowBrand: null,
        nowCate: "",
        pageIndex: 1,       // 默认返回第一页数据
        orderTotal: null,
        currentCate: 0,
        /***/
        brandCategory: [],
        allBrandPrdList: [],
        showPage1: false,
        showPage2: false,
        showPage3: false,
        isNowCate: [],
        swiper: null,
        cateIndex: 1,
        totalBrand: null,
        frameSrc: "",
        brandTips: "",
        currentBrandId: ""
    },
    computed: {
        currentBrand: function () {
            var $this = this;
            return {
                ponyef: $this.thisBrand == 1,
                imeme: $this.thisBrand == 2,
                nooni: $this.thisBrand == 3,
                bonvivant: $this.thisBrand == 4
            }
        }
    },
    methods: {
        initScroll: function () {
            var $this = this;
            var timer;
            setTimeout(function(){
                var scrollDom =document.querySelector('#s-brand');
                var scroll = $('#s-brand').scroll({
                    indicators: false //是否显示滚动条
                });
                scrollDom.addEventListener('scroll',function () {
                    timer = setTimeout(function(){
                        $this.scrollY = scroll.y;
                        clearTimeout(timer);
                    },50)
                })
            },0);
        },
        initMui: function (){
            var $this = this;
            $('#s-brand').pullRefresh({
                up: {
                    contentrefresh: '正在加载...',
                    contentnomore: '没有更多数据了',   //没有更多数据了
                    callback: pullupRefresh
                }
            });
            function pullupRefresh() {
                setTimeout(function () {
                    $('#s-brand').pullRefresh().endPullupToRefresh();

                    if ((10 * $this.pageIndex) >= $this.orderTotal) {
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        $('#s-brand').pullRefresh().endPullupToRefresh(true);
                    }else {
                        $this.pageIndex++;
                        $this.getBrandList(function (data) {
                            $this.brandList = ($this.brandList).concat(data['data']);
                        })
                    }
                }, 0);
            }
        },
        initBrandMui: function () {
            var $this = this;
            $('#brandlist').pullRefresh({
                up: {
                    contentrefresh: '正在加载...',
                    contentnomore: '',
                    callback: pullupReload
                }
            });
            function pullupReload() {
                setTimeout(function () {
                    $('#brandlist').pullRefresh().endPullupToRefresh();

                    if ((10 * $this.cateIndex) >= $this.totalBrand) {
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        $('#brandlist').pullRefresh().endPullupToRefresh(true);
                    }else {
                        $this.cateIndex++;
                        $this.getBrandPrdList($this.nowBrand, $this.nowCate, function (data) {
                            $this.allBrandPrdList = ($this.allBrandPrdList).concat(data['data']);
                        })
                    }
                }, 100);
            }
        },
        getBrandId: function (name) {
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return (r[2]);
            return null;
        },
        initBrand: function () {
            var $this = this,
                brandId = $this.getBrandId("id"),
                brandName = "",
                cateName = "";
            $this.brandFourCate = [];

            //查询品牌id对应的品牌信息
            $this.getBrandData(brandId);
            //查询品牌对应的分类
            $this.httpAjax({
                url: '/h5/brand/category',
                param:{
                    id: brandId
                },
                success: function (data) {
                    if(data.code == 1){
                        var sourceData = data.data;
                        if(sourceData.length > 0){
                            $this.brandCategory = sourceData;
                            for(var i=1; i<5; i++){
                                $this.brandFourCate.push(sourceData[i]);
                            }

                            brandName = sourceData[1].searchBrand;
                            cateName = sourceData[1].searchCategory;
                            //获取品牌第一个分类的前4个商品
                            $this.nowBrand = brandName;
                            $this.nowCate = cateName;
                            $this.getFourCateList(brandName, cateName);
                            //获取品牌的所有商品
                            $this.getBrandList();

                            $this.init = true;
                            $this.showPage1 = true;
                        }else{
                            $this.brandCategory = [];
                            $this.brandFourCate = [];
                        }
                    }else{
                        $this.popup({content: data.msg});
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
            $this.initScroll();
        },
        getBrandData: function (brandId) {
            var $this = this;
            $this.pageData = {};
            $this.httpAjax({
                url: '/h5/brand/home',
                param:{
                    brandId: brandId
                },
                success: function (data) {
                    if(data.code == 1 && data.data){
                        var sourceData = data.data;
                        if(sourceData.hasOwnProperty("brandId")){
                            $this.currentBrandId = sourceData.brandId;
                        }
                        if(sourceData.hasOwnProperty("id")){
                            $this.thisBrand = sourceData.id;
                        }
                        if(sourceData.hasOwnProperty("name")){
                            $this.nowBrand = sourceData.name;
                        }
                        if(sourceData.hasOwnProperty("intro")){
                            var str = sourceData.intro;
                            if(str.indexOf("\\n") >= 0){
                                var str2 = str.replace('"\\n"', "&nbsp;\n&nbsp;");
                                sourceData.intro = str2;
                            }
                            $this.pageData = sourceData;
                        }
                    }else{
                        $this.popup({content: data.msg});
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
            return $this.pageData;
        },
        getFourCateList: function (brand, category, e, index) {
            var $this = this,
                sourceData = "",
                bgimg = "";
            $this.nowCate = category;
            if(e){
                document.querySelector(".brand-nav .active").className = "";
                e.target.className = "active";
            }
            if(index){
                $this.currentCate = index;
                bgimg = $this.brandFourCate[index].adImg
            }else{
                bgimg = $this.brandFourCate[0].adImg;
            }
            //$this.brandCateImg = "background-image: url("+bgimg+")";
            $this.brandCateImg = bgimg;
            $this.categoryfourList = [
                {   imgUrl: "",
                    price: "",
                    productId: ""
                },{ imgUrl: "",
                    price: "",
                    productId: ""
                },{ imgUrl: "",
                    price: "",
                    productId: ""
                },{ imgUrl: "",
                    price: "",
                    productId: ""
                }
            ];
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: {
                    brand: brand,
                    category: category
                },
                success: function (data) {
                    if(data.code == 1 && data.orderTotal != 0){
                        sourceData = data.data;
                        for(var i=0; i<4; i++){
                            if(sourceData[i]){
                                $this.categoryfourList[i].imgUrl = sourceData[i].imgUrl;
                                $this.categoryfourList[i].price = sourceData[i].price;
                                $this.categoryfourList[i].productId = sourceData[i].productId;
                            }
                        }
                    }else{
                        if($this.orderTotal<10){
                            setTimeout(function(){
                                $('#s-brand').pullRefresh().endPullupToRefresh(true);
                            },0);
                        }
                    }
                    setTimeout(function () {
                        $this.initEcho();
                    },10)
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
        },
        getBrandList: function (callback) {
            var $this = this,
                param = {
                    pageIndex: $this.pageIndex,
                    brand: $this.nowBrand
                };
            $this.isEmpty = false;
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: param,
                success: function (data) {
                    $this.orderTotal=data.orderTotal;
                    if(callback){
                        callback(data);
                    }else{
                        if(data.code == 1 && data.orderTotal != 0){
                            $this.brandList = data.data;
                        }else{
                            $this.isEmpty = true;
                            $this.brandList = [];
                        }
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
        },
        getBrandPrdList: function (brand, cate, callback) {
            var $this = this,
                brandName = brand ? brand:$this.nowBrand,
                cateName = cate ? cate:"";
            $this.isEmpty = false;
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: {
                    pageIndex: $this.cateIndex,
                    brand: brandName,
                    category: cateName
                },
                success: function (data) {
                    $this.totalBrand=data.orderTotal;
                    if(callback){
                        callback(data);
                    }else{
                        if(data.code == 1 && data.orderTotal != 0){
                            $this.allBrandPrdList = data.data;
                        }else{
                            $this.isEmpty = true;
                            $this.allBrandPrdList = [];
                        }
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
            $('#brandlist').scroll({indicators: false});
        },
        changeTab: function (event) {
            var $this = this,
                content = event.target.textContent,
                val = event.target.getAttribute("value"),
                parentClass = event.target.parentNode.className,
                parentIndex = event.target.parentNode.getAttribute("data-index"),
                brandId = $this.getBrandId("id");
            $this.isNowCate = [];
            if(parentClass == "active"){
                return false;
            }else{
                document.querySelector(".brand-topNav .active").className = "";
                event.target.parentNode.className = "active";
                if(parentIndex == 0){
                    if($this.scrollY == 0){
                        $this.headerColorSta = false;
                        $this.headerCss = {'background-color':'rgba(255, 255, 255, 0)'};
                    }
                    $this.showPage1 = true;
                    $this.showPage2 = false;
                    $this.showPage3 = false;
                    _maq.push(["_trackEvent" , "brand_page" , {brand_id:$this.thisBrand, brand_name:$this.nowBrand}]);
                }else if(parentIndex == 1){
                    $this.headerColorSta = true;
                    $this.headerCss = {'background-color':'rgba(255, 255, 255, 1)'};
                    $this.showPage1 = false;
                    $this.showPage2 = true;
                    $this.showPage3 = false;
                    $this.isNowCate[0] = true;
                    $this.getBrandPrdList($this.nowBrand, "");
                    setTimeout(function () {
                        $this.swiper = new Swiper('.brandlist-container .swiper-container', {
                            slidesPerView: 3,
                            paginationClickable: true,
                            spaceBetween: 10,
                            freeMode: true,
                            resistanceRatio: 0
                        });
                    }, 10);
                    _maq.push(["_trackEvent" , "brand_product_list" , {brand_id:$this.thisBrand, brand_name:$this.nowBrand}]);
                }else{
                    $this.showPage1 = false;
                    $this.showPage2 = false;
                    $this.showPage3 = true;
                    $this.headerColorSta = true;
                    $this.headerCss = {'background-color':'rgba(255, 255, 255, 1)'};
                    //$this.frameSrc = location.origin + $this.page + "/home/home.html";
                    $this.frameSrc = val;
                    _maq.push(["_trackEvent" , "brand_other" , {brand_id:$this.thisBrand, brand_name:$this.nowBrand}]);
                    //location.href=val;
                }
            }
        },
        changeCate: function (brand, cate, event) {
            var $this = this,
                brandName = brand ? brand:"PONY EFFECT",
                cateName = cate ? cate:"",
                clickItem = null,
                nowIndex = null,
                isActive = null;
            $this.nowBrand = brandName;
            $this.nowCate = cateName;
            $this.isNowCate = [];
            if(event){
                clickItem = event.target.parentNode.className.split(" ");
                nowIndex = event.target.parentNode.getAttribute("value");
                isActive = _.indexOf(clickItem, "active");
                if(isActive == -1){
                    $this.isNowCate[nowIndex] = true;
                    $this.cateIndex = 1;
                    $this.getBrandPrdList(brandName, cateName);
                }else{
                    return false;
                }
            }else{
                document.querySelector(".brand-topNav .active").className = "";
                document.querySelector(".brand-topNav").children[1].className = "active";
                $this.headerColorSta = true;
                $this.headerCss = {'background-color':'rgba(255, 255, 255, 1)'};
                $this.showPage1 = false;
                $this.showPage2 = true;
                $this.currentCate++;
                $this.isNowCate[$this.currentCate] = true;
                $this.cateIndex = 1;
                $this.getBrandPrdList(brandName, cateName);

                setTimeout(function () {
                    $this.swiper = new Swiper('.brandlist-container .swiper-container', {
                        slidesPerView: 3,
                        paginationClickable: true,
                        spaceBetween: 10,
                        freeMode: true,
                        resistanceRatio: 0
                    });
                }, 10);
            }
        },
        checkAllBrand: function () {
            var $this = this;
            $this.changeCate($this.nowBrand, $this.nowCate);
        },
        goToPage: function (productId) {
            var $this = this;
            _maq.push(["_trackEvent" , "brand_other" , {brand_id:$this.thisBrand, brand_name:$this.nowBrand, category_name:$this.nowCate}]);
            location.href = location.origin + $this.page + '/productDetails/productDetails.html#'+productId;
        }
    },
    watch:{
        scrollY:function(val, oldVal){
            var $this = this;
            var windowH = document.body.clientHeight;
            var scrollH = windowH * 0.4;
            var opacityBg = 0;
            var scrollY = val;
            if(scrollY >= 0){
                opacityBg = 0;
            }else if(scrollY <0 && scrollY>=-(scrollH)){
                opacityBg = (-scrollY/scrollH).toFixed(2);
            }else{
                opacityBg = 1;
            }
            if(scrollY >= 0){
                $this.headerColorSta = false;
            }else{
                $this.headerColorSta = true;
            }
            $this.headerCss = {'background-color':'rgba(255, 255, 255,'+opacityBg+')'};     //标题栏背景*/
        }
    },
    ready: function () {
        var $this=this;
        $this.initBrandMui();
    },
    created: function () {
        var $this=this;
        $this.initBrand();
        $this.initMui();
        if(typeof(Storage)!=="undefined") {
            sessionStorage.KEYNODE = 3;
        }
    }
});