// ***************************************************************

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');

var urlsToRedirect = [
	// BEGIN EXTENSION URLS
		// Cross-domain access
		/^https?:\/\/(apps\.facebook\.com)\/crossdomain\.xml/,

		// Angry Birds
		/^https?:\/\/(d3t8o3t65sk1l3\.cloudfront\.net|angrybirds-facebook\.appspot\.com)\/flash\/AngryBirdsFacebook-[0-9a-f]{40}\.swf/,

		// Marvel: Avengers Alliance
		/^https?:\/\/((marvel|maa)\d+-.\.akamaihd\.net)\/marvelshield\/production(_n\d+)?\/ac\/\w+\/client\/swf\/([a-z][a-z]_[A-Z][A-Z]\/)?(rsl\/)?(client|ce|clientLH|client2)\.swf/,

		// Bejeweled Blitz
		/^https?:\/\/ecl\.labs\.popcap\.com\/(v\d+\/)?facebook\/bj2\/((Blitz3GamePreloader|Blitz3Game)\.swf|data\.xml)/,

		// Bubble Island
		/^https?:\/\/cdn-bi2\.wooga\.com\/assets\/\w+\/(b\/)?flash\/(BubbleIslandPrePreloader(-swf\d+)?\.swf|BubbleIsland(-swf\d+)?\.swf|BubbleIslandPrePreloaderLH(-swf\d+)?\.swf)/,

		// Bubble Witch Saga
		/^https?:\/\/bw1\.midasplayer\.com\/swf\/(preloaderBws|bubblewitch|preloaderBwsLH)\.swf/,

		// Candy Crush Saga
		/^https?:\/\/(cc\d\.midasplayer\.com|.*\.akamai\.net)(\/candycrush\.king\.com)?\/swf\/CCMain\.swf/,

		// CityVille
		/^https?:\/\/(zynga.-a\.akamaihd\.net|cityville-zc\d\.assets\d\.zgncdn\.com)\/((city-zc\d\/)?hashed\/)?9d911c19110b21541f4e8ebe52253e27\.swf/,

		// Diamond Dash
		/^https?:\/\/cdn-dd\d?\.wooga\.com\/assets\/(old\/)?(DiamondDashPrePreloader(_optimized)?(-[0-9a-f]{32})?\.swf|DiamondDash(_optimized)?(-[0-9a-f]{32})?\.swf)/,

		// Monster World
		/^https?:\/\/(cdn-mw\.wooga\.com|gp1\.wac\.edgecastcdn\.net)\/(00581B\/\/)?gardens\/modules\/(MonsterBootstrap\.\d+\.swf|MonsterGardenModule\.\d+\.swf|MonsterMainModule\.\d+\.swf)/,

		// Slotomania
		/^https?:\/\/(playtika\.cotssl\.net|vs-fb\.playtika\.com|static\.playtika\.com|store-ssl-\d+\.playtika\.com)\/playtika\/vs_fb_en\/assets\/cid_\d+\/(VideoSlots|VideoSlotsLH)\.swf/,

		// Solitaire Blitz
		/^https?:\/\/solb-prd-ecl\.labs\.popcap\.com\/solitaireblitz\/facebook\/swfs\/latest\/v__[0-9a-f]{40}\/(core|coreLH)\.swf/,

		// Zuma Blitz
		/^https?:\/\/[^\.]+\.labs\.popcap\.com(\/\d{6})?\/+facebook\/zumablitz\/nux\/(Preloader|ZumaBlitzMain)\.swf/,
	// END EXTENSION URLS

	// Testing
	/https?:\/\/leethax\.net\/test\.swf/,
];

var bypass = /[&\/]leethax[\-=]bypass|leethax[\-=]bypass&|\?leethax[\-=]bypass$/;

function newURI(spec) {
	var http = Components.classesByID['{4f47e42e-4d23-4dd3-bfda-eb29255e9ea3}'].getService(Ci.nsIHttpProtocolHandler);
	return http.newURI(spec, null, null);
}

function rewriteUri(uri) {
	var spec = uri.spec;
	//dump(spec + "\n");
	if (spec.match(bypass))
		return newURI(spec.replace(bypass, ''));
	for (var i=0; i < urlsToRedirect.length; i++)
		if (spec.match(urlsToRedirect[i]))
			return newURI('http://' + uri.scheme + '.' + uri.host + '.proxy.leethax.net:8002' + uri.path);
	return uri;
};

function buildProxy(src, dst) {
	//dump('buildProxy('+src+', '+dst+'\n');
	for (var f in src)
		if (!(f in dst))
			(function(f, dst) {
				if (typeof(src[f]) == 'function')
					dst[f] = function() {
						return src[f].apply(src, arguments);
					};
				else {
					dst.__defineGetter__(f, function() {
						return src[f];
					});
					dst.__defineSetter__(f, function(val) {
						src[f] = val;
					});
				}
			})(f, dst);
}

function HttpProtocolHandlerProxy() {
	this.wrappedJSObject = this;
}

HttpProtocolHandlerProxy.prototype = {
	classDescription : 'leethax.net http protocol service proxy',
	classID          : Components.ID('{af99f54d-2e41-7542-8ff8-937bc8156ef6}'),
	contractID       : '@mozilla.org/network/protocol;1?name=http',

	QueryInterface : function(iid) {
		this.QueryInterface = XPCOMUtils.generateQI([
			Ci.nsISupports,
			Ci.nsIProtocolHandler,
			Ci.nsIProxiedProtocolHandler,
			Ci.nsIHttpProtocolHandler,
		]);

		buildProxy(this._getOriginal(), this);

		return this.QueryInterface(iid);
	},

	_getOriginal : function() {
		return Components.classesByID['{4f47e42e-4d23-4dd3-bfda-eb29255e9ea3}'].getService(Ci.nsIHttpProtocolHandler);
	},

	newChannel : function() {
		var orig = this._getOriginal();
		arguments[0] = rewriteUri(arguments[0]);
		alert(arguments[0]);
		return orig.newChannel.apply(orig, arguments);
	},

	newProxiedChannel : function() {
		var orig = this._getOriginal();
		arguments[0] = rewriteUri(arguments[0]);
		alert(arguments[0]);
		return orig.newProxiedChannel.apply(orig, arguments);
	},
}

function HttpsProtocolHandlerProxy() {
	this.wrappedJSObject = this;
}

HttpsProtocolHandlerProxy.prototype = {
	classDescription : 'leethax.net https protocol service proxy',
	classID          : Components.ID('{ff86a776-ce15-452f-b345-fc1ef0758bc3}'),
	contractID       : '@mozilla.org/network/protocol;1?name=https',

	QueryInterface : function(iid) {
		this.QueryInterface = XPCOMUtils.generateQI([
			Ci.nsISupports,
			Ci.nsIProtocolHandler,
			Ci.nsIProxiedProtocolHandler,
			Ci.nsIHttpProtocolHandler,
		]);

		buildProxy(this._getOriginal(), this);

		return this.QueryInterface(iid);
	},

	_getOriginal : function() {
		return Components.classesByID['{dccbe7e4-7750-466b-a557-5ea36c8ff24e}'].getService(Ci.nsIHttpProtocolHandler);
	},

	newChannel : function() {
		var orig = this._getOriginal();
		arguments[0] = rewriteUri(arguments[0]);
		alert(arguments[0]);
		return orig.newChannel.apply(orig, arguments);
	},

	newProxiedChannel : function() {
		var orig = this._getOriginal();
		arguments[0] = rewriteUri(arguments[0]);
		alert(arguments[0]);
		return orig.newProxiedChannel.apply(orig, arguments);
	},
}

// ***************************************************************

if (XPCOMUtils.generateNSGetFactory) {
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([HttpProtocolHandlerProxy, HttpsProtocolHandlerProxy]);
} else {
	var NSGetModule = XPCOMUtils.generateNSGetModule([HttpProtocolHandlerProxy, HttpsProtocolHandlerProxy]);
}