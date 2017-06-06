/**======================== 快递版 ============================*/
/**
 * @author AnJier
 */
//服务器地址
var SERVER_ADDRESS = "http://101.64.235.90/ajzhy/rest/";
//var SERVER_ADDRESS = "http://61.153.183.66:10303/ajzhy/rest/";
//var SERVER_ADDRESS = "http://172.18.11.206:7777/ajzhy/rest/";
//var SERVER_ADDRESS = "http://172.18.11.120:12580/ajzhy/rest/"

// 当前ios版本
var nowIosVersion = "10";
// 当前Android版本
var nowAndroidVersion ="10";

// 判断开箱返回成功
var sendResult = false;
// 开箱结束标记
var timeOut = false;

/**
 * 监听返回键
 * @param {Object} type
 */
function addBackListening(type){ 
	if(!type){
		    var plat = uexWidgetOne.getPlatform();
		    //如果是android平台，则监听返回按钮事件
		    if(plat){
		      uexWindow.onKeyPressed=function(keyCode){
		        if(keyCode==0)
		          uexWidgetOne.exit();
		        }
		      uexWindow.setReportKey(0,1);
		    }
		  }
} 
/**
 * 监听返回键
 * @param {Object} type
 */
function addBackListeningGoMian(type){
    if (!type) {
        var plat = uexWidgetOne.getPlatform();
        //如果是android平台，则监听返回按钮事件
        if (plat) {
            uexWindow.onKeyPressed = function(keyCode){
                if (keyCode == 0)
					clearLocVal("isScan");
					winClose(); 
//                    openNewWin("main","main.html");
            }
            uexWindow.setReportKey(0, 1);
        }
    }
}
/**
 * 获取网络状态
 */
function getInternetStatus(callback){
	uexDevice.cbGetInfo = function(opCode, dataType, data){
		var device = eval('(' + data + ')');
		var connectStatus = device.connectStatus;
		if (connectStatus != null && connectStatus.length > 0) {
			if (connectStatus == -1) {
				 $toast("未检测到网络信号!",'2000');
				 typeof callback == 'function' && callback(false);
			}
			else 
				typeof callback == 'function' && callback(true);
			}
		}
		uexDevice.getInfo('13');
}

/**
 * String 类里面扩展出来的format方法
 * 参数个数不限
 */
String.prototype.format = function(){
    var args = arguments;
    var pattern = new RegExp("{([1-" + arguments.length + "])}", "g");
    return this.replace(pattern, function(match, index){
        return args[index - 1];
    });
}

/**
 * 加载系统参数
 */
function loadSystemSettingParam(){
	
	var params =[];
	// 快件免费存物时间
	var expressFreeStoreLimit ={"typeGroupCode":"timetype","typeCode":"delivery_free"};
	// 快递订单到期前多长时间可以续费
	var userRechargeLimit ={"typeGroupCode":"timetype","typeCode":"renewalTime"};
	// 查询快递可取件免费时间
	var expressFreeFetchLimit ={"typeGroupCode":"timetype","typeCode":"fetchForExpress"};
	// 管理员联系电话
	var adminphone ={"typeGroupCode":"adminphone","typeCode":"yunwei"};
	//  指令失效时间
	var instructionTime ={"typeGroupCode":"timetype","typeCode":"instructionTime"};
	
	params.push(expressFreeStoreLimit);
	params.push(expressFreeFetchLimit);
	params.push(adminphone);
	params.push(userRechargeLimit);
	params.push(instructionTime);
//	$toast("正在获取系统配置信息。。。",0);
	$.post(SERVER_ADDRESS+"findTypeListByParams",{"params":JSON.stringify(params)},function(data){
//		$closeToast();
		if(data.success){
			var tradeList = data.data.typeList;
			for(var i in tradeList){
				if(tradeList[i].typegroupcode=="timetype"){
					if(tradeList[i].typecode == "delivery_free"){
						  //免费存放时间
						  var freeTime =int(tradeList[i].typevalue);
	      				  setLocVal("freeTime", freeTime);
					}else if(tradeList[i].typecode == "renewalTime"){
						//普通用户的续费时间，60分
						var renTime =int(tradeList[i].typevalue);
          				setLocVal("renTime",renTime);
					}else if(tradeList[i].typecode == "fetchForExpress"){
						//快递的取件时间，30分
						var fetTime = int(tradeList[i].typevalue);
         			    setLocVal("fetchTime", fetTime);
					}else if(tradeList[i].typecode == "instructionTime"){
						//指令失效时间
						 var instructionTime = Number(tradeList[i].typevalue);
          				setLocVal("instructionTime", instructionTime*60*1000);
					}
				}else{
						//运维人员号码
					   var maintainPhone = tradeList[i].typevalue;
          			   setLocVal("maintainPhone", maintainPhone);
				}
			}
		}else{
			$toast(data.message,1500);
		}
	});
}

/**
 * 调用字典的公共方法返回为列表
 * @param {Object} typegroupcode 编码
 * @param {Object} fn 回调函数
 */
function loadDataListFromDictory(typegroupcode, fn){
    //$toast("正在加载数据。。。",0);
    $.post(SERVER_ADDRESS + "findTypeListByTypeGroupCode", {
        "typeGroupCode": typegroupcode
    }, function(data){
		//$closeToast();
		if(data.success){
			fn(data);
		}else{
			$toast(data.message,1500);
		}
    });
}

/**
 * 调用字典的公共方法返回为实体
 * @param {Object} typegroupcode 编码
 * @param {Object} fn 回调函数
 */
function loadDataEntityFromDictory(typegroupcode,typecode, fn){
    //$toast("正在加载数据。。。",0);
    $.post(SERVER_ADDRESS + "findTypeByTypeGroupCode", {
        "TypeGroupCode": typegroupcode,"typecode":typecode
    }, function(data){
	//	$closeToast();
		if(data.success){
			fn(data);
		}else{
			$toast(data.message,1500);
		}
    });
}


/**
 * Date 原型里面添加一个方法
 * @param {Object} format
 */
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
 * 字符串转换成日期
 * @param {Object} str
 */
function formatDate(date, pattern){

    var date = new Date(date);
    
    if (date == undefined) {
        date = new Date();
    }
    if (pattern == undefined) {
        pattern = "yyyy-MM-dd hh:mm:ss";
    }
    return date.format(pattern);
}


/**
 * 发送开箱指令
 * @param {Object} litigant 当事人类型
 * @param {Object} tradeId 订单编号
 * @param {Object} islandCode 岛体代码
 * @param {Object} boxId 箱子编号
 */
function sendOpenCommand(litigant, tradeId, islandCode, sarkCode, boxId, callback){
	if(tradeId=="" || islandCode=="" || sarkCode==""|| boxId==""){
          $toast("数据异常",1500);
          return;
     }
	// 访问地址
	var url="";
	// 操作类型（已作废）
	var openType="";
	// 重试开箱类型（取物/存物）
	var actiontypecode = "";
	if(litigant=="fetcher"){
		// 发送取物开箱指令
		 //openType ="openandfetch";
		 url = SERVER_ADDRESS+"openBoxByConditionFetch";
	}else if(litigant == "depositor"){
		 //发送存物开箱指令
		 //openType ="openandsave";
		 url = SERVER_ADDRESS+"openBoxByConditionStorage";
	}else if(litigant == "retrysave"){
		// 再次存物开箱的指令
		actiontypecode="openandsave"
		url = SERVER_ADDRESS+"retryOpenbox";
	}else if(litigant == "retryfetch"){
		// 再次取物开箱的指令
		actiontypecode="openandfetch"
		url = SERVER_ADDRESS+"retryOpenbox";
	}
	// 发送开箱指令ajax请求
	$.post(url,{"userId":getLocVal("userId"),
	     "tradeId":tradeId,"sarkCode":sarkCode,"islandCode":islandCode,"boxId":boxId,"actiontypecode":actiontypecode},function(data){
		 	if(data.success){
				// 默认为未获取开箱结果（不论成功失败都要修改为true，等待为false）
				sendResult =false;
				timeOut = false;
				//$toast("正在获取开箱结果",0);
				uexWindow.evaluateScript("", 0, "showOpenBoxWait();");
				// 获取开箱结果
				getOpenBoxResult(litigant, tradeId, sarkCode, islandCode,boxId,openType,callback);
				// 一直等待超过规定时间的设置
				outTime = setTimeout(function(){
					timeOut = true;
				},app.datastore.get("instructionTime"));
			}else{
				$toast(data.message, 2000);
				typeof callback =='function'&&callback(data);
			}
			
	});
}

/**
 * 接受箱子打开是否结果（成功和失败都调用回调函数，等待的回调自己直到成功失败或者超时，超时当做成功处理。（在再次开箱页面处理）只有结果失败才可以再次开箱，如果返回成功但是箱子未打开联系管理员）
 * @param {Object} tradeId 订单编号
 * @param {Object} sarkCode 柜体代码
 * @param {Object} islandCode 岛体代码
 * @param {Object} boxId 箱子编号
 * @param {Object} openType 操作类型
 * @param {Function} callback 回调函数
 */
function getOpenBoxResult(litigant, tradeId,sarkCode,islandCode,boxId,openType,callback){
	$.post(SERVER_ADDRESS+"getOpenBoxResult",{'tradeId':tradeId,'sarkCode':sarkCode,'islandCode':islandCode,"openType":openType,'boxId':boxId},function(dataString){
	   // 开箱成功
	   var data = JSON.parse(dataString);
		if(Number(data.data.resultFlag)==1){
			//清除定时器
			clearTimeout(outTime);
			//已经获取过结果不再获取
			if (!sendResult) {
				sendResult = true;
				data.data.success=true;
			}
		}else if(Number(data.data.resultFlag)==0){
			//清除定时器
			clearTimeout(outTime);
			// 开箱失败
			if(!sendResult){
				    sendResult=true;
					data.data.success=false;
			    }
		}else{
			// 已超时返回成功
			if(timeOut){
				//重试开箱
				if(litigant == "retrysave" || litigant == "retryfetch"){
					sendResult=true;
					data.data.success=true;
					data.data.message="开箱成功";
				}else{
					sendResult=true;
					data.data.success=false;
					data.data.message="开箱失败";
				}
				//清除定时器
				clearTimeout(outTime);
			}else{
				// 未超时返回等待，调用自身
				setTimeout(function(){
					getOpenBoxResult(litigant, tradeId, sarkCode, islandCode,boxId,openType,callback);
				},1000)
			}
		}
		if(sendResult){
			//$closeToast();
			//uexWindow.closePopover("wait_for_openbox");
			//typeof callback =='function'&&callback(data.data);
		}
	});
}
/**
 * 打开等待开箱结果悬浮框
 */
function showOpenBoxWait(){
	var s = window.getComputedStyle(document.body, null);
    var x = 0;
    var y = 0;
    
    uexWindow.openPopover("wait_for_openbox", "0", "wait_for_openbox.html", "", int(x), int(y), int(s.width), int(s.height), int(s.fontSize), "0");
}
/**
 * 根据订单编号得到订单详情
 * @param {Object} tradeId 订单编号
 * @param {Object} fn 回调函数
 */
function findTradeInfoByTradeId(tradeId,fn){
	
	$.post(SERVER_ADDRESS+"findTradeInfoByTradeId",{"tradeId":tradeId},function(data){
		fn(data);
	});
}

/**
 * 打开滚动插件
 * @param funName 需要的函数名称
 * @param callback 回调函数
 */
function openBoxNoChoice(funName,callBack){
	setLocVal("funName",funName);
	setLocVal("callBack",callBack);
	uexWindow.evaluateScript("", 0, "openBoxNoPage()");
}
/**
 * 打开滚动页面
 */
function openBoxNoPage(){
	var s = window.getComputedStyle(document.body, null);
    var x = 0;
    var y = 0;
    uexWindow.openPopover("box_no", "0", "box_no.html", "", int(x), int(y), int(s.width), int(s.height), int(s.fontSize), "0");
}

/**
 * 加载没有网络页面
 */
function loadNetWork(){
	if(getLocVal("loadNetWork")=="false"){
		uexWindow.evaluateScript("", 0, "openLoading()");
		setLocVal("loadNetWork","true");
	}
}

/**
 * 随机数
 * @param {Object} under
 * @param {Object} over
 */
function fRandomBy(under, over){
	switch(arguments.length){
	case 1: return parseInt(Math.random()*under+1);
	case 2: return parseInt(Math.random()*(over-under+1) + under);
	default: return 0;
		}
}
/**
 * 距离处理
 * @param {Object} distance
 */
function distanceShow(distance){
	if(distance == 0){
		return "";
	}else if(distance<1000){
		 var dis = parseFloat(distance);
		return dis.toFixed(1)+"m";
	}else{
		return Number(distance/1000).toFixed(1)+"km";
	}
}
//设置默认版本为IOS的
var nowVersion = nowIosVersion;
/**
	 * 检查是否有更新
	 */
	function checkUpdate(result){
			if(uexWidgetOne.platformName == "iOS"){
				//快递ios版
				appType = "2";
				nowVersion = nowIosVersion;
			}else{
				//快递Android版
				appType = "3";
				nowVersion = nowAndroidVersion;
//				nowVersion = nowIosVersion;
			}
			if(result){
				$toast("正在检查，请等待。。。", 0);
			}
			$.post(SERVER_ADDRESS+"checkUpdate",{"version":nowVersion, "appType":appType},function(data){
				$closeToast();
				if(data.success){
					//更新地址
					var updateUrl = data.data.updateUrl;
					//更新方式
					var updateMode = data.data.updatemode;
					//新版本名称
					var versionName = data.data.versionName;
//					//保存版本名称
//					setLocVal("versionName", versionName);
					//是否发现了新版本
					setLocVal("isUpdate","true");
					toUpdate(updateUrl, updateMode, versionName);
				}else{
					var versionName = data.data.versionName;
					setLocVal("versionName", versionName);
					setLocVal("isUpdate","false");
					if(result){
						$toast("已是最新版本", 2000);
					}
				}
			});
		}
		
		/**
		 * 选择更新方式
		 */
		function toUpdate(url, mode, name){
		        //如果是强制更新
				if(mode== "1"){
					uexWindow.cbConfirm=function(opId,dataType,data){
						     if(data=='0'){
							 	if(uexWidgetOne.platformName == "iOS"){
									        // IOS
											 uexWidget.loadApp(url);
											  setTimeout(function(){
												uexWidgetOne.exit(0)
											},5000);
									}else{
										     var a = "android.intent.action.VIEW";//启动安卓手机浏览器
											 var b = "text/html";					
										     //uexWidget.loadApp(a,b,url);	  //此方法已经失效，由于更换引擎（20160419）
											 uexWidget.startApp("1", "android.intent.action.VIEW", '{"data":{"mimeType":"text/html","scheme":"'+url+'"}}');
											 setTimeout(function(){
												uexWidgetOne.exit(0)
											},5000);
									}
								 }else if(data=='1'){
								 	   uexWidgetOne.exit(0);
							 }
						}
						uexWindow.confirm("版本更新","有新的版本需要更新（"+name+"），不更新将会影响使用",["更新","退出程序"]);
					}else{
						  uexWindow.cbConfirm=function(opId,dataType,data){ 
						     if(data=='0'){
								 	if (uexWidgetOne.platformName == "iOS") {
										   // IOS
											 uexWidget.loadApp(url);
									}else{
										 var a = "android.intent.action.VIEW";//启动安卓手机浏览器
										 var b = "text/html";					
									     //uexWidget.loadApp(a,b,url);	  //此方法已经失效，由于更换引擎（20160419）
										//uexWidget.startApp("1", "android.intent.action.VIEW", '{"data":{"mimeType":"text/html","scheme":"http://101.64.235.90:80/appUpdate/11335695.apk"}}');
										uexWidget.startApp("1", "android.intent.action.VIEW", '{"data":{"mimeType":"text/html","scheme":"'+url+'"}}');
									}
								 }else if(data=='1'){
								 	
								 }
							   }
						uexWindow.confirm("版本更新","有新的版本需要更新（"+name+"），请前往下载",["更新","忽略"]);
					}
		}
