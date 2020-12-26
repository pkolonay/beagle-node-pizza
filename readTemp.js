var b = require('bonescript');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');
var nimbits = require('./nimbits');
var request = require('request')
var constants = require('constants');


var tempNow;

var readInterval = 1000; // read input interval

// Save reading every 10 minutes
var saveInterval = 60000 * 10; // save reading to file
// Write temperature readings to this file
var tempLogFile = path.join(process.cwd(), '/.temps');

var temp_f;
var temp_c;
var mvInputAin1;

//var certFile = fs.readFileSync('certificates/testproxyclient.crt');
//var keyFile = fs.readFileSync('certificates/testproxyclient.key');

var vm_info = {
  host: 'qvoiceanalytics.honeywell.com',
  port: 443,
  customerId: 'kolonay'
};

// Get platform information and display
var platform = b.getPlatform((x) => {
    console.log('name = ' + x.name);
    console.log('version = ' + x.version);
    console.log('serialNumber = ' + x.serialNumber);
    console.log('bonescript = ' + x.bonescript);
    return x;
} );

//function post (event, vm_info, posthandler) {
//  var URL = 'https://' + vm_info.host + ':' + vm_info.port + '/data/' + vm_info.customerId;
//  console.log('Sending message to ' + URL);
//  console.log('Message = ' + JSON.stringify(event));
//  request.post(
//    URL,
//    {   form: { event: JSON.stringify(event) },
//        strictSSL: true,
//        agentOptions: {
//            secureProtocol: 'SSLv23_method',
//            secureOptions: constants.SSL_OP_NO_SSLv3,
//            cert: certFile,
//            key: keyFile,
//        }
//    },
//    function (error, response, body) {
//      posthandler(error, response, event, body);
//    }
//  );
//};

// Read the analog input pin based on the read interval
function readLoop () {         //  create a loop function
   setTimeout(function () {    //  call a 3s setTimeout when the loop is called
      b.analogRead('P9_40', readTemp);
      readLoop();              //  ..  again which will trigger another 
   }, readInterval)
}

function readTemp(x) {
	// Convert to milliVolts scaled to max value
	mvInput = x.value * 1800;
	// TMP36 mv to C conversion.
	temp_c = (mvInput - 500) / 10;
	// Convert to F.
	temp_f = (temp_c * 9/5) + 32;
        temp_f = parseFloat(Math.round(temp_f *100)/100).toFixed(2);
}

function printStatus(x) {

	var ts_hms = new Date();
        var dt = dateFormat(ts_hms.request_date, "yyy-mm-dd h:MM:ss"); 

	tempNow = temp_f + " degrees F";
	console.log(dt + " " + temp_f);
	//storeReading(tempLogFile, {'time': ts_hms, 'temperature_f': temp_f});
	storeReading(tempLogFile, ts_hms + " " + "temp = " + temp_f);
}

setInterval(printStatus, saveInterval);

function storeReading(tempLogFile, data) {
        console.log(data)
	fileStream.write(data+"\n", 'utf8', function(err) {
		if (err) throw err;
		console.log('Saved.');
	});
// This was for the days when Operation Acuity was the endpoint
//        messageObject = {'messages':[{'customerId':'kolonay','time':new Date(),'deviceName':platform.bonescript,'message':data,'site':{'id':'-1','name':'Default','timezone':'America/New_York'}}]};
//	post(messageObject,vm_info,function(err,res, body) {
//          if(err) {
//            console.log('sumtin wong');
//            console.log(err);
//          } else {
//            console.log(body);
//          }
//       }); 
}


var fileStream = fs.createWriteStream(tempLogFile, {flags:'a', encoding:'utf8'});
fileStream.on('open', function() {readLoop();});


var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var html = fs.readFileSync('index.html', 'utf8');

function handler (req, res) {
	res.setHeader('Content-Type', 'text/html');
 	res.setHeader('Content-Length', Buffer.byteLength(html, 'utf8'));
	res.end(html);
}
	
function tick() {
//	var now = new Date().toUTCString();
	io.sockets.send(temp_f);
}

setInterval(tick, readInterval);

app.listen(3001);

