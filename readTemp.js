var b = require('bonescript');
var dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');
var nimbits = require('./nimbits_module_2');

var tempNow;

var readInterval = 1000; // read input interval
var saveInterval = 60000 * 15; // save reading to file
var file = path.join(process.cwd(), '/.temps');

var temp_f;
var temp_c;
var mvInputAin1;

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
	storeReading(file, dt + " " + temp_f);
}

setInterval(printStatus, saveInterval);

function storeReading(file, data) {
	fileStream.write(data+"\n", 'utf8', function(err) {
		if (err) throw err;
		console.log('Saved.');
	});
        var qString = '&id=pkolonay@gmail.com/openData&json={"d":' + temp_f + '}';
        nimbits.performRequest('/service/v2/value', 'POST', qString);
}


var fileStream = fs.createWriteStream(file, {flags:'a', encoding:'utf8'});
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

app.listen(3000);

