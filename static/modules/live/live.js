/**
 * Created by yate on 2017/4/13.
 */
var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var videojs = require("./video");
var RongIMLib = require("./rongyun/RongIMLib-2.2.5");
var Long = require('./rongyun/Long');
var ByteBuffer = require('./rongyun/ByteBuffer');
var protobuf = require('./rongyun/protbuf');
var RongIMClient = RongIMLib.RongIMClient;

var player = videojs('player', function onPlayerReady() {
    videojs.log('Your player is ready!');

    // In this context, `this` is the player that was created by Video.js.
    this.play();
});

function getUserName(tel,obj) {
    tel && typeof Number(tel) === 'number' && (tel = tel.toString().replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"));
    tel && (obj.user = obj.user + '('+ tel +')');
}

var msgMap = {
    'MBox:TotalInoutMsg': function (content) {
        var map = {0: '加入了房间',1: '退出了房间'};
        ((content.userNames && content.userNames.length > 1) || (content.userIds && content.userIds.length > 1)) ? (map[content.type] = '等一群蜜米们' + map[content.type]):'';
        var obj = {
            msg: map[content.type],
            user: content.name?content.name:content.userNames?content.userNames[0]:content.userIds[0]
        };
        // getUserName(content.extra,obj);
        //console.log(obj);
    },
    'MBox:SyncChatRoomInfo': function (content) {
        $.each(content,function (key,value) {
            $('[data-bind="'+ key +'"]').text(value);
        });
    }
};

vue = new Vue({
    mixins: [common, appTools],
    el: 'html',
    data: {
        title: '美美箱直播',
        init: false,
        liveData: {},
        chatToken: "",
        appUrl: '',
        liveRoomId: '',
        chatRoomId: "",
        bottomFix: true,
        contentData: []
    },
    computed: {
        anchorName: function () {
            if(this.liveData.anchorName){
                return this.liveData.anchorName;
            }else{
                return "****";
            }
        },
        livePeople: function () {
            if(this.liveData.livePeopleNumber){
                /*if(parseInt(this.liveData.livePeopleNumber) > 9999){
                    return "9999+";
                }*/
                return this.liveData.livePeopleNumber;
            }else{
                return 0;
            }
        },
        liveLikeCount: function () {
            if(this.liveData.liveLikeCount){
                /*if(parseInt(this.liveData.liveLikeCount) > 9999){
                    return "9999+";
                }*/
                return this.liveData.liveLikeCount;
            }else{
                return 0;
            }
        },
        /*showBtn: function () {
            if(appVer.isIos()){
                return true;
            }else{
                return false;
            }
        }*/
    },
    methods: {
        getLiveInfo: function () {
            var $this = this;
            //获取直播间信息
            $this.httpAjax({
                url: '/h5/live/roomInfo',
                param: {
                    liveRoomId: $this.liveRoomId
                },
                success: function (data) {
                    $this.liveData = {};
                    if(data.code == 1){
                        var status;
                        $this.liveData = data.data.liveInfo;
                        $this.chatRoomId = data.data.liveInfo.chatRoomId;
                        status = $this.liveData.liveStatus;
                        if (status == 1) {
                            $this.popup({type: "alert", content: "直播未开始"});
                            return '直播未开始';
                        } else if (status == 2) {
                            $this.initChatRoom();
                            return '直播中';
                        } else if (status == 4 || status == 8) {
                            $this.popup({type: "alert", content: "直播已结束"});
                            return '直播已结束';
                        }

                    }
                },
                error: function (err) {
                    console.error(err);
                }
            });
            $this.init = true;
        },
        initChatRoom: function () {
            var $this = this;
            // 设置连接监听状态 （ status 标识当前连接状态 ）
            // 连接状态监听器
            RongIMClient.setConnectionStatusListener({
                onChanged: function (status) {
                    switch (status) {
                        case RongIMLib.ConnectionStatus.CONNECTED:
                            var obj = {
                                msg: "欢迎来到美美直播间，跟主播学扮美秘籍。美美箱提倡健康的直播环境，对直播内容24小时巡查，禁止宣传违法、违规、低俗等不良信息",
                                user: "系统消息:"
                            };
                            $this.contentData.push(obj);
                            console.log('链接成功');
                            break;
                        case RongIMLib.ConnectionStatus.CONNECTING:
                            console.log('正在链接');
                            break;
                        case RongIMLib.ConnectionStatus.DISCONNECTED:
                            console.log('断开连接');
                            break;
                        case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                            console.log('其他设备登录');
                            break;
                        case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
                            console.log('域名不正确');
                            break;
                        case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                            console.log('网络不可用');
                            break;
                    }
                }});
            // 消息监听器
            RongIMClient.setOnReceiveMessageListener({
                // 接收到的消息
                onReceived: function (message) {
                    // 判断消息类型
                    switch(message.messageType){
                        case RongIMClient.MessageType.TextMessage:
                            // message.content.content => 消息内容
                            var obj = {
                                msg: message.content.content.replace(//g,'\\表情'),
                                user: message.content.user && (message.content.user.name || message.content.user.id) || '游客',
                                admin: message.content.user && message.content.user.id && message.content.user.id === $('.live-room-name').text().trim() + '_admin'
                            };
                            //getUserName(message.content.extra,obj);
                            $this.contentData.push(obj);
                            break;
                        case RongIMClient.MessageType.UnknownMessage:
                            if('MBox:SyncChatRoomInfo' != message.objectName ){
                                var msgContent = message.content.message.content;
                                var map = {0: '加入了房间',1: '退出了房间'};
                                if(message.objectName == "MBox:LiveRoomCloseStatus"){
                                    if(msgContent.type == 1 || msgContent.type == 2 || msgContent.type == 4){
                                        $this.popup({type: "alert", content: "直播已结束"});
                                        return false;
                                    }
                                    if(msgContent.type == 8){
                                        $this.popup({type: "alert", content: "直播出错了"});
                                        return false;
                                    }
                                }
                                if(message.objectName == "MBox:InOutChatRoomMsg" && msgContent.name != "游客"){
                                    var obj = {
                                        msg: map[msgContent.type],
                                        user: msgContent.name ? msgContent.name:null,
                                    };
                                    $this.contentData.push(obj);
                                }
                            }
                            break;
                        default:
                        // do something...
                    }
                }
            });
            var chatRoomId = $this.chatRoomId; // 聊天室 Id。
            $this.httpAjax({
                url: '/h5/live/getChatToken',
                goLogin: false,
                success: function (data) {
                    if(!data.code==1){
                        alert(data.msg);
                    }else{
                        // 连接融云服务器。
                        $this.chatToken = data.data.chatToken;
                        if($this.chatToken){
                            RongIMClient.connect(data.data.chatToken, {
                                onSuccess: function(userId) {
                                    console.log("Login successfully." + userId);

                                    var recentCount = 50;// 拉取最近聊天最多 50 条。
                                    RongIMClient.getInstance().joinChatRoom(chatRoomId, recentCount, {
                                        onSuccess: function() {
                                            // 加入聊天室成功。
                                            console.log("加入聊天室成功")
                                        },
                                        onError: function(error) {
                                            // 加入聊天室失败
                                            console.log("加入聊天室失败")
                                        }
                                    });

                                    //获取信息
                                    var chatCount = 10; // 获取聊天室人数 （范围 0-20 ）
                                    var order = RongIMLib.GetChatRoomType.REVERSE;// 排序方式。
                                    RongIMClient.getInstance().getChatRoomInfo(chatRoomId, chatCount, order, {
                                        onSuccess: function(chatRoom) {
                                            // chatRoom => 聊天室信息。
                                            // chatRoom.userInfos => 返回聊天室成员。
                                            // chatRoom.userTotalNums => 当前聊天室总人数。

                                            console.log(JSON.stringify(chatRoom));
                                            console.log(chatRoom.userInfos);
                                            console.log(chatRoom.userTotalNums);
                                        },
                                        onError: function(error) {
                                            // 获取聊天室信息失败。
                                        }
                                    });
                                },
                                onTokenIncorrect: function() {
                                    console.log('token无效');
                                },
                                onError:function(errorCode){
                                    var info = '';
                                    switch (errorCode) {
                                        case RongIMLib.ErrorCode.TIMEOUT:
                                            info = '超时';
                                            break;
                                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                            info = '未知错误';
                                            break;
                                        case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
                                            info = '不可接受的协议版本';
                                            break;
                                        case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                                            info = 'appkey不正确';
                                            break;
                                        case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                                            info = '服务器不可用';
                                            break;
                                    }
                                    console.log(errorCode);
                                }
                            });
                        }
                    }
                }
            });
        },
        clickPlay: function () {
            var videoSta= document.querySelector('video').paused;
            if(videoSta){
                document.querySelector('video').play();
                document.querySelector(".liveRoom-play-btn").style.display="none";
            }else{
                document.querySelector('video').pause();
                document.querySelector(".liveRoom-play-btn").style.display="block";
            }
        },
        /*clickPlayBtn: function () {
            var $this = this;
            //var theVideo = document.querySelector('video');
            player.on('ended', function() {
                $this.popup({type: "alert", content: "直播已结束"});
                return false;
            });
            player.on('error', function() {
                $this.popup({type: "alert", content: "直播视频出错了"});
                return false;
            });
            document.querySelector('video').play();
            //player.play();
            document.querySelector(".liveRoom-play-btn").style.display="none";
        },*/
        gotoAppPage: function () {
            var $this = this;
            var obj = {
                roomId: $this.liveRoomId
            };
            window.appsdk.global.toAppLive(obj);
            setTimeout(function () {
                location.href = '/m/app/'
            }, 2000);
        },
        getUrl: function () {
            var obj = {
                roomId: this.roomId
            };
            var param={
                domain:'live',
                action:'to_live',
                data:obj
            };
            if (appVer.isIos() && appVer.isWeixin()) {
                this.appUrl = window.appsdk.global.toAppLive(obj);
            } else {
                this.appUrl = "javascript:void(0)";
            }
        }
    },
    ready: function () {
        var $this = this;
        mui.init();
        player.on('ended', function() {
            $this.popup({type: "alert", content: "直播已结束"});
            return false;
        });
        player.on('error', function() {
            $this.popup({type: "alert", content: "直播视频出错了"});
            return false;
        });
    },
    created: function () {
        var $this = this;
        // 初始化
        var appKey = "25wehl3u2q21w";
        RongIMClient.init(appKey);
        $this.liveRoomId = $this.getSearch('roomId') ? $this.getSearch('roomId'):null;
        $this.getLiveInfo();
        $this.getUrl();
    }
});
