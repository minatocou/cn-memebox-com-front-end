/**
 * Created by leo.wang on 2017/1/14
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');

var share = require('./share');

var cellCount = document.querySelectorAll('.page-cell').length;
var audio = document.querySelector('#year-audio');
var dayStart = '2017/1/16';
var dayEnd = '2017/1/22';
var dayLimit = dayStart + '-' + dayEnd;
var scoreList = {
	'A+' : '我校为拥有如你般优秀的学生<br />而骄傲！',
	'A' : '恭喜你已修够本期美丽学分，<br />可以安心回家过个好年啦～',
	'B' : '恭喜你已修够本期美丽学分，<br />可以安心回家过个好年啦～',
	'C' : '要相信，只要做足美丽功课，<br />人人都能完成成魔法般的蜕变，<br />继续努力吧！',
	'D' : '要相信，只要做足美丽功课，<br />人人都能完成成魔法般的蜕变，<br />继续努力吧！',
	'E' : '呃｀｀你｀｀<br />居然连一件美丽法器都没有纳入？！<br />美丽这件事可是一份耕耘一份收获的<br />不能懈怠啊，快去补修学分吧～！',
};

window.vue = new Vue({
 	mixins: [common, appTools, share],
 	el: 'html',
 	data: {
 		userData: {},
 		audioSrc: '',
 		levelMap: ['','新蜜米','铜牌蜜米','银牌蜜米','金牌蜜米','铂金蜜米','钻石蜜米','VIP蜜米','VVIP蜜米'],
 		classList: ['','vip-0','vip-1','vip-2','vip-3','vip-4','vip-5','vip-6','vip-7','vip-8'],
 		shareBtnClassList: {
 			1: 'button-1',
 			2: 'button-2',
 			3: 'button-3'
 		},
 		shareBtnIndex: 1,
 		couponBtnClassList: {
 			1: 'button-4',
 			2: 'button-5'
 		},
 		coupon: {
 			'A+' : [
 				{dayLimit: dayLimit,money: 20,res: '美美妆仓'},
 				{dayLimit: dayLimit,money: 30,res: '中国仓'},
 				{dayLimit: dayLimit,money: 50,res: '中国仓'},
 				{dayLimit: dayLimit,money: 100,res: '美美妆仓'}
 			],
 			'A' : [
 				{dayLimit: dayLimit,money: 20,res: '美美妆仓'},
 				{dayLimit: dayLimit,money: 30,res: '中国仓'},
 				{dayLimit: dayLimit,money: 100,res: '美美妆仓'}
 			],
 			'B' : [
 				{dayLimit: dayLimit,money: 20,res: '美美妆仓'},
 				{dayLimit: dayLimit,money: 30,res: '中国仓'},
 				{dayLimit: dayLimit,money: 50,res: '中国仓'}
 			],
 			'C' : [
 				{dayLimit: dayLimit,money: 20,res: '美美妆仓'},
 				{dayLimit: dayLimit,money: 30,res: '中国仓'}
 			],
 		},
 		getCouponBtnIndex: 1,
 		inviteUid: '',
 		cellActiveIndex: '',
 		hasloaded: false,
 		cellActiveList: [],
 		notAnimation: false,
 		//hasGetedCoupon: false,
 		specialEffects: false
 	},
 	computed: {
 		// cellActiveList: function () {
 		// 	var arr = [];
 		// 	arr.length = cellCount;
 		// 	(typeof this.cellActiveIndex === 'number') && (arr[this.cellActiveIndex] = true);
 		// 	return arr;
 		// },
 		tagShow: function () {
 			return (typeof this.cellActiveIndex === 'string') || (this.cellActiveIndex <=5);
 		}
 	},
 	methods: {
 		syncCss: function () {
 			this.$nextTick(function () {
	 			window.getComputedStyle(document.querySelector('.loading'), null).getPropertyValue("transform");
 			});
 		},
 		togglePageCell: function () {
 			var $this = this;
 			if($this.inviteUid){
 				$this.cellActiveIndex = 0;
 				location.replace('#'+ $this.cellActiveIndex);
 				return;
 			}
 			if(!$this.userData.productCount || Number($this.userData.productCount) === 0){
 				$this.cellActiveIndex = 6;
 				location.replace('#'+ $this.cellActiveIndex);
 				return;
 			}
 			if(!$this.userData.referalOrderCount || Number($this.userData.referalOrderCount) === 0){
 				if($this.cellActiveIndex == 3) {
 					$this.cellActiveIndex = 5;
	 				location.replace('#'+ $this.cellActiveIndex);
	 				return;
 				}
 			}
 			($this.cellActiveIndex <7) && (location.replace('#'+ ++$this.cellActiveIndex));
 			// alert([].indexOf.call(document.querySelectorAll('.page-cell'),document.querySelector('.page-cell.active'))+''+$this.cellActiveIndex);
 		},
 		runSpecialEffects: function () {
 			setInterval((function () {
 				this.specialEffects = !this.specialEffects;
 			}).bind(this),800);
 		},
 		scrollPage: (function () {
 			var startX = 0,
 				startY = 0,
 				endX = 0,
 				endY = 0,
 				audioStart = false;
 			var eventHandler = {
 				touchstart: function (e) {
 					//startX = e.touches[0].pageX;
 					startY = e.touches[0].pageY;
 					// if(!audioStart){
 					// 	this.playAudio();
 					// 	audioStart = true;
 					// }
 				},
 				touchend: function (e) {
 					//endX = e.touches[0].pageX;
 					var $this = this;
 					endY = e.changedTouches[0].pageY;
 					if(endY - startY > 0){
 						if($this.inviteUid){
 							$this.cellActiveIndex = 0;
 							location.replace('#'+ $this.cellActiveIndex);
 							return;
 						}
 						//如果没有购买记录则只显示两屏
 						if(!$this.userData.productCount || Number($this.userData.productCount) === 0){
 							$this.cellActiveIndex = 0;
 							location.replace('#'+ $this.cellActiveIndex);
 							return;
 						}
			 			if(!$this.userData.referalOrderCount || Number($this.userData.referalOrderCount) === 0){
			 				if($this.cellActiveIndex == 5) {
			 					$this.cellActiveIndex = 3;
				 				location.replace('#'+ $this.cellActiveIndex);
				 				return;
			 				}
			 			}
 						($this.cellActiveIndex >0) && (location.replace('#'+ --$this.cellActiveIndex));
 					} else if(endY - startY < 0){
 						if($this.inviteUid){
 							$this.cellActiveIndex = 6;
 							location.replace('#'+ $this.cellActiveIndex);
 							return;
 						}
 						//如果没有购买记录则只显示两屏
 						if(!$this.userData.productCount || Number($this.userData.productCount) === 0){
 							$this.cellActiveIndex = 6;
 							location.replace('#'+ $this.cellActiveIndex);
 							return;
 						}
			 			if(!$this.userData.referalOrderCount || Number($this.userData.referalOrderCount) === 0){
			 				if($this.cellActiveIndex == 3) {
			 					$this.cellActiveIndex = 5;
				 				location.replace('#'+ $this.cellActiveIndex);
				 				return;
			 				}
			 			}
 						($this.cellActiveIndex <6) && (location.replace('#'+ ++$this.cellActiveIndex));
 						if($this.cellActiveIndex == 6 && ($this.shareBtnIndex == 2)) {
 							location.replace('#'+ ++$this.cellActiveIndex);
 						}
 					}
 				}
 			}
 			return function (e) {
 				var $this = this;
 				if($this.inviteUid){
 					return ;
 				}
 				eventHandler[e.type].call($this,e);
 			}
 		}()),
 		loginFunc: function () {
 			var $this = this;
 			localStorage.ref = location.pathname;
 			if($this.isApp()){
 			    setTimeout(function () {
 			        $this.app_login();
 			    }, 100)
 			} else {
 			    $this.go('/m/account/login.html');
 			}
 		},
 		loginCall: function (data) {
 		    location.reload();
 		},
 		initPageData: function (data) {
 			var $this = this;
 			localStorage.customerId = data.customerId;
 			setTimeout(function () {
		 		$this.setShareFunc();
 			});
 			if(!data.productCount || (data.score === 'D')) {
 				$this.shareBtnIndex = 3;
 			}
 			if(Number(data.discount) === 0){
 				data.discount = 0;
 			}
 			if($this.inviteUid) {
 				$this.shareBtnIndex = 2;
 			}
 			//data.score = 'A+';
 			//如果没有购买记录则
 			if(!data.productCount || Number(data.productCount) === 0){
 				data.score = 'E';
 			}
 			data.scoreText = scoreList[data.score];
 			data.couponList = $this.coupon[data.score];
 			$this.userData = data;
 		},
 		shareBtnEvent: function () {
 			//点击分享按钮的事件
 			var $this = this;
 			if($this.shareBtnIndex == 1){
 				$this.goShareFunc();
 			} else if($this.shareBtnIndex == 2){
 				if($this.inviteUid){
 					location.replace(location.href.replace(location.search,'').replace(location.hash,''));
 					return;
 				}
 				location.replace('#'+ ++$this.cellActiveIndex);
 			} else {
 				if($this.isApp()){
 					$this.app_back({});
 				} else {
	 				location.href = '/m/home/home.html';
 				}
 			}
 		},
 		getUserData: function () {
 			var $this = this;
 			//解决hash可能被加上其他字符串的问题
 			var targetHash = Number(location.hash.substring(1,2)) || 0;
 			location.replace('#' + targetHash);

 			$this.httpAjax({
 				url: '/h5/view/annualSummary',
 				goLogin: false,
 				param: ($this.inviteUid && {inviteUid:$this.inviteUid}) || {},
 				success: function (data) {
 					if(data.code == '1'){
						var audiourl='http://secure.cn.memebox.com/media/2017/sxg.mp3';
 						$this.initPageData(data.data);
 						$this.hasloaded = true;
 						$this.audioSrc = audiourl;//'http://www.w3school.com.cn/i/song.mp3';
						//$this.playAudio();
 						$this.cellActiveIndex = targetHash;
 						//document.querySelector('.loading').style.animationDuration = document.querySelector('.loading').style.webkitAnimationDuration = null; 
 						$this.syncCss();
 						//$this.getCoupon();
						wx.ready(function () {
							if(audio){
								audio.src=audiourl;
								audio.play();
							}
						})
 					} else {
 						mui.alert(data.msg,function () {
 							data.code == '2' && ($this.loginFunc());
 						});
 					}
 				}
 			});	
 		},

 		processAppUserData: function () {
            var $this = this;
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        },
 		userInfoCall: function (data) {
 		    var $this = this;
 		    if (data && data.data && data.data.token) {
 		        this.errorMsg = data.data.token;
 		        localStorage.mmToken = data.data.token;
 		    }
 		    if (!localStorage.mmToken) {
 		        setTimeout(function () {
 		            $this.app_login();
 		        }, 100)
 		    } else {
 		        $this.getUserData();
 		    }
 		},
 		getCouponBtnEvent: function () {
 			//点击分享按钮的事件
 			//,location.replace(location.href.replace(location.search,'')用于
 			var $this = this;
 			if(new Date() - new Date(dayEnd + ' 23:59:59') > 0){
 				mui.alert('本期活动已结束，感谢您的关注，希望下次您不要错过哦！');
 				return ;
 			}
 			$this.getCouponBtnIndex !=2 && $this.getCoupon();
 		},
 		getCoupon: function () {
 			var $this = this;
 			$this.httpAjax({
 				url: '/h5/share/getAnnualCoupon',
 				success: function (data) {
 					mui.alert(data.msg);
 					if(data.code == '1' || (data.code == '3')){
 						//$this.hasGetedCoupon = true;
 						$this.getCouponBtnIndex = 2;
 					}
 				}
 			});
 		},
 		playAudio: function () {
 			audio.play();
 			audio.autoplay = true;
 			audio.isLoadedmetadata = false;
 			audio.touchstart = true;
 			audio.audio = true;
 		},
 		pauseAudio: function () {
 			if(audio.paused){
 				audio.play();
 				this.notAnimation = false;
 			} else {
				audio.pause();
 				this.notAnimation = true;
 			}
 			this.syncCss();
 		}
 	},
 	ready: function () {
 		var $this = this;
 		//mui.alert(12)
 		//location.hash.substring(1) && location.replace('#');
 		//mui.alert(window.innerHeight)
 		if($this.isApp()) {
 			$this.processAppUserData();
 		} else {
 			$this.getUserData();
 		}

 	},
 	watch: {
 	    cellActiveIndex: function (val) {
      		var arr = [];
      		arr.length = cellCount;
      		(typeof this.cellActiveIndex === 'number') && (arr[this.cellActiveIndex] = true);
      		this.cellActiveList = arr;
 	      	this.syncCss();
 			// mui.alert(this.cellActiveList.toString());
 	    }
  	},
 	created: function () {
 		// window.addEventListener('error',function (e) {
 		// 	document.write(e.error.stack);
 		// });
 		
 		var $this = this;//localStorage.clear();
 		location.search.substring(1).split('&').forEach(function (item) {
 			item.indexOf('inviteUid') !== -1 && ($this.inviteUid = item.split('=')[1]);
 		});
 		$this.runSpecialEffects();
 	}
});
