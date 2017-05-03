/**
 * Created by Jesse on 17/3/28.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: 'html',
    data: {
        // title: '',
        init: false,
        dataProductList: [],
        showResult: '', // true->显示搜索结果
        orderTotal: null,
        move: {
            mask: false,
            box: false,
            disable: false
        },
        /**
         * 请求参数
         */
        paramObj: {
            order: '',
            filter: '',
            warehouse: '',
            pageIndex: '',
            pageSize: '',
            sku: '',
            category_ids: ''
        },
        search: '',
        extra: {
            title: '',
            tips: '',
            amount: '',
            margin: '',
            limit: '',
            level: '',
            type: ''
        },
        /**
         * 换购加车商品
         */
        addExProList: [],
        hallGiftList: '',
        /**
         *
         */
        activityHallGift: {
            level:'',
            list:''
        },
        activity_id: '',
        changeBuyList: '',
        changeBuyPro: {},
        currentLength: 0
    },
    methods: {
        checkExProQty: function () {
            if (document.querySelectorAll('input[type="checkbox"]:checked').length == this.extra.limit) {
                // this.popup({
                //     // content: '只能选择' + this.extra.limit + '件换购商品'
                //     content: '已满足'
                // });
                return false;
            }
            return true;
        },
        initMui: function () {
            var $this = this;
            mui.init({
                pullRefresh: {
                    container: '#pullrefresh',
                    up: {
                        contentrefresh: '正在加载...',
                        contentnomore: '', //没有更多数据了
                        callback: pullupRefresh
                    }
                }
            });
            /**
             * 上拉加载具体业务实现
             */
            function pullupRefresh() {
                var t = setTimeout(function () {
                    t = null;
                    mui('#pullrefresh').pullRefresh().endPullupToRefresh();
                    if (($this.paramObj.pageIndex * $this.paramObj.pageSize) >= $this.orderTotal) {
                        $this.popup({
                            content: '没有更多商品了',
                            time: 1000,
                            autoClose: true
                        });
                        mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                    } else {
                        $this.paramObj.pageIndex++;
                        $this.getList();
                    }
                }, 0);
            }
        },
        /**
         * 设置排序类型
         */
        bindleChangeSortType: function (order) {
            var $this = this;
            $this.paramObj.pageIndex = 1;
            $this.dataProductList = [];
            if (!order) {
                if ($this.paramObj.order != 4 && $this.paramObj.order != 3) {
                    order = 3;
                } else {
                    order = 12 / $this.paramObj.order;
                }
            }
            // $this.search = $this.search.replace(/&order=\d/,'&order='+order);
            $this.paramObj.order = order; //1:综合排序  2：销量降序  4：价格升序 3：价格降序
            mui('#pullrefresh').pullRefresh().scrollTo(0, 0, 100); //回到顶部
            mui('#pullrefresh').pullRefresh().refresh(true);
            $this.getList();
        },
        /**
         * 检测排序类型
         */
        checkSortType: function () {
            if (arguments.length == 1) {
                return (this.paramObj.order == arguments[0]) && 'sort-title-active';
            } else if (arguments.length == 2) {
                return (arguments[0] == this.paramObj.order || arguments[1] == this.paramObj.order) && 'sort-title-active';
            }
        },
        /**
         * 切换赠品
         * @param index
         */
        changeHallList: function (index,condition) {
            this.activityHallGift.list = this.hallGiftList.products[index].products;
            this.activityHallGift.level = condition;
            this.currentLength = 0;
        },
        /**
         * 展示选择商品
         */
        showChangePro: function () {
            var $this = this;
            var t = setTimeout(function () {
                t = null;
            }, 1);
            this.move.mask = true;
            this.move.box = true;
        },
        /**
         * 隐藏选择商品
         */
        hideChangePro: function () {
            this.move.mask = false;
            this.move.box = false;
        },
        /**
         * 获取列表
         */
        getList: function (callback) {
            var $this = this;
            $this.httpAjax({
                url: '/global/search',
                // url: '/global/search'+$this.search,
                domain: $this.searchDomain,
                param: $this.paramObj,
                success: function (data) {
                    $this.showResult = true;
                    $this.orderTotal = data.orderTotal;
                    typeof callback === 'function' && callback();
                    // if ($this.orderTotal < $this.paramObj.pageSize) {
                    //     setTimeout(function() {
                    //         mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                    //     }, 0);
                    // }
                    mui('#pullrefresh').pullRefresh().refresh(true);
                    $this.dataProductList = ($this.dataProductList).concat(data['data']);
                    $this.init = true;
                    var t = setTimeout(function () {
                        t = null;
                        $this.initEcho();
                    }, 10)

                }
            });
        },
        /**
         * 获取换购商品
         */
        getChangeBuyList: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/cart/hallGiftList',
                param: {
                    activity_id: $this.activity_id,
                    condition: $this.extra.level
                },
                success: function (data) {
                    $this.hallGiftList = data.data;
                    for (var i = 0, l = $this.hallGiftList.products.length; i < l; i++) {
                        if ($this.extra.level == $this.hallGiftList.products[i].condition) {
                            $this.activityHallGift.list = $this.hallGiftList.products[i].products;
                            break;
                        }
                    }
                }
            })
        },
        addCart: function () {
            var $this = this;
            var oCheckBox = document.querySelectorAll('input[type="checkbox"]:checked');
            $this.addExProList = [];
            // console.log($this.addExProList);
            // return
            for (var i = 0, l = oCheckBox.length; i < l; i++) {
                var activity = oCheckBox[i].parentNode.parentNode.querySelector('.activity');
                var hasOptions = oCheckBox[i].parentNode.parentNode.querySelector('.pro-options');
                $this.addExProList[i] = {};
                $this.addExProList[i].product_id = oCheckBox[i].getAttribute('id');
                if (hasOptions && !activity) {

                }
                if (activity) {
                    $this.addExProList[i].optionKey = activity.getAttribute('key');
                    $this.addExProList[i].optionValue = activity.getAttribute('value');
                }
            }
            console.log($this.addExProList);
            $this.httpAjax({
                url: '/h5/cart/addHallGift',
                param: {
                    products: JSON.stringify($this.addExProList),
                    activity_id: $this.activity_id,
                    warehouse: $this.hallGiftList.warehouse
                },
                success: function (data) {
                    console.log(data);
                    location.href = "/m/cart/cart.html";
                }
            });
        },
        /**
         * 限制选择一个，交替选择
         */
        onlyOne: function () {
            var activity = document.querySelector('.activity'),
                checked = document.querySelectorAll('input[type="checkbox"]:checked');
            if (activity) {
                activity.className = activity.className.replace('activity', '');
            }
            for (var i = 0, l = checked.length; i < l; i++) {
                checked[i].checked = false;
            }
            this.currentLength = 1;
        },
        /**
         * 选择options
         * @param e
         */
        choiceOption: function (e) {
            var activity = e.target.parentNode.querySelector(".activity");
            var oCheckbox = e.target.parentNode.parentNode.parentNode.querySelector("input[type='checkbox']");
            if (this.extra.margin != 0) {
                return false;
            }
            if ((!this.checkExProQty() || this.extra.margin != 0) && this.extra.limit != 1 && !activity) {
                return false;
            }
            if (this.extra.limit == 1) {
                this.onlyOne();
            } else {
                this.currentLength++;
            }
            if (activity) {
                activity.className = activity.className.replace("activity", "");
            }
            e.target.className += " activity";
            if (!oCheckbox.checked) {
                oCheckbox.checked = true;
            }
        },
        /**
         * 勾选商品
         */
        choicePro: function (e) {
            var oInput = e.target;
            this.checkExProQty();
            if (this.extra.margin != 0) {
                return false;
            }
            if (oInput.nodeName.toLocaleLowerCase() !== 'input') {
                oInput = oInput.childNodes;
            }
            var oDiv = oInput.parentNode.parentNode;
            if (oInput.checked) {
                if (this.extra.limit == 1) {
                    this.onlyOne();
                    e.target.checked = true;
                } else {
                    this.currentLength++;
                }

                if (!oDiv.querySelector("span.activity") && oDiv.querySelector(".abled")) {
                    oDiv.querySelector(".abled").className += " activity";
                }

                // if(this.currentLength==1){
                //
                // }
            } else {
                if (oDiv.querySelector("span.activity")) {
                    oDiv.querySelector("span.activity").className = oDiv.querySelector("span.activity").className.replace("activity", '');
                }
                this.currentLength--;
            }

        },
        goCart: function () {
            location.href = "/m/cart/cart.html";
        }
    },
    ready: function () {
        this.init = true;
        for (var k in this.paramObj) {
            this.paramObj[k] = this.getSearch(k);
            if (!this.paramObj[k]) {
                delete this.paramObj[k];
            }
        }
        for (var k in this.extra) {
            this.extra[k] = this.getSearch(k);
        }
        if (this.extra.margin == 0) {
            this.showChangePro();
        } else {
            this.move.disable = true;
        }
        this.activityHallGift.level = this.extra.level;
        this.setTitle(this.extra.title);
        this.activity_id = this.getSearch('activity_id');
        this.getList(function () {
            this.initMui();
        }.call(this));
        this.getChangeBuyList();
    },
    created: function () {
    },
    watch: {
        currentLength: function (val) {
            var oInput = document.querySelectorAll('input[type="checkbox"]');
            if (val == this.extra.limit && this.extra.limit != 1) {
                for (var i = 0, l = oInput.length; i < l; i++) {
                    !oInput[i].checked && (oInput[i].disabled = true);
                }
            } else {
                if (document.querySelector('input[type="checkbox"]:disabled')) {
                    for (var i = 0, l = oInput.length; i < l; i++) {
                        oInput[i].disabled = false;
                    }
                }
            }
        }
    }
});
