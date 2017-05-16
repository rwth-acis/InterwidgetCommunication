/*
 * Copyright (c) 2015 Advanced Community Information Systems (ACIS) Group, Chair
 * of Computer Science 5 (Databases & Information Systems), RWTH Aachen
 * University, Germany All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * Neither the name of the ACIS Group nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
// WIP re-implementation

(function(window){
	
	'use strict';
	function define_IWC(){
		var IWC = {};
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
		}
		
		//private variables
		this._connected = false;
		this._categories = categories;
		this._callback = null;
		
		//onIntent is called when an intent is received. A JSON intent object is passed to the function
		this.onIntent = function(){};
	};

	/**
	 * Connect widget to messaging. This sets up the callback function and creates
	 * an event listener for HTML5 messaging.
	 * @param {function} callback - The callback function used for receiving messages.
	 */
	iwc.Client.prototype.connect = function(callback) {
		this._callback = callback;
		window.addEventListener('message',callback,false);
	};

	/**
	 * Disconnect the widget from messaging. This removes the event listener
	 * and the callback.
	 */
	iwc.Client.prototype.disconnect = function() {
		window.removeEventListener('message', this._callback, false);
		this._callback = null;
	};

	// first send locally, if flag iwc.util.FLAGS is set send via yjs
	/**
	 * Publishes an intent, 
	 * @param {intent} - The intent about to be published, this object contains all information.
	 */
	iwc.Client.prototype.publish = function(intent) {
		if (iwc.util.validateIntent(intent)) {
			//var envelope = {"type":"JSON", "event":"publish", "message":intent};
			publishLocal(intent);		
		}
	};

	var publishLocal = function(intent) {
		//Find iframe and post message
		//alert("Sender: " + intent.sender);
		var frames = $(".widget",parent.document).find("iframe");
		frames.each(function(){
			if ($(this).contents().find("head").find("title").text() === intent.receiver) {
				//alert("Posting message");
				this.contentWindow.postMessage(intent, "http://127.0.0.1:8073");
			}			
		});
	};

	//======================= iwc.util ==============================
	iwc.util = function() {
	};

	/**
	 * Used to determine whether global or local messaging should be used.
	 * Local messaging uses HTML5 messaging, global messaging uses yjs.
	 */
	iwc.util.FLAGS = {
		PUBLISH_LOCAL : "PUBLISH_LOCAL",
		PUBLISH_GLOBAL : "PUBLISH_GLOBAL"
	};

	/**
	 * Check intent for correctness.
	 */
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
	};

		return IWC;
	}

	//define globally if it doesn't already exist
	if(typeof(IWC) === 'undefined') {
		window.IWC = define_IWC();
	}
	else {
		console.log("IWC already defined.");
	}
})(window);