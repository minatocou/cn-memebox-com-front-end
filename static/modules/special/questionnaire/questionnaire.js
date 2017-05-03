/**
 * Created by leo.wang on 2017/2/14
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');
var appTools = require('app/app');
var cacheSubmitObj;
try {
	cacheSubmitObj = JSON.parse(localStorage.cacheSubmitObj);
} catch(e){}
window.vue = new Vue({
 	mixins: [common, appTools],
 	el: 'html',
 	data: {
        orderListStyle: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
 		preview: null,
 		questionsData: null,
 		isNotCollapse: [],
 		isQuestionAnswered: [],
 		submitObj: {
 			survey_id: '',
 			answers: []
 		},
 		answersText: [],
 		questionType: [null,'单选','多选','填空'],
 		isRequired: ['选填','必填'],
 		isAnswerComplete: false,
 		hasSubmitted: false,
 		hasReward: false,
 		msg: '',
	},
 	computed: {
 		
 	},
 	filters: {
	    trim: function(value) {
	        return value.trim();
	    }
	},
 	methods: {
 		syncCss: function () {
 			this.$nextTick(function () {
	 			window.getComputedStyle(document.querySelector('body'), null).getPropertyValue("transform");
 			});
 		},
 		getUserInfo:function () {
 		    var $this = this;
 		    if($this.isApp()){
 		        $this.processAppUserData();
 		    } else {
 		        $this.isLogin() && !$this.getQuestions() || $this.loginFunc();
 		    }
 		},
 		processAppUserData: function () {
 		    var $this = this;
 		    localStorage.removeItem('mmToken');
 		    $this.app_userinfo();
 		},
 		getQuestions: function () {
 		    var $this = this;
 		    if(!$this.preview){
	 		    $this.httpAjax({
	 		        url: '/h5/survey/detail',
	 		        param: {survey_id: $this.getSearch('survey_id')},
	 		        goLogin: false,
	 		        alert: true,
	 		        success: function (data) {
	 		            if(data.code == 1){
	 		              	$this.setQuestionsDataAndSubmitObj(data.data);
	 		            } else {
	 		    //             mui.alert(data.msg,function () {
	 						// 	data.code == '2' && ($this.loginFunc());
	 						// });
	 		            }
	 		        },
	 		        complete: function (data) {
	 		        	data.code !=1 && mui.alert(data.msg,function () {
 							 data.code == '0' && $this.app_back();
 							 data.code == '2' && $this.loginFunc();
 						});

	 		        }
	 		    });
 		    }
 		},
 		setQuestionsDataAndSubmitObj: function (data) {
 			var $this = this;
        	$this.hasReward = (data.rule_id && data.rule_id != '0') || (data.point_amount && data.point_amount != '0');
 			$this.questionsData = data;
 			$this.submitObj.survey_id = data.survey_id;
 			data.questions.forEach(function (item,index) {
 				$this.submitObj.answers.push({question_id : item.question_id,is_required: item.is_required,answer: item.type == '2'?[]:''});
 			});
 			$this.answersText.length = $this.isQuestionAnswered.length = data.questions.length;
 			for (var i = 0; i < $this.answersText.length; i++) {
 				$this.answersText[i] = '';
 			}
 			$this.$nextTick(function () {
	 			[].slice.call(document.querySelectorAll('.question-option-container'),0).forEach(function (elem) {
	 				elem.style.height = elem.scrollHeight + 'px';
	 			});
 			});
 			document.querySelector('html').style.height = window.innerHeight + 'px';
 			$this.isCacheNeeded(cacheSubmitObj);
 			$this.$nextTick(function () {
 				$this.setElementNotCollapse(0,true);
 			});
 		},
 		setQuestionAnswered: function (index,value) {
 			var $this = this;
 			if($this.questionsData.questions[index].type == '3') {
	 			$this.answersText.splice(index,1,$this.submitObj.answers[index].answer);
 			} else {
 				var optionIdArr = [].concat($this.submitObj.answers[index].answer);
 				var textArr = $this.questionsData.questions[index].options.reduce(function (textArr,item) {
 					optionIdArr.some(function (option_id) {
 						if(item.option_id === option_id) {
 							textArr.push(item.value);
	 						return true;
 						}
 					});
 					return textArr;
 				},[]);
				$this.answersText.splice(index, 1, textArr.toString().split(',').join(' / '));
 			}
 			if(value === true) {
 				$this.isQuestionAnswered.splice(index,1,value);
 				return;
 			} else {
 				!$this.submitObj.answers[index].answer.length && $this.isQuestionAnswered.splice(index,1,false);
 			}
 		},
 		fixAndroidBug: function (e) {
 			mui('.mui-android-4-3').length && e.stopPropagation();
 		},
 		foreverChecked: function (e) {
 			e.target.checked = true;
 		},
 		loginFunc: function () {
 			var $this = this;
 			localStorage.ref = location.href;
 			if($this.isApp()){
 			    setTimeout(function () {
 			        $this.app_login();
 			    }, 100)
 			} else {
 			    $this.go('/m/account/login.html');
 			}
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
 		        $this.getQuestions();
 		    }
 		},
 		processAppUserData: function () {
            var $this = this;
            localStorage.removeItem('mmToken');
            $this.app_userinfo();
        },
        setElementNotCollapse: function (index,value) {
        	var $this = this;
        	$this.$nextTick(function () {
	        	$this.isNotCollapse.splice(index,1,value);
	        	if(!value && $this.isNotCollapse.length > index + 1){
	        		$this.$nextTick(function () {
			        	$this.isNotCollapse.splice(index + 1,1,!value);
	        		});
	        	}
	        	if($this.questionsData.questions[index].type == '3'){
	        		$this.submitObj.answers[index].answer = $this.submitObj.answers[index].answer.trim();
	        	}
	        	$this.submitObj.answers.forEach(function (item,i) {
		        	item.answer.length && $this.setQuestionAnswered(i,true);
	        	});
        	});
        },
        inputAnswer: function (e) {
        	var $this = this;
        	$this.submitObj.answers.some(function (item) {
        		if(item.question_id == e.target.getAttribute('data-index')) {
        			item.answer = e.target.value;
        			return true;
        		}
        	});
        },
        chooseReady: function (index) {
        	var $this = this;
        	if(!$this.submitObj.answers[index].answer.length && $this.submitObj.answers[index].is_required == '1'){
        		mui.alert('请先填写题目哦！');
        		return;
        	}
        	$this.setElementNotCollapse(index,false);
        },
        toggleCollapse: function (index) {
        	var $this = this;
        	var arr = new Array($this.questionsData.questions.length);
        	var flag = $this.isNotCollapse[index];
        	$this.isNotCollapse = arr;
        	$this.setElementNotCollapse(index,!flag);
        },
        goToUserCenter: function () {
        	window.appsdk.global.toUserCenter();	
        },
        filterSubmitObj: function (submitObj) {
        	var $this = this;
        	var obj = submitObj.answers.filter(function (item) {
        		if(!(item.answer.length === 0 && item.is_required != '1')){
        			return item;
        		}
        	});
        	var copyObj = JSON.parse(JSON.stringify(submitObj));
        	copyObj.answers = obj;
        	return copyObj;
        },
        isCacheNeeded: function (cacheSubmitObj) {
        	var $this = this;
        	if(!cacheSubmitObj){
        		return;
        	}
        	$this.$nextTick(function () {
		 		try {
			 		var cacheObj = $this.filterSubmitObj(cacheSubmitObj);
			 		if(cacheObj.survey_id == $this.submitObj.survey_id){
			 			$this.submitObj.answers.forEach(function (item) {
			 				cacheObj.answers.forEach(function (obj,i) {
				 				if( obj.question_id == item.question_id ) {
				 					cacheObj.answers.splice(i,1);
				 					item.answer = obj.answer;
				 				}
			 				});
			 			});
			 		}
		 		} catch(e) {}
        	});
        },
        submit: function () {
        	var $this = this;
        	setTimeout(function () {
        		if($this.isAnswerComplete && !$this.preview) {
        			var obj = $this.filterSubmitObj($this.submitObj);
        			$this.httpAjax({
        				url: '/h5/survey/saveAnswer',
        				type: 'post',
        				alert: true,
        				param: {data:JSON.stringify(obj)},
        				success: function (data) {
        					if(data.code == 1) {
        						($this.hasSubmitted = true);
        						localStorage.removeItem('cacheSubmitObj');
        						$this.syncCss();
        						if(data.data.reward == '1'){
        							$this.msg = data.msg;
        						} else if(data.data.reward == '0' && $this.hasReward){
                                    $this.msg = '非常感谢您的支持，答卷奖励数量有限，已发放完毕，下次可以早点来哦 ~';
                                } else if(data.data.reward == '0' && !$this.hasReward){
        							$this.msg = '非常感谢您的支持，我们会继续努力为您提供更加贴心的服务 ~';
        						}
        					} else {
        						// mui.alert(data.msg);
        					}
        				},
        				complete: function(data){
 							 data.code !=1 && mui.alert(data.msg,function () {
	 							 data.code == '0' && $this.app_back();
	 							 data.code == '2' && $this.loginFunc();
	 							 data.code == '3' && location.reload();
	 						});
        				}
        			});
        		} else if($this.preview) {
        			$this.hasSubmitted = true;
        			$this.msg = 'preview msg';
        		} else {
        			mui.alert('您还有必答题没有答完哦！');
        		}
        	},50);
        }
 	},
 	ready: function () {
 		var $this = this;


 	},
 	watch: {
 	    questionsData: function () {
 	    	var $this = this;
 	    	$this.isNotCollapse.length = $this.questionsData.questions.length;
 	    },
 	    answersText: function () {
 	    	var $this = this;
 	    	$this.$nextTick(function () {
	 	    	$this.isAnswerComplete = !$this.submitObj.answers.some(function (item) {
	 	    		return item.answer.length === 0 && item.is_required == '1';
	 	    	});
	 	    	if($this.isAnswerComplete){
	 	    		$this.syncCss();
	 	    	}
 	    	});
 	    },
 	    'submitObj': {
 	    	handler: function () {
 	    		//缓存答案
 	    		var $this = this;
 	    		localStorage.cacheSubmitObj = JSON.stringify($this.submitObj);
 	    	},
 	    	deep: true
 	    }
  	},
 	created: function () {
 		// window.addEventListener('error',function (e) {
 		// 	document.write(e.error.stack);
 		// });
 		
 		var $this = this;
 		$this.preview = $this.getSearch('preview');
 		if($this.preview) {
 			try {
	 			$this.setQuestionsDataAndSubmitObj(JSON.parse(decodeURIComponent(location.hash.substring(1))));
 			} catch(e){
 				alert('请先添加题目再进行预览')
 			}
 		} else {
 			$this.getUserInfo();
 		}
 	}
});
