/**
 * Created by page on 2016/4/20.
 */

var Vue=require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common=require('vue/vue-common');
var validate=require('vue/vue-validate');
var vue = new Vue({
    mixins: [common,validate],
    el: 'html',
    data:{
        title:'找回密码',
        init:false,
        param:{
            userName:null,
            type:1
        },
        pwd:null,
        showPwd:false
    },
    methods:{
        reg: function(){
            var $this=this;
            var now=new Date().getTime();
            $this.valiForm(function(){
                if($this.pwd){
                    $this.param.password=$this.base64($this.pwd+now+'');
                }
                $this.httpAjax({
                        url: '/h5/customer/forgotPassword',
                        param:$this.param,
                        type:'post',
                        headers:{nowdate:now},
                        success: function (data) {
                            if(data.code==1){
                                localStorage.userName=$this.param.userName;
                                $this.go('../account/login.html');

                            }
                        }
                    }
                )
            })
        }, 
        getAuth: function(){
            var $this=this;
            if($this.param.userName){
                $this.showPwd=true;
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

        }
    },
    ready:function(){
        this.init=true;
        this.$refs.loading.show=false;
    },
    created: function(){
    }
})