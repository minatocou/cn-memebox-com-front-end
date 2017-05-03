/**
 * Created by Jesse on 16/5/12.
 */
var Vue = require('vue/vue');
var validate = require('vue/vue-validate');
var common = require('vue/vue-common');
var appTools = require('app/app');

vue = new Vue({
    mixins: [common, appTools,validate],
    el: 'html',
    data: {
        title: '女神节',
        cd: null,
        nowLv:0,
        nowImg:null,
        mistake:[],
        countLv: 32,
        view:{
            INDEX:'index',
            MAIN:'main',
            END:'end',
            SHARE:'share',
        },
        showView:'',
        mainInit: false,
        indexInit: true,
        endInit: false,
        shareInit:false,
        col: 2,
        checkIndex:null,
        shareLv:null,
        shareAvatar:null,
        avatar:null,
        countdown:null,
        commonShare:true,
        mask: false,
        isLogin:false,
        text:[
            {s:0,me:'白天不懂夜的黑，直男这锅你背不背',ta:'我怀疑ta可能是位有少女心的汉子吧'},
            {s:10,me:'天若有情天亦老，有点粗糙你晓不晓',ta:'很少见这么不挑剔的女神'},
            {s:20,me:'你的表现很突出，让彩妆达人都相形见绌',ta:'高分女神秒杀彩妆达人'},
            {s:28,me:'真女神，请留步，美妆博主都得给你让让路',ta:'我想她一定是真女神无疑了'},
            {s:33,me:'你就是真女神！',ta:'她就是真女神！'},
        ],
        imgMap:{
            0:{id:'23634',name:'PONY樱花浪漫口红',desc:'新鲜花瓣一样鲜明丰富的色感以及轻盈服帖的使用感'},
            1:{id:'23635',name:'轻奢保湿口红',desc:'像丝绸一样柔软丝滑的唇色'},
            2:{id:'21351',name:'纯真染色唇彩',desc:'不仅保湿滋润颜色丰富，还防水长效持久不易掉色'},
            3:{id:'23645',name:'轻奢丝绒口红',desc:'远离一般哑光唇膏的干涩质感，展现丝绒般的清爽舒适'},
            4:{id:'23648',name:'水凝唇釉',desc:'用水分紧紧包裹唇瓣，抚平唇部角质，多种颜色选择'},
            5:{id:'16300',name:'我爱蜡笔唇膏',desc:'像啫喱般的柔润顺滑，让肌肤看起来更白皙的色系'},
            6:{id:'23632',name:'我爱魔法棒',desc:'轻轻一抹均匀涂开打造完美小V脸妆容'},
            7:{id:'21460',name:'我爱柔蜜甜心气垫唇釉',desc:'糖果般的柔蜜鲜唇，持久不脱色，水润好涂抹'},
        },
    },
    methods: {
        userInfoCall: function (data) {
            if (data && data.data && data.data.token) {
                this.errorMsg = data.data.token;
                localStorage.mmToken = data.data.token;
                this.isLogin=true;
                this.initPage();
            } else {
                try {
                    this.errorMsg = JSON.stringify(data);
                } catch (e) {
                    alert(e);
                }
                this.initPage();
            }
        },

        initPage: function () {
            var $this=this;
            var param={};
            $this.openId && (param.openId=$this.openId)
            $this.httpAjax({
                url: '/h5/activityview/girlsday',
                param: param,
                showLoading: true,
                success: function (data) {
                    $this.avatar=data.data.avatar;
                }
            })
            if($this.shareLv){

                $this.shareLv=parseInt($this.dbase64($this.shareLv),36);
                if($this.shareLv>0){
                    $this.showView=$this.view.SHARE;
                }else{
                    $this.showView=$this.view.INDEX;
                }
            }else{
                $this.showView=$this.view.INDEX;
            }
        },
        initMain: function () {
            var $this = this;
            $this.cd=45;
            $this.mistake=[];
            $this.nowLv=0;
            if(localStorage.mmToken){
                $this.cd=60;
            }
            // if($this.getSearch('debug')){
            //     $this.cd=$this.getSearch('debug');
            // }
            // if($this.getSearch('lv')){
            //     $this.nowLv=parseInt($this.getSearch('lv'));
            // }
            $this._initLv($this.nowLv);
            clearInterval($this.countdown);
            $this.showView=$this.view.MAIN;
            $this.setShare();
        },
        linkStart: function () {
            var $this = this;
            $this.initMain();
        },
        getLvText: function (lv) {
            var $this = this;
            var cc=null;
            lv=lv || $this.nowLv;
            for(var i=0;i<$this.text.length;i++){
                if(lv>=$this.text[i].s && $this.text[i+1] && lv<$this.text[i+1].s){
                    cc= $this.text[i];
                    break;
                }else if(lv>=$this.text[i].s && !$this.text[i+1]){
                    cc= $this.text[i];
                    break;
                }
            }
            return cc;
        },

        toProduct: function (id) {
            var $this = this;
            if($this.isApp()){
                $this.app_product({productId:id})
            }else{
                _maq.push(["_trackEvent" , "goddess_product" , {token:localStorage.mmToken,pid:id}]);
                location.href='/m/productDetails/productDetails.html?p='+id;
            }
        },
        _countdown: function(){
            var $this = this;
            $this.countdown = setInterval(function () {
                if ($this.cd > 0) {
                    $this.cd--;
                } else {
                    $this.showView='end';
                    $this.setShare();
                    clearInterval($this.countdown);
                }
            }, 1000);
        },
        checkTap: function (v) {
            var $this = this;
            if($this.nowLv==0 && v.n===1){
                document.ontouchmove = function(event){
                    event.preventDefault();
                }
                $this._countdown();
            }
            if(v.n===1){
                if($this.nowLv==$this.countLv){
                    $this.nowLv=($this.nowLv+1);
                    $this.showView='end';
                    $this.setShare();
                    clearInterval($this.countdown);
                }else{
                    // $this.cd+=10;
                    $this._initLv(++$this.nowLv);
                    $this.setShare();
                }

            }
        },
        _initLv: function (lv) {
            var $this = this;
            $this.col=lv+1>=5? 6: lv+2;
            $this.mistake=[];
            $this.checkIndex=$this._random($this.col*$this.col);
            for(var i=0;i<$this.col*$this.col;i++){
                if($this.checkIndex==i){
                    $this.mistake.push({n:1})
                }else{
                    $this.mistake.push({n:($this.countLv+11-lv)/10});
                }
            }
            $this.nowImg=$this._random(8)
        },
        _random: function (n) {
            return Math.floor(Math.random()*n);
        },
        getShareData: function () {
            var $this = this;
            var title='分是女生还是女神就在此一搏了！！';
            if($this.nowLv>0){
                title='经权威机构检测，我的女神值高达'+$this.nowLv*$this.nowLv+'！';
            }
            var url=[location.origin+location.pathname+'?l='+$this.base64($this.nowLv.toString(36))];
            if(localStorage.user){
                var user=JSON.parse(localStorage.user);
                url.push('&su='+user.userId)
            }
            if($this.avatar){
                url.push('&sa='+$this.base64($this.avatar));
            }
            $this.share={
                title: title,
                text: '快来看看你够女神嘛~',
                url: url.join(''),
                image: location.origin + '<<<uri:../../../img/favicon.png>>>'
            }
            return {
                title: title,
                text: '快来看看你够女神嘛~',
                url: url.join(''),
                image: location.origin + '<<<uri:../../../img/favicon.png>>>'
            };
        },
        setShare: function () {
            if(this.isApp()){
                this.app_setShare(this.getShareData());
            }else{
                this.set_share(this.getShareData());
            }

        },
        appShare: function () {
            var $this = this;
            if (this.isApp()) {
                this.app_share(this.getShareData());
            } else {
                $this.mask=true;
            }

        },
        toLogin: function () {
            var $this = this;
            var pathname = location.href;
            localStorage.ref = pathname;
            localStorage.removeItem('mmToken');
            if($this.isApp()){
                $this.app_login({source:10});
            }else{
                $this.h5_login(null,10);
            }
        },
    },
    ready: function () {
        var $this = this;
        $this.setShare();
        if(localStorage.mmToken){
            $this.isLogin=true;
        }
        this.$refs.loading.show = false;

    },
    created: function () {
        var $this = this;

        $this.shareLv=$this.getSearch('l');
        $this.shareAvatar=$this.getSearch('sa');
        if($this.shareAvatar){
            $this.shareAvatar=$this.dbase64($this.shareAvatar);
        }
        if ($this.isApp()) {
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
            setTimeout(function () {
                if (!localStorage.mmToken) {
                    $this.initPage();
                }
            }, 500);
        }else if($this.isWeixin()){
            $this.getOpenId();
            $this.initPage();
        } else {
            $this.initPage();
        }

    },
});
