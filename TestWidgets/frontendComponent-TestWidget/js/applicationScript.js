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

var client;

var init = function () {

  sendContent.bind(this);
  $("#sendBtn").click(sendContent);

  Y({
    db: {
      name: 'memory'
    },
    connector: {
      name: 'websockets-client',
      room: 'cae-room'
    },
    sourceDir: "http://localhost:8080/frontendComponent-TestWidget/bower_components",
    share: {
      textArea: 'Text',
      intents: 'Map'
    }
  }).then(function (y) {
    initClient(y);
  }).catch(function (y) {
      console.log("YJS failed to load");
  });

  var initClient = function(y) {
    this.client = new Las2peerWidgetLibrary("", iwcCallback, "http://127.0.0.1:8073", y);
    console.log("Client initialized");
  };

};

var iwcCallback = function (intent) {
  // define your reactions on incoming iwc events here 
  //console.log(intent);
  if (intent.action == "receiveUpdate") {
    updateContent(intent.data);
  }
};

var sendContent = function () {
  var content = document.getElementById('textArea').value;
  // Get widget title
  var sender = $("head").find("title")[0].text;
  //alert("sending " + content);
  //Send locally to widget with title "ReceiveWidget"
  client.sendIntent(sender, "ReceiveWidget", "update", content, false);
};

// updateContent
var updateContent = function (content) {

};

$(document).ready(function () {
  init();
});
