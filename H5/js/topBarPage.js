var pageNum = 1;
var pageSize = 5;
var totalPage = 1;
var searchFilter = '';
var searchKeyword = '';
var isFrist = true;
var isLoding = false;
var isKey = true;
setting.loding = false;
$(function() {
	var $jSearchShow = $('#j-searchShow');
	var $jSearchHide = $('#j-searchHide');
	var $jBarSwiper = $('#j-barSwiper');
	var $jSearch = $('#search');

	//大头鸟的事件
	$(document).on('click', '#j-whMenu', function(e) {
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			var d = 0;
			var $this = $(this);
			var $jWHMenuEle = $($this.attr('data-href'));
			if($jWHMenuEle.hasClass('hide')) {
				$jWHMenuEle.removeClass('hide');
				$jWHMenuEle.find('.item').each(function(index, item) {
					var param = $(item).attr('data-param').split(',');
					$(item).animateRotate(360).css({
						position: 'absolute',
						opacity: 0,
						left: "40.5%",
						top: "20%"
					}).delay(d).animate({
						opacity: 1,
						left: param[0],
						top: param[1]
					}, 500);
					d += 50;
				});
			} else {
				var d = 0;
				$($jWHMenuEle.find('.item').get().reverse()).each(function() {
					$(this).animateRotate(-360).delay(d).animate({
						opacity: 0,
						left: "41%",
						top: "20%"
					}, 150);
					d += 15;
				}).promise().done(function() {
					$jWHMenuEle.addClass('hide');
				});
			}
		} else {
			$('#personalInfo').removeClass('panel-left');
			$('#topBar-page').removeClass('fadeOutDown').addClass('animated').addClass('fadeOutUp');
			$('#j-recommend').removeClass('hide').removeClass('fadeOutDown').addClass('animated').addClass('fadeInUp');
			loadRecommend();
		}
	});
	//关闭大头鸟的事件
	$(document).on('click', '#j-recommend .headInfoImg', function(e) {
		$('#topBar-page').removeClass('hide').removeClass('fadeOutUp').addClass('fadeInDown');
		$('#j-recommend').removeClass('fadeInUp').addClass('fadeOutDown');
		$('#personalInfo').addClass('panel-left');
		///动画1秒小时候执行，修改动画时间和定时器必须一样  否则无法执行侧栏事件
		setTimeout(function(){
			$('#topBar-page').removeClass('animated').removeClass('fadeOutDown');
		},1000);
	});
	//显示输入关键字的事件
	$(document).on('click', '#j-searchShow', function(e) {
		$('#search').val(searchKeyword);
		$jSearchShow.addClass('hide');
		$jBarSwiper.addClass('hide');
		$jSearchHide.closest('.searchbar').removeClass('hide');
	});
	//输入关键字取消的事件
	$(document).on('click', '#j-searchHide', function(e) {
		$jSearchHide.closest('.searchbar').addClass('hide');
		$jSearchShow.removeClass('hide');
		$jBarSwiper.removeClass('hide');
	});
	//输入关键字完成搜索的事件
	$(document).on('click', '#j-keywordBtn', function(e) {
		$jSearchHide.closest('.searchbar').addClass('hide');
		$jSearchShow.removeClass('hide');
		$jBarSwiper.removeClass('hide');
		searchKeyword = $('#search').val();
		pageNum = 1;
		totalPage = 1;
		isFrist = true;
		isKey = true;
		loadChooseList();
	});
	//筛选条件事件
	$(document).on('click', '#mainSearch', function(e) {
		$('#topBar-page').addClass('hide');
		$('#mainSearch').addClass('hide');
		$('#j-recommend').addClass('hide');
		$('#serach-page').removeClass('hide');
		loadChoosefilter();
	});
	///侧栏事件
	$(document).on("open", "#personalInfo", function(e) {
		var $this = $(this);
		var data = {};
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			data.memberId = '';
			setting.needToken = false;
		} else {
			data.memberId = pageLocalStorage.getItem('memberId');
			setting.needToken = true;
		}
		$.ajax({
			url: $.baseApi + "member/getNotice",
			type: "GET",
			dataType: "json",
			cache: false,
			data: data,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					$this.find('.bar-nav .title').text(data.returnValue.mobile);
					$this.find('.content .item-content .s-pointDiv').removeClass('hide');
					$this.find('.content .item-content .s-couponDiv').removeClass('hide');
					$this.find('.content .item-content .j-signIn').removeClass('hide');
					$this.find('.content .item-content .s-pointDiv .p-total').text(data.returnValue.point);
					$this.find('.content .item-content .s-couponDiv .c-total').text(data.returnValue.couponCount);
					if(data.returnValue.headPic == '') {
						$this.find('.content .item-content .headPic').attr('src', '../img/defaultBG.png');
					} else {
						$this.find('.content .item-content .headPic').attr('src', data.returnValue.headPic);
					}					
					if(data.returnValue.grade == '') {
						$this.find('.content .content-head .item-grade').css('visibility','hidden');
						$this.find('.content .content-head .item-grade').text('');
					} else {
						$this.find('.content .content-head .item-grade').css('visibility','initial');
						$this.find('.content .content-head .item-grade').text(data.returnValue.grade);
					}
				} else {
					$this.find('.bar-nav .title').text('游客');
					$this.find('.content .item-content .s-pointDiv').addClass('hide');
					$this.find('.content .item-content .s-couponDiv').addClass('hide');
					$this.find('.content .item-content .j-signIn').addClass('hide');
					$this.find('.content .item-content .headPic').attr('src', '../img/defaultBG.png');
				}
			}
		});
	});
	///会员签到
	$("#personalInfo").find('.content .item-content .j-signIn').bind('click', function() {
		setting.needToken = true;
		var data = {};
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			$.redirectLogin('../login/index.html', window.location.href);
		}
		data.memberId = pageLocalStorage.getItem('memberId');
		$.ajax({
			url: $.baseApi + "point/signIn",
			type: "POST",
			dataType: "json",
			cache: false,
			data: data,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					$("#personalInfo").find('.content .item-content .s-pointDiv .p-total').text(data.returnValue.totalPoint);
					$.toast(data.returnValue.tipInfo);
				} else {
					if(data.errorCode == 1001) {
						$.redirectLogin('../login/index.html', window.location.href, 'token失效，重新登陆');
					} else {
						$.toast(data.errorReason);
					}
				}
			}
		});
	});
	//上拉加载事件
	$(document).on("pageInit", "#topBar-page", function(e, id, page) {
		//销毁下拉刷新
		$.destroyPullToRefresh($(page).find(".pull-to-refresh-content"));
		$(page).find(".infinite-scroll").on('infinite', function(e) {
			//上拉加载
			if(isLoding)
				return;
			isLoding = true;
			isFrist = false;
			var $this = $(this);
			if(pageNum > totalPage) {
				$.toast('暂无更多');
				return;
			}
			loadChooseList();
		});
	});
	//详情过度页面
	$(document).on("pageInit", "#tobPage-page", function(e, id, page) {
		///加载详情的值
		if($.getUrlParam('isPush') == 'true') {
			var datailContent = activityDetails();
				if($.isEmptyObject(datailContent) || datailContent == '') return;
				var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG2', 'menu_bespokeBG1');
				$('#wheel1').find('.j-bespokeBtn img').attr('src', iconBG);
				$('#wheel1').find('.j-bespokeBtn a').attr('href', 'javascript:;');
				$('#wheel1').find('.j-telphoneBtn a').attr('href', 'tel:' + datailContent.phone);
				$('#j-DetailsContent').find('.content-head .btnsDiv1').removeClass('hide');
				$('#j-DetailsContent').find('.content-head .btnsDiv2').addClass('hide');
				$('#j-DetailsTitle').text(datailContent.name);
				$('#j-DetailsContent>img').attr('src', datailContent.backGround);
				$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').addClass('min-txtsize');
				if($.isEmptyObject(datailContent.logo) || datailContent.logo == '') {
					$('#j-DetailsContent').find('.content-head .pull-left').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingLeft-0');
				} else {
					$('#j-DetailsContent').find('.content-head .logo').attr('src', datailContent.logo);
					$('#j-DetailsContent').find('.content-head .pull-left').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('paddingLeft-0');
				}
				$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt1').text(datailContent.name);
				if(datailContent.shopsId == '') {
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('threeTxt');
					$('#j-DetailsContent').find('.content-head .icon-white-room').addClass('hide');
					$('#j-DetailsContent').find('.content-head .icon-white-txt').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .icon-white-txt').closest('.external').attr('href', 'details.html?isPush=true&shopsId=');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('oneIcon');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('适用门店：' + datailContent.shopsDesc);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').text('活动时间：' + datailContent.beginDate.replaceAll('-', '.') + '至' + datailContent.endDate.replaceAll('-', '.'));
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').removeClass('hide');
				} else {
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('threeTxt');
					$('#j-DetailsContent').find('.content-head .icon-white-room').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .icon-white-txt').closest('.external').attr('href', 'details.html?isPush=true&shopsId=');
					$('#j-DetailsContent').find('.content-head .icon-white-room').closest('.external').attr('href', 'details.html?isPush=true&shopsId=' + datailContent.shopsId);
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('oneIcon');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('位置：' + datailContent.shopsDesc);
				}
		} else {
			switch(pageLocalStorage.getItem('detailTab')) {
				case '#activityTab':
					var datailContent = activityDetails();
					if($.isEmptyObject(datailContent) || datailContent == '') return;
					var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG2', 'menu_bespokeBG1');
					$('#wheel1').find('.j-bespokeBtn img').attr('src', iconBG);
					$('#wheel1').find('.j-bespokeBtn a').attr('href', 'javascript:;');
					$('#wheel1').find('.j-telphoneBtn a').attr('href', 'tel:' + datailContent.phone);
					$('#j-DetailsContent').find('.content-head .btnsDiv1').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .btnsDiv2').addClass('hide');
					$('#j-DetailsTitle').text(datailContent.name);
					$('#j-DetailsContent>img').attr('src', datailContent.backGround);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').addClass('min-txtsize');
					if($.isEmptyObject(datailContent.logo) || datailContent.logo == '') {
						$('#j-DetailsContent').find('.content-head .pull-left').addClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingLeft-0');
					} else {
						$('#j-DetailsContent').find('.content-head .logo').attr('src', datailContent.logo);
						$('#j-DetailsContent').find('.content-head .pull-left').removeClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('paddingLeft-0');
					}
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt1').text(datailContent.name);
					if(datailContent.shopsId == '') {
						$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('threeTxt');
						$('#j-DetailsContent').find('.content-head .icon-white-room').addClass('hide');
						$('#j-DetailsContent').find('.content-head .icon-white-txt').removeClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('oneIcon');
						$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('适用门店：' + datailContent.shopsDesc);
						$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').text('活动时间：' + datailContent.beginDate.replaceAll('-', '.') + '至' + datailContent.endDate.replaceAll('-', '.'));
						$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').removeClass('hide');
					} else {
						$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('threeTxt');
						$('#j-DetailsContent').find('.content-head .icon-white-room').removeClass('hide');
						$('#j-DetailsContent').find('.content-head .icon-white-room').closest('.external').attr('href', 'details.html?shopsId=' + datailContent.shopsId);
						$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('oneIcon');
						$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').addClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('位置：' + datailContent.shopsDesc);
					}
					break;
				case '#finefoodTab':
					var datailContent = fineDoodDetails();
					if($.isEmptyObject(datailContent) || datailContent == '') return;
					var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG2', 'menu_bespokeBG1');
					$('#wheel1').find('.j-bespokeBtn img').attr('src', iconBG);
					$('#wheel1').find('.j-bespokeBtn a').attr('href', 'javascript:;');
					$('#wheel1').find('.j-telphoneBtn a').attr('href', 'tel:+' + datailContent.phone);
					$('#j-DetailsContent').find('.content-head .btnsDiv1').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .btnsDiv2').addClass('hide');
					$('#j-DetailsTitle').text(datailContent.shopsName);
					$('#j-DetailsContent>img').attr('src', datailContent.backgroundPic);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').addClass('min-txtsize');
					if($.isEmptyObject(datailContent.brandLogo) || datailContent.brandLogo == '') {
						$('#j-DetailsContent').find('.content-head .pull-left').addClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingLeft-0');
					} else {
						$('#j-DetailsContent').find('.content-head .logo').attr('src', datailContent.brandLogo);
						$('#j-DetailsContent').find('.content-head .pull-left').removeClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('paddingLeft-0');
					}
					var businessTime = datailContent.businessTime.name == undefined ? '' : datailContent.businessTime.name;
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('threeTxt');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingRight');
					$('#j-DetailsContent').find('.content-head .icon-white-txt').addClass('hide');
					$('#j-DetailsContent').find('.content-head .icon-white-room').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('oneIcon');
					$('#j-DetailsContent').find('.content-head .icon-white-room').closest('.external').attr('href', 'details.html?shopsId=' + datailContent.id);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt1').text('营业时间：' + businessTime);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('人均消费：' + datailContent.avgprice + '（RBM）');
					break;
				case '#shopTab':
					var datailContent = fineDoodDetails();
					if($.isEmptyObject(datailContent) || datailContent == '') return;
					var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG2', 'menu_bespokeBG1');
					$('#wheel1').find('.j-bespokeBtn img').attr('src', iconBG);
					$('#wheel1').find('.j-bespokeBtn a').attr('href', 'javascript:;');
					$('#wheel1').find('.j-telphoneBtn a').attr('href', 'tel:' + datailContent.phone);
					$('#j-DetailsContent').find('.content-head .btnsDiv1').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .btnsDiv2').addClass('hide');
					$('#j-DetailsTitle').text(datailContent.shopsName);
					$('#j-DetailsContent>img').attr('src', datailContent.backgroundPic);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').addClass('min-txtsize');
					if($.isEmptyObject(datailContent.brandLogo) || datailContent.brandLogo == '') {
						$('#j-DetailsContent').find('.content-head .pull-left').addClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingLeft-0');
					} else {
						$('#j-DetailsContent').find('.content-head .logo').attr('src', datailContent.brandLogo);
						$('#j-DetailsContent').find('.content-head .pull-left').removeClass('hide');
						$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('paddingLeft-0');
					}
					var businessTime = datailContent.businessTime.name == undefined ? '' : datailContent.businessTime.name;
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('threeTxt');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingRight');
					$('#j-DetailsContent').find('.content-head .icon-white-txt').addClass('hide');
					$('#j-DetailsContent').find('.content-head .icon-white-room').removeClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('oneIcon');
					$('#j-DetailsContent').find('.content-head .icon-white-room').closest('.external').attr('href', 'details.html?shopsId=' + datailContent.id);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt1').text(datailContent.shopsName);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('营业时间：' + businessTime);
					break;
				case '#yuleTab':
					var datailContent = yuleDetails();
					if($.isEmptyObject(datailContent) || datailContent == '') return;
					if(datailContent.canReserve=='0'){
						var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG1', 'menu_bespokeBG2');
						$('#wheel1').find('.j-bespokeBtn a').attr('href', 'bespoke.html');
					}else{
						var iconBG = $('#wheel1').find('.j-bespokeBtn img').attr('src').replace('menu_bespokeBG2', 'menu_bespokeBG1');
						$('#wheel1').find('.j-bespokeBtn a').attr('href', 'javascript:;');
					}
					$('#wheel1').find('.j-bespokeBtn img').attr('src', iconBG);
					$('#wheel1').find('.j-telphoneBtn a').attr('href', 'tel:' + datailContent.shop.contactNumber);
					$('#j-DetailsContent').find('.content-head .btnsDiv1').addClass('hide');
					$('#j-DetailsContent').find('.content-head .btnsDiv2').removeClass('hide');
					$('#j-DetailsContent>img').attr('src', datailContent.shop.shopBackgroundPic);
					$('#j-DetailsTitle').text(datailContent.name);
					$('#j-DetailsContent').find('.content-head .pull-left').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').addClass('paddingLeft-0');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt3').addClass('hide');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').removeClass('min-txtsize');
					$('#j-DetailsContent').find('.content-head .s-centerDiv').removeClass('threeTxt');
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt1').text('营业时间：' + datailContent.businessHours.name);
					$('#j-DetailsContent').find('.content-head .s-centerDiv .s-txt2').text('预约费用：' + datailContent.price + '元');
					break;
			}
		}
		//menu 点击事件
		$(page).on('click', '#j-whMenu1', function() {
			var d = 0;
			var $this = $(this);
			var $jWHMenuEle = $($this.attr('data-href'));
			if($jWHMenuEle.hasClass('hide')) {
				$jWHMenuEle.removeClass('hide');
				$jWHMenuEle.find('.item').each(function(index, item) {
					var param = $(item).attr('data-param').split(',');
					$(item).animateRotate(360).css({
						position: 'absolute',
						opacity: 0,
						left: "43%",
						top: "25%"
					}).delay(d).animate({
						opacity: 1,
						left: param[0],
						top: param[1]
					}, 500);
					d += 50;
				});
			} else {
				var d = 0;
				$($jWHMenuEle.find('.item').get().reverse()).each(function() {
					$(this).animateRotate(-360).delay(d).animate({
						opacity: 0,
						left: "41%",
						top: "20%"
					}, 150);
					d += 15;
				}).promise().done(function() {
					$jWHMenuEle.addClass('hide');
				});
			}
		});
	});
	//详情加载
	$(document).on("pageInit", "#detail-page", function(e, id, page) {
		if($.getUrlParam('shopsId') != '') {
			$(page).find('.bar-nav h1.title').text('店铺详情');
			$(page).find('.j-activityDiv').addClass('hide');
			$(page).find('.j-shopDiv').removeClass('hide');
			$.ajax({
				url: $.baseApi + "shops/getShops?shopsId=" + $.getUrlParam('shopsId'),
				type: "GET",
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$(page).find('.content .topDiv .bg').attr('src', data.returnValue.pic);
						$(page).find('.content .topDiv-bottom .logo').attr('src', data.returnValue.brandLogo);
						$(page).find('.content .topDiv-bottom .s-centerDiv .s-txt1').text(data.returnValue.shopsName);
						$(page).find('.content .topDiv-bottom .s-centerDiv .s-txt2').text(data.returnValue.introduction);
						$(page).find('.j-shopDiv .divContent').html(data.returnValue.description);
					} else {
						$.toast(data.errorReason);
					}
				}
			});
		} else {
			var datailContent = null;
			if($.getUrlParam('isPush') == 'true') {
				datailContent = activityDetails();
			}else{
				switch(pageLocalStorage.getItem('detailTab')) {
					case '#activityTab':
						datailContent = activityDetails();
						break;
					case '#finefoodTab':
					case '#shopTab':
						datailContent = fineDoodDetails();
						break;
					case '#yuleTab':
						datailContent = yuleDetails();
						break;
				}
			}
			$(page).find('.bar-nav h1.title').text('活动详情');
			$(page).find('.j-activityDiv').removeClass('hide');
			$(page).find('.j-shopDiv').addClass('hide');
			$(page).find('.j-activityDiv .s-introDiv .dateDiv .pull-right').text(datailContent.beginDate.replaceAll('-', '.') + '至' + datailContent.endDate.replaceAll('-', '.'));
			$(page).find('.j-activityDiv .s-introDiv .localDiv .pull-right').text(datailContent.shopsDesc);
			$(page).find('.content .topDiv .bg').attr('src', datailContent.picture);
			$(page).find('.content .topDiv .logo').attr('src', datailContent.logo);
			$(page).find('.j-activityDiv .divContent').text(datailContent.details);
			$(page).find('.content .topDiv-bottom .s-centerDiv .s-txt1').text(datailContent.shopsName);
			$(page).find('.content .topDiv-bottom .s-centerDiv .s-txt2').text(datailContent.content);
		}
	});
	///预约规则和项目详情
	$(document).on("pageInit", "#ruleAndIntro-page", function(e, id, page) {
		var datailContent = yuleDetails();
		if($.isEmptyObject(datailContent) || datailContent == '') return;
		if($.getUrlParam('type') == '1') {
			$(page).find('.bar-nav h1.title').text('项目详情');
			$(page).find('.content .divContent').text(datailContent.introduction);
		} else {
			$(page).find('.bar-nav h1.title').text('预约规则');
			$(page).find('.content .divContent').text(datailContent.orderNotice);
		}
	});
	///项目预约
	$(document).on("pageInit", "#bespoke-page", function(e, id, page) {
		var datailContent = yuleDetails();
		var isCanReserve = true;
		if($.isEmptyObject(datailContent) || datailContent == '') return;
		var unitPrice = datailContent.price;
		var recreationId = datailContent.id;
		if(datailContent.canReserve=='0'){
			isCanReserve = true;
		}else{
			isCanReserve = false;
		}
		$(page).find('.s-bespokeDiv .orderName .pull-right').text(datailContent.name);
		$(page).find('.s-bespokeDiv .orderPrice .j-unitPrice').text(currency(datailContent.price, 2, false));
		$(page).find('.bottomInfo .j-orderTotal').text(currency(datailContent.price, 2, false));
		$(page).on('click', '.j-decrease', function() {
			var val = parseInt($(page).find('.j-inputVal').text());
			val = val - 1;
			if(val == 0) {
				val = 1;
				$.toast('购买数量不能为0');
			} else {
				$(page).find('.j-inputVal').text(val);
			}
			$(page).find('.bottomInfo .j-orderTotal').text(currency(val * unitPrice, 2, false));
		});
		$(page).on('click', '.j-increase', function() {
			var val = parseInt($(page).find('.j-inputVal').text());
			val = val + 1;
			$(page).find('.j-inputVal').text(val);
			$(page).find('.bottomInfo .j-orderTotal').text(currency(val * unitPrice, 2, false));
		});
		$(page).on('click', '.j-btnPost', function() {
			if($.isEmptyObject(pageLocalStorage.getItem('memberId'))) {
				$.redirectLogin('../../login/index.html', window.location.href);
			}
			setting.needToken = true;
			var data = {
				recreationId: recreationId,
				number: parseInt($(page).find('.j-inputVal').text()),
				memberId: pageLocalStorage.getItem('memberId')
			}
			$.ajax({
				url: $.baseApi + "recreation/appoint",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.errorCode == 1001) {
						$.redirectLogin('../../login/index.html', window.location.href, 'token失效，重新登陆');
					} else {
						$.toast(data.errorReason);
					}
				}
			});
		});
	});
	$.init();
	var slideIndex = 0;
	if(pageLocalStorage.getItem('detailTab') != null) {
		$.each($('#j-barSwiper').find('.swiper-slide'), function(j, item) {
			if(pageLocalStorage.getItem('detailTab') == $(item).attr('href').trim()) {
				slideIndex = j;
				return false;
			}
		});
	}
	$('#j-barSwiper').swiper({
		slidesPerView: 3,
		centeredSlides: true,
		paginationClickable: true,
		spaceBetween: -15,
		onInit: function(swiper) {
			//初始化
			swiper.slideTo(slideIndex, 1000, false);
			pageLocalStorage.setItem('detailTab', $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim());
			pageNum = 1;
			totalPage = 1;
			searchFilter = searchKeyword = '';
			isFrist = true;
			$("body, html").scrollTop(0);
			loadChooseList();
		},
		onTap: function(swiper) {
			//初始化
			swiper.slideTo(swiper.clickedIndex, 1000, false);
			pageLocalStorage.setItem('detailTab', $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim());
			pageNum = 1;
			totalPage = 1;
			searchFilter = searchKeyword = '';
			isFrist = true;
			$("body, html").scrollTop(0);
			loadChooseList();
		},
		onSlideChangeEnd: function(swiper) {
			//初始化
			pageLocalStorage.setItem('detailTab', $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim());
			pageNum = 1;
			totalPage = 1;
			searchFilter = searchKeyword = '';
			isFrist = true;
			$("body, html").scrollTop(0);
			loadChooseList();
		}
	});
	//根据tab选择方法
	function loadChooseList() {
		if(pageLocalStorage.getItem('detailTab') == '#vrRoomTab') {
			$('#mainSearch').addClass('hide');
		} else {
			$('#mainSearch').removeClass('hide');
		}
		$('#topBar-page').find('.content .tabs .tab').removeClass('active');
		$(pageLocalStorage.getItem('detailTab')).addClass('active');
		switch(pageLocalStorage.getItem('detailTab')) {
			case '#activityTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip activityBG');
				getActivityList();
				break;
			case '#finefoodTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip finefoodBG');
				getFineFoodList();
				break;
			case '#yuleTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip yuleBG');
				getYuleList();
				break;
			case '#shopTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip shopBG');
				getShopList();
				break;
			case '#couponTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip couponBG');
				getCouponList();
				break;
			case '#vrRoomTab':
				$('#topBar-page').find('.centerTip').attr('class', 'centerTip vrRoomBG');
				getVRRoomList();
				break;
		}
	}
	//根据tab选择筛选条件
	function loadChoosefilter() {
		switch(pageLocalStorage.getItem('detailTab')) {
			case '#activityTab':
				filterActivity();
				break;
			case '#finefoodTab':
				filterFineFood();
				break;
			case '#yuleTab':
				filterYule();
				break;
			case '#shopTab':
				filterShop();
				break;
			case '#couponTab':
				filterCoupon();
				break;
		}
	}
	///推荐精彩活动列表
	function loadRecommend() {
		var rList = $('#j-recommend').find('.content .list');
		rList.find('.card').not('.templet').remove();
		$.ajax({
			url: $.baseApi + 'favorable/getByTypeAndFloor',
			type: 'GET',
			dataType: 'json',
			data: {
				pageNum: 1,
				pageSize: -1,
				isPush: 'true'
			},
			cache: false,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.list)) {
						$('#j-recommend').find('.j-noRecord').addClass('hide');
						$.each(data.returnValue.list, function(index, item) {
							var ele = rList.find('.card.templet').clone(true).removeClass('templet');
							ele.attr('data-id', item.id);
							var pic = '';
							if(item.pictures.split(',').length > 1){
								pic= item.pictures.split(',')[0];
							}else{
								pic = item.pictures;
							}
							ele.find('.card-header .card-cover').attr('src', pic);
							ele.find('.card-footer .name').text(item.name);
							rList.append(ele);
						});
					} else {
						$('#j-recommend').find('.j-noRecord').removeClass('hide');
					}
				} else {
					$.toast(data.errorReason);
					//$('#j-recommend').find('.j-noRecord').removeClass('hide');
				}
			}
		});
	}
	///加载精彩活动列表
	function getActivityList() {
		var list = $('#activityTab').find('.list-block ul');
		if(isFrist) {
			list.find('.item-content').not('.templet').remove();
		}
		var urlParam = '?pageNum=' + pageNum + '&pageSize=' + pageSize + '&keyWord=' + searchKeyword + searchFilter;
		$.ajax({
			url: $.baseApi + 'favorable/getByTypeAndFloor' + urlParam,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				isLoding = false;
				var imgLength = 0;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.list)) {
						$.each(data.returnValue.list, function(index, item) {
							if(isFrist && index == 0) {
								$('#activitySwiper').remove();
								var startHtml= '<div id="activitySwiper" onclick="setDetailsId(this)" data-id="'+ item.id +'" class="swiper-container"><div class="swiper-wrapper">'
								var endtHtml='</div><div class="swiper-bottom"><div class="item-maskBG"><div class="maskBG"></div></div><div class="item-bottom"><div class="icon-itemTip pull-left"><img src="" /></div><div class="rightDiv"><div class="item-subtitle itemTxt1"></div><div class="item-subtitle itemTxt2 min-txtsize"></div><div class="item-subtitle itemTxt3 min-txtsize"></div></div></div></div></div>';
								var swiperHtml = '';
								imgLength = item.pictures.split(',').length;
								$.each(item.pictures.split(','), function(i, itemi) {
									swiperHtml += '<div class="swiper-slide"><img class="item-shadowImg" src="' + itemi + '" /></div>';
								});
								list.before(startHtml+swiperHtml+endtHtml);
								/*var swiperList = $('#activitySwiper').find('.swiper-wrapper');
								$('#activitySwiper').attr('data-id', item.id);
								swiperList.empty();
								var swiperHtml = '';
								imgLength = item.pictures.split(',').length;
								$.each(item.pictures.split(','), function(i, itemi) {
									swiperHtml += '<div class="swiper-slide"><img class="item-shadowImg" src="' + itemi + '" /></div>';
									//var swiperItem = swiperList.find('.swiper-slide.templet').clone().removeClass('templet');
									//swiperItem.find('img').attr('src', itemi);
								});
								swiperList.append(swiperHtml);*/
								$('#activitySwiper').find('.swiper-bottom .item-bottom .icon-itemTip img').attr('src', item.brandLogo);
								$('#activitySwiper').find('.swiper-bottom .item-bottom .itemTxt1').text(item.name);
								$('#activitySwiper').find('.swiper-bottom .item-bottom .itemTxt2').text('适用门店：' + item.shops);
								$('#activitySwiper').find('.swiper-bottom .item-bottom .itemTxt3').text('活动时间：' + item.beginTime + '至' + item.endTime);
							} else {
								var ele = list.find('.item-content.templet').clone(true).removeClass('templet');
								ele.find('.item-inner').attr('data-id', item.id);
								ele.find('.item-inner .item-shadowImg').attr('src', item.pictures);
								ele.find('.item-inner .item-bottom .icon-itemTip img').attr('src', item.brandLogo);
								ele.find('.item-inner .item-bottom .itemTxt1').text(item.name);
								ele.find('.item-inner .item-bottom .itemTxt2').text('适用门店：' + item.shops);
								ele.find('.item-inner .item-bottom .itemTxt3').text('活动时间：' + item.beginTime + '至' + item.endTime);
								list.append(ele);
							}
						});
						$('#activityTab').find('.j-noRecord').addClass('hide');
					} else {
						if(isFrist) {
							$('#activityTab').find('.j-noRecord').removeClass('hide');
							$('#activitySwiper').remove();
						} else {
							$.toast('无数据');
							$('#activityTab').find('.j-noRecord').addClass('hide');
						}
					}
					totalPage = data.returnValue.totalPage;
					pageNum = data.returnValue.pageNum + 1;
					if(pageNum > totalPage) {
						$('#activityTab').find('.infinite-scroll-preloader').addClass('hide');
					} else {
						$('#activityTab').find('.infinite-scroll-preloader').removeClass('hide');
					}
					if(isFrist) {
						if(imgLength>1){
							$('#activitySwiper').swiper({
								paginationClickable: true,
								spaceBetween: 0,
								autoplay: 5000,
								lazyLoading: true,
								onTap: function(swiper) {}
							});
						}else{
							$('#activitySwiper').swiper({
								paginationClickable: true,
								spaceBetween: 0,
								lazyLoading: true,
								onTap: function(swiper) {}
							});
						}
					}
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载精彩活动筛选条件
	function filterActivity() {
		var list = $('#serach-page').find('.serach-list');
		list.find('.serach-item').not('.templet').remove();
		$.ajax({
			url: $.baseApi + "favorable/getTypeAndFloor",
			type: "GET",
			dataType: "json",
			cache: false,
			success: function(data) {
				isLoding = false;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.typeList)) {
						var ele = list.find('.serach-item.templet').clone().removeClass('templet');
						ele.attr('name', 'type');
						ele.find('.item-title').text('分类');
						var nameHtml = '';
						$.each(data.returnValue.typeList, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					if(!$.isEmptyObject(data.returnValue.floorList)) {
						var ele = list.find('.serach-item.templet').clone(true).removeClass('templet');
						ele.attr('name', 'floor');
						ele.find('.item-title').text('楼层');
						var nameHtml = '';
						$.each(data.returnValue.floorList, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					initSerchItemClick();
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载娱乐列表
	function getYuleList() {
		var list = $('#yuleTab').find('.list-block ul');
		if(isFrist) {
			list.find('.item-content').not('.templet').remove();
		}
		//var urlParam = '?pageNum=' + pageNum + '&pageSize=' + pageSize + '&recreationName=' + searchKeyword + searchFilter;
		if(isKey){
			var urlParam = '?pageNum=' + pageNum + '&pageSize=' + pageSize + '&recreationName=' + searchKeyword + searchFilter;
		}else{
			var urlParam = '?pageNum=' + pageNum + '&pageSize=' + pageSize  + searchFilter;
		}
		$.ajax({
			url: $.baseApi + 'recreation/getRecreations' + urlParam,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				isLoding = false;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.recordList)) {
						$.each(data.returnValue.recordList, function(index, item) {
							var ele = list.find('.item-content.templet').clone(true).removeClass('templet');
							ele.find('.item-inner').attr('data-id', item.id);
							ele.find('.item-inner .item-shadowImg').attr('src', item.pic);
							ele.find('.item-inner .item-bottom .itemTxt1').text(item.name);
							ele.find('.item-inner .item-bottom .itemTxt2').text(item.introduction);
							list.append(ele);
						});
						$('#yuleTab').find('.j-noRecord').addClass('hide');
					} else {
						if(isFrist) {
							$('#yuleTab').find('.j-noRecord').removeClass('hide');
						} else {
							$.toast('无数据');
							$('#yuleTab').find('.j-noRecord').addClass('hide');
						}
					}
					totalPage = data.returnValue.totalPage;
					pageNum = data.returnValue.pageNum + 1;
					if(pageNum > totalPage) {
						$('#yuleTab').find('.infinite-scroll-preloader').addClass('hide');
					} else {
						$('#yuleTab').find('.infinite-scroll-preloader').removeClass('hide');
					}
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载娱乐筛选条件
	function filterYule() {
		var list = $('#serach-page').find('.serach-list');
		list.find('.serach-item').not('.templet').remove();
		$.ajax({
			url: $.baseApi + "recreation/getFilter",
			type: "GET",
			dataType: "json",
			cache: false,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.name)) {
						var ele = list.find('.serach-item.templet').clone().removeClass('templet');
						ele.attr('name', 'recreationName');
						ele.find('.item-title').text('娱乐项目');
						var nameHtml = '';
						$.each(data.returnValue.name, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item + '" class="col-25 button item-color button-middle j-itemBtn">' + item + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					if(!$.isEmptyObject(data.returnValue.age)) {
						var ele = list.find('.serach-item.templet').clone(true).removeClass('templet');
						ele.attr('name', 'age');
						ele.find('.item-title').text('适合年龄');
						var nameHtml = '';
						$.each(data.returnValue.age, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					initSerchItemClick();
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载优惠劵列表
	function getCouponList() {
		var list = $('#couponTab').find('.list-block ul');
		if(isFrist) {
			list.find('.item-content').not('.templet').remove();
		}
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			setting.needToken = false;
			var urlParam = '?pageNum=' + pageNum + '&pageSize=10' + '&shopsName=' + searchKeyword + searchFilter;
		} else {
			setting.needToken = true;
			var urlParam = '?pageNum=' + pageNum + '&pageSize=10' + '&shopsName=' + searchKeyword + searchFilter;
			urlParam = urlParam + '&memberId=' + pageLocalStorage.getItem('memberId');
		}
		$.ajax({
			url: $.baseApi + 'coupon/getList' + urlParam,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				isLoding = false;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.couponList)) {
						$.each(data.returnValue.couponList, function(index, item) {
							var ele = list.find('.item-content.templet').clone(true).removeClass('templet');
							if(item.usable == '1') {
								ele.find('.item-inner').addClass('get');
							} else {
								ele.find('.item-inner').addClass('over');
							}
							ele.find('.item-inner').attr('couponType', item.couponType);
							ele.find('.item-inner').attr('couponId', item.id);
							//代金券
							if(item.couponType == '0') {
								ele.find('.item-inner .coupon1-txt').addClass('hide');
								ele.find('.item-inner .coupon2-txt').addClass('hide');
								ele.find('.item-inner .coupon0-txt').removeClass('hide');
								ele.find('.item-inner .coupon0-txt .cou-par').text(item.par);
								if($.trim(item.quota) == '') {
									ele.find('.item-inner .coupon0-txt .cou-quota').addClass('hide');
								} else {
									ele.find('.item-inner .coupon0-txt .cou-quota').text('(满¥' + item.quota + '元适用)');
									ele.find('.item-inner .coupon0-txt .cou-quota').removeClass('hide');
								}
							} else if(item.couponType == '1') { //折扣券
								ele.find('.item-inner .coupon0-txt').addClass('hide');
								ele.find('.item-inner .coupon2-txt').addClass('hide');
								ele.find('.item-inner .coupon1-txt').removeClass('hide');
								ele.find('.item-inner .coupon1-txt .cou-name').text('折扣卷');
								ele.find('.item-inner .coupon1-txt .cou-par').text(item.discountValue);
							} else if(item.couponType == '2') { //礼品券
								ele.find('.item-inner .coupon0-txt').addClass('hide');
								ele.find('.item-inner .coupon1-txt').addClass('hide');
								ele.find('.item-inner .coupon2-txt').removeClass('hide');
								ele.find('.item-inner .coupon2-txt .cou-name').text('礼品券');
							}
							ele.find('.item-inner .shop-name').text(item.shops);
							if(item.expiryType=='0'){
								ele.find('.item-inner .time-txt').text(item.beginDate + '至' + item.endDate);
							}else{
								ele.find('.item-inner .time-txt').closest('.min-txtsize').css('visibility','hidden');
							}
							getCoupon(ele);
							list.append(ele);
						});
						$('#couponTab').find('.j-noRecord').addClass('hide');
					} else {
						if(isFrist) {
							$('#couponTab').find('.j-noRecord').removeClass('hide');
						} else {
							$.toast('无数据');
							$('#couponTab').find('.j-noRecord').addClass('hide');
						}
					}
					totalPage = data.returnValue.totalPage;
					pageNum = data.returnValue.pageNum + 1;
					if(pageNum > totalPage) {
						$('#couponTab').find('.infinite-scroll-preloader').addClass('hide');
					} else {
						$('#couponTab').find('.infinite-scroll-preloader').removeClass('hide');
					}
				} else {
					if(data.errorCode == 1001) {
						pageLocalStorage.removeItem('memberId');
						pageLocalStorage.removeItem('token');
						getCouponList();
						isFrist = true;
						totalPage = 1;
						pageNum = 1;
					} else {
						$.toast(data.errorReason);
					}
				}
			}
		});
	}
	///加载优惠劵筛选条件
	function filterCoupon() {
		var list = $('#serach-page').find('.serach-list');
		list.find('.serach-item').not('.templet').remove();
		$.ajax({
			url: $.baseApi + "coupon/getCouponFilter",
			type: "GET",
			dataType: "json",
			cache: false,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.shopsTypeList)) {
						var ele = list.find('.serach-item.templet').clone(true).removeClass('templet');
						ele.attr('name', 'shopsType');
						ele.find('.item-title').text('分类');
						var nameHtml = '';
						$.each(data.returnValue.shopsTypeList, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					if(!$.isEmptyObject(data.returnValue.typeList)) {
						var ele = list.find('.serach-item.templet').clone().removeClass('templet');
						ele.attr('name', 'couponType');
						ele.find('.item-title').text('优惠劵类型');
						var nameHtml = '';
						$.each(data.returnValue.typeList, function(index, item) {
							var txt = '';
							switch(item) {
								case '0':
									txt = '代金券';
									break;
								case '1':
									txt = '折扣券';
									break;
								case '2':
									txt = '礼品券';
									break;
							}
							nameHtml = nameHtml + '<div data-id="' + item + '" class="col-25 button item-color button-middle j-itemBtn">' + txt + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					initSerchItemClick();
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载领取优惠劵事件
	function getCoupon(ele) {
		$(ele).bind('click', function() {
			var $this = $(this);
			setting.needToken = true;
			if($this.find('.item-inner').hasClass('over')) return;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html', window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				couponId: $this.find('.item-inner').attr('couponId')
			}
			$.ajax({
				url: $.baseApi + "coupon/getCoupon",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$.toast("领取成功");
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html', window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
							$this.find('.item-inner').removeClass('get');
							$this.find('.item-inner').addClass('over');
						}
					}
				}
			});
		});
	}
	//加载美食汇列表
	function getFineFoodList() {
		var list = $('#finefoodTab').find('.list-block ul');
		if(isFrist) {
			list.find('.item-content').not('.templet').remove();
		}
		var urlParam = '?classId=FOODS&pageNo=' + pageNum + '&pageSize=' + pageSize + '&shopsName=' + searchKeyword + searchFilter;
		$.ajax({
			url: $.baseApi + 'shops/getShopsPage' + urlParam,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				isLoding = false;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.list)) {
						$.each(data.returnValue.list, function(index, item) {
							var ele = list.find('.item-content.templet').clone(true).removeClass('templet');
							ele.find('.item-inner').attr('data-id', item.id);
							ele.find('.item-inner .item-shadowImg').attr('src', item.pic);
							ele.find('.item-inner .item-bottom .icon-itemTip img').attr('src', item.brandLogo);
							ele.find('.item-inner .item-bottom .itemTxt1').text(item.shopsName);
							ele.find('.item-inner .item-bottom .itemTxt2').text(item.introduction);
							list.append(ele);
						});
						$('#finefoodTab').find('.j-noRecord').addClass('hide');
					} else {
						if(isFrist) {
							$('#finefoodTab').find('.j-noRecord').removeClass('hide');
						} else {
							$.toast('无数据');
							$('#finefoodTab').find('.j-noRecord').addClass('hide');
						}
					}
					totalPage = data.returnValue.totalPage;
					pageNum = data.returnValue.pageNo + 1;
					if(pageNum > totalPage) {
						$('#finefoodTab').find('.infinite-scroll-preloader').addClass('hide');
					} else {
						$('#finefoodTab').find('.infinite-scroll-preloader').removeClass('hide');
					}
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载美食汇筛选条件
	function filterFineFood() {
		var list = $('#serach-page').find('.serach-list');
		list.find('.serach-item').not('.templet').remove();
		$.ajax({
			url: $.baseApi + "shops/getShopsFilter?classId=FOODS",
			type: "GET",
			dataType: "json",
			cache: false,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.filter)) {
						var ele = list.find('.serach-item.templet').clone().removeClass('templet');
						ele.attr('name', 'filterId');
						ele.find('.item-title').text('菜系');
						var nameHtml = '';
						$.each(data.returnValue.filter, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					if(!$.isEmptyObject(data.returnValue.floor)) {
						var ele = list.find('.serach-item.templet').clone(true).removeClass('templet');
						ele.attr('name', 'floorId');
						ele.find('.item-title').text('楼层');
						var nameHtml = '';
						$.each(data.returnValue.floor, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					initSerchItemClick();
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	//加载购物达人列表
	function getShopList() {
		var list = $('#shopTab').find('.list-block ul');
		if(isFrist) {
			list.find('.item-content').not('.templet').remove();
		}
		var urlParam = '?classId=SHOPPING&pageNo=' + pageNum + '&pageSize=' + pageSize + '&shopsName=' + searchKeyword + searchFilter;
		$.ajax({
			url: $.baseApi + 'shops/getShopsPage' + urlParam,
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function(data) {
				isLoding = false;
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.list)) {
						$.each(data.returnValue.list, function(index, item) {
							var ele = list.find('.item-content.templet').clone(true).removeClass('templet');
							ele.find('.item-inner').attr('data-id', item.id);
							ele.find('.item-inner .item-shadowImg').attr('src', item.pic);
							ele.find('.item-inner .item-bottom .icon-itemTip img').attr('src', item.brandLogo);
							ele.find('.item-inner .item-bottom .itemTxt1').text(item.shopsName);
							ele.find('.item-inner .item-bottom .itemTxt2').text(item.introduction);
							list.append(ele);
						});
						$('#shopTab').find('.j-noRecord').addClass('hide');
					} else {
						if(isFrist) {
							$('#shopTab').find('.j-noRecord').removeClass('hide');
						} else {
							$.toast('无数据');
							$('#shopTab').find('.j-noRecord').addClass('hide');
						}
					}
					totalPage = data.returnValue.totalPage;
					pageNum = data.returnValue.pageNo + 1;
					if(pageNum > totalPage) {
						$('#shopTab').find('.infinite-scroll-preloader').addClass('hide');
					} else {
						$('#shopTab').find('.infinite-scroll-preloader').removeClass('hide');
					}
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载购物达人筛选条件
	function filterShop() {
		var list = $('#serach-page').find('.serach-list');
		list.find('.serach-item').not('.templet').remove();
		$.ajax({
			url: $.baseApi + "shops/getShopsFilter?classId=SHOPPING",
			type: "GET",
			dataType: "json",
			cache: false,
			success: function(data) {
				$.hidePreloader();
				if(data.success) {
					if(!$.isEmptyObject(data.returnValue.filter)) {
						var ele = list.find('.serach-item.templet').clone().removeClass('templet');
						ele.attr('name', 'filterId');
						ele.find('.item-title').text('商品');
						var nameHtml = '';
						$.each(data.returnValue.filter, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					if(!$.isEmptyObject(data.returnValue.floor)) {
						var ele = list.find('.serach-item.templet').clone(true).removeClass('templet');
						ele.attr('name', 'floorId');
						ele.find('.item-title').text('楼层');
						var nameHtml = '';
						$.each(data.returnValue.floor, function(index, item) {
							nameHtml = nameHtml + '<div data-id="' + item.id + '" class="col-25 button item-color button-middle j-itemBtn">' + item.name + '</div>';
						});
						//nameHtml = nameHtml + '<div data-id="" class="col-25 button item-color button-middle j-itemBtn">全部</div>';
						ele.find('.item-list.row').html(nameHtml);
						list.append(ele);
					}
					initSerchItemClick();
				} else {
					$.toast(data.errorReason);
				}
			}
		});
	}
	///加载VR空间列表
	function getVRRoomList() {
		$('#vrRoomTab').find('.infinite-scroll-preloader').addClass('hide');
	}
	///初始化筛选的事件
	function initSerchItemClick() {
		var keyList = searchFilter.substring(1, searchFilter.length).split('&');
		$('#serach-page').find('.item-list .j-itemBtn').bind('click', function() {
			var $this = $(this);
			$this.closest('.serach-item').find('.j-itemBtn').removeClass('active');
			$this.addClass('active');
		});
		//上次的筛选条件
		if(!$.isEmptyObject(keyList[0]) && keyList[0] != ''){
			$('#serach-page').find('.serach-list .serach-item').each(function() {
				var $this = $(this);
				var key = $this.attr('name');
				if(typeof(key) == 'undefined')
					return true;
				$.each(keyList, function(index, item) {
					if(item.split('=')[0] == key) {
						$this.find('.j-itemBtn').each(function(index1, item1) {
							if($(this).attr('data-id') == item.split('=')[1]) {
								$(item1).addClass('active');
								return false;
							}
						});
					}
				});
			});
		}
		/*if($.isEmptyObject(keyList[0]) || keyList[0] == '') {
			$('#serach-page').find('.serach-list .serach-item').not('.templet').each(function() {
				$(this).find('.j-itemBtn').removeClass('active');
				$(this).find('.j-itemBtn:last').addClass('active');
			});
		} else {
			$('#serach-page').find('.serach-list .serach-item').each(function() {
				var $this = $(this);
				var key = $this.attr('name');
				if(typeof(key) == 'undefined')
					return true;
				$.each(keyList, function(index, item) {
					if(item.split('=')[0] == key) {
						$this.find('.j-itemBtn').each(function(index1, item1) {
							if($(this).attr('data-id') == item.split('=')[1]) {
								$(item1).addClass('active');
								return false;
							}
						});
					}
				});
			});
		}*/
	}
	///组装筛选的的参数
	$('#serach-page').find('.bar .btnEnter').bind('click', function() {
		pageNum = 1;
		totalPage = 1;
		searchFilter = '';
		isFrist = true;
		isKey = false;
		var keyList = '';
		$('#serach-page').find('.serach-list .serach-item').each(function() {
			var key = $(this).attr('name');
			$(this).find('.j-itemBtn').each(function() {
				if($(this).hasClass('active')) {
					keyList += '&' + key + '=' + $(this).attr('data-id');
				}
			});
		});
		searchFilter = keyList;
		$('#serach-page').addClass('hide');
		$('#topBar-page').removeClass('hide');
		$('#mainSearch').removeClass('hide');
		loadChooseList();
	});
	///清除组装筛选的的参数
	$('#serach-page').find('.bar .btnClear').bind('click', function() {
		$('#serach-page').find('.serach-list .serach-item').not('.templet').each(function() {
			$(this).find('.j-itemBtn').removeClass('active');
			//$(this).find('.j-itemBtn:last').addClass('active');
		});
	});
});
///每个列表跳转详情处理
function setDetailsId(ele) {
	var id = $(ele).attr('data-id').trim();
	if(id == '') return;
	pageLocalStorage.setItem('detailsId', id);
	window.location.href = 'tabPage/index.html';
}

function setRDetailsId(ele) {
	var id = $(ele).attr('data-id').trim();
	if(id == '') return;
	pageLocalStorage.setItem('detailsId', id);
	window.location.href = 'tabPage/index.html?isPush=true';
}
//function loadChooseDetails(ele) {
//	switch(pageLocalStorage.getItem('detailTab')) {
//		case '#activityTab':
//			activityDetails(ele);
//			break;
//		case '#finefoodTab':
//		case '#shopTab':
//			fineDoodDetails(ele);
//			break;
//		case '#yuleTab':
//			yuleDetails(ele);
//			break;
//	}
//}
///活动列表详情处理
function activityDetails() {
	var id = pageLocalStorage.getItem('detailsId');
	if($.isEmptyObject(id) || id == '') window.location.href = '../index.html';
	var detailsContent = null;
	$.ajax({
		url: $.baseApi + "favorable/getFavorable?favorableId=" + id,
		type: "GET",
		dataType: "json",
		cache: false,
		async: false,
		success: function(data) {
			$.hidePreloader();
			if(data.success) {
				detailsContent = data.returnValue;
			} else {
				$.toast(data.errorReason);
			}
		}
	});
	return detailsContent;
}
///美食汇和购物达人调用门店的详情
function fineDoodDetails() {
	var id = pageLocalStorage.getItem('detailsId');
	if($.isEmptyObject(id) || id == '') window.location.href = '../index.html';
	var detailsContent = null;
	$.ajax({
		url: $.baseApi + "shops/getShops?shopsId=" + id,
		type: "GET",
		dataType: "json",
		cache: false,
		async: false,
		success: function(data) {
			$.hidePreloader();
			if(data.success) {
				detailsContent = data.returnValue;
			} else {
				$.toast(data.errorReason);
			}
		}
	});
	return detailsContent;
}
///娱乐天地的详情
function yuleDetails() {
	var id = pageLocalStorage.getItem('detailsId');
	if($.isEmptyObject(id) || id == '') window.location.href = '../index.html';
	var detailsContent = null;
	$.ajax({
		url: $.baseApi + "recreation/getRecreationDetailById?recreationId=" + id,
		type: "GET",
		dataType: "json",
		cache: false,
		async: false,
		success: function(data) {
			$.hidePreloader();
			if(data.success) {
				detailsContent = data.returnValue.recreation;
			} else {
				$.toast(data.errorReason);
			}
		}
	});
	return detailsContent;
}