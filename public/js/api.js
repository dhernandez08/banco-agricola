// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }

// Send a message request to the server
  function postConversationMessage(text) {
    var data = {'input': {'text': text}};
    if (context) {
      data.context = context;
    }
    Api.setUserPayload(data);
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    http.onload = function() {
      if (http.status === 200 && http.responseText) {
        var response = JSON.parse(http.responseText);
        context = response.context;
        Api.setResponsePayload(response);
      } else {
        Api.setResponsePayload({output: {text: [
          'The service may be down at the moment; please check' +
          ' <a href="https://status.ng.bluemix.net/" target="_blank">here</a>' +
          ' for the current status. <br> If the service is OK,' +
          ' the app may not be configured correctly,' +
          ' please check workspace id and credentials for typos. <br>' +
          ' If the service is running and the app is configured correctly,' +
          ' try refreshing the page and/or trying a different request.'
        ]}});
        console.error('Server error when trying to reply!');
      }
    };
    http.onerror = function() {
      console.error('Network error trying to send message!');
    };

    http.send(JSON.stringify(data));
  }


}());


