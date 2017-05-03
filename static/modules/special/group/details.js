/**
 * Created by Jesse on 16/5/12.
 */

var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common,appTools],
    el: 'html',
    data: {
        title: '',
        init: false,
        statusLabel: '',
        showPlayGroup: '',
        dataProductDetails: {},                              //拼团数据
        thumbnailUrl: '',
        grouponId: '',                                        //团长Id
        productId: '',                                        //商品Id
        lackNum: null,
        showShare: '',                                         //显示分享遮罩层
        disappearTime: '',
        state:'组团中',
        stateText:{'未开团':'去开团','去参团':'去参团','已成团':'开新团'},
        errorMsg:null,
        getNum: 0,
    },
    methods: {
        playGroup: function () {
            //玩转拼团
            var $this = this;
            $this.showPlayGroup = 1;
        },
        close: function (e) {
            //关闭浮层
            e.preventDefault();
            var $this = this;
            $this.showPlayGroup = '';
        },
        closeShareMask: function (e) {
            e.preventDefault();
            var $this = this;
            $this.showShare = false;
            clearTimeout($this.disappearTime);
        },
        groupUrl: function () {
            var url=location.origin+this.page+'/payment/group.html?productId='+this.productId;
            if(this.grouponId && this.dataProductDetails.data.currentNum<this.dataProductDetails.data.totalNum){
                url+='&grouponId='+this.grouponId;
            }
            if(this.getSearch('code')){
                url+='&code='+this.getSearch('code');
            }
            if(this.isWeixin()){
                url=this.getPayUrl(url);
            }
            return url;
        },
        userInfoCall: function (data) {
            if(data && data.data && data.data.token){
                this.errorMsg=data.data.token;
                localStorage.mmToken = data.data.token;
                this.getDetail();
            }else{
                this.getDetail();
            }
        },
        getDetail: function () {
            var $this = this;
            $this.productId = $this.getSearch('productId');
            $this.grouponId = $this.getSearch('grouponId');
            var param={};
            $this.productId && (param.productId = $this.productId);
            $this.grouponId && (param.grouponId = $this.grouponId);
            $this.httpAjax({
                url:  '/h5/groupon/detail',
                param: param,
                showLoading: true,
                success: function (data) {
                    if(data.code==1){
                        if(data && data.data && data.data.productInfo && data.data.productInfo.stockStatus==true){
                            try{
                                var wxshare= {
                                    title: '仅'+data.data.productInfo.price+'元！我买了【火爆韩国思密达】'+data.data.productInfo.name,
                                    desc: '宋仲基代言全球知名化妆品平台- 美美箱MEMEBOX来中国啦！100%正品，比出国买还便宜。',
                                    link: location.href,
                                    imgUrl: data.data.productInfo.thumbnailUrl[0],
                                }
                                $this.set_share(wxshare);
                                var appShare={
                                    title:'仅'+data.data.productInfo.price+'元！我买了【火爆韩国思密达】'+data.data.productInfo.name,
                                    text:'宋仲基代言全球知名化妆品平台- 美美箱MEMEBOX来中国啦！100%正品，比出国买还便宜。',
                                    url:location.href,
                                    image:data.data.productInfo.thumbnailUrl[0],
                                }
                                if($this.isApp() && ($this.iosVer()>=360 || $this.androidVer()>=360)){
                                    $this.app_setShare(appShare);
                                }
                            }catch(e){
                                $this.errorMsg=e;
                            }

                            $this.init = true;
                            $this.$refs.loading.show = false;
                            $this.dataProductDetails = data;
                            $this.setTitle($this.dataProductDetails.data.productInfo.name);
                            $this.productId = $this.dataProductDetails.data.productInfo.productId;
                            $this.thumbnailUrl = $this.dataProductDetails.data.productInfo.thumbnailUrl;
                            $this.grouponId = $this.dataProductDetails.data.grouponId;
                            if (($this.grouponId==localStorage.grouponId)&&localStorage.groupPhone) {
                                $this.showShare = true;
                                $this.disappearTime = setTimeout(function () {
                                    $this.showShare = false;
                                    console.log(0)
                                }, 10000);
                            }
                            $this.state=$this.dataProductDetails.data.statusLabel;
                            ($this.state=='未开团'||$this.state=='去参团')?$this.state='组团中':'';
                            $this.state=='已过期'?$this.state='已取消':'';
                            $this.lackNum = $this.dataProductDetails.data.lackNum;
                            ($this.grouponId&&$this.dataProductDetails.data.currentNum=='0')?$this.dataProductDetails.data.currentNum='1':'';
                            ($this.grouponId&&$this.dataProductDetails.data.currentNum>$this.dataProductDetails.data.totalNum)?$this.dataProductDetails.data.currentNum=$this.dataProductDetails.data.totalNum:'';
                            // setTimeout(function () {
                            //     var mySwiper = new Swiper('.swiper-container', {
                            //         loop: true,
                            //         autoplay: 2000,
                            //         pagination: '.swiper-pagination',
                            //         autoplayDisableOnInteraction: false
                            //     });
                            // }, 500);
                            $this.initSwipe();
                            if(localStorage.groupParam){
                                var obj = JSON.parse(localStorage.groupParam);
                                obj.productId = $this.productId ;
                                localStorage.groupParam = JSON.stringify(obj);
                            }

                        }else{
                            $this.getNum++;
                            if($this.getNum<5){
                                setTimeout($this.getDetail,10000);
                            }else{
                                $this.popup({
                                    content: '网络状态不太好,请稍后再试', type: 'alert', autoClose: false, ok: function () {
                                        location.href = 'list.html';
                                    }
                                });
                            }


                        }


                    }



                }
            });
        }
    },
    ready: function () {


    },
    created: function () {
        var $this=this;
        // if(this.isWeixin() && !this.getSearch('code')){
        //     this.wxPay();
        // }
        try {
            if(this.isApp() && ($this.iosVer()>=360 || $this.androidVer()>=360) && !localStorage.mmToken){
                this.app_userinfo();
                setTimeout(function () {
                    if(!localStorage.mmToken){
                        $this.getDetail();
                    }
                },500);
            }else{
                this.getDetail();
            }
        }catch(e){
            console.log(e);
            $this.getDetail();
        }
    }
});
