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

/**
 * Instantiates a new Las2peerWidgetLibrary, given its endpoint URL and the
 * IWC-callback function
 * @param {string} endpointUrl - endpoint URL for the respective microservice of the widget if it has one
 * @param {function} iwcCallback - The callback used for interwidget communication.
 * @param {string} origin - The origin (i.e. the url where your application script lives) is needed for messaging
 * @param {object} y - yjs reference 
 */
function Las2peerWidgetLibrary(endpointUrl, iwcCallback, origin, y) {
  // care for widget frontends without a microservice backend
  if (endpointUrl === null) {
    endpointUrl = "not specified";
  }
  // care for trailing slash in endpoint URL
  if (endpointUrl.endsWith("/")) {
    this._serviceEndpoint = endpointUrl.substr(0, endpointUrl.length - 1);
  } else {
    this._serviceEndpoint = endpointUrl;
  }

  //Check origin
  if (origin === undefined) {
    console.error("Origin not set, local messaging will not work!");
  }

  //Create a client for interwidget communication
  this.iwcClient = new IWC.Client(null, origin, y);
  //Define your callback, the callback will receive intent objects
  this.callback = iwcCallback;
  //Bind the callback
  this.iwcClient.connect(iwcCallback);
}

/**
 * Sends an AJAX request to a resource.
 *
 * @override
 * @this {Las2peerWidgetLibrary}
 * @param {string}
 *          method the HTTP method used
 * @param {string}
 *          relativePath the path relative to the client's endpoint URL
 * @param {object}
 *          content the content to be sent in the HTTP request's body
 * @param {string}
 *          mime - the MIME-type of the content
 * @param {string}
 *          customHeaders a JSON string with additional header parameters to be
 *          sent
 * @param {string}
 *          authenticate a boolean, fetches the oidc token from localstorage and
            sends it with the request if true
 * @param {string}
 *          successCallback a callback function invoked in case the request
 *          succeeded. Expects two parameters "data" and "type" where "data"
 *          represents the content of the response and "type" describes the
 *          MIME-type of the response.
 * @param {string}
 *          errorCallback a callback function invoked in case the request
 *          failed. Expects one parameter "error" representing the error
 *          occurred.
 */
Las2peerWidgetLibrary.prototype.sendRequest = function (method, relativePath,
  content, mime, customHeaders, authenticate, successCallback, errorCallback) {
  var mtype = "text/plain; charset=UTF-8";
  if (mime !== 'undefined') {
    mtype = mime;
  }

  var rurl = this._serviceEndpoint + "/" + relativePath;

  var ajaxObj = {
    url: rurl,
    type: method.toUpperCase(),
    data: content,
    contentType: mtype,
    crossDomain: true,
    headers: {},
    error: function (xhr, errorType, error) {
      console.log(error);
      var errorText = error;
      if (xhr.responseText !== null && xhr.responseText.trim().length > 0) {
        errorText = xhr.responseText;
      }
      errorCallback(errorText);
    },
    success: function (data, status, xhr) {
      var type = xhr.getResponseHeader("Content-Type");
      successCallback(data, type);
    },
  };

  if (customHeaders !== undefined && customHeaders !== null) {
    $.extend(ajaxObj.headers, customHeaders);
  }
  if (authenticate === true) {
    console.log("Authenticated request...");
    var tokenHeader = { 'access_token': window.localStorage.access_token };
    $.extend(ajaxObj.headers, tokenHeader);
    //%%something%% placeholders can be replaced with the code generation service
    var endPointHeader = { 'oidc_provider': 'https://api.learning-layers.eu/o/oauth2' };
    $.extend(ajaxObj.headers, endPointHeader);
  } else {
    console.log("Anonymous request...");
  }
  $.ajax(ajaxObj);
};

/**
 * Sends an intent
 * If global is true broadcast via yjs otherwise send directly to specified receiver.
 * @param {string} sender - The identifier of the sending widget
 * @param {string} receiver - The identifier of the target to receive the message
 * @param {string} action - The action to perform
 * @param {object} data - Data to be send with the message
 * @param {string} global - Flag whether the intent is for local or global broadcast
 */
Las2peerWidgetLibrary.prototype.sendIntent = function (sender, receiver, action, data, global) {
  if (global === null) {
    global = true;
  }
  var intent = new IWC.Intent(sender, receiver, action, data, global);
  this.iwcClient.publish(intent);
};

/**
 * Convenience function to check if a String ends with a given suffix.
 * @param {string} suffix - The suffix to check for.
 */
String.prototype.endsWith = function (suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
