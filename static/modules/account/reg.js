/**
 * Created by page on 2016/4/20.
 */
var Vue=require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common=require('vue/vue-common');
var validate=require('vue/vue-validate');
var appTools = require('app/app');
var vue = new Vue({
    mixins: [common,validate,appTools],
    el: 'html',
    data:{
        title:'注册',
        init:false,
        param:{
            userName:null,
            password:null,
        },
        pwd:null,
        c:null
    },
    methods:{
        getCoupon: function (cb) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/coupon/list',
                param: {pageIndex: 1,pageSize:20},
                success: function (data) {
                    if (data.code == 1) {
                        $this.c=data.data;
                        console.log(console.log($this.coupon));
                        cb && cb();
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            })
        },
        reg: function(){
            var $this=this;
            var now=new Date().getTime();
            $this.valiForm(function(){
                $this.param.password=$this.base64($this.pwd+now+'');
                var url=localStorage.ref || $this.getSearch('ref');
                if(localStorage.getItem('source')){
                    $this.param.source = localStorage.getItem('source');
                }
                if(/(group)/.test(url)){
                    $this.param.source=4;
                }
                if($this.getSearch('source')){
                    $this.param.source=$this.getSearch('source');
                }
                if($this.getSearch('channel')){
                    $this.param.channel=$this.getSearch('channel');
                }
                if(localStorage.activityType){
                    $this.param.type=localStorage.activityType;
                }
                $this.httpAjax({
                        url: '/h5/customer/register',
                        param:$this.param,
                        type:'post',
                        headers:{nowdate:now},
                        success: function (data) {
                            if(data.code==1){
                                localStorage.user=JSON.stringify(data.data);
                                localStorage.mmToken=data.data.token;
                                localStorage.userName=$this.param.userName;
                                localStorage.isNew=1;
                                $this.getCoupon();
                                $this.popup({content: data.msg,type:'alert',ok:function(){
                                    url=url? decodeURIComponent(url): '../home/home.html';
                                    _hmt.push(['_trackEvent', 'success_register', '注册成功']);
                                    _maq.push(["_trackEvent" , "success_register" , {suuid:localStorage.uuid,suuid2:localStorage.uuid2,source:localStorage.source,ref:url}]);
                                    localStorage.removeItem('channel');
                                    localStorage.removeItem('ref');
                                    $this.go(url);
                                }});

                            }
                        }
                    }
                )
            })
        },
        getAuth: function(){
            var $this=this;
            if($this.param.userName){
                $this.httpAjax({
                        url: '/h5/sms/getAuth',
                        param:$this.param,
                        success: function (data) {
                            $this.popup({content: data.msg});
                        }
                    }
                )
            }else{
                $this.popup({content: '请输入手机号'});
            }
        },
        otherLogin: function (platform) {
            var url = '/sns/' + platform + '/login?source=h5';
            location.href=CTX+url;
        },
        ref: function () {
            return location.search;
        }
    },
    ready:function(){
        var $this = this;
        _hmt.push(['_trackEvent', 'user_regiser_page', '进入注册页']);
        _maq.push(["_trackEvent" , "user_regiser_page" , {source:localStorage.source}]);
        if($this.isWeixin()){
            $this.otherLogin('wechat');
        }else{
            $this.init=true;
            $this.$refs.loading.show=false;
        }
        //$this.getCoupon();
    },
    created: function(){
    }
});