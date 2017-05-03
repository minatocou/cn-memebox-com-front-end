/**
 * Created by Jesse on 16/5/15.
 */

var Vue = require('vue/vue');
Vue.use(require('vue/vue-validator'));
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        title: '支付成功!',
        init: false,
        grouponId:null,
        lackNum:null,
        path:location.origin,
        reCount: 0
    },
    methods: {
        getStatus: function () {
            var $this = this;
            var orderId = $this.getSearch('orderId');
            $this.httpAjax({
                url:'/h5/grouponcheckout/status',
                showLoading:true,
                param:{orderId:orderId},
                success:function (data) {
                    $this.init = true;

                    if(data.code==1 && data.data.groupon_id){
                        $this.grouponId=data.data.groupon_id;
                        if($this.grouponId){
                            try {
                                localStorage.groupPhone=data.data.phone;
                                localStorage.grouponId=$this.grouponId;
                            }catch (e){
                                console.log(e);
                            }
                            $this.$refs.loading.show = false;
                            location.href=$this.path+'/m/special/group/details.html?grouponId='+$this.grouponId;
                            // $this.httpAjax({
                            //     url:'/h5/groupon/detail',
                            //     param:{grouponId:$this.grouponId},
                            //     success:function (data) {
                            //         $this.lackNum=data.data.lackNum;
                            //
                            //     }
                            // });
                        }
                    }else if($this.reCount<=100){
                        setTimeout(function () {
                            $this.getStatus();
                            $this.reCount++;
                        },100);
                    }else if($this.reCount>100){
                        $this.$refs.loading.show = false;
                    }

                }
            });
        }
    },
    ready: function () {
        this.$refs.loading.show = true
    },
    created: function () {
        this.getStatus();
    }
});
