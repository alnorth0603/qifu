﻿var pageLocalStorage = window.localStorage;
var setting = {
	loding: false,
	needToken: false
};
! function($) {
	//$.baseApi = 'http://172.19.50.75:8080/rest/f/';
	$.baseApi = 'http://www.cliffordwonderland.com/rest/f/';
	//$.baseApi='http://172.20.10.138:8080/rest/f/';

	$.fn.animateRotate = function(angle, duration, easing, complete) {
		return this.each(function() {
			var $elem = $(this);
			$({
				deg: 0
			}).animate({
				deg: angle
			}, {
				duration: duration,
				easing: easing,
				step: function(now) {
					$elem.css({
						transform: 'rotate(' + now + 'deg)'
					});
				},
				complete: complete || $.noop
			});
		});
	};

	/// Get Url Method of parameter
	$.getUrlParam = function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	}
		// 跳转登录
	$.redirectLogin = function(loginUrl,redirectUrl, message) {
		var href = loginUrl;
		if(redirectUrl != null) {
			href += "?redirectUrl=" + encodeURIComponent(redirectUrl);
		}
		if(message != null) {
			$.toast(message);
			setTimeout(function() {
				location.href = href;
			}, 1000);
		} else {
			location.href = href;
		}
	}
}(window.jQuery);

/*
 * 输出时间日期的末模板  yyyy-M-d hh:mm:ss==2015-12-10 12:10:11  yy年M月d日 礼拜w 第q季度 hh:mm:ss== 15年12月10日 礼拜2 第1季度  12:10:11
 * @param template 输出时间日期的末模板  格式必须为2015/12/10 12:10:11的字符串
 * @return 
 */
Date.prototype.pattern = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份         
		"d+": this.getDate(), //日         
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
		"H+": this.getHours(), //小时         
		"m+": this.getMinutes(), //分         
		"s+": this.getSeconds(), //秒         
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度         
		"S": this.getMilliseconds() //毫秒         
	};
	var week = {
		"0": "\u65e5",
		"1": "\u4e00",
		"2": "\u4e8c",
		"3": "\u4e09",
		"4": "\u56db",
		"5": "\u4e94",
		"6": "\u516d"
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

//字符串替换全部
String.prototype.replaceAll = function(findStr, repStr) {
	var raRegExp = new RegExp(findStr, "g");
	return this.replace(raRegExp, repStr);
};

///页面刷新处理
function refresh() {
	window.location.reload();
}

// 货币格式化
function currency(value, mantissa, showUnit) {
	var pointNum = parseInt(mantissa);
	if(value != null) {
		var price = (Math.round(value * Math.pow(10, pointNum)) / Math.pow(10, pointNum)).toFixed(pointNum);
		if(showUnit) {
			price += '元';
		}
		return price;
	}
}

// 添加Cookie
function addCookie(name, value, options) {
	if(arguments.length > 1 && name != null) {
		if(options == null) {
			options = {};
		}
		if(value == null) {
			options.expires = -1;
		}
		if(typeof options.expires == "number") {
			var time = options.expires;
			var expires = options.expires = new Date();
			expires.setTime(expires.getTime() + time * 1000);
		}
		if(options.path == null) {
			options.path = "/";
		}
		if(options.domain == null) {
			options.domain = "";
		}
		document.cookie = encodeURIComponent(String(name)) + "=" + encodeURIComponent(String(value)) + (options.expires != null ? "; expires=" + options.expires.toUTCString() : "") + (options.path != "" ? "; path=" + options.path : "") + (options.domain != "" ? "; domain=" + options.domain : "") + (options.secure != null ? "; secure" : "");
	}
}

// 获取Cookie
function getCookie(name) {
	if(name != null) {
		var value = new RegExp("(?:^|; )" + encodeURIComponent(String(name)) + "=([^;]*)").exec(document.cookie);
		return value ? decodeURIComponent(value[1]) : null;
	}
}

// 移除Cookie
function removeCookie(name, options) {
	addCookie(name, null, options);
}

$().ready(function() {

	///后退
	$(document).on("click", ".backBtn", function() {
		history.back();
	});

	///ajax发送请求接口之前处理
	$(document).ajaxStart(function() {
		if(setting.loding) {
			$.showPreloader('正在加载...');
		}
	});

	///ajaxq请求接口在headers中添加Token
	$(document).ajaxSend(function(event, request) {
		if(setting.needToken) {
			request.setRequestHeader("token", pageLocalStorage.getItem('token'));
		}
	});

	///ajax发送请求完成之周处理
	$(document).ajaxComplete(function() {});
});