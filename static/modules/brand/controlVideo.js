(function(window, document){
    //获取要操作的元素
    var video = document.getElementById("video");
    var videoControls = document.getElementById("videoControls");
    var videoContainer = document.getElementById("videoContainer");
    var controls = document.getElementById("video_controls");
    var playBtn = document.getElementById("playBtn");
    var fullScreenBtn = document.getElementById("fullScreenBtn");
    var progressWrap = document.getElementById("progressWrap");
    var playProgress = document.getElementById("playProgress");
    var fullScreenFlag = false;
    var progressFlag;


    var videoPlayer = {
        init: function(){
            var that = this;
            video.removeAttribute("controls");
            bindEvent(video, "loadeddata", videoPlayer.initControls);
            videoPlayer.operateControls();
        },
        initControls: function(){
            videoPlayer.showHideControls();
        },
        showHideControls: function(){
            bindEvent(video, "mouseover", showControls);
            bindEvent(videoControls, "mouseover", showControls);
            bindEvent(video, "mouseout", hideControls);
            bindEvent(videoControls, "mouseout", hideControls);
        },
        operateControls: function(){
            //bindEvent(playBtn, "click", play);
            bindEvent(video, "click", play);

            //bindEvent(fullScreenBtn, "click", fullScreen);
            bindEvent(progressWrap, "mousedown", videoSeek);
        }
    }

    videoPlayer.init();

    function bindEvent(ele, eventName, func){
        if(window.addEventListener){
            ele.addEventListener(eventName, func);
        }
        else{
            ele.attachEvent('on' + eventName, func);
        }
    }

    function showControls(){
        videoControls.style.opacity = 1;
    }

    function hideControls(){
        videoControls.style.opacity = 1;
    }

    function play(){
        if ( video.paused || video.ended ){
            if ( video.ended ){
                video.currentTime = 0;
            }
            video.play();
            //playBtn.innerHTML = "暂停";
            progressFlag = setInterval(getProgress, 60);
        }
        else{
            video.pause();
            //playBtn.innerHTML = "播放";
            clearInterval(progressFlag);
        }
    }

    function fullScreen(){
        if(fullScreenFlag){
            videoContainer.webkitCancelFullScreen();
        }
        else{
            videoContainer.webkitRequestFullscreen();
        }
    }

    function getProgress(){
        var percent = video.currentTime / video.duration;
        playProgress.style.width = percent * (progressWrap.offsetWidth) - 2 + "px";
        //showProgress.innerHTML = (percent * 100).toFixed(1) + "%";
    }

    function videoSeek(e){
        if(video.paused || video.ended){
            play();
            enhanceVideoSeek(e);
        }
        else{
            enhanceVideoSeek(e);
        }

    }
    function enhanceVideoSeek(e){
        clearInterval(progressFlag);
        var length = e.pageX - progressWrap.offsetLeft;
        var percent = length / progressWrap.offsetWidth;
        playProgress.style.width = percent * (progressWrap.offsetWidth) - 2 + "px";
        video.currentTime = percent * video.duration;
        progressFlag = setInterval(getProgress, 60);
    }

}(this, document))