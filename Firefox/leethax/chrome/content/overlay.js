var leethax = {
	_topic : "http-on-examine-response",

	init : function() {
		// URL rewrite part 2
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(leethax, leethax._topic, false);

		// update check
		gBrowser.addEventListener("load", leethax._loadHandler, true);
	},

	_urlSuffix : '.proxy.leethax.net',

	observe : function(subject, topic, data) {
		//dump('observe('+subject+','+topic+','+data+'\n');
		if (topic == leethax._topic) {
			var chan = subject.QueryInterface(Components.interfaces.nsIChannel);
			//dump('  '+chan.URI.spec+'\n');
			var host = chan.URI.host;
			if (host.length > leethax._urlSuffix.length && host.substring(host.length - leethax._urlSuffix.length) == leethax._urlSuffix) {
				var oldSpec = chan.URI.spec;
				chan.URI.scheme = host.split('.',1)[0];
				chan.URI.host = host.substring(chan.URI.scheme.length+1, host.length - leethax._urlSuffix.length);
				chan.URI.port = -1;
			//	dump('  ' + oldSpec + ' -> ' + chan.URI.spec + '\n');
			}
		}
	},

	_updateCheckUrl : 'http://proxy.leethax.net:8002/latest.txt',
	_updateUrl : 'http://leethax.net/extension/',
	_updateCheckTriggerUrls : [
		// BEGIN UPDATE URLS
			/apps\.facebook\.com\/angrybirds/,
			/apps\.facebook\.com\/avengersalliance/,
			/apps\.facebook\.com\/bejeweled/,
			/plus\.google\.com\/games\/78439823804/,
			/apps\.facebook\.com\/bubbleisland/,
			/apps\.facebook\.com\/bubblewitch/,
			/apps\.facebook\.com\/candycrush/,
			/apps\.facebook\.com\/cityville/,
			/apps\.facebook\.com\/diamonddash/,
			/apps\.facebook\.com\/monster-world/,
			/apps\.facebook\.com\/slotomania/,
			/apps\.facebook\.com\/solitaireblitz/,
			/apps\.facebook\.com\/zuma/,
		// END UPDATE URLS
		/leethax\.net/,
	],
	_currentVersion : '2014.09.16',

	_loadHandler : function(event) {
		var doc = event.originalTarget;

		for (var i in leethax._updateCheckTriggerUrls)
			if (doc.defaultView.location.href.match(leethax._updateCheckTriggerUrls[i]))
			{
				leethax._updateCheckTriggerUrls = [];
				gBrowser.removeEventListener("load", leethax._loadHandler, true);

				var request = new XMLHttpRequest();
				request.open('GET', leethax._updateCheckUrl + '?v=' + leethax._currentVersion, true);
				request.onreadystatechange = function (aEvt) {
					if (request.readyState == 4 && request.status == 200)
					{
						var latestVersion = request.responseText;
						if (latestVersion > leethax._currentVersion)
						{
							var nb = gBrowser.getNotificationBox();
							var buttons = [{
								label: 'Get update',
								accessKey: 'U',
								popup: null,
								callback: function() { gBrowser.selectedTab = gBrowser.addTab(leethax._updateUrl) },
							}];

							const priority = nb.PRIORITY_INFO_LOW;
							nb.appendNotification('leethax.net extension update available!',
								'leethax-update',
								'chrome://leethax/content/icon.png',
								priority, buttons);
						}
					}
				};
				request.send(null);

				return;
			}
	},
}

window.addEventListener("load", leethax.init, false);