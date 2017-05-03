/**
 * Created by Jesse on 16/8/9.  会员等级
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTool = require('app/app');
vue = new Vue({
    mixins: [common, appTool],
    el: 'html',
    data: {
        init: '',
        vipData: {},
        vipDetails: {},
        showMask: false,
        moreLevel: {
            next: [],
            now: [],
            has: []
        }
    },
    methods: {
        mask: function () {
            var $this = this;
            $this.showMask = !$this.showMask;
        },
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
            }
            if(!localStorage.mmToken){
                this.app_login();
            }else{
                this.come();
            }
        },
        time: function (num) {
            if (num == 2 || num == 3) {
                return '一个季度内';
            } else if (num == 4 || num == 5) {
                return '一年内';
            } else {
                return '两年内';
            }
        },
        come: function () {
            var $this = this;
            var app = $this.isApp();
            $this.httpAjax({
                url: '/h5/newaccount/gradeIndex',
                goLogin:false,
                showLoading:app,
                success: function (data) {
                    $this.vipData = data.data;
                    $this.vipDetails = $this.vipData.details[8 - $this.vipData.currentGradeId];
                    $this.vipData.currentGradeId--;
                    $this.vipData.vipImg = '/images/app/my/include/vip' + $this.vipData.currentGradeId.toString() + '.png';
                    $this.vipData.vImg = '/images/app/my/include/v' + $this.vipData.currentGradeId.toString() + '.png';
                    $this.vipDetails.fromDate = $this.vipDetails.fromDate.replace('-', '.');
                    $this.vipDetails.toDate = $this.vipDetails.toDate.replace('-', '.');
                    $this.moreLevel.now.push($this.vipDetails);
                    if ($this.vipData.currentGradeId != 7) {
                        if($this.vipData.nextGradeId!=''){
                            $this.moreLevel.next.push($this.vipData.details[8 - $this.vipData.nextGradeId]);
                        }else{
                            $this.moreLevel.next.push($this.vipData.details[6 - $this.vipData.currentGradeId]);
                        }
                    } else {
                        delete $this.moreLevel.next;
                    }
                    for (var i = 0; i < $this.vipData.currentGradeId; i++) {
                        $this.moreLevel.has.unshift($this.vipData.details[7 - i]);
                    }
                    $this.moreLevel.has.length == 0 && delete $this.moreLevel.has;
                    $this.init = true;
                }
            });
        }
    },
    ready: function () {
         this.$refs.loading.show = false;
    },
    created: function () {
        var $this = this;
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        } else {
            $this.come();
        }
    }
});