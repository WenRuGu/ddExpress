
/**
 * author: WenRuGu
 * email: 15715702346@163.com
 * */

var host = 'http://kd.yusong.com.cn:8080';
/*var host = 'http://192.9.198.3:8100';*/
var oldhost = 'http://101.64.235.90/ajzhy/rest/';
/**
 * 显示日期格式处理
 * */
Date.prototype.format = function(format){
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}
/**
 * String 类里面扩展出来的format方法
 * 参数个数不限
 */
String.prototype.format = function(){   // 无错可用
    var args = arguments;
    var pattern = new RegExp("{([1-" + arguments.length + "])}", "g");
    return this.replace(pattern, function(match, index){
        return args[index - 1];
    });
}
var app = {
	$c: function(id, doc) {
		var d = doc ? doc : document;
		return d.getElementsByClassName(id)[0];
	},
	$id: function(id, doc) {
		var d = doc ? doc : document;
		return d.getElementById(id);
	},
	/*
	 * 页面跳转
	 * */
	oLogin: function(url) {
		mui.openWindow({
			id:'login.html',
			url:url,
			styles: {
				popGesture: 'none'
			},
			show: {
				aniShow: 'none'
			},
			waiting: {
				autoShow: false
			}
		})
	},
	oPage: function( url, data, ani, dur) {
		var ani = ani || 'pop-in';
		var time = dur || 200;
		var d = data || {};
		mui.openWindow({
			id: url,
			url: url,
			show: {
				autoshow: true,
				duration: time,
				aniShow: ani
			},
			extras: d,
			waiting: {
				autoShow: false
			}
		})
	},
	toast: function(msg, algin, time) {
		if(time != 'long') {
			time = 'short';
		}
		if ( algin == undefined ) {
			algin = 'bottom';
		}
		plus.nativeUI.toast(msg, {
			duration: time,
			verticalAlign: algin
		});
	},
	ajax: {
		post: function( url, data, obj, e) {
			mui.ajax({
				type: 'post',
				url: url,
				data: data,
				dataType: 'json',
				timeout: 10 * 1000,
				success: obj,
				complete: function() {},
				error: e || function(){
					plus.nativeUI.closeWaiting();
				}
			})
		},
		get: function( url, data, obj, e) {
			mui.ajax({
				type: 'get',
				url: url,
				data: data,
				dataType: 'json',
				timeout: 10 * 1000,
				success: obj,
				complete: function() {},
				error: e || function() {
					plus.nativeUI.closeWaiting();
				}
			})
		}
	},
	isJson: function(obj) {	// 是否json
		var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		return isjson;
	},
	network: function() {		// 网络状况
		var network = plus.networkinfo.getCurrentType();
		if ( network <= 1 ) {   // 0状态未知 1未连接
			return false;
		} else {  				// 2 有线 3 wifi 4 2G 5 3G 6 4G
			return true;
		}
	},
	local: {
		set: function(key, value) {
			window.localStorage[key] = value;
		},
		get: function(key) {
			if(window.localStorage[key]){
				return window.localStorage[key];
			} else {
				return "";
			}
		},
		clear: function(key) {
			if(key) {
				window.localStorage.removeItem(key);
			} else {
				window.localStorage.clear();
			}
		}
	},
	/*
	 * 安卓两次按钮退出
	 * */
	quit: function (){
		if (mui.os.android) {
			var backButtonPress = 0;
			mui.back = function(event) {
				backButtonPress++;
				if (backButtonPress > 1) {
					plus.runtime.quit();
				} else {
					plus.nativeUI.toast('再按一次退出应用');
				}
				setTimeout(function() {
					backButtonPress = 0;
				}, 2000);
				return false;
			};
		}
	},
	// 数组排序   
	jsonSort: function( array, filed, reverse) {
		if (array.length < 2 || !filed || typeof array[0] !== "object") return array;

		//数字类型排序
		if(typeof array[0][filed] === "number") {
			array.sort(function(x, y) {
				return x[filed] - y[filed]
			});
		}
		//字符串类型排序
		if(typeof array[0][filed] === "string") {
			array.sort(function(x, y) {
				return x[filed].localeCompare(y[filed])
			});
		}
		//倒序
		if(reverse) {
			array.reverse();
		}
		return array;
	},
	/**
	 * 判断版本号大小，相等返回undefined，n大于o  return true;
	 * oldVer and newVer
	 * */
	compareVersion:	function( ov, nv ){  
		if ( !ov || !nv || ov=="" || nv=="" ){
			return false;
		}
		var b=false,
		ova = ov.split(".",4),
		nva = nv.split(".",4);
		for ( var i=0; i<ova.length&&i<nva.length; i++ ) {
			var so=ova[i],no=parseInt(so),sn=nva[i],nn=parseInt(sn);
			if ( nn>no || sn.length>so.length  ) {
				return true;
			} else if ( nn<no ) {
				return false;
			}
		}
		if ( nva.length>ova.length && 0 == nv.indexOf(ov) ) {
			return true;
		}
	},
	/**
	 * 日期格式处理
	 * formatDate( time（毫秒）, "yyyy-MM-dd hh:mm")
	 * */
	formatDate: function (date, pattern){
	    var date = new Date(date);
	    if (date == undefined) {
	        date = new Date();
	    }
	    if (pattern == undefined) {
	        pattern = "yyyy-MM-dd hh:mm:ss";
	    }
	    var data =  date.format(pattern);
	    return data;
	},
	userlogin: {
		'newlogin': function(mobile, password, obj) {
			var url = host + '/api/v1/courier/login2';
			app.ajax.post(url, {
				mobile: mobile,
				password: password
			}, obj);
		},
		'oldlogin': function(mobile, checkcode, obj) {
			var url = oldhost + 'bindingDeviceByRandomDeviceToken';
			app.ajax.post(url, {
				"mobilePhone": mobile,
				"checkCode": checkcode,
				"userRole": "courier" //用户角色 快递员
			}, obj);
		},
		'getcheckcode': function(mobile, obj, err) {
			var url = oldhost + 'getValCodeByMoblieForExpress';
			app.ajax.post(url, {
				"mobilePhone": mobile,
			}, obj);
		},
		'info': function(courierId,token,obj) {
			var url = host + '/api/v1/courier/info';
			app.ajax.post(url,{
				id:courierId,	
				token: token
			}, obj);
		}
	},
	index: {
		'checkDeviceToken': function(token, randomDeviceToken,obj, err) {
			var url = oldhost + 'checkDeviceToken';
			mui.ajax({
				url: url,
				type: 'post',
				dataType: 'json',
				timeout: 10000,
				data: {
					"deviceToken": token,
					"randomDeviceToken": randomDeviceToken,
					"userRole": "courier" //用户角色 快递员
				},
				success: obj,
				error: err
			});
		},
		'checkNotice': function(appType, obj) {
			var url = oldhost + 'checkNotice';
			app.ajax.post(url, {
				'apptype': appType
			}, obj);
		}
	},
	info: {
		'unbound': function(obj) {
			var url = oldhost + 'unbound';
			app.ajax.post(url, {
				'userId': app.local.get("userId")
			}, obj);
		},
		'order': function(obj) {
			var url = host + '/api/v1/courier/order/order_count';
			app.ajax.post( url, {
				token: app.local.get('token'),
				courierId: app.local.get('courierId')
			}, obj);
		}
	},
	account: {
		'balance': function(obj) {
			var url = host + '/api/v1/courier/balance';
			app.ajax.post(url,{
				token: app.local.get('token'),
				courierId: app.local.get('courierId')
			}, obj);
		},
		'history': function(offset,limit,obj) {
			var url = host + '/api/v1/courier/in_out_money/list';
			app.ajax.post(url,{
				token: app.local.get('token'),
				courierId: app.local.get('courierId'),
				offset: offset,
				limit: limit
			}, obj);
		},
		'rechargeDetails': function(offset, limit, token, courierId, obj) {
			var url = host + '/api/v1/courier/deposit/list';
			app.ajax.post(url,{
				token: token,
				courierId: courierId,
				offset: offset,
				limit: limit
			}, obj);
		}
	},
	order: {
		'history': function(pageNo, pageSize, islandId, tradeState, obj) {
			var url = oldhost + 'findExpressTradeListByPage';
			app.ajax.post(url, {
				"userId": app.local.get('userId'),
				"islandId": islandId,
				"tradeState": tradeState,
				"timelength": '',
				"pageNo": pageNo,
				"pageSize": pageSize
			}, obj);
		},
		'newallhistory': function(pageNo, pageSize, token, courierId, type, obj) {
			var url = host + '/api/v1/courier/deliver_order/list';
//			console.log('aaa == '+type);
			app.ajax.post(url, {
				"offset": pageNo,
				"limit": pageSize,
				"token": token,
				"courierId": courierId,
				"type": type
			}, obj);
		},
		'newhistory': function(pageNo, pageSize, ntoken, courierId, terminalId, type, obj) {
			var url = host + '/api/v1/courier/deliver_order/list2';
			app.ajax.post(url, {
				"token": ntoken,
				"courierId": courierId,
				"terminalId": terminalId,
				"offset": pageNo,
				"type": type,
				"limit": pageSize
			}, obj);
		},
		'newdeliverordertake': function(token, courierId, id, obj) {
			var url = host + '/api/v1/courier/deliver_order/take';
			app.ajax.post(url, {
				"token": token,
				"courierId": courierId,
				"id": id
			}, obj);
		},
		'getBoxNum': function(token, courierId, terminalCode, boxtypeid, obj) {
			var url = host + "/api/v1/courier/terminal/query_empty_box_num";
			app.ajax.post(url, {
				token: token,
				courierId: courierId,
				terminalCode: terminalCode,
				boxType: boxtypeid
			}, obj);
		},
		'findhistory': function(pageNo, pageSize, obj) {
			var url = oldhost + 'findTradeListByExpressNoOrFetherPhone';
			app.ajax.post(url, {
				'userId': app.local.get("userId"),
				'expreeNo': app.config.expressNo(),
				'fetherPhone': app.config.mobile(),
				'isOneHundredDay': 1,
				'pageNo': pageNo,
				'pageSize': pageSize
			}, obj);
		},
		'newfindTradeActionByTradeId': function(token, id, obj) {
			var url = host + '/api/v1/courier/deliver_order/detail';
			app.ajax.post(url, {
				"token": token,
				"id": id
			}, obj);
		},
		'findTradeActionByTradeId': function(tradeId, obj) {
			var url = oldhost + 'findTradeActionByTradeId';
			app.ajax.post(url, {
				"tradeId": tradeId
			}, obj);
		},
		'findTradeInfoByTradeId': function( tradeId, obj) {
			var url = oldhost + 'findTradeInfoByTradeId';
			app.ajax.post(url, {
				"tradeId": tradeId
			}, obj);
		},
		'findIsLandListByPage': function(pageNo, pageSize, keyword, longitude, latitude, obj) {
			var url = oldhost + 'findIsLandListByPage';
			app.ajax.post(url, {
				"pageNo": pageNo,
				"pageSize": pageSize,
				"keyword": keyword,
				"longitude": longitude,
				"latitude": latitude
			}, obj);
		},
		'newfindIsLandListByPage': function(token, courierId, offset, pageSize, keyword, longitude1, latitude1, obj) {
			var url = host + '/api/v1/courier/terminal/nearest';

			app.ajax.post(url, {
				token: token,
				courierId: courierId,
				terminalName: keyword,
				lng: longitude1,
				lat: latitude1,
				offset: offset,
				limit: pageSize
			}, obj);
		},
		'newgetTradeListByUserId': function(ntoken, courierId, keyword, longitude, latitude, obj) {
			var url = host + '/api/v1/courier/deliver_order/wait_sign_terminal_list';

			app.ajax.post(url, {
				token: ntoken,
				courierId: courierId,
				"keyword": keyword,
				"lng": longitude,
				"lat": latitude
			}, obj);
		},
		'getTradeListByUserId': function(pageNo, pageSize, keyword, longitude, latitude, obj) {
			var url = oldhost + 'getTradeListByUserId';
			app.ajax.post(url, {
				"userId": app.local.get("userId"),
				"pageNo": pageNo,
				"pageSize": pageSize,
				"keyword": keyword,
				"longitude": longitude,
				"latitude": latitude,
				"timelength": app.local.get("timelength") || ""
			}, obj);
		},
		'findTradeMessageListByTradeIds': function(tradeArrStr, obj) {
			var url = oldhost + 'findTradeMessageListByTradeIds';
			app.ajax.post(url, {
				"tradeids": tradeArrStr
			}, obj);
		},
		'newfindTradeMessageListByTradeIds': function(token, orderId, obj) {
			var url = host + '/api/v1/courier/deliver_order/mobile_message_info';
			app.ajax.post(url, {
				"token": token,
				"orderId": orderId
			}, obj);
		},
		'showPwd': function(tradeId, obj) {
			var url = oldhost + 'showPwd';
			app.ajax.post(url, {
				"tradeId": tradeId
			}, obj);
		},
		'successMsgById': function(msgId, informtag, obj) {
			var url = oldhost + 'successMsgById';
			app.ajax.post(url, {
				"msgId": msgId,
				"informtag": informtag
			}, obj);
		},
		'findTypeListByTypeGroupCode': function(typeGroupCode, obj) {
			var url = oldhost + 'findTypeListByTypeGroupCode';
			app.ajax.post(url, {
				"typeGroupCode": typeGroupCode
			}, obj);
		},
		'checkForExpress': function(userId, obj) {
			var url = oldhost + 'checkForExpress';
			app.ajax.post(url, {
				"userId": userId
			}, obj);
		},
		'newfindIslandBoxInfoForExpress': function(ntoken, courierId, terminalCode, obj) {
			var url = host + '/api/v1/courier/terminal/query_empty_box_info';
			app.ajax.post(url, {
				"token": ntoken,
				"courierId": courierId,
				"terminalCode": terminalCode
			}, obj);
		},
		'findIslandBoxInfoForExpress': function(paratype, paravalue, obj) {
			var url = oldhost + 'findIslandBoxInfoForExpress';
			app.ajax.post(url, {
				"paratype": paratype,
				"paravalue": paravalue,
				"userId": app.local.get("userId")
			}, obj);
		},
		'findBaseBoxListByIslandIdAndBoxType': function(islandId, boxtypeid, obj) {
			var url = oldhost + 'findBaseBoxListByIslandIdAndBoxType';
			app.ajax.post(url, {
				"islandId": islandId,
				"boxtypeId": boxtypeid
			}, obj);
		},
		'getSarkCodeByBoxId': function(boxId, obj) {
			var url = oldhost + 'getSarkCodeByBoxId';
			app.ajax.post(url, {
				"boxId": boxId
			}, obj);
		},
		'checkExpressNo': function(expressNo, obj) {
			var url = oldhost + 'checkExpressNo';
			app.ajax.post(url, {
				"userId": app.local.get("userId"),
				"expressNo": expressNo
			}, obj);
		},
		'submitOrder': function(token, courierId, orderNo, mobile, boxNum, boxType, terminalCode, obj) {
			var url = host + '/api/v1/courier/deliver_order/create2';
			app.ajax.post(url, {
				token: token,
				courierId: courierId,
				orderNo: orderNo,
				mobile: mobile,
				boxNum: boxNum,
				boxType: boxType,
				terminalCode: terminalCode
			}, obj);
		},
		'submitLockOrder': function(params, obj) {
			var url = oldhost + 'submitLockOrder';
			app.ajax.post(url, params, obj);
		},
		'cancelExpressTradeByTradeId': function(tradeId, obj) {
			var url = oldhost + 'checkExpressNo';
			app.ajax.post(url, {
				"userId": app.local.get("userId"),
				"tradeId": tradeId,
				"reason": app.local.get("reason")
			}, obj);
		},
		'sendOrderTake': function(token, courierId,orderId,obj) {
			var url = host + '/api/v1/courier/send_order/take';
			app.ajax.post(url, {
				"token": token,
				"courierId": courierId,
				"id": orderId
			}, obj);
		},
		'sendOrderList': function(offset,limit,token,courierId,type,obj) {
			var url = host + '/api/v1/courier/send_order/list';
			app.ajax.post(url, {
				"token": token,
				"courierId": courierId,
				"type": type,
				'offset': offset,
				'limit': limit
			}, obj);
		},
		'searchOrder': function( token, orderId) {
			var url = host + '/api/v1/courier/send_order/list';
			app.ajax.post(url, {
				"token": token,
				"id": orderId,
			}, obj);
		}
	},
	main: {
		'getlockList': function(pageNo, pageSize, keyword, longitude, latitude) {},
		'getMapList': function(curLongitude, curLatitude) {
			var url = oldhost + 'findIsLandListByDistance';
			app.ajax.post(url, {
				"keyword": app.localhost.keyword || "",
				"longitude": curLongitude,
				"latitude": curLatitude
			}, obj);
		}
	}
}


































































