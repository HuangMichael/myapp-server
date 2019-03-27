(function($, doc) {
	$.init({
		statusBarBackground: '#f7f7f7'
	});
	$.plusReady(function() {
		plus.screen.lockOrientation("portrait-primary");
		var settings = app.getSettings();
		var state = app.getState();
		var mainPage = plus.webview.getWebviewById("main");
		var main_loaded_flag = false;
		if(!mainPage) {
			mainPage = $.preload({
				"id": 'main',
				"url": 'main.html'
			});
		} else {
			main_loaded_flag = true;
		}

		mainPage.addEventListener("loaded", function() {
			main_loaded_flag = true;
		});
		var toMain = function() {
			//使用定时器的原因：
			//可能执行太快，main页面loaded事件尚未触发就执行自定义事件，此时必然会失败
			var id = setInterval(function() {
				if(main_loaded_flag) {
					clearInterval(id);
					$.fire(mainPage, 'show', null);
					mainPage.show("pop-in");
				}
			}, 20);
		};
		//检查 "登录状态/锁屏状态" 开始
		if(settings.autoLogin && state.token && settings.gestures) {
			$.openWindow({
				url: 'unlock.html',
				id: 'unlock',
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: false
				}
			});
		} else if(settings.autoLogin && state.token) {
			toMain();
		} else {
			app.setState(null);
		}

		// close splash
		setTimeout(function() {
			//关闭 splash
			plus.navigator.closeSplashscreen();
		}, 600);
		//检查 "登录状态/锁屏状态" 结束

		$.enterfocus('#login-form input', function() {
			$.trigger(loginButton, 'tap');
		});

		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if(backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	});
}(mui, document));

$(function() {

	$("#login").on("tap", function() {
		//获取参数  并且转化为json 
		var uName = $("#userName").val();
		var uPwd = $("#password").val()
		var param = {
			"userName": uName,
			"password": uPwd
		};
		var url = "http://192.168.100.6:8080/login";
		$.post(url, param, function(data) {
			if(data.result) {
				setTimeout(function() {
					mui.toast(data.resultDesc);
				}, 2000);
				localStorage.setItem("userName",uName);
				location.href = "main.html";
			}
		});
	});
});