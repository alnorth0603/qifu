var isSend = false;
var wait = 60;
var page = {
	init: function() {
		page.login();
		page.register();
		page.forget();
		page.getRegisterCode();
		page.getFetforgetCode();
		page.getPersonalInfo();
	},
	login: function() {
		var $loginFrom = $('.j-login');
		var isDoing = false;
		$loginFrom.find('.sumb').bind('click', function() {

			if($loginFrom.find(".j-mobile").val().trim() == '') {
				$.message("手机号不能为空");
				return;
			}
			var mobileReg = /^1\d{10}$/;
			if(!mobileReg.test($loginFrom.find(".j-mobile").val().trim())) {
				$.message("手机号不合法");
				return;
			}
			if($loginFrom.find(".j-password").val().trim() == '') {
				$.message("密码不能为空");
				return;
			}
			var data = {
				mobile: $loginFrom.find(".j-mobile").val(),
				password: $.md5($loginFrom.find(".j-password").val()).toLocaleUpperCase(),
				deviceId: ''
			};
			if(isDoing) return;
			isDoing = true;
			$.ajax({
				url: $.baseApi + "login",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					isDoing = false;
					if(data.success) {
						$(".forms_box").fadeOut();
						addCookie("memberId", data.returnValue.memberId);
						addCookie("token", data.returnValue.token);
						page.getPersonalInfo();
						$(".menber").text('退出');
					} else {
						$.message(data.errorReason);
					}
				}
			});
		});
	},
	register: function() {
		var $registerFrom = $('.j-register');
		var isDoing = false;
		$registerFrom.find('.sumb').bind('click', function() {
			if($registerFrom.find(".j-mobile").val().trim() == '') {
				$.message("手机号不能为空");
				return;
			}
			var mobileReg = /^1\d{10}$/;
			if(!mobileReg.test($registerFrom.find(".j-mobile").val().trim())) {
				$.message("手机号不合法");
				return;
			}
			if($registerFrom.find(".j-code").val().trim() == '') {
				$.message("验证码不能为空");
				return;
			}
			if($registerFrom.find(".j-password").val().trim() == '') {
				$.message("密码不能为空");
				return;
			}
			if($registerFrom.find(".j-password").val().trim() != $registerFrom.find(".j-enPassword").val().trim()) {
				$.message("两次密码不一致");
				return;
			}
			var data = {
				mobile: $registerFrom.find(".j-mobile").val(),
				password: $.md5($registerFrom.find(".j-password").val()).toLocaleUpperCase(),
				code: $registerFrom.find(".j-code").val()
			};
			if(isDoing) return;
			isDoing = true;
			$.ajax({
				url: $.baseApi + "register",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					if(data.success) {
						$.ajax({
							url: $.baseApi + "login",
							type: "POST",
							data: {
								mobile: $registerFrom.find(".j-mobile").val(),
								password: $.md5($registerFrom.find(".j-password").val()).toLocaleUpperCase(),
								deviceId: ''
							},
							dataType: "json",
							cache: false,
							async: false,
							success: function(data) {
								isDoing = false;
								if(data.success) {
									$(".forms_box").fadeOut();
									addCookie("memberId", data.returnValue.memberId);
									addCookie("token", data.returnValue.token);
									page.getPersonalInfo();
									$(".menber").text('退出');
								} else {
									$.message(data.errorReason);
								}
							}
						});
					} else {
						$.message(data.errorReason);
					}
				}
			});
		});
	},
	forget: function() {
		var $forgetFrom = $('.j-forget');
		var isDoing = false;
		$forgetFrom.find('.sumb').bind('click', function() {
			if($forgetFrom.find(".j-mobile").val().trim() == '') {
				$.message("手机号不能为空");
				return;
			}
			var mobileReg = /^1\d{10}$/;
			if(!mobileReg.test($forgetFrom.find(".j-mobile").val().trim())) {
				$.message("手机号不合法");
				return;
			}
			if($forgetFrom.find(".j-code").val().trim() == '') {
				$.message("验证码不能为空");
				return;
			}
			if($forgetFrom.find(".j-password").val().trim() == '') {
				$.message("密码不能为空");
				return;
			}
			if($forgetFrom.find(".j-password").val().trim() != $forgetFrom.find(".j-enPassword").val().trim()) {
				$.message("两次密码不一致");
				return;
			}
			var data = {
				mobile: $forgetFrom.find(".j-mobile").val(),
				password: $.md5($forgetFrom.find(".j-password").val()).toLocaleUpperCase(),
				code: $forgetFrom.find(".j-code").val()
			};
			if(isDoing) return;
			isDoing = true;
			$.ajax({
				url: $.baseApi + "member/forgotPassword",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					isDoing = false;
					if(data.success) {
						$.ajax({
							url: $.baseApi + "login",
							type: "POST",
							data: {
								mobile: $forgetFrom.find(".j-mobile").val(),
								password: $.md5($forgetFrom.find(".j-password").val()).toLocaleUpperCase(),
								deviceId: ''
							},
							dataType: "json",
							cache: false,
							async: false,
							success: function(data) {
								if(data.success) {
									$(".forms_box").fadeOut();
									addCookie("memberId", data.returnValue.memberId);
									addCookie("token", data.returnValue.token);
									page.getPersonalInfo();
									$(".menber").text('退出');
								} else {
									$.message(data.errorReason);
								}
							}
						});
					} else {
						$.message(data.errorReason);
					}
				}
			});
		});
	},
	getRegisterCode: function() {
		var $registerFrom = $('.j-register');
		$registerFrom.find('.j-codeTxt').bind('click', function() {
			var $jMobile = $registerFrom.find(".j-mobile");
			var $jGetSmsCode = $registerFrom.find('.j-codeTxt')
			var type = $(this).attr('data-type').trim();
			var mobileReg = /^1\d{10}$/;
			if($.trim($jMobile.val()) != "" && mobileReg.test($jMobile.val())) {
				if(isSend)
					return;
				isSend = true;
				$.ajax({
					url: $.baseApi + "code/sendCode",
					type: "GET",
					data: {
						mobile: $jMobile.val(),
						type: type
					},
					dataType: "json",
					cache: false,
					success: function(data) {
						if(data.success) {
							$.message("发送成功");
							time($jGetSmsCode);
						} else {
							$.message(data.errorReason);
							isSend = false;
						}
					}
				});
			} else {
				$.message("手机号不合法");
			}
		});
	},
	getFetforgetCode: function() {
		var $forgetFrom = $('.j-forget');
		$forgetFrom.find('.j-codeTxt').bind('click', function() {
			var $jMobile = $forgetFrom.find(".j-mobile");
			var $jGetSmsCode = $forgetFrom.find('.j-codeTxt')
			var type = $(this).attr('data-type').trim();
			var mobileReg = /^1\d{10}$/;
			if($.trim($jMobile.val()) != "" && mobileReg.test($jMobile.val())) {
				if(isSend)
					return;
				isSend = true;
				$.ajax({
					url: $.baseApi + "code/sendCode",
					type: "GET",
					data: {
						mobile: $jMobile.val(),
						type: type
					},
					dataType: "json",
					cache: false,
					success: function(data) {
						if(data.success) {
							$.message("发送成功");
							time($jGetSmsCode);
						} else {
							$.message(data.errorReason);
							isSend = false;
						}
					}
				});
			} else {
				$.message("手机号不合法");
			}
		});
	},
	getPersonalInfo: function() {
		var $personalInfo = $('.personalInfo');
		if(getCookie('memberId') != null && getCookie('memberId') != "") {
			$.ajax({
				url: $.baseApi + "member/getProfile?memberId=" + getCookie('memberId'),
				type: "GET",
				dataType: "json",
				cache: false,
				async: false,
				beforeSend:function(XMLHttpRequest){
					XMLHttpRequest.setRequestHeader("token", getCookie('token'));
				},
				success: function(data) {
					if(data.success){
						var myInfoVal = data.returnValue;
						if(myInfoVal.headPic == ''){
							$personalInfo.find('.headPic').attr('src','images/loginIn-defaultPic.png');
						}else{
							$personalInfo.find('.headPic').attr('src',myInfoVal.headPic);
							$personalInfo.find('.headPic').css('border','2px solid #ffffff');
							$personalInfo.find('.headPic').css('border-radius','50%');
						}
						if(myInfoVal.name=="" && myInfoVal.birthday==""){
							$personalInfo.find('.myInfo .head.row1').hide();
						}else{
							$personalInfo.find('.myInfo .row1.head').show();
							$personalInfo.find('.myInfo .row1.head .name').text(myInfoVal.name);
							if((myInfoVal.gender).toString() == '0'){
								$personalInfo.find('.myInfo .row1.head .name').addClass('man');
							}else if((myInfoVal.gender).toString() == '1'){
								$personalInfo.find('.myInfo .row1.head .name').addClass('woman');
							}
							$personalInfo.find('.myInfo .row1.head .birthday').text(myInfoVal.birthday);
						}
						if(myInfoVal.mobile=="" && myInfoVal.point==""){
							$personalInfo.find('.myInfo .row2').hide();
						}else{
							$personalInfo.find('.myInfo .row2').show();
							$personalInfo.find('.myInfo .row2 .phone>span').text(myInfoVal.mobile);
							$personalInfo.find('.myInfo .row2 .point>span').text(myInfoVal.point);
						}
						if(myInfoVal.email=="" ){
							$personalInfo.find('.myInfo .row3').hide();
						}else{
							$personalInfo.find('.myInfo .row3').show();
							$personalInfo.find('.myInfo .row3 .email .item-media-body').text(myInfoVal.email);
						}
						if(myInfoVal.address=="" ){
							$personalInfo.find('.myInfo .row4').hide();
						}else{
							$personalInfo.find('.myInfo .row4').show();
							$personalInfo.find('.myInfo .row4 .usuallyAddr .item-media-body').text(myInfoVal.address);
						}
						if(myInfoVal.maritalStatus=="" ){
							$personalInfo.find('.myInfo .row5').hide();
						}else{
							$personalInfo.find('.myInfo .row5').show();
							if((myInfoVal.maritalStatus).toString() == '0') {
								$personalInfo.find('.myInfo .row5 .feelState .item-media-body').text('未婚');
							} else if((myInfoVal.maritalStatus).toString() == '1') {
								$personalInfo.find('.myInfo .row5 .feelState .item-media-body').text('已婚');
							}
						}
						if(myInfoVal.workAddress=="" ){
							$personalInfo.find('.myInfo .row8').hide();
						}else{
							$personalInfo.find('.myInfo .row8').show();
							$personalInfo.find('.myInfo .row8 .workAddr .item-media-body').text(myInfoVal.workAddress);
						}
						if(myInfoVal.oftenVisits=="" ){
							$personalInfo.find('.myInfo .row6').hide();
						}else{
							$personalInfo.find('.myInfo .row6').show();
							$personalInfo.find('.myInfo .row6 .oftenAddr .item-media-body').text(myInfoVal.oftenVisits);
						}
						if(myInfoVal.interest=="" ){
							$personalInfo.find('.myInfo .row7').hide();
						}else{
							$personalInfo.find('.myInfo .row7').show();
							$personalInfo.find('.myInfo .row7 .hobbies .item-media-body').text(myInfoVal.interest);
						}
						$personalInfo.addClass('login-after');
					}
				}
			});
		}else{
			$personalInfo.removeClass('login-after');
			$personalInfo.find('.headPic').attr('src','images/loginOut-defaultPic.png');
		}
	}
}
$(document).ready(function() {
	page.init();
});

function time(o) {
	if(wait == 0) {
		o.text("获取验证码");
		wait = 60;
		isSend = false;
	} else {
		o.text("重新发送(" + wait + ")");
		wait--;
		setTimeout(function() {
				time(o)
			},
			1000)
	}
}