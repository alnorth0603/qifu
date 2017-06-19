$(function() {
	///我的设置
	$(document).on("pageInit", "#mySetting-page", function(e, id, page) {
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			$.redirectLogin('../login/index.html',window.location.href);
		}
		$(page).on('click', '.j-loginOut', function(e) {
			pageLocalStorage.removeItem('memberId');
			pageLocalStorage.removeItem('token');
			window.location.href = '../index.html';
		});
		$(page).find('.content .list-block ul li').bind('click', function(e) {
			var $this =$(this);
			if(typeof($this.attr('data-href'))=='undefined' || $this.attr('data-href')=="") return;
			$(page).addClass('hide');
			$($this.attr('data-href')).removeClass('hide');
		});
		var isDoing = false;
		$('#wrapUpdatePwd').find('.content .bottomBtn .j-updatePwd').bind('click', function() {
			setting.needToken = true;
			var $this = $(this);
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			if($this.closest('.content').find('.j-oldPassword').val().trim() == '') {
				$.toast('旧密码不能为空');
				return;
			}
			if($this.closest('.content').find('.j-newPassword').val().trim() == '') {
				$.toast('新密码不能为空');
				return;
			}
			if($this.closest('.content').find('.j-QuPassword').val().trim() == '' && $this.closest('.content').find('.j-QuPassword').val().trim() != $this.closest('.content').find('.j-newPassword').val().trim()) {
				$.toast('两次密码不一致');
				return;
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				password: $.md5($this.closest('.content').find('.j-newPassword').val().trim()).toLocaleUpperCase(),
				oldPassword: $.md5($this.closest('.content').find('.j-oldPassword').val().trim()).toLocaleUpperCase()
			};
			if(isDoing) return;
			isDoing = true;
			$.ajax({
				url: $.baseApi + "member/changePassword",
				type: "POST",
				dataType: "json",
				data:data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					isDoing = false;
					if(data.errorCode == 1001) {
						$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
					} else {
						if(data.success) {
							$.toast('修改成功');
							setTimeout(function(){
								window.location.reload();
							},1000);
						}else{
							$.toast(data.errorReason);
						}
					}
				}
			});
		});
		$('#wrapUpdatePwd').find('.bar-nav .backBtnHide').bind('click', function() {
			$('#wrapUpdatePwd').addClass('hide');
			$(page).removeClass('hide');
		});
	});
	///帮助中心
	$(document).on("pageInit", "#myHelp-page", function(e, id, page) {
		getArticleList();

		function getArticleList() {
			var list = $(page).find('.content .list-block ul');
			list.find('.qution-li').not('.templet').remove();
			$.ajax({
				url: $.baseApi + "article/getPointRuleArticle?typeId=4",
				type: "GET",
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$(page).find('.content .setDiv .s-custom').attr('href', 'tel:' + data.returnValue.phone);
						$.each(data.returnValue.list, function(index, item) {
							var ele = list.find('.qution-li.templet').clone().removeClass('templet');
							ele.attr('data-id', item.id);
							ele.attr('data-content', item.content);
							ele.find('.item-content .icon-liBG').text(item.title);
							list.append(ele);
						});
						list.find('.qution-li').not('.templet').bind('click', function() {
							var $this = $(this);
							$('#wrapArticleDetail').find('.bar-nav .title').text($this.find('.item-content .icon-liBG').text());
							$('#wrapArticleDetail').find('.content .content-block').html($this.attr('data-content'));
							$('#wrapArticleDetail').removeClass('hide');
							$(page).addClass('hide');
						});
					}
				}
			});
		}
		$('#wrapArticleDetail').find('.bar-nav .backBtnHide').bind('click', function() {
			$('#wrapArticleDetail').addClass('hide');
			$(page).removeClass('hide');
		});
	});
	///我的信息
	$(document).on("pageInit", "#myInfo-page", function(e, id, page) {
		var nowBirthday = "";
		var nowGender = "";
		var nowMarital = "";

		function loadMyInfo() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			$.ajax({
				url: $.baseApi + "member/getProfile?memberId=" + pageLocalStorage.getItem('memberId'),
				type: "GET",
				dataType: "json",
				cache: false,
				async: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						var myInfoVal = data.returnValue;
						$(page).find('.list-block .data-schedule>span').text(myInfoVal.percent + '%');
						if(myInfoVal.headPic == '') {
							$(page).find('.list-block .j-headPic').attr('src', '../img/defaultBG.png');
							$('#wrapUpload .list-block .upHeadPic').attr('src', '../img/defaultBG.png');
						} else {
							$(page).find('.list-block .j-headPic').attr('src', myInfoVal.headPic);
							$('#wrapUpload .list-block .upHeadPic').attr('src', myInfoVal.headPic);
						}
						$(page).find('.list-block .j-name').text(myInfoVal.name);
						$(page).find('.list-block .j-birthday').text(myInfoVal.birthday);
						nowBirthday = myInfoVal.birthday;
						$(page).find('.list-block .j-mobile').text(myInfoVal.mobile);
						$(page).find('.list-block .j-email').text(myInfoVal.email);
						$(page).find('.list-block .j-address').text(myInfoVal.address);
						//$(page).find('.list-block .j-maritalStatus').text(myInfoVal.maritalStatus);
						$(page).find('.list-block .j-workAddress').text(myInfoVal.workAddress);
						$(page).find('.list-block .j-interest').text(myInfoVal.interest);
						$(page).find('.list-block .j-oftenVisits').text(myInfoVal.oftenVisits);
						$('.wrap .list-block .item-input input').each(function(index, item) {
							switch($(item).attr('name')) {
								case 'name':
									$(item).val(myInfoVal.name);
									break;
								case 'gender':
									if((myInfoVal.gender).toString() == '0') {
										$('#picker-gender').val('男');
										$(page).find('.list-block .j-sex').text('男');
										nowGender = '男';
									} else if((myInfoVal.gender).toString() == '1') {
										$('#picker-gender').val('女');
										$(page).find('.list-block .j-sex').text('女');
										nowGender = '女';
									}
									$('#j-setGender').val(myInfoVal.gender);
									break;
								case 'birthday':
									$(item).val(myInfoVal.birthday);
									break;
								case 'email':
									$(item).val(myInfoVal.email);
									break;
								case 'address':
									$(item).val(myInfoVal.address);
									break;
								case 'maritalStatus':
									if((myInfoVal.maritalStatus).toString() == '0') {
										$('#picker-marital').val('未婚');
										$(page).find('.list-block .j-maritalStatus').text('未婚');
										nowMarital = '未婚';
									} else if((myInfoVal.maritalStatus).toString() == '1') {
										$('#picker-marital').val('已婚');
										$(page).find('.list-block .j-maritalStatus').text('已婚');
										nowMarital = '已婚';
									}
									$(item).val(myInfoVal.maritalStatus);
									$('#j-setMarital').val(myInfoVal.maritalStatus);
									break;
								case 'workAddress':
									$(item).val(myInfoVal.workAddress);
									break;
								case 'interest':
									$(item).val(myInfoVal.interest);
									break;
								case 'oftenVisits':
									$(item).val(myInfoVal.oftenVisits);
									break;
								case 'oftenVisits':
									$(item).val(myInfoVal.oftenVisits);
									break;
							}
						});
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		loadMyInfo();
		$(page).find('.list-block ul>li').bind('click', function() {
			var $this = $(this);
			if(typeof($this.attr('href')) == 'undefined') return;
			$($this.attr('href')).removeClass('hide');
			$(page).addClass('hide');
			initPicker();
		});
		$('.wrap .backBtnHide').bind('click', function() {
			var $this = $(this);
			$this.closest('.wrap').addClass('hide');
			$(page).removeClass('hide');
		});
		//更改信息
		$('.wrap .j-btnPost').bind('click', function() {
			setting.needToken = true;
			var $this = $(this);
			var isLegal = true;
			var listBlock = $(this).closest('.bottomBtn').siblings('.list-block');
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				id: pageLocalStorage.getItem('memberId')
			};
			listBlock.find('.item-input input').each(function() {
				if(typeof($(this).attr("name")) == 'undefined') return;
				if($(this).attr("name") == 'gender') {
					if($('#picker-gender').val() == '男') {
						$('#j-setGender').val('0');
					} else if($('#picker-gender').val() == '女') {
						$('#j-setGender').val('1');
					}
				}
				if($(this).attr("name") == 'maritalStatus') {
					if($('#picker-marital').val() == '未婚') {
						$('#j-setMarital').val('0');
					} else if($('#picker-marital').val() == '已婚') {
						$('#j-setMarital').val('1');
					}
				}
				if($(this).val() == null || $(this).val() == '') {
					var tip = $(this).closest('.item-input').siblings('.item-title').text() + '不能为空';
					$.toast(tip);
					isLegal = false;
					return;
				} else {
					if($(this).attr("name") == 'email') {
						var reg = /\w+[@]{1}\w+[.]\w+/;
						if(!reg.test($(this).val())) {
							$.toast('请输入正确的email地址');
							isLegal = false;
							return;
						}
					}
					data[$(this).attr("name")] = $(this).val();
				}
			});
			if(!isLegal) return;
			isLegal = true;
			$.ajax({
				url: $.baseApi + "member/saveProfile",
				type: "POST",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$.toast('修改成功');
						setTimeout(function() {
							loadMyInfo();
							$this.closest('.wrap').addClass('hide');
							$(page).removeClass('hide');
						}, 1000);
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		});
		function initPicker(){
			//性别选择框
			if(nowGender == '') {
				$("#picker-gender").picker({
					toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">\
		      确定\
		      </button>\
		      <h1 class="title">选择您的性别</h1>\
		      </header>',
					cols: [{
						textAlign: 'center',
						values: ['男', '女']
					}]
				});
			} else {
				$("#picker-gender").picker({
					toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">\
		      确定\
		      </button>\
		      <h1 class="title">选择您的性别</h1>\
		      </header>',
					cols: [{
						textAlign: 'center',
						values: ['男', '女']
					}],
					value: [nowGender]
				});
			}
			//情感状态选择框
			if(nowMarital == '') {
				$("#picker-marital").picker({
					toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">\
		      确定\
		      </button>\
		      <h1 class="title">选择您的情感状态</h1>\
		      </header>',
					cols: [{
						textAlign: 'center',
						values: ['未婚', '已婚']
					}]
				});
			} else {
				$("#picker-marital").picker({
					toolbarTemplate: '<header class="bar bar-nav">\
		      <button class="button button-link pull-right close-picker">\
		      确定\
		      </button>\
		      <h1 class="title">选择您的情感状态</h1>\
		      </header>',
					cols: [{
						textAlign: 'center',
						values: ['未婚', '已婚']
					}],
					value: [nowMarital]
				});
			}
			//生日选择框
			if(nowBirthday == "") {
				$("#calendar-birthday").calendar({
					dateFormat: "yyyy-mm-dd",
					onChange: function(p, v, d) {
						//		        console.log(p, v, d);
					}
				});
			} else {
				$("#calendar-birthday").calendar({
					dateFormat: "yyyy-mm-dd",
					value: [nowBirthday],
					onChange: function(p, v, d) {
						//		        console.log(p, v, d);
					}
				});
			}
		}
	});
	//我的积分
	$(document).on("pageInit", "#myPoint-page", function(e, id, page) {
		var pageNum = 1;
		var totalPage = 1;
		var isLoading = true;
		//销毁下拉刷新
		$.destroyPullToRefresh($(page).find(".pull-to-refresh-content"));
		$(page).find(".infinite-scroll").on('infinite', function(e) {
			//上拉加载
			if(isLoding)
				return;
			isLoading = true;
			if(pageNum > totalPage) {
				$.toast('暂无更多');
				return;
			}
			getPointList();
		});
		getPointList();

		function getPointList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 10
			};
			var list = $(page).find('.list .content-block ul');
			if(pageNum == 1) {
				list.find('.li-item').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "point/getRecordsByMemberId",
				type: "GET",
				data: data,
				dataType: "json",
				cache: false,
				success: function(data) {
					isLoading = false;
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.recordList)) {
							$.each(data.returnValue.recordList, function(index, item) {
								index = index + 1;
								var ele = list.find('.li-item.templet').clone().removeClass('templet');
								if(index % 2 == 0) {
									ele.addClass('li-left');
								} else {
									ele.addClass('li-right');
								}
								if(parseFloat(item.point) > 0) {
									ele.find('.item-inner .div-radius').addClass('radius-green');
								} else {
									ele.find('.item-inner .div-radius').addClass('radius-red');
								}
								ele.find('.item-inner .div-radius').text(item.point);
								ele.find('.item-inner .div-txt .txt').text(item.souceName);
								ele.find('.item-inner .div-txt .date').text(item.date);
								list.append(ele);
							});
						} else {
							$.toast('无数据');
						}
						$(page).find('.list .head-ul .s-pointVal').text(data.returnValue.totalPoint);
						totalPage = data.returnValue.pages;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$(page).find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$(page).find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
	});
	//积分规则
	$(document).on("pageInit", "#pointRule-page", function(e, id, page) {
		getPointRule();

		function getPointRule() {
			$(page).find('.content .content-block').html();
			$.ajax({
				url: $.baseApi + "article/getPointRuleArticle?typeId=2",
				type: "GET",
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$.each(data.returnValue.list, function(index, item) {
							$(page).find('.content .content-block').append(item.content);
						});
					} else {
						$.toast(data.errorReason)
					}
				}
			});
		}
	});
	//关于我们
	$(document).on("pageInit", "#aboutUs-page", function(e, id, page) {
		getAboutUs();

		function getAboutUs() {
			$(page).find('.content .content-block').html();
			$.ajax({
				url: $.baseApi + "article/getPointRuleArticle?typeId=3",
				type: "GET",
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						$.each(data.returnValue.list, function(index, item) {
							$(page).find('.content .content-block').append(item.content);
						});
					} else {
						$.toast(data.errorReason)
					}
				}
			});
		}
	});
	//我的消息
	$(document).on("pageInit", "#myNews-page", function(e, id, page) {
		var pageNum = 1;
		var totalPage = 1;
		var isLoading = true;
		//销毁下拉刷新
		$.destroyPullToRefresh($(page).find(".pull-to-refresh-content"));
		$(page).find(".infinite-scroll").on('infinite', function(e) {
			//上拉加载
			if(isLoding)
				return;
			isLoading = true;
			if(pageNum > totalPage) {
				$.toast('暂无更多');
				return;
			}
			getNewsList();
		});
		getNewsList();

		function getNewsList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20
			};
			var list = $(page).find('.content .list-block ul');
			if(pageNum == 1) {
				list.find('.swipeout').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "message/getMessage",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.list)) {
							$.each(data.returnValue.list, function(index, item) {
								var ele = list.find('.swipeout.templet').clone().removeClass('templet');
								ele.attr('data-id', item.id);
								ele.find('.card-footer .card-title').text(item.title);
								ele.find('.card-footer .color-gray').text(item.createDate);
								ele.find('.card-content .card-content-inner').text(item.content);
								list.append(ele);
							});
						} else {
							if(pageNum == 1){
								$(page).find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$(page).find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.pages;
						pageNum = pageNum + 1;
						if(pageNum > totalPage) {
							$(page).find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$(page).find('.infinite-scroll-preloader').removeClass('hide');
						}
						delClick();
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}

		function delClick() {
			$(page).find('.swipeout').on('delete', function(e) {
				var $this = $(this);
				setting.needToken = true;
				if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
					$.redirectLogin('../login/index.html',window.location.href);
				}
				var isDoing = false;
				var data = {
					memberId: pageLocalStorage.getItem('memberId'),
					messageId: $this.attr('data-id')
				};
				if(isDoing) return;
				isDoing = true;
				$.ajax({
					url: $.baseApi + "message/delete",
					type: "POST",
					dataType: "json",
					data: data,
					cache: false,
					success: function(data) {
						isDoing = false;
						if(data.success) {
							$.toast("操作成功");
						} else {
							if(data.errorCode == 1001) {
								$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
							} else {
								$.toast(data.errorReason);
							}
						}
					}
				});
			});
		}
	});
	//意见反馈
	$(document).on("pageInit", "#feedback-page", function(e, id, page) {
		if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
			$.redirectLogin('../login/index.html',window.location.href);
		}
		getSuggestTypes();
		function getSuggestTypes() {
			$.ajax({
				url: $.baseApi + "suggest/getSuggestTypes",
				type: "POST",
				dataType: "json",
				cache: false,
				success: function(data) {
					$.hidePreloader();
					$('#j-selectVal').find('option').remove();
					if(data.success) {
						$.each(data.returnValue.suggestTypes, function(index, item) {
							$('#j-selectVal').append('<option value="' + item.id + '">' + item.name + '</option>');
						});
					} else {
						$.toast(data.errorReason)
					}
				}
			});
		}
		$(page).on('click', '.j-feedbackBtn', function() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var isDoing = false;
			if($('#j-selectVal').val().trim() == '') {
				$.toast('问题类型不能为空');
				return;
			}
			if($('#j-suggestContent').val().trim() == '') {
				$.toast('意见不能为空');
				return;
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				suggestContent: $('#j-suggestContent').val(),
				suggestType: $('#j-selectVal').val()
			};
			if(isDoing) return;
			isDoing = true;
			$.ajax({
				url: $.baseApi + "suggest/suggestIn",
				type: "POST",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.errorCode == 1001) {
						$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
					} else {
						if(data.success){
							$.toast('提交成功,我们会积极采纳');
							setTimeout(function(){
								window.location.href='myHelp.html';
							},1000);
						}else{
							$.toast(data.errorReason);
						}
					}
				}
			});
		});
	});

	//我的优惠劵
	$(document).on("pageInit", "#myCoupon-page", function(e, id, page) {
		var pageNum = 1;
		var totalPage = 1;
		var isLoading = true;
		var isFrist = true;
		var nowCoupon = '#zheKouTab';
		//销毁下拉刷新
		$.destroyPullToRefresh($(page).find(".pull-to-refresh-content"));
		$(page).find(".infinite-scroll").on('infinite', function(e) {
			//上拉加载
			var $this = $(this);
			if(isLoding)
				return;
			isLoding = true;
			isFrist = false;
			if(pageNum > totalPage) {
				$.toast('暂无更多');
				return;
			}
			loadChooseCoupon();
		});		
		$('#j-CouponSwiper').swiper({
			slidesPerView: 3,
			centeredSlides: true,
			paginationClickable: true,
			spaceBetween: -15,
			initialSlide :1,
			onInit:function(swiper){
				//初始化
				if(nowCoupon!=null){
					var index = 0;
					$.each($('#j-CouponSwiper').find('.swiper-slide'),function(j,item){
						if(nowCoupon==$(item).attr('href').trim()){
							index = j;
							return false;
						}
					});
					swiper.slideTo(index);
				}else{
					nowCoupon = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				}
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseCoupon();
			},
			onTap:function(swiper){
				swiper.slideTo(swiper.clickedIndex, 1000, false);
				//初始化
				nowCoupon = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseCoupon();
			},
			onSlideChangeEnd: function(swiper){
				//初始化
				nowCoupon = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseCoupon();
			}
		});

		function loadChooseCoupon() {
			$(page).find('.content .tabs .tab').removeClass('active');
			$(nowCoupon).addClass('active');
			switch(nowCoupon) {
				case '#voucherTab':
					getVoucherList();
					break;
				case '#zheKouTab':
					getZheKouList();
					break;
				case '#cashTab':
					getCashList();
					break;
			}
		}
		//获取代金卷
		function getVoucherList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				couponType: 0
			};
			var list = $('#voucherTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.item-content').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "coupon/getMemberCoupons",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.couponList)) {
							$.each(data.returnValue.couponList, function(index, item) {
								var ele = list.find('.item-content.templet').clone().removeClass('templet');
								ele.attr('data-code', item.code);
								if(item.expired.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-inner').addClass('usable');
									} else {
										ele.find('.item-inner').addClass('used');
									}
								} else {
									ele.find('.item-inner').addClass('expire');
								}
								ele.find('.item-inner .cou-par').text(item.par);
								ele.find('.item-inner .cou-quota').text('(满¥' + item.quota + '元适用)');
								ele.find('.item-inner .shop-name').text(item.shops);
								ele.find('.item-inner .time-txt').text(item.beginDate + '-' + item.endDate);
								list.append(ele);
							});
							$('#voucherTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#voucherTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#voucherTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#voucherTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#voucherTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		//获取折扣卷
		function getZheKouList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				couponType: 1
			};
			var list = $('#zheKouTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.item-content').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "coupon/getMemberCoupons",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.couponList)) {
							$.each(data.returnValue.couponList, function(index, item) {
								var ele = list.find('.item-content.templet').clone().removeClass('templet');
								ele.attr('data-code', item.code);
								if(item.expired.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-inner').addClass('usable');
									} else {
										ele.find('.item-inner').addClass('used');
									}
								} else {
									ele.find('.item-inner').addClass('expire');
								}
								ele.find('.item-inner .cou-par').text(item.discountValue);
								ele.find('.item-inner .shop-name').text(item.shops);
								ele.find('.item-inner .time-txt').text(item.beginDate + '-' + item.endDate);
								list.append(ele);
							});
							$('#zheKouTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#zheKouTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#zheKouTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#zheKouTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#zheKouTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		//获取现金券
		function getCashList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				couponType: 2
			};
			var list = $('#cashTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.item-content').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "coupon/getMemberCoupons",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.couponList)) {
							$.each(data.returnValue.couponList, function(index, item) {
								var ele = list.find('.item-content.templet').clone().removeClass('templet');
								ele.attr('data-code', item.code);
								if(item.expired.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-inner').addClass('usable');
									} else {
										ele.find('.item-inner').addClass('used');
									}
								} else {
									ele.find('.item-inner').addClass('expire');
								}
								ele.find('.item-inner .cou-par').text('礼品券');
								ele.find('.item-inner .shop-name').text(item.shops);
								ele.find('.item-inner .time-txt').text(item.beginDate + '-' + item.endDate);
								list.append(ele);
							});
							$('#cashTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#cashTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#cashTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#cashTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#cashTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		
		$('#wrapCodeList').find('.bar-nav .backBtnHide').bind('click', function() {
			$(page).removeClass('hide');
			$('#wrapCodeList').addClass('hide');
		});
	});

	//我的预约
	$(document).on("pageInit", "#myReservation-page", function(e, id, page) {
		var pageNum = 1;
		var totalPage = 1;
		var isLoading = true;
		var isFrist = true;
		var nowTab = '#allTab';
		//销毁下拉刷新
		$.destroyPullToRefresh($(page).find(".pull-to-refresh-content"));
		$(page).find(".infinite-scroll").on('infinite', function(e) {
			//上拉加载
			if(isLoading)
				return;
			isLoading = true;
			isFrist = false;
			var $this = $(this);
			if(pageNum > totalPage) {
				$.toast('暂无更多');
				return;
			}
		});
		$('#j-ReservationSwiper').swiper({
			slidesPerView: 3,
			centeredSlides: true,
			paginationClickable: true,
			spaceBetween: -15,
			initialSlide :1,
			onInit:function(swiper){
				//初始化
				if(nowTab!=null){
					var index = 0;
					$.each($('#j-ReservationSwiper').find('.swiper-slide'),function(j,item){
						if(nowTab==$(item).attr('href').trim()){
							index = j;
							return false;
						}
					});
					swiper.slideTo(index);
				}else{
					nowTab = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				}
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseReser();
			},
			onTap:function(swiper){
				swiper.slideTo(swiper.clickedIndex, 1000, false);
				//初始化
				nowTab = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseReser();
			},
			onSlideChangeEnd: function(swiper){
				//初始化
				nowTab = $(swiper.wrapper).find('.swiper-slide-active').attr('href').trim();
				pageNum = 1;
				totalPage = 1;
				isLoading = true;
				isFrist = true;
				$("body, html").scrollTop(0);
				loadChooseReser();
			}
		});

		function loadChooseReser() {
			$(page).find('.content .tabs .tab').removeClass('active');
			$(nowTab).addClass('active');
			switch(nowTab) {
				case '#usedTab':
					getUsedList();
					break;
				case '#allTab':
					getAllList();
					break;
				case '#notUsedTab':
					getnotUsedList();
					break;
			}
		}
		//获取已使用的预约列表
		function getUsedList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				isUsed: true
			};
			var list = $('#usedTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.list-li').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "recreation/getMyRecreations",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.list)) {
							$.each(data.returnValue.list, function(index, item) {
								var ele = list.find('.list-li.templet').clone(true).removeClass('templet');
								ele.attr('data-id', item.id);
								ele.find('.item-content.top .item-media img').attr('src', item.pic);
								ele.find('.item-content.top .item-title-row .name').text(item.name);
								if(item.isCancel.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-content.top .item-title-row .status').addClass('red');
										var total = 0;
										var total_use = 0;
										$.each(item.snList, function(indexj, itemj) {
											total = total + 1;
											if(itemj.used == '0') {
												total_use = total_use + 1;
											}
										});
										if(total == 1) {
											ele.find('.item-content.top .item-title-row .status').text('待使用');
										} else {
											ele.find('.item-content.top .item-title-row .status').text('待使用(' + total_use + '/' + total + ')');
										}
										ele.find('.item-content.bottom .j-cancleYuYue').removeClass('hide');
										ele.find('.item-content.bottom .j-useYuYue').removeClass('hide');
									} else {
										ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
										ele.find('.item-content.top .item-title-row .status').text('已使用');
										ele.find('.item-content.bottom .j-alginYuYue').removeClass('hide');
									}
								} else {
									ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
									ele.find('.item-content.top .item-title-row .status').text('已取消');
									ele.find('.item-content.bottom .btns').addClass('hide');
								}
								ele.find('.item-content.top .item-inner .date').text(item.createDate);
								ele.find('.item-content.top .item-title-row .money>span').text(item.price);
								ele.find('.item-content.top .item-title-row .total').text('x ' + item.number);
								ele.find('.item-content.bottom .totalMoney').text(item.totalPrice);
								list.append(ele);
							});
							$('#usedTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#usedTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#usedTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#usedTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#usedTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		//获取全部的预约列表
		function getAllList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				isUsed: ''
			};
			var list = $('#allTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.list-li').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "recreation/getMyRecreations",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.list)) {
							$.each(data.returnValue.list, function(index, item) {
								var ele = list.find('.list-li.templet').clone(true).removeClass('templet');
								ele.attr('data-id', item.id);
								ele.attr('data-sn', JSON.stringify(item.snList));
								ele.find('.item-content.top .item-media img').attr('src', item.pic);
								ele.find('.item-content.top .item-title-row .name').text(item.name);
								if(item.isCancel.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-content.top .item-title-row .status').addClass('red');
										var total = 0;
										var total_use = 0;
										$.each(item.snList, function(indexj, itemj) {
											total = total + 1;
											if(itemj.used == '0') {
												total_use = total_use + 1;
											}
										});
										if(total == 1) {
											ele.find('.item-content.top .item-title-row .status').text('待使用');
										} else {
											ele.find('.item-content.top .item-title-row .status').text('待使用(' + total_use + '/' + total + ')');
										}
										ele.find('.item-content.bottom .j-cancleYuYue').removeClass('hide');
										ele.find('.item-content.bottom .j-useYuYue').removeClass('hide');
									} else {
										ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
										ele.find('.item-content.top .item-title-row .status').text('已使用');
										ele.find('.item-content.bottom .j-alginYuYue').removeClass('hide');
									}
								} else {
									ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
									ele.find('.item-content.top .item-title-row .status').text('已取消');
									ele.find('.item-content.bottom .btns').addClass('hide');
								}
								ele.find('.item-content.top .item-inner .date').text(item.createDate);
								ele.find('.item-content.top .item-title-row .money>span').text(item.price);
								ele.find('.item-content.top .item-title-row .total').text('x ' + item.number);
								ele.find('.item-content.bottom .totalMoney').text(item.totalPrice);
								list.append(ele);
							});
							$('#allTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#allTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#allTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#allTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#allTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}
		//获取未使用的预约列表
		function getnotUsedList() {
			setting.needToken = true;
			if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
				$.redirectLogin('../login/index.html',window.location.href);
			}
			var data = {
				memberId: pageLocalStorage.getItem('memberId'),
				pageNum: pageNum,
				pageSize: 20,
				isUsed: false
			};
			var list = $('#notUsedTab').find('.content-block .list-block ul');
			if(isFrist) {
				list.find('.list-li').not('.templet').remove();
			}
			$.ajax({
				url: $.baseApi + "recreation/getMyRecreations",
				type: "GET",
				dataType: "json",
				data: data,
				cache: false,
				success: function(data) {
					$.hidePreloader();
					if(data.success) {
						if(!$.isEmptyObject(data.returnValue.list)) {
							$.each(data.returnValue.list, function(index, item) {
								var ele = list.find('.list-li.templet').clone(true).removeClass('templet');
								ele.attr('data-id', item.id);
								ele.attr('data-sn', JSON.stringify(item.snList));
								ele.find('.item-content.top .item-media img').attr('src', item.pic);
								ele.find('.item-content.top .item-title-row .name').text(item.name);
								if(item.isCancel.toLowerCase() == 'false') {
									if(item.used.toLowerCase() == 'false') {
										ele.find('.item-content.top .item-title-row .status').addClass('red');
										var total = 0;
										var total_use = 0;
										$.each(item.snList, function(indexj, itemj) {
											total = total + 1;
											if(itemj.used == '0') {
												total_use = total_use + 1;
											}
										});
										if(total == 1) {
											ele.find('.item-content.top .item-title-row .status').text('待使用');
										} else {
											ele.find('.item-content.top .item-title-row .status').text('待使用(' + total_use + '/' + total + ')');
										}
										ele.find('.item-content.bottom .j-cancleYuYue').removeClass('hide');
										ele.find('.item-content.bottom .j-useYuYue').removeClass('hide');
									} else {
										ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
										ele.find('.item-content.top .item-title-row .status').text('已使用');
										ele.find('.item-content.bottom .j-alginYuYue').removeClass('hide');
									}
								} else {
									ele.find('.item-content.top .item-title-row .status').addClass('color-gray');
									ele.find('.item-content.top .item-title-row .status').text('已取消');
									ele.find('.item-content.bottom .btns').addClass('hide');
								}
								ele.find('.item-content.top .item-inner .date').text(item.createDate);
								ele.find('.item-content.top .item-title-row .money>span').text(item.price);
								ele.find('.item-content.top .item-title-row .total').text('x ' + item.number);
								ele.find('.item-content.bottom .totalMoney').text(item.totalPrice);
								list.append(ele);
							});
							$('#notUsedTab').find('.j-noRecord').addClass('hide');
						} else {
							if(isFrist){
								$('#notUsedTab').find('.j-noRecord').removeClass('hide');
							}else{
								$.toast('无数据');
								$('#notUsedTab').find('.j-noRecord').addClass('hide');
							}
						}
						totalPage = data.returnValue.totalPage;
						pageNum = data.returnValue.pageNum + 1;
						if(pageNum > totalPage) {
							$('#notUsedTab').find('.infinite-scroll-preloader').addClass('hide');
						} else {
							$('#notUsedTab').find('.infinite-scroll-preloader').removeClass('hide');
						}
					} else {
						if(data.errorCode == 1001) {
							$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
						} else {
							$.toast(data.errorReason);
						}
					}
				}
			});
		}

		$('#wrapSNList').find('.bar-nav .backBtnHide').bind('click', function() {
			$(page).removeClass('hide');
			$('#wrapSNList').addClass('hide');
		});
	});
	$.init();
});
//预约的sn列表			
function showSNList(ele) {
	var $this = $(ele);
	$('#myReservation-page').addClass('hide');
	$('#wrapSNList').removeClass('hide');
	var snList = $.parseJSON($this.closest('.list-li').attr('data-sn'));
	if($.isEmptyObject(snList)) return;
	var list = $('#wrapSNList').find('.content .list-block ul');
	list.find('.item-content').not('.templet').remove();
	$.each(snList, function(index, item) {
		var ele = list.find('.item-content.templet').clone().removeClass('templet');
		if(item.used == '0') {
			ele.find('.item-title').text('*' + item.sn);
			ele.find('.item-title').addClass('color-primary');
		} else {
			ele.find('.item-title').text('*' + item.sn + '(已使用)');
			ele.find('.item-title').addClass('color-gray')
		}
		list.append(ele);
	});
}
//预约的code列表			
function showCodeList(ele) {
	var $this = $(ele);
	$('#myCoupon-page').addClass('hide');
	$('#wrapCodeList').removeClass('hide');
	var code = $this.attr('data-code');
	if(code==''|| $.isEmptyObject(code)) return;
	var list = $('#wrapCodeList').find('.content .list-block ul');
	list.find('.item-content').not('.templet').remove();
	var ele = list.find('.item-content.templet').clone().removeClass('templet');
	ele.find('.item-title').text('*' + code);
	ele.find('.item-title').addClass('color-primary');
	list.append(ele);
}
//取消预约	
function cancelRecreation(ele) {
	setting.needToken = true;
	var $this = $(ele);
	if($.isEmptyObject(pageLocalStorage.getItem('memberId')) || $.isEmptyObject(pageLocalStorage.getItem('token'))) {
		$.redirectLogin('../login/index.html',window.location.href);
	}
	var id = $this.closest('.list-li').attr('data-id').trim();
	if(id == '') return;
	var data = {
		memberId: pageLocalStorage.getItem('memberId'),
		recreationMemberId: id
	};
	$.ajax({
		url: $.baseApi + "recreation/cancelRecreation",
		type: "POST",
		dataType: "json",
		data: data,
		cache: false,
		success: function(data) {
			$.hidePreloader();
			if(data.errorCode == 1001) {
				$.redirectLogin('../login/index.html',window.location.href, 'token失效，重新登陆');
			} else {
				$.toast(data.errorReason);
			}
			setTimeout(function() {
				window.location.reload();
			}, 2000);
		}
	});
}
//再次预约	
function alginBespoke(ele) {
	var $this = $(ele);
	var id = $this.closest('.list-li').attr('data-id').trim();
	if(id == '') return;
	$.ajax({
		url: $.baseApi + "recreation/getRecreationDetailById?recreationId=" + id,
		type: "GET",
		dataType: "json",
		cache: false,
		success: function(data) {
			$.hidePreloader();
			if(data.success) {
				pageLocalStorage.setItem('detail', JSON.stringify(data.returnValue.recreation));
				window.location.href = '../topBarPage/tabPage/bespoke.html';
			} else {
				$.toast(data.errorReason);
			}
		}
	});
}

function ajaxFileUpload(ele) {
	setting.needToken = false;
	var $this = $(ele);
    var filepath = $this.val();
    var extStart = filepath.lastIndexOf(".");
    var ext = filepath.substring(extStart, filepath.length).toUpperCase();
    if (ext != ".BMP" && ext != ".PNG" && ext != ".GIF" && ext != ".JPG" && ext != ".JPEG") {
        $.toast("图片限于bmp,png,gif,jpeg,jpg格式");
        return;
    }
	$.ajaxFileUpload({
		url: $.baseApi + 'file/uploadHeadPic',
		secureuri: false,
		fileElementId: 'file',
		dataType: 'json',
		data: {
			memberId: pageLocalStorage.getItem('memberId')
		},
		success: function(data, status) {
			$.hidePreloader();
			if(status=='success') {
				//$("#imghead").attr("src", data.value.headPic);
				$.toast("头像上传成功");
				setTimeout(function() {
					window.location.href='myInfo.html';
				}, 1000);
			} else {
				$.toast('头像上传失败');
			}
		},
		error: function(data, status, e) {
			//$.toast(status);
			//上传头像 进入此断点 也是上传成功,特殊处理
			setTimeout(function() {
					window.location.href='myInfo.html';
				}, 1000);
		}
	});
}