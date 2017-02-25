var querystring = require('querystring');
var http = require('http');

var host = 'cloud.nimbits.com';
var username = 'pkolonay';
var password = '*****';
var apiKey = 'reband';
var email = username + '@gmail.com';

exports.performRequest = function performRequest(endpoint, method, data) {
  var dataString = JSON.stringify(data);
  var headers = {};
  
  
  endpoint += '?email=' + email + '&key=' + apiKey;
  endpoint += data;
  console.log('endpoint: '+endpoint);

  if (method == 'POST') {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
    console.log('dataString->'+dataString + ' length-> ' + dataString.length);
  }

  var options = {
    host: host,
    port: 80,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
    });
  });

  req.write(dataString);
  req.end();
}

