
mui.init();
var subpages = [
		'pages/main.html',
		'pages/express.html', 
		'pages/record.html', 
		'pages/setting.html'
	];
var subpage_style = {
	top: '44px',
	bottom: '50px'
};

var aniShow = {};
var title = document.getElementsByClassName("mui-title")[0];
var _self;
var showLogin; 
var deviceToken;
var qiandao = app.$c('icon-qiandao');
mui.plusReady(function() {
	_self = plus.webview.currentWebview();
	showLogin = app.local.get('loginFlag') || 'false';
//	console.log(showLogin);
	if ( showLogin == 'true') {
		getToken();
		page();
	} else {
		app.oLogin('pages/login.html');
	}
	plus.navigator.setStatusBarBackground('#12B7F5');
//	plus.screen.lockOrientation('portrait-primary');
	window.addEventListener('page', function(e) {
		page();
		info();
	})
	function page(){
		for (var i = 0; i < 4; i++) {
			var temp = {};
			var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
			if (i > 0) {
				sub.hide();
			}
			_self.append(sub);
		}
	}
	function getToken() {
		deviceToken = plus.device.uuid;
		app.local.set('deviceToken', deviceToken);
		checkDeviceToken();
		geo();
		loadSystemSettingParam();		//加载数据字典，必要参数的值
	}
	function checkDeviceToken() {
		app.index.checkDeviceToken( deviceToken, function(data) {
			console.log(JSON.stringify(data));
			if ( data.success ) {
				var userInfo = data.data.userInfo;
				app.local.set("userId", userInfo.id);					// 安吉userId
				app.local.set("realName", userInfo.realName);
				app.local.set("userName", userInfo.userName);
				app.local.set("userMobile", userInfo.mobilePhone);		// 手机号
				app.local.set("userCompany", data.data.companyName);	// 公司名
				app.local.set("userCompanyId", data.data.companyId);
				app.local.set("sessionid", data.data.sessionid);
				var myDate = new Date().Format("yyyy/MM/dd");
				var newpassword = hex_md5(myDate + userInfo.mobilePhone + "9FA6EB4SDFSFDSDFD075A98F84SDFSDFSDFSDFF896CF0DSDFSDFSDFSDF451");
				newpassword = newpassword.toUpperCase();
				app.userlogin.newlogin(userInfo.mobilePhone, newpassword, function(ndata) {
					console.log('登录 = '+JSON.stringify(ndata));
					if(ndata.code == 0) {
						app.local.set("token", ndata.data.token);		// 验证token
						app.local.set("courierId", ndata.data.id);		// 快递员id
						info();
					} else {
						app.toast("请绑定设备");
						app.oLogin('pages/login.html');
					}
				});
			} else {
				app.toast('请绑定设备');
				app.oLogin('pages/login.html');
			}
		}, function(e) {
			app.toast('请绑定设备');
			app.oLogin('pages/login.html');
		})
	}
	function info() {
		app.userlogin.info( app.local.get('courierId'),app.local.get('token'),function(data2) {
			console.log('个人信息 = '+JSON.stringify(data2));
			if ( data2.code == 0 ) {		// realName gender balance qrCode courierId
				app.local.set('newRealName', data2.data.realName);
			} else {
				app.toast(data2.message, 'center');
			}
		});
	}
	function geo() {
		plus.geolocation.getCurrentPosition( function(r) {
			console.log(JSON.stringify(r));
			var lat = r.coords.latitude;
			var lng = r.coords.longitude;
			
			if ( mui.os.ios ) {
				var arr2 = GPS.gcj_decrypt(lat,lng);
				var ggPoing = new BMap.Point(arr2['lon'], arr2['lat']);
				BMap.Convertor.translate(ggPoint, 2, function(point) {
					var lat = point.lat; 
					var lng = point.lng; 
					if(lat == 0 && lng == 0) {
						app.local.setlat(""); 
						app.local.setlog(""); 
					} else {
						app.local.setlat('lat', lat); //纬度
						app.local.setlog('lng', lng); //经度
					}
				});
			} else {
				app.local.set('lat', lat);
				app.local.set('lng', lng);
			}
			 
		}, function(e) {
			app.toast("请允许程序访问您的地理位置", 'center');
		}, {
			geocode: true,
			provider: 'amap'
		});
	}
	function loadSystemSettingParam() {
		var params = [];
		// 快件免费存物时间
		var expressFreeStoreLimit = {
			"typeGroupCode": "timetype",
			"typeCode": "delivery_free"
		};
		// 快递订单到期前多长时间可以续费
		var userRechargeLimit = {
			"typeGroupCode": "timetype",
			"typeCode": "renewalTime"
		};
		// 查询快递可取件免费时间
		var expressFreeFetchLimit = {
			"typeGroupCode": "timetype",
			"typeCode": "fetchForExpress"
		};
		// 管理员联系电话
		var adminphone = {
			"typeGroupCode": "adminphone",
			"typeCode": "yunwei"
		};
		//  指令失效时间
		var instructionTime = {
			"typeGroupCode": "timetype",
			"typeCode": "instructionTime"
		};

		params.push(expressFreeStoreLimit);
		params.push(expressFreeFetchLimit);
		params.push(adminphone);
		params.push(userRechargeLimit);
		params.push(instructionTime);
		mui.post(oldhost + "findTypeListByParams", {
			"params": JSON.stringify(params)
		}, function(data) {
			console.log(JSON.stringify(data));
			if(data.success) {
				var tradeList = data.data.typeList;
				for(var i in tradeList) {
					if(tradeList[i].typegroupcode == "timetype") {
						if(tradeList[i].typecode == "delivery_free") {
							//免费存放时间
							var freeTime = tradeList[i].typevalue;
							app.local.set("freeTime", freeTime);
						} else if(tradeList[i].typecode == "renewalTime") {
							//普通用户的续费时间，60分
							var renTime = tradeList[i].typevalue;
							app.local.set("renTime", renTime);
						} else if(tradeList[i].typecode == "fetchForExpress") {
							//快递的取件时间，30分
							var fetTime = tradeList[i].typevalue;
							app.local.set("fetchTime", fetTime);
						} else if(tradeList[i].typecode == "instructionTime") {
							//指令失效时间
							var instructionTime = Number(tradeList[i].typevalue);
							app.local.set("instructionTime", instructionTime * 60 * 1000);
						}
					} else {
						//运维人员号码
						var maintainPhone = tradeList[i].typevalue;
						app.local.set("maintainPhone", maintainPhone);
					}
				}
			} else {
				app.toast(data.message, 'center');
			}
		}, 'json');
	}
	// 两次退出
	app.quit();
});
window.addEventListener('login-sec',function(e) {
	var that = app.$id('defaultTab');
	tab('pages/main.html',that);
})
var activeTab = subpages[0];
mui('.mui-bar-tab').on('tap', 'a', function(e) {
	var targetTab = this.getAttribute('href');
	var that = this;
	tab(targetTab,that);
});
function tab(targetTab,that){
//	console.log(targetTab+','+activeTab);
	if (targetTab == activeTab) {
		return;
	}
	var tabImg = that.querySelector('img');
	mui('nav a').each(function(index) {
		var img = this.querySelector('img');
		if ( index == 0 ) {
			img.src = 'images/zhuye_hui.png';
		} else if ( index == 1 ) {
			img.src = 'images/kuaidi_hui.png';
		} else if ( index == 2 ) {
			img.src = 'images/jilu_hui.png';
		} else {
			img.src = 'images/me_hui.png';
		}
		this.style.color = '#929292';
	});
	title.innerHTML = that.querySelector('.mui-tab-label').innerHTML;
	qiandao.style.display = 'none';
	that.style.color = '#12B7F5';
	if ( targetTab == 'pages/main.html' ) {
		tabImg.src = 'images/zhuye_lan.png';
//		qiandao.style.display = 'block';
	} else if ( targetTab == 'pages/express.html' ) {
		tabImg.src = 'images/kuaidi_lan.png';
	} else if ( targetTab == 'pages/record.html' ) {
		tabImg.src = 'images/jilu_lan.png';
	} else if ( targetTab == 'pages/setting.html' ) {
		tabImg.src = 'images/me_lan.png';
		title.innerHTML = '我的';
	}
	//更换标题
	if(mui.os.ios||aniShow[targetTab]){
		plus.webview.show(targetTab);
	} else {
		var temp = {};
		temp[targetTab] = "true";
		mui.extend(aniShow,temp);
		plus.webview.show(targetTab,"fade-in",300);
	}
	plus.webview.hide(activeTab);
	activeTab = targetTab;
}

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}





























