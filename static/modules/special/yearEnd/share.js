/**
 * Created by leo.wang on 2017/1/14
 */
var wxShareBackdrop = require('./wxShareBackdrop');
module.exports = {
 	mixins: [wxShareBackdrop],
 	methods: {
 		getShareData: function () {
 		    return {
 		        title:'他们说长得美的人对社会有功，非要给我一些奖励',
 		        text:'[MEMEBOX]年终美妆修行大回顾，送你巨额奖学金，祝美丽的你来年更加光彩照人',
 		        url:location.origin + location.pathname + '?inviteUid=' + localStorage.customerId + '#6',
 		        image:location.origin+'/images/app/special/yearEnd/include/memebox.png'
 		    }
 		},
 		goShareFunc: function () {
 			var $this = this;
 			document.querySelector('#year-audio').pause();
 		    if($this.isApp()){
 		        $this.app_share($this.getShareData());
 		        var currentTime = new Date();
 		        var showTime = '';
 		        var timer = setInterval(function () {
 		        	showTime = new Date();
 		        	if(showTime - currentTime > 8000){
 		        		clearInterval(timer);
 		        		if($this.shareBtnIndex !== 2) {
 		        			$this.appShareCall({code:1});
 		        		}
 		        	}
 		        },1000);
 		    } else if($this.isWeixin()) {
 		        $this.wxShare();
 		    } else {
 		    	mui.alert('请稍等...');
 		        window.appsdk.global.toAppH5View(location.href,'蜜米期末成绩单',location.origin+'/images/app/special/yearEnd/include/memebox.png');
 		        setTimeout(function () {
	 		        $this.getAppUrl();
	 		        $this.appShareCall({code:1});
 		        },8000);
 		    }
 		},
 		appShareCall: function (data) {
 			var $this = this;
 			if(data.code == 1){
	 			$this.shareBtnIndex = 2;
	 			$this.cellActiveIndex = 7;
	 			location.replace('#'+ $this.cellActiveIndex);
 			}
 		},
 		setShareFunc: function () {
 			var $this = this;
		    $this.set_share($this.getShareData());
 			$this.app_setShare($this.getShareData());
 		}
 	}
 };