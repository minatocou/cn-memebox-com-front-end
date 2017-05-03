/**
 * Created by Jesse on 16/4/25.
 */

var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var validate=require('vue/vue-validate');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common,validate],
    el: 'html',
    data: {
        title: '搜索',
        init: false,
        dataSearchType: {},
        keysFirstLevel: [],
        searchText: '',
        text: '',
        dataProductList: [],
        showResult: '',                              // true->显示搜索结果
        showSearch:false,
        showBrandCard: false,
        price: null,
        position: true,                             //默认排序方法
        sale:null,
        cartNumber: null,
        pageIndex: 1,
        orderTotal: null,
        first: true ,                           //判断第一次点击价格排序
        noSearch:'',
        noFiler:'',
        filter:{},
        isShowFilter:false,
        brands:[],
        currentBrandId: null,
        filterOption:{
            data:[],
            brand:[],
            category:[],
            functions:[],
            origin:[],
            price:[]
        },
        brandCardData: {},
        filterSwipe:null,
        letters:null,
        tab:{
            brand:{show:true,text:"品牌"},
            category:{show:false,text:"分类"},
            functions:{show:false,text:"功效"},
            origin:{show:false,text:"发货地"},
            price:{show:false,text:"价格"},
        }
    },
    methods: {
        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
                    up: {
                        contentrefresh: '正在加载...',
                        contentnomore: '',   //没有更多数据了
                        callback: pullupRefresh
                    }
                }
            });
            /**
             * 上拉加载具体业务实现
             */
            function pullupRefresh() {
                setTimeout(function () {
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh();

                    if ((10 * $this.pageIndex) >= $this.orderTotal) {
                        $this.popup({
                            content: '没有更多商品了', time: 1000, autoClose: true
                        });
                        mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                    }else {
                        var param={q:$this.text,pageIndex:$this.ascIndex};
                        $this.pageIndex++;
                        $this.getList(param,function (data) {
                            $this.dataProductList = ($this.dataProductList).concat(data['data']);
                        })
                    }
                }, 0);
            }
        },
        initFilterSwipe:function () {
            var $this = this;
            $this.filterSwipe = new Swiper('#filter .swiper-container', {
                observer:true,
                slidesPerView: 'auto',
                paginationClickable: true,
                spaceBetween: 10,
                freeMode: true,
                direction : 'horizontal',
            });
        },
        submit: function (event) {
            var $this = this;
            event.preventDefault();
            $this.valiForm(function () {
                location.search = '?searchInput=' + encodeURIComponent($this.searchText);
            });
            localStorage.searchText = $this.searchText;
        },
        getBrandCard: function (text) {
            var $this = this,
                searchText = text,
                brand,
                backBrandId = null;
            if(searchText == ""){
                return false;
            }else{
                searchText = searchText.toLowerCase();
            }
            if($this.getCookie("brand") == null){
                $this.httpAjax({
                    url: '/h5/brand/cards',
                    success: function (data) {
                        var backData = data.data;
                        if(data.code == 1 && backData.length>0){
                            $this.setCookie("brand", JSON.stringify(backData), "h3");
                            brand = JSON.parse($this.getCookie("brand"));
                            for(var l=0; l<brand.length; l++){
                                var str = (brand[l].name).toLowerCase(),
                                    temp = (brand[l].intro).toLowerCase(),
                                    searchVal = brand[l].searchKey;
                                if((str.indexOf(searchText) >= 0) || (temp.indexOf(searchText) >= 0)){
                                    backBrandId = brand[l].brandId;
                                    $this.brandCardData = brand[l];
                                    break;
                                }
                                for(var i=0; i<searchVal.length; i++){
                                    var tmp = searchVal[i].toLowerCase();
                                    if(searchText == tmp){
                                        backBrandId = brand[l].brandId;
                                        $this.brandCardData = brand[l];
                                        break;
                                    }
                                }
                            }
                        }else{
                            $this.popup({content: data.msg});
                        }
                    },
                    error: function (err) {
                        $this.popup({content: "程序出错了"});
                    }
                });
            }else{
                brand = JSON.parse($this.getCookie("brand"));
                for(var l=0; l<brand.length; l++){
                    var str = (brand[l].name).toLowerCase(),
                        temp = (brand[l].intro).toLowerCase(),
                        searchVal = brand[l].searchKey;
                    if((str.indexOf(searchText) >= 0) || (temp.indexOf(searchText) >= 0)){
                        backBrandId = brand[l].brandId;
                        $this.brandCardData = brand[l];
                        break;
                    }
                    for(var i=0; i<searchVal.length; i++){
                        var tmp = searchVal[i].toLowerCase();
                        if(searchText == tmp){
                            backBrandId = brand[l].brandId;
                            $this.brandCardData = brand[l];
                            break;
                        }
                    }
                }
            }
            return backBrandId;
        },
        setCookie: function (name, value, time) {
            /** 设置cookie缓存
             * s20是代表20秒
             * h是指小时，如12小时则是：h12
             * d是天数，30天则：d30
             *
             **/
            var $this = this;
            var strsec = $this.getsec(time);
            var exp = new Date();
            exp.setTime(exp.getTime() + strsec*1);
            document.cookie = name + "="+ encodeURI(value) + ";expires="+ exp.toGMTString();
        },
        getsec: function (str) {
            //设置时间
            var str1=str.substring(1,str.length)*1;
            var str2=str.substring(0,1);
            if (str2=="s") {
                return str1*1000;
            } else if (str2=="h") {
                return str1*60*60*1000;
            } else if (str2=="d") {
                return str1*24*60*60*1000;
            }
        },
        getCookie: function(name) {
            //获取cookie缓存
            var arr, reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg)){
                return decodeURI(arr[2]);
            } else{
                return null;
            }
        },
        delCookie: function (name) {
            //删除cookie缓存
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval=getCookie(name);
            if(cval!=null)
                document.cookie= name + "="+cval+";expires="+exp.toGMTString();
        },
        inputEmpty: function () {
            var $this = this;
            $this.searchText = '';
        },
        //价格升序
        priceChange: function () {
            var $this = this;
            $this.position = false;
            $this.sale = false,
            $this.price = $this.price =='asc' ? 'desc' : 'asc' ;
            $this.first = false;
            $this.pageIndex = 1;
            if($this.showResult){
                mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
                mui('#pullrefresh').pullRefresh().refresh(true);
                $this.getList();
            }
            $this.isShowFilter = false;
        },
        positionSort: function () {
            var $this = this;
            $this.position = true;
            $this.price = null;
            $this.sale = false;
            $this.pageIndex = 1;
            if($this.showResult){
                mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
                mui('#pullrefresh').pullRefresh().refresh(true);
                $this.getList();
            }

            $this.isShowFilter = false;
        },
        salesSort:function(){
            var $this = this;
            $this.position = false;
            $this.price = null;
            $this.sale = true;
            $this.pageIndex = 1;
            if($this.showResult){
                mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
                mui('#pullrefresh').pullRefresh().refresh(true);
                $this.getList();
            }
            $this.isShowFilter = false;
        },
        getList: function (param,callback) {
            var $this = this;
            param=param || {};
            param.order = 1;
            if($this.price){
                $this.price == 'asc'?param.order='3':param.order='4';
            }
            if($this.sale){
                param.order = 2;
            }

            for(var kind in $this.filterOption){
                if(kind!='data'&&$this.filterOption[kind].length>0){
                    param[kind]= $this.filterOption[kind].toString();
                    if(kind=='price'){           //价格处理
                        var str = param[kind].match(/\d+/g);
                        if(str.length>1){
                            if(parseInt(str[0])<parseInt(str[1])){
                                param[kind] = str[0]+'-'+str[1];
                            }else{
                                param[kind] = str[1]+'-'+str[0];
                            }
                        }else{
                            param[kind] = str[0]+"-*";
                        }
                    }
                }

            }
            param.q=$this.text.replace(/(^\s*)|(\s*$)/g,'');
            param.pageIndex=$this.pageIndex;
            $this.httpAjax({
                url:  '/global/search',
                domain: $this.searchDomain,
                param: param,
                success: function (data) {
                    $this.orderTotal=data.orderTotal;
                    if(callback){
                        callback(data);
                    }else{
                        if($this.orderTotal ==0){
                            $this.showResult =false;
                            $this.noSearch=true;
                        }else{
                            $this.showResult =true;
                            $this.noSearch=false;

                            if($this.orderTotal<10){
                                setTimeout(function(){
                                    mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                                },0);
                            }
                        }
                        $this.dataProductList=data.data;

                    }
                    $this.init = true;
                    setTimeout(function () {
                        $this.initEcho();
                    },10)

                }
            });
        },
        getCart: function () {
            var $this = this;
            $this.httpAjax({
                url:  '/h5/newcart/count',
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
        },
        //品牌按首字母排序
        pySort:function(arr,empty){
            var $this = this;
            if(!String.prototype.localeCompare)
                return null;

            var letters ="ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split('');
            $this.letters = letters;
            var zh ="啊把差大额发噶哈*级卡啦吗那哦爬器然撒他**哇西呀咋".split('');     //*占位没有i,u,v拼音开头的汉字

            var arrList = [];
            for(var m =0;m<arr.length;m++){
                arrList.push(arr[m].name);
            }

            var result = [];
            var curr;
            for(var i=0;i<letters.length;i++){
                curr = {letter: letters[i], data:[]};

                if(i!=26){
                    for(var j=0;j<arrList.length;j++){
                        var arrListJ = arrList[j].toString();
                        var initial = arrListJ.charAt(0);           //截取第一个字符
                        if(initial==letters[i]||initial==letters[i].toLowerCase()){   //首字符是英文的
                            curr.data.push(arrListJ);
                        }else if(zh[i]!='*'&&$this.isChinese(initial)){      //判断是否是无汉字,是否是中文
                            if(initial.localeCompare(zh[i]) >= 0 &&(!zh[i+1]||initial.localeCompare(zh[i+1]) <0)) {   //判断中文字符在哪一个类别
                                curr.data.push(arrListJ);
                            }
                        }
                    }
                }else{
                    for(var k=0;k<arrList.length;k++){
                        var arrListK = arrList[k].toString();
                        var ini = arrListK.charAt(0);           //截取第一个字符
                        if(!$this.isChar(ini)&&!$this.isChinese(ini)){
                            curr.data.push(arrListK);
                        }
                    }
                }

                if(empty || curr.data.length) {
                    result.push(curr);
                    /*curr.data.sort(function(a,b){
                        return a.localeCompare(b);       //排序,英文排序,汉字排在英文后面 (有问题)
                    });*/
                }
            }
            return result;
        },
        isChinese:function(temp){
              var re=/[^\u4E00-\u9FA5]/;
              if (re.test(temp)){return false  ;}
              return true ;
        },
        isChar:function(char){
            var reg = /[A-Za-z]/;
            if (!reg.test(char)){return false ;}
            return true ;
        },
        //筛选品牌侧边索引跳转
        scrollToGroup:function (group) {
            var brand = document.getElementById("brand");
            if(brand.getElementsByClassName(group)[0]){
                brand.scrollTop = brand.getElementsByClassName(group)[0].offsetTop;
            }
        },
        //筛选
        changeTab:function(kind){
            var $this = this;
            for(k in $this.tab){
                $this.tab[k].show = false;
            }
            $this.tab[kind].show = true;
        },
        selectOption:function(k,v,event){
            var $this = this;
            var targetDom = event.currentTarget;
            if(targetDom.className=='active'){
                targetDom.className='';
                $this.deleteOption(k,v);
            }else{
                if(k=='price'||k=='origin'){
                    $this.filterOption[k]=[];
                    $this.emptyArr(k,$this.filterOption.data);
                    var pODom= document.getElementById(k);
                    var activeDom = pODom.querySelectorAll('.active');
                    for(var i =0;i<activeDom.length;i++){
                        activeDom[i].className='';
                    }
                }
                targetDom.className='active';
                $this.addOption(k,v);
            }

            $this.slideChange();

        },
        removeOption:function (k,v) {
            var $this = this;
            $this.deleteOption(k,v);
            var secondLDom = document.getElementsByClassName("second-level-con")[0];
            var activeDom = secondLDom.querySelectorAll(".active");
            for(var i =0;i<activeDom.length;i++){
                if(activeDom[i].getAttribute("data-value") == v){
                    activeDom[i].className='';
                }
            }

            /*$this.slideChange();*/

        },
        addOption:function (k,v) {
            var $this = this;
            $this.addArr({k:k,v:v},$this.filterOption.data,true);
            $this.addArr(v,$this.filterOption[k],false);
        },
        deleteOption:function(k,v){
            var $this = this;
            $this.deleteArr({k:k,v:v},$this.filterOption.data,true);
            $this.deleteArr(v,$this.filterOption[k],false);
        },
        addArr:function(obj,arr,isO){
            var $this = this;
            if(!isO){
                for (var i=0; i<arr.length; i++) {
                    if (obj==arr[i]) {
                        $this.deleteArr(arr[i],arr,isO);
                        return false;
                    }
                }

            }else{
                for (var i in arr) {
                    if (arr[i].k == obj.k && arr[i].v == obj.v) {
                        $this.deleteArr(arr[i],arr,isO);
                        return false;
                    }
                }
            }
            arr.push(obj);
        },
        deleteArr:function(obj,arr,isO){
            if(!isO){
                for (var i=0; i<arr.length; i++) {
                    if (obj==arr[i]) {
                        arr.splice(i, 1);
                        return false;
                    }
                }

            }else{
                for (var i in arr) {
                    if (arr[i].k == obj.k && arr[i].v == obj.v) {
                        arr.splice(i, 1);
                        return false;
                    }
                }
            }

        },
        emptyArr:function (k,arr) {        //将data中特定的k值清除
            for (var i in arr) {
                if (arr[i].k == k) {
                    arr.splice(i, 1);
                    return false;
                }
            }
        },
        slideChange:function () {
            var $this = this;
            var slideTimer = setTimeout(function(){
                var slideIndex = $this.filterOption.data.length-1;
                $this.filterSwipe.slideTo(slideIndex, 300, false);
                clearTimeout(slideTimer);
            },10);
        },
        //筛选
        clearFilter:function () {
            var $this = this;
            for(var i in $this.filterOption){
                $this.filterOption[i]=[];
                /*$this.filterOption[i].length=0;
                $this.filterOption[i].splice(0,$this.filterOption[i].length)*/
            }
            var secConDom = document.getElementsByClassName('second-level-con')[0];
            var activeSecLevDom = secConDom.querySelectorAll('.active');

            for(var i = 0;i<activeSecLevDom.length;i++){
                activeSecLevDom[i].className = '';
            }
        },
        sureFilter:function () {
            var $this = this;
            $this.pageIndex = 1;
            if($this.showResult){
                mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
                mui('#pullrefresh').pullRefresh().refresh(true);
            }
            $this.getList();
            $this.isShowFilter = false;
        },
        showFilter:function(){
            var $this = this;
            $this.isShowFilter = !($this.isShowFilter);
        },
        enterBrand: function () {
            var $this = this,
                brandId = $this.currentBrandId;
            if(brandId){
                _maq.push(["_trackEvent" , "search_enter_brand_click" , {brand_id:brandId, keyword:$this.searchText}]);
            }
        }
    },
    ready: function () {
        var $this = this,
            flag;
        var search = $this.getSearch("searchInput");
        $this.init = true;
        if (search&&search != '') {
            localStorage.searchText = decodeURI(search);
            $this.searchText = localStorage.searchText;                                       //localStorage
            $this.text = $this.searchText;                                                //记录被搜索的内容  解决汉字乱码
            $this.getList({filter:1},function (data) {
                /*$this.showSearch = true;*/
                if (!data.data) {
                    $this.popup({
                        content: '没有该商品', time: 1000, autoClose: true, ok: function () {
                            //window.location.href = '../search/search.html';
                        }
                    });
                    $this.noSearch=true;
                } else {
                    $this.dataProductList = data.data;
                    $this.filter = data.filter;
                    $this.brands = $this.pySort($this.filter.brand);
                    ($this.dataProductList.length!=0)&& ($this.showResult = true);
                    ($this.dataProductList.length==0)&&($this.noSearch=true);
                    $this.title = $this.searchText;
                    setTimeout(function () {
                        $this.initMui();
                        $this.getCart();
                        $this.initFilterSwipe();
                    },10)
                }
                $this.showSearch = true;
            })
            //品牌卡
            flag = $this.getBrandCard($this.searchText);
            if(flag){
                $this.currentBrandId = flag;
                $this.showBrandCard = true;
            }else{
                $this.showBrandCard = false;
            }
        } else {
            $this.httpAjax({
                url:  '/h5/category/getCats',
                success: function (data) {
                    $this.dataSearchType = data['data'];
                    $this.showResult = false;
                    $this.showSearch = false;
                }
            });
        }
    },
    created: function () {
        if(typeof(Storage)!=="undefined") {
           sessionStorage.KEYNODE = 2;
        }
    }
});

