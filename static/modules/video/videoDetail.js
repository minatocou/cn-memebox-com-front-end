/**
 * Created by carina on 17/4/12.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: '视频详情',
        init: false,
        detailData: {},
        videoId:'',
        isShowPreview:true,
        isShowControlBar:false,
        isPlay:false,
        timer:null,
        videoCurrentTime:"00:00",
        videoTotalTime:"00:00",
        playProgress:"0%",
        bufferProgress:"0%",
        videoHeight:'0',
        cartNumber: '',                 //购物车数量
    },
    methods: {
        initCart: function (showLoading) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/newcart/count',
                showLoading: showLoading,
                success: function (data) {
                    $this.cartNumber = data['data']['totalQty'];
                }
            });
        },
        getDetail: function () {
            var $this = this;

            //__inline('_detailData.js');

            $this.httpAjax({
                url: '/h5/video/detail?videoId=' + $this.videoId,
                complete: function (data) {
                    if (data.code == 1) {

                        $this.detailData = data.data;
                        $this.isShowPreview = true;

                        $this.initCart(true);

                        var showTimer = setTimeout(function () {
                            $this.init = true;
                            $this.$refs.loading.show = false;
                            showTimer = null;
                            var timerHeight = setTimeout(function(){
                                $this.videoHeight = parseInt(document.getElementById('videoBox').offsetWidth*0.56)+'px';
                                timerHeight = null;
                            },200);

                        }, 300);
                    } else {
                        $this.popup({
                            type: 'confirm',
                            title: '',
                            content: '视频已失效',
                            btn: ['知道啦'],
                        });
                    }
                },
                alert:function(){

                }
            });

        },
        initBuffer:function(){
            var $this = this;
            var myVideo = document.getElementById('myVideo');

            setTimeout(function(){
                $this.bufferProgress = parseInt(myVideo.buffered.end(0))/parseInt(myVideo.duration)*100+'%';
            },500);

        },
        dragProBarStart:function(event){
            var $this = this;
            $this.isShowControlBar = true;
            $this.timer = null;
        },
        dragProBar:function(event){
            var $this = this;

            var myVideo = document.getElementById('myVideo');

            var pb = document.getElementById('proBar');

            var pro = document.getElementById('progress');

            var playPro = parseInt( ((event.touches[0].clientX - pro.offsetLeft - pb.offsetLeft)/pb.offsetWidth) *100 );
            if(playPro>100){
                $this.playProgress='100%';
            }else{
                $this.playProgress = playPro + '%';
            }

            $this.videoCurrentTime = ( parseInt(myVideo.currentTime/60)<10 ? '0'+parseInt(myVideo.currentTime/60) : parseInt(myVideo.currentTime/60) ) +
                                        ":" +
                                     ( parseInt(myVideo.currentTime%60)<10 ? '0'+parseInt(myVideo.currentTime%60) : parseInt(myVideo.currentTime%60) );

            $this.isShowControlBar = true;

            var currentTime = parseInt( ((event.touches[0].clientX - pro.offsetLeft - pb.offsetLeft)/pb.offsetWidth) * myVideo.duration );
            if(currentTime){
                myVideo.currentTime = currentTime;
            }
        },
        dragProBarEnd:function(event){
            var $this = this;
            $this.updateProgress();
        },
        endPlay:function(){
            var $this = this;
            $this.videoPause();
        },
        showVideo:function(){
            var $this = this;
            $this.isShowPreview = false;
            $this.videoPlay();
        },
        changeControlBar:function(){
            var $this = this;
            $this.isShowControlBar = !($this.isShowControlBar);
        },
        changeVideo:function(){
            var $this = this;
            var myVideo = document.getElementById('myVideo');
            if(myVideo.paused){
                $this.videoPlay();
            }else{
                $this.videoPause();
            }
        },
        videoPlay:function(){
            var $this = this;
            var myVideo = document.getElementById('myVideo');
            myVideo.play();
            $this.isPlay = true;

            $this.isShowControlBar = true;
            $this.hideControlBar();

            $this.updateProgress();
        },
        videoPause:function(){
            var $this = this;
            var myVideo = document.getElementById('myVideo');
            myVideo.pause();
            $this.isPlay = false;

            $this.isShowControlBar = true;
            $this.hideControlBar();

            $this.timer = null;
        },
        hideControlBar:function(){
            var $this = this;
            if($this.isShowControlBar){
                var controllerTimer = setTimeout(function(){
                    $this.isShowControlBar = false;
                    controllerTimer = null;
                },3000);
            }
        },
        updateProgress:function(){
            var $this = this;
            var myVideo = document.getElementById('myVideo');
            $this.timer = setInterval(function(){
    
                $this.playProgress = parseInt(myVideo.currentTime)/parseInt(myVideo.duration)*100+'%';

                $this.videoTotalTime = ( parseInt(myVideo.duration/60)<10 ? '0'+parseInt(myVideo.duration/60) : parseInt(myVideo.duration/60) ) +
                                        ":" +
                                       ( parseInt(myVideo.duration%60)<10 ? '0'+parseInt(myVideo.duration%60) : parseInt(myVideo.duration%60) );

                $this.videoCurrentTime = ( parseInt(myVideo.currentTime/60)<10 ? '0'+parseInt(myVideo.currentTime/60) : parseInt(myVideo.currentTime/60) ) +
                                          ":" +
                                         ( parseInt(myVideo.currentTime%60)<10 ? '0'+parseInt(myVideo.currentTime%60) : parseInt(myVideo.currentTime%60) );
            },1000);
        },

    },
    ready: function () {
        var $this = this;
        mui.init();
        $this.getDetail();
        document.getElementById('myVideo').pause();
        window.onblur = function(){
            if($this.isPlay){
                $this.videoPause();
            }
        }
    },
    created: function () {
        var $this = this;
        $this.videoId = $this.getSearch('videoId');
    },
    watch: {}

});