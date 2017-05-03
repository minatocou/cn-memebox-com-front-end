/**
 * Created by yate on 2017/3/16.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');

var vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: "",
        init: false,
        teletextData: {
            id: "",
            title: "",
            intro:"",
            author:"",
            createDate: "",
            tags: [],
            content: "",
            views: 0,
            zan: 0
        },
        skus: [],
        prdlist: []
    },
    methods: {
        getTeleId: function (name) {
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if(r!=null)return (r[2]);
            return null;
        },
        initTeletext: function () {
            var $this=this,
                teleId = $this.getTeleId("id");
            $this.httpAjax({
                url:  '/h5/Imagetext/detail',
                param: {
                    id: teleId
                },
                goLogin: false,
                success: function (data) {
                    if(data.code == 1){
                        var source = data.data;
                        $this.teletextData={
                            id: "",
                            title: "",
                            intro:"",
                            author:"",
                            createDate: "",
                            tags: [],
                            content: "",
                            views: 0,
                            zan: 0
                        };
                        $this.teletextData.id = source.id;
                        $this.teletextData.cover = source.cover;
                        $this.teletextData.author = source.author;
                        $this.teletextData.title = source.title;
                        $this.teletextData.intro = source.intro;
                        $this.teletextData.views = source.view_count;
                        $this.teletextData.zan = source.zan_count;
                        if(source.created_at){
                            $this.teletextData.createDate = source.created_at.substr(0, 10);
                        }

                        if(source["tags_name"]){
                            var taglist = source["tags_name"].split(","),
                                newArr = [];
                            for(var l=0; l<taglist.length; l++){
                                if(taglist[l]){
                                    newArr.push(taglist[l]);
                                }
                            }
                            $this.teletextData.tags = newArr;
                        }
                        if(source["skus"]){
                            $this.skus = source["skus"].split(",");
                        }
                        if(source["productList"]){
                            $this.prdlist = source["productList"];
                        }
                        if(source["content"]){
                            var obj = $(source["content"]),
                                sourceHtml = source["content"],
                                objLen,
                                destObj = {},
                                temp = 0,
                                allTags;
                            var el = document.createElement('div');
                            //el.className = "ele-parent";
                            el.innerHTML = sourceHtml;
                            allTags = el.getElementsByTagName('*');
                            $this.teletextData.content = allTags;
                            /*objLen = Object.keys(allTags).length;
                            for(var n=0; n<objLen; n++){
                                if(allTags[n].parentNode.nodeName == "P" || allTags[n].parentNode.nodeName == "DIV"){
                                    if(allTags[n].parentNode.className == "ele-parent" && allTags[n].innerHTML != "" && allTags[n].innerHTML != "<br>"){
                                        destObj[temp] = allTags[n];
                                        temp++;
                                    }
                                }
                            }
                            $this.teletextData.content = destObj;*/
                        }
                        $this.setShare();
                        if(source.title.length > 15){
                            document.title = source.title.substr(0, 15)+"...";
                        }else{
                            document.title = source.title;
                        }
                        $this.init = true;
                    }else{
                        $this.popup({content: data.msg});
                    }
                },
                error: function (err) {
                    $this.popup({content: "程序出错了"});
                }
            });
        },

        getProductDetailUrl: function (id) {
            var $this = this,
                productDetailUrl = "";
            if ($this.isAppPresale()) {
                $this.app_product({productId: id})
                productDetailUrl =  $this.domain+'/catalog/product/view/id/'+id;
            } else {
                productDetailUrl = '/m/productDetails/productDetails.html#'+id;
                return productDetailUrl;
            }
        },
        gotoDetail: function (id) {
            var $this = this,
                productDetailUrl = "",
                pid = id,
                teleId = $this.teletextData.id,
                teleTitle = $this.teletextData.title;
            if ($this.isAppPresale()) {
                $this.app_product({productId: id})
                productDetailUrl =  $this.domain+'/catalog/product/view/id/'+id;
            } else {
                productDetailUrl = '/m/productDetails/productDetails.html#'+id;
                location.href = productDetailUrl;
            }
            _maq.push(["_trackEvent", "artc_det_pro_ck" , {product_id:pid, image_text_id:teleId, title: teleTitle}]);
        },
        getShareData: function () {
            var $this = this,
                teleID,
                title,
                intro,
                cover;
            teleID = $this.teletextData.id;
            title = $this.teletextData.title;
            intro = $this.teletextData.intro;
            cover = $this.teletextData.cover;
            return {
                title: title,
                text: intro,
                url: location.origin + '/m/special/teletext/index.html?id='+teleID,
                image: cover
            }
        },
        appShare: function () {
            var $this = this;
            if ($this.isApp()) {
                $this.app_share($this.getShareData());
                _hmt.push(['_trackEvent', '图文页面', '分享']);
            } else {
                $this.popup({
                    title:'',
                    type: 'confirm',
                    content: '悄悄告诉你，这个活动太划算，只能在APP内进行哦',
                    btn:['关闭','下载APP'],
                    ok:$this.goApp(),
                });
            }

        },
        setShare: function () {
            var $this = this;
            if($this.isApp()){
                $this.app_setShare($this.getShareData());
            }else{
                $this.set_share($this.getShareData());
            }
        },
    },
    ready: function () {
        var $this=this;

    },
    created: function () {
        var $this=this;

        $this.initTeletext();
    }
});