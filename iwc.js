// WIP re-implementation
iwc = function(){
};

iwc.Client = function(categories) {

	this._componentName = "unknown";
	
	if (typeof window.location !== "undefined" &&
			typeof window.location.search === "string" &&
			typeof window.unescape === "function") {
		var pairs = window.location.search.substring(1).split("&"), pair, query = {};
		if (!(pairs.length == 1 && pairs[0] === "")) {
			for (var p = 0; p < pairs.length; p++) {
				pair = pairs[p].split("=");
				if (pair.length == 2) {
					query[pair[0]] =
						window.unescape(pair[1]);
				}
			}
		}
		if (typeof query.url === "string") {
			this._componentName = query.url;
		}
		//console.log("COMPONENT NAME " + this._componentName);
	};
	
	//private variables
	this._connected = false;
	this._categories = categories;
	this._callback;
	
	//onIntent is called when an intent is received. A JSON intent object is passed to the function
	this.onIntent = function(){};
};

iwc.Client.prototype.connect = function(callback) {
	this._callback = callback;
	window.addEventListener('message',callback,false);
}

iwc.Client.prototype.disconnect = function() {
	window.removeEventListener('message', this._callback, false);
}

// first send locally, if flag iwc.util.FLAGS is set send via yjs
iwc.Client.prototype.publish = function(intent) {
	if (iwc.util.validateIntent(intent)) {
		var envelope = {"type":"JSON", "event":"publish", "message":intent};

		//Find iframe and post message
		alert("Sender: " + intent.sender);
		var frames = $(".widget",parent.document).find("iframe");
		frames.each(function(){
			alert($(this).contents().find("head").find("title").text());
		})
	}
}
//======================= iwc.util ==============================
iwc.util = function() {
};

iwc.util.FLAGS = {
	PUBLISH_LOCAL : "PUBLISH_LOCAL",
	PUBLISH_GLOBAL : "PUBLISH_GLOBAL"
};

iwc.util.validateIntent = function(intent) {
	if (typeof intent.sender != "string") {
		throw new Error("Intent object must possess property 'component' of type 'String'");
	}
	if (typeof intent.data != "string") {
		throw new Error("Intent object must possess property 'data' of type 'String'");
	}
	if (typeof intent.dataType != "string") {
		throw new Error("Intent object must possess property 'dataType' of type 'String'");
	}
	return true;
}