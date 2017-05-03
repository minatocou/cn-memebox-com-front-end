/**
 * Created by page on 2016/4/27.
 */

var Vue = require('vue/vue');
var common = require('vue/vue-common');

var vue = new Vue({
    mixins: [common],
    el: '#app',
    data: {
        title: '购物车',
        init: false,
        config: {max: 99, min: 1},
        countChangeTimer: null,
        editOrFinish: true,
        showBtn: false,
        showTil: true,
        preferences: '',
        cartData: null,
        selectOnePro: false,
        proIdBox: {
            1: [],
            2: [],
            4: [],
            8: []
        },
        changeActivityParam: {
            activity_id: null,
            product_id: null
        }
    },
    methods: {
        countNum: function (index, type, event) {
            var ele = event.target.parentNode.getElementsByTagName('input')[0],
                qty = ele.value,
                itemId = ele.getAttribute('itemId'),
                that = this;
            if (type == 'add') {
                if (qty < this.config.max) {
                    qty++;
                }
            }
            if (type == 'reduce') {
                if (qty > this.config.min) {
                    qty--;
                }
            }
            if (that.countChangeTimer) {
                clearTimeout(that.countChangeTimer);
            }
            that.countChangeTimer = setTimeout(function () {
                that.updateCart(itemId, qty);
            }, 500);

        },
        updateCart: function (itemId, qty) {
            var $this = this;
            $this.httpAjax({
                url: '/h5/cart/update',
                param: {itemId: itemId, qty: qty},
                success: function (data) {
                    if (data.code == 1) {
                        $this.cartData = data.data;
                    }
                }
            })
        },
        remove: function (itemId) {
            var $this = this;
            $this.popup({
                type: 'confirm', content: '确认删除？', ok: function () {
                    $this.httpAjax({
                        url: '/h5/cart/delete',
                        param: {itemIds: itemId},
                        success: function (data) {
                            if (data.code == 1) {
                                $this.cartData = data.data;
                            }
                        }
                    })
                }
            })
        },
        //点击复选框
        checkedItem: function (event) {
            var $this = this,
                checkedObj = $this.cartData.warehouses,
                flag = event.target.checked,
                val = event.target.getAttribute("value"),
                itemArr = [],
                sta = 1,
                itemVal = "";
            if (flag) {
                sta = 1;
            } else {
                sta = 0;
            }
            if (val == "all") {
                for (var i in checkedObj) {
                    console.log(checkedObj[i].id)
                    $this.getItemId(checkedObj[i].id);
                    itemArr = itemArr.concat($this.proIdBox[checkedObj[i].id]);
                }
                itemVal = JSON.stringify(itemArr);
            } else {
                if (checkedObj[val]) {
                    $this.getItemId(checkedObj[val].id);
                    itemVal = JSON.stringify($this.proIdBox[checkedObj[val].id]);
                } else {
                    itemArr.push(val);
                    itemVal = JSON.stringify(itemArr);
                }
            }
            $this.httpAjax({
                url: '/h5/cart/mark',
                param: {
                    itemId: itemVal,
                    mark: sta
                },
                success: function (data) {
                    if (data.code == 1) {
                        $this.cartData = data.data;
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            });
        },
        checkout: function () {
            var $this = this,
                url = '../payment/order_order.html';
            if ($this.selectOnePro) {
                location.href = url;
            }
        },
        /**
         * 获得每个仓的商品的 itemId
         * @param wId：仓的Id
         */
        getItemId: function (wId) {
            var $this = this;
            var l = $this.cartData.warehouses.length;
            for (var i = 0; i < l; i++) {
                if ($this.cartData.warehouses[i].id == wId) {
                    $this.cartData.warehouses[i].preferences.forEach(function (item) {
                        item.products.forEach(function (item) {
                            $this.proIdBox[wId].push(item.itemId);
                        })
                    })
                }
            }
        },
        //删除选中的商品
        delSelectPrd: function (event) {
            var $this = this;
            if ($this.showClean) {
                $this.popup({content: "您还没有选择商品"});
            } else {
                $this.popup({
                    type: 'confirm', content: '确认删除？', ok: function () {
                        $this.httpAjax({
                            url: '/h5/cart/batchDel',
                            success: function (data) {
                                if (data.code == 1) {
                                    $this.cartData = data.data;
                                    // $this.showTil = true;
                                    // $this.showBtn = false;
                                    // mui(".cart-edit")[0].innerHTML = "编辑";
                                } else {
                                    $this.popup({content: data.msg});
                                }
                            }
                        })
                    }
                })
            }
        },
        initCart: function () {
            var $this = this;
            $this.httpAjax({
                url: '/h5/cart/view',
                success: function (data) {
                    $this.cartData = data.data;
                    if (data.code == 1) {
                        $this.init = true;
                        $this.$nextTick(function () {
                            mui.init();
                            if ($this.cartData.warehouses) {
                                document.getElementsByClassName('kr-notice')[0].style.bottom = document.getElementsByClassName('total')[0].clientHeight + 'px';
                                // $this.fixedTop();
                            }
                        });
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            })
        },
        cleanUp: function () {
            var $this = this,
                customerId = localStorage.mmToken;
            $this.popup({
                type: 'confirm', content: '是否清除失效商品？', ok: function () {
                    $this.httpAjax({
                        url: '/h5/cart/cleanUp',
                        param: {$customer_id: customerId},
                        success: function (data) {
                            if (data.code == 1) {
                                $this.cartData = data.data;
                            } else {
                                $this.popup({content: data.msg});
                            }
                        }
                    })
                }
            });
        },
        editCart: function (e) {
            var $this = this;
            if (this.showBtn) {
                $this.showTil = true;
                $this.showBtn = false;
                mui(".cart-edit")[0].innerHTML = "编辑";
            } else {
                $this.showTil = false;
                $this.showBtn = true;
                mui(".cart-edit")[0].innerHTML = "完成";
            }
        },
        choiceDiscount: function (preferences, product_id, activity_id) {
            var choiceDiscount = document.getElementById('choiceDiscount');
            this.preferences = preferences;
            choiceDiscount.style.display = 'block';
            setTimeout(function () {
                choiceDiscount.className += ' active';
            }, 0);
            this.changeActivityParam.product_id = product_id;
            this.changeActivityParam.activity_id = activity_id;
        },
        changeActivity: function (activity_id) {
            var $this = this;
            if ($this.changeActivityParam.activity_id == activity_id) {
                return;
            }
            $this.changeActivityParam.activity_id = activity_id;
            $this.httpAjax({
                url: '/h5/cart/activity',
                param: $this.changeActivityParam,
                success: function (data) {
                    if (data.code == 1) {
                        $this.cartData = data.data;
                        $this.closeChoiceDiscount();
                    } else {
                        $this.popup({content: data.msg});
                    }
                }
            });
        },
        closeChoiceDiscount: function () {
            var choiceDiscount = document.getElementById('choiceDiscount');
            choiceDiscount.className = choiceDiscount.className.replace('active', '');
            setTimeout(function () {
                choiceDiscount.style.display = 'none';
            }, 500);
        },
        // /**
        //  * 仓头部吸顶
        //  */
        // fixedTop: function () {
        //     var makeFixedTop = document.getElementsByClassName('makeFixedTop'), objFixedTop, arr = [], y;
        //     for (var i = 0; i < makeFixedTop.length; i++) {
        //         objFixedTop = makeFixedTop[i];
        //         if (objFixedTop.style.display == 'none') {
        //             break;
        //         }
        //         y = objFixedTop.offsetTop - document.querySelector('header').clientHeight;
        //         arr.push(y);
        //     }
        //     function removeClass() {
        //         for (var i = 0; i < makeFixedTop.length; i++) {
        //             objFixedTop = makeFixedTop[i];
        //             if (objFixedTop.style.display == 'none') {
        //                 break;
        //             }
        //             objFixedTop.style.paddingTop = '0';
        //             objFixedTop.className = objFixedTop.className.replace('fixed-top', '');
        //         }
        //     }
        //
        //     window.addEventListener('scroll', function (e) {
        //         var scrollY = window.scrollY;
        //         if (!arr[1] || arr[1] >= scrollY && scrollY >= arr[0]) {
        //             if (makeFixedTop[0] && makeFixedTop[0].className.match('fixed-top') == null) {
        //                 removeClass();
        //                 makeFixedTop[0].className += ' fixed-top';
        //             }
        //         } else if (!arr[2] || arr[2] >= scrollY && scrollY >= arr[1]) {
        //             if (makeFixedTop[1] && makeFixedTop[1].className.match('fixed-top') == null) {
        //                 removeClass();
        //                 makeFixedTop[1].className += ' fixed-top';
        //             }
        //         } else {
        //             if (makeFixedTop[2] && makeFixedTop[2].className.match('fixed-top') == null) {
        //                 removeClass();
        //                 makeFixedTop[2].className += ' fixed-top';
        //             }
        //         }
        //         document.getElementsByClassName('fixed-top')[0]&&(document.getElementsByClassName('fixed-top')[0].style.paddingTop = document.getElementsByClassName('fixed-top')[0].getElementsByClassName('cart-title')[0].clientHeight + 'px');
        //     });
        // },
        isShowCart: function () {
            var $this = this;
            if ($this.cartData.totalQty!=0) {
                return true;
            }
            return false;
        },
        getActivityText: function (type, condition) {
            var arr = ['去凑单', '去换购', '重新换购'],
                arr1 = ['去凑单', '选赠品', '更换赠品'];
            if(type==6||type==7){
                return arr[condition];
            }
            if(type==8||type==9){
                return arr1[condition];
            }

        },
        /**
         * go exchange product detail
         */
        goExDetail:function (id) {
            id=id.replace(/HG|CZ/,'');
            location.href="/m/productDetails/productDetails.html#"+id;
        },
        /**
         * 获取仓类型
         * @param t
         * @returns {{a: string, b: string}}
         */
        getType: function (t) {
            var obj = {
                a: 'china',
                b: '极速仓'
            };
            switch (t) {
                case 2:
                    break;
                case 1:
                    obj.a = 'korea';
                    obj.b = '韩国仓';
                    break;
                case 4:
                    obj.a = 'bonded';
                    obj.b = '保税仓';
                    break;
                case 8:
                    obj.a = 'korea';
                    obj.b = '韩国直邮 ／特快';
                default:
                    break;
            }
            return obj;
        },
        // getText: function (type, is_success) {
        //     var ary = {
        //         6: ['去凑单', '重新换购']
        //     };
        //     is_success ? is_success = 1 : is_success = 0;
        //     if (ary[type]) {
        //         return ary[type][is_success];
        //     }
        //     return '';
        // },
        /**
         * 获取仓活动类型
         * @param type：活动类型
         * return：类型
         */
        getWarehosesDiscountType: function (type) {
            //活动类型 0:N元任选,1:满减件数,2:满减金额,3:满折件数,4:满折金额,5:超级惠,6 7:加价购,8 9:场增
            var t = ['N元任选', '满减', '满减', '满折', '满折', '超级惠', '加价购', '加价购','场增','场增'];
            return t[type];
        },
        /**
         * 设置活动UI样式
         * @param advertise：名称
         */
        setAdvertise: function (pre, w) {
            if (w) {
                return pre.replace('{', '<span>').replace('}', '</span>');
            }
            if (pre.id === -1) {
                return pre.name;
            }
            return pre.advertise.replace('{', '<span class="red">').replace('}', '</span>');
        },
        /**
         * 跳转url
         * @param url：链接
         * @return 无返回值
         */
        goUrl: function () {
            if (arguments[1] == 6 || arguments[1] == 7||arguments[1] == 8||arguments[1] == 9) {
                var obj = arguments[3],str="";
                for(var k in obj){
                    str += "&"+k+"="+obj[k];
                }
                var o = {
                    6:'/changebuy/',
                    7:'/changebuy/',
                    8:'/hallgift/',
                    9:'/hallgift/',
                };
                arguments[0] = '/m/special'+o[arguments[1]] + (arguments[0].match(/(\?.+)/) && arguments[0].match(/(\?.+)/)[0]) + '&activity_id=' + arguments[2]+str+"&type="+arguments[1];
            }
            arguments[0] && (location.href = arguments[0]);
        },
        /**
         * 跳转到商品详情
         * @param id
         */
        goDetail: function (id) {
            location.href = this.page + "/productDetails/productDetails.html#" + id;
        },
        getProActivityType:function (pro) {
            var obj = {
                exbuy:'加价购',
                hallgift:'赠品'
            };
            for(var k in obj){
                if(pro[k]==1){
                    return obj[k];
                }
            }
        },
        /**
         * 判断是否选择商品
         */
        selectOne: function () {
            if (document.querySelector('.mui-content input.proCheckBox:checked')) {
                return true;
            } else {
                return false;
            }
        }
    },
    ready: function () {
    },
    created: function () {
        var $this = this;
        this.initCart();
    },
    watch: {
        cartData: function () {
            this.selectOnePro = this.selectOne();
            console.log(this.selectOnePro)
        }
    }
});
