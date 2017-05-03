/**
 * Created by page.xia on 16/6/28.
 */
module.exports = {
    methods: {
        pushPro: function(pro,oid){
            var $this=this;
            if(window.ga){
                try {
                    window.ga('ecommerce:addItem', {
                        'id': oid,
                        'name': pro.name,
                        'sku': pro.sku,
                        'category': pro.brandName,
                        'price': pro.price,
                        'quantity': pro.qty
                    });
                }catch (e){
                    console.log('ga error')
                }
            }else{
                setTimeout(function () {
                    $this.pushPro(pro,oid);
                },500)
            }
        },
        payOk: function (oid,callback) {
            var $this = this;
            if(window.ga){
                window.ga('require', 'ecommerce');
                if(oid){
                    _hmt.push(['_trackEvent', 'finish_order', '支付成功']);
                    $this.httpAjax({
                        url: '/h5/payment/success',
                        param: {orderId: oid},
                        complete: function (data) {
                            if(data.data.groupon_id){
                                localStorage.grouponId=data.data.groupon_id;
                                location.href=$this.page + '/payment/group.html?grouponId='+data.data.groupon_id;
                            }else{
                                callback && callback();
                            }

                        },
                        error: function () {
                            callback && callback();
                        },
                        success: function (data) {
                            if (data.code == 1) {
                                var pros=[];
                                ga('ecommerce:addTransaction', {
                                    'id': oid,                     // Transaction ID. Required.
                                    'affiliation': '',   // Affiliation or store name.
                                    'revenue': data.data.grantTotal,               // Grand Total.
                                    'shipping': data.data.shippingAmount,                  // Shipping.
                                    'tax': ''                     // Tax.
                                });
                                if(data.data.orderProductInfo){
                                    for(var i=0;i<data.data.orderProductInfo.length;i++){
                                        var pro=data.data.orderProductInfo[i];
                                        pros.push({ "skuId": pro.sku,
                                            "skuName": pro.name,
                                            "category": pro.brandName,
                                            "Price": pro.price,
                                            "Quantity": pro.qty})
                                        $this.pushPro(pro,oid,pros);
                                    }
                                }
                                if(data.data.krChildOrders && data.data.krChildOrders.krChildOrderProductInfo && data.data.krChildOrders.krChildOrderProductInfo.length>0){
                                    for(var i=0;i<data.data.krChildOrders.krChildOrderProductInfo.length;i++){
                                        var pro=data.data.krChildOrders.krChildOrderProductInfo[i];
                                        pros.push({ "skuId": pro.sku,
                                            "skuName": pro.name,
                                            "category": pro.brandName,
                                            "Price": pro.price,
                                            "Quantity": pro.qty})
                                        $this.pushPro(pro,oid,pros);
                                    }
                                }
                                if(data.data.localChildOrders && data.data.localChildOrders.localOrderProductInfo && data.data.localChildOrders.localOrderProductInfo.length>0){
                                    for(var i=0;i<data.data.localChildOrders.localOrderProductInfo.length;i++){
                                        var pro=data.data.localChildOrders.localOrderProductInfo[i];
                                        pros.push({ "skuId": pro.sku,
                                            "skuName": pro.name,
                                            "category": pro.brandName,
                                            "Price": pro.price,
                                            "Quantity": pro.qty})
                                        $this.pushPro(pro,oid,pros);
                                    }
                                }


                                _hmt.push(['_trackOrder', {
                                    "orderId": oid,
                                    "orderTotal": data.data.grantTotal,
                                    "item": pros}
                                ]);
                                ga('ecommerce:send');
                                if(data.data.groupon_id){
                                    localStorage.grouponId=data.data.groupon_id;
                                    location.href=$this.page + '/payment/group.html?grouponId='+data.data.groupon_id;
                                }else{
                                    callback && callback(data);
                                }

                                // callback && callback(data);
                            } else {
                                $this.popup({content: data.msg});
                            }
                        }
                    })
                }
            }else{
                setTimeout(function () {
                    $this.payOk(oid);
                },500)
            }


        },
    }
}