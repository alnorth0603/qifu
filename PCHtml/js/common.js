
(function($) {
	$.baseApi = 'http://172.19.50.75:8080/rest/f/';
	//$.baseApi='http://172.20.10.138:8080/rest/f/';
	
	var zIndex = 9999;
	
	// 消息框
	var $message;
	var messageTimer;
	$.message = function() {
			var message = {};
			if($.isPlainObject(arguments[0])) {
				message = arguments[0];
			} else if(typeof arguments[0] === "string") {
				message.content = arguments[0];
			} else {
				return false;
			}

			if(message.content == null) {
				return false;
			}

			if($message == null) {
				$message = $('<div class="xxMessage"><div class="messageContent"><\/div><\/div>');
				if(!window.XMLHttpRequest) {
					$message.append('<iframe class="messageIframe"><\/iframe>');
				}
				$message.appendTo("body");
			}

			$message.children("div").html(message.content);
			$message.css({
				"margin-left": parseInt(($(window).width() - $message.outerWidth()) / 2),
				"z-index": zIndex++
			}).show();

			clearTimeout(messageTimer);
			messageTimer = setTimeout(function() {
				$message.hide();
			}, 3000);
			return $message;
		}
})(jQuery);
// Html转义
function escapeHtml(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// 添加Cookie
function addCookie(name, value, options) {
	if (arguments.length > 1 && name != null) {
		if (options == null) {
			options = {};
		}
		if (value == null) {
			options.expires = -1;
		}
		if (typeof options.expires == "number") {
			var time = options.expires;
			var expires = options.expires = new Date();
			expires.setTime(expires.getTime() + time * 1000);
		}
		if (options.path == null) {
			options.path = "/";
		}
		if (options.domain == null) {
			options.domain = "";
		}
		document.cookie = encodeURIComponent(String(name)) + "=" + encodeURIComponent(String(value)) + (options.expires != null ? "; expires=" + options.expires.toUTCString() : "") + (options.path != "" ? "; path=" + options.path : "") + (options.domain != "" ? "; domain=" + options.domain : "") + (options.secure != null ? "; secure" : "");
	}
}

// 获取Cookie
function getCookie(name) {
	if (name != null) {
		var value = new RegExp("(?:^|; )" + encodeURIComponent(String(name)) + "=([^;]*)").exec(document.cookie);
		return value ? decodeURIComponent(value[1]) : null;
	}
}

// 移除Cookie
function removeCookie(name, options) {
	addCookie(name, null, options);
}