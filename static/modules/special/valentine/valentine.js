var Vue = require('vue/vue'),
    common = require('vue/vue-common'),
    appTools = require('app/app'),
    audio = document.getElementById('myAudio'),
    cellCount = document.querySelectorAll('.page').length,
    fullPage = new FullPage({
        id : 'pageContain',
        slideTime : 800,
        continuous : false,
        effect : {
            transform : {
                translate : 'Y',
                scale : [1, 1],
                rotate : [0, 0]
            },
            opacity : [0, 1]
        },
        mode : 'wheel,touch',
        easing : 'ease',
        start : 0,
        onSwipeStart : function(index, thisPage) {

        },
        beforeChange : function(index, thisPage) {
            //console.log(index);
            // if(index == 1){
            //     mui.toast('请先选择酒店哦');
            //     return "stop";
            // }
        },
        callback : function(index, thisPage) {

        }
    })

var strStoreDate = window.localStorage? localStorage.getItem("uuid"): Cookie.read("uuid");
console.log(strStoreDate);
generateUUID();
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    console.log(uuid);
    /*if (window.localStorage) {
        localStorage.setItem("uuid", uuid);
    } else {
        Cookie.write("uuid", uuid);
    }*/
    return uuid;
}

document.addEventListener( "plusready", onPlusReady, false );
// 扩展API加载完毕，现在可以正常调用扩展API
function onPlusReady() {
    plus.io.requestFileSystem( plus.io.PRIVATE_WWW, function( fs ) {
        // 可通过fs进行文件操作
        console.log( "File system name: " + fs.name );
        // 通过fs.root获取DirectoryEntry对象进行操作
        fs.root.getFile('a.txt',{create:true}, function(fileEntry){
            fileEntry.file( function(file){
                var fileWriter = new plus.io.FileWriter();
                console.log("getFile:" + JSON.stringify(file));
                fileWriter.seek( file.length );
                fileWriter.write( "New data!" );
            } );
        });

    }, function ( e ) {
        console.log( "Request file system failed: " + e.message );
    });
}

var vm = new Vue({
    mixins: [common],
    el: "html",
    data: {
        isActive: true,
        showLoad: false,
        showPage: true,
        //showDown: true,
        productSta: false,
        productHid: false,
        tableSta: false,
        tableHid: false,
        nameInfo:null,
        numInfo:null,
        nameValid: false,
        numValid: false,
        audioSrc: null
    },
    watch: {

    },
    methods: {
        setAudio: function (e) {
            var $this = this;
            if($this.isActive){
                $this.isActive = false;
                audio.pause();
            }else{
                $this.isActive = true;
                audio.play();
            }
        },
        scrollPage: function () {
            return false;
        },
        chooseBar: function (e) {
            var index = e.target.getAttribute("value");
            fullPage.next();
            switch(index){
                case "1":
                    fullPage.next();
                    break;
                case "2": fullPage.next(); break;
                case "3": fullPage.next(); break;
                case "4": fullPage.next(); break;
                default: fullPage.next(); break;
            }
            console.log(fullPage.next())
        },
        submitInfo: function () {
            var $this = this;
            $this.tableSta = true;
            $this.tableHid = false;
        },
        barInfo: function () {
            var $this = this;
            $this.productSta = true;
            $this.productHid = false;
        },
        closeDlg: function () {
            var $this = this;
            $this.productSta = false;
            $this.productHid = true;
            $this.tableSta = false;
            $this.tableHid = true;
            setTimeout(function () {
                $this.tableHid = false;
            }, 500);
            setTimeout(function () {
                $this.productHid = false;
            }, 500);
            document.getElementsByName("userName")[0].value = "";
            document.getElementsByName("userNum")[0].value = "";
            $this.nameValid = false;
            $this.numValid = false;
        },
        submitForm: function () {
            var $this = this,
                userName = document.getElementsByName("userName")[0].value,
                userNum = document.getElementsByName("userNum")[0].value,
                flag = true,
                sta = true;
            if(userName == "" || userName == null){
                $this.nameValid = true;
                $this.nameInfo = "用户名不能为空";
                flag = false;
            }else if(userName.length > 10){
                $this.nameValid = true;
                $this.nameInfo = "用户名不能超过10个字符";
                flag = false;
            }else{
                $this.nameValid = false;
                $this.nameInfo = null;
                flag = true;
            }
            if(userNum == "" || userNum == null){
                $this.numValid = true;
                $this.numInfo = "手机号不能为空";
                sta = false;
            }else if(userNum.length > 11 || !/^(1)([0-9]{10})?$/.test(userNum)){
                $this.numValid = true;
                $this.numInfo = "请填写正确的手机号";
                sta = false;
            }else{
                $this.numValid = false;
                $this.numInfo = null;
                sta = true;
            }
            if(flag && sta){
                $this.popup({content: "您成功报名了本次活动", type: 'alert'});
                /*$this.httpAjax({
                    url: '/h5/valentine/saveUserInfo',
                    param: {"userName": userName, "userNum": userNum},
                    success: function (data) {
                        if (data.code == 1) {
                            $this.popup({content: data.msg});
                        } else {
                            $this.popup({content: data.msg});
                        }
                    }
                })*/
            }else{
                $this.popup({content: "报名失败，请重新报名吧", type: 'alert'});
                return false;
            }
        }
    },
    ready: function () {
        var $this = this,
            audiourl = 'http://secure.cn.memebox.com/media/2017/sxg.mp3';
        $this.audioSrc = audiourl;
        wx.ready(function () {
            if(audio){
                audio.src=audiourl;
                audio.play();
            }
        })
    },
    created: function () {
        var $this = this,
            loadTime = null,
            loadNum = 0;
        clearTimeout(loadTime);
        loadTime = setInterval(function() {
            if (loadNum != 100) {
                loadNum += 4;
                document.getElementsByClassName("loading-num")[0].innerHTML = loadNum+"%";
            }
            if(loadNum >= 100){
                $this.showLoad = true;
                $this.showPage = false;
                //$this.showDown = false;
                return false;
            }
        }, 50);

    }
});