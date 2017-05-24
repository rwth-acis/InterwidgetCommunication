# InterwidgetCommunication
This repository contains JS libraries for interwidget communication and las2peer connectivity.

## Usage
For a full example, take a look at the example ROLE widgets in this repository.
Add iwc.js and las2peerWidgetLibrary.js after y.js and jQuery and before your own scripts.
```html
<!-- import jQuery for AJAX calls -->
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
  <!-- additional widget specific imports (put your own imports here as well) -->
  <script src=".../bower_components/yjs/y.js"></script>
  <!-- inter widget communication library import -->
  <script type="text/javascript" src=".../js/lib/iwc.js"></script>
  <!-- import the client library -->
  <script type="text/javascript" src=".../js/lib/las2peerWidgetLibrary.js"></script>
  <!-- import application script -->
  <script type="text/javascript" src=".../js/applicationScript.js"></script>
```

### General preparations
Set up [y-js](https://github.com/y-js/yjs), a map named "intents" is neccessary.
```javascript
Y({
  db: {
    ...
  },
  connector: {
    ...
  },
  sourceDir: ... ,
  share: {
    intents: 'Map'
  }
}).then(function (y) {
  initClient(y);
})
```

Initialise the iwc client:
```javascript
...
var initClient = function(y) {
  this.client = new Las2peerWidgetLibrary("", iwcCallback, "http://127.0.0.1:8073", y);
  console.log("Client initialized");
};
...
```

If you want to react to messages, you have to define a callback function:
```javascript
...
var iwcCallback = function (intent) {
  // define your reactions on incoming iwc events here 
};
...
```

### Sending messages
You have to decide on an address for messaging. In the examples we use the title of [ROLE](https://github.com/rwth-acis/ROLE-SDK) widgets.
An example of sending the content of a textArea locally by using the title of the widget as the address ...
```javascript
...
var content = document.getElementById('textArea').value;
// Get widget title
var sender = $("head").find("title")[0].text;
//Send locally to widget with title "ReceiveWidget"
client.sendIntent(sender, "ReceiveWidget", "update", content, false);
...
```

or globally ...
```javascript
client.sendIntent(sender, "ReceiveWidget", "update", content, true);
```

### Receiving messages
