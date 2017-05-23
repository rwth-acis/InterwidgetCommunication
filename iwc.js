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
(function (window) {
	'use strict';
	function define_IWC() {
		var IWC = {};
		
		IWC.Intent = function (sender, receiver, action, data, global) {
			this.sender = sender;
			this.receiver = receiver;
			this.data = data;
			this.dataType = "text/xml";
			this.action = action;
			this.categories = ["", ""];
			this.flags = [global ? "PUBLISH_GLOBAL" : "PUBLISH_LOCAL"];
			this.extras = {};
		};

		IWC.Client = function (categories, origin, y) {

			//console.log(y);
			this._y = y;
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
			}

			//private variables
			this._connected = false;
			this._categories = categories;
			this._callback = null;

			// Needed for HTML5 messaging
			this._origin = origin;
		};

		/**
		 * Connect widget to messaging. This sets up the callback function and creates
		 * an event listener for HTML5 messaging.
		 * @param {function} callback - The callback function used for receiving messages.
		 */
		IWC.Client.prototype.connect = function (callback) {
			this._callback = callback;
			var handler = receiveMessage.bind(this);
			window.addEventListener('message', handler, false);

			if (!(this._y === null || this._y === undefined )) {
				// If yjs is available also connect a global listener
				if (this._y.share.intents !== undefined)
					this._y.share.intents.observe(handler);
			}
		};

		/**
		 * Disconnect the widget from messaging. This removes the event listener
		 * and the callback.
		 */
		IWC.Client.prototype.disconnect = function () {
			window.removeEventListener('message', receiveMessage, false);
			this._callback = null;

			if (!(this._y === null || this._y === undefined)) {
				this._y.share.intents.unobserver(receiveMessage);
			}
		};

		/**
		 * Publishes an intent, 
		 * @param {intent} - The intent about to be published, this object contains all information.
		 */
		IWC.Client.prototype.publish = function (intent) {
			if (IWC.util.validateIntent(intent)) {
				if (intent.flags[0] === IWC.util.FLAGS.PUBLISH_GLOBAL) {
					publishGlobal(intent, this._y);
				} else if (intent.flags[0] === IWC.util.FLAGS.PUBLISH_LOCAL) {
					publishLocal(intent, this._origin);
				}
			}
		};

		var publishLocal = function (intent, origin) {
			//Find iframe and post message
			console.log(intent);
			var frames = $(".widget", parent.document).find("iframe");
			frames.each(function () {
				if ($(this).contents().find("head").find("title").text() === intent.receiver) {
					this.contentWindow.postMessage(intent, origin);
				}
			});
		};

		var publishGlobal = function (intent, y) {
			//y.share.intents.push(intent);
			y.share.intents.set(0, intent);
		};

		/**
		 * Unpack events and pre process them
		 * @param {Event} event - The event that activated the callback
		 */
		var receiveMessage = function (event) {
			//console.log(event);
			// Local messaging events
			if (event.type === "message") {
				//Unpack message events
				if (event instanceof MessageEvent) {
					//console.log(event);
					this._callback(event.data);
				}
			} else if (event.type === "insert") {
				//Unpack yjs event
				alert(event);
			}
		};

		//======================= IWC.util ==============================
		IWC.util = function () {
		};

		/**
		 * Used to determine whether global or local messaging should be used.
		 * Local messaging uses HTML5 messaging, global messaging uses yjs.
		 */
		IWC.util.FLAGS = {
			PUBLISH_LOCAL: "PUBLISH_LOCAL",
			PUBLISH_GLOBAL: "PUBLISH_GLOBAL"
		};

		/**
		 * Check intent for correctness.
		 */
		IWC.util.validateIntent = function (intent) {
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
	if (typeof (IWC) === 'undefined') {
		window.IWC = define_IWC();
	}
	else {
		console.log("IWC already defined.");
	}
})(window);