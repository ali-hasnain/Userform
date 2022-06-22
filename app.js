var express = require("express");
var bodyParser = require("body-parser");
require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var analyticsClient = require('./ZohoAnalyticsNodeJsClient/AnalyticsClient');

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var refreshtoken = process.env.REFRESH_TOKEN;
var orgId = '60000460986';
var workspaceId = '103074000002015532';
var viewId = '103074000014988016';
var ac = new analyticsClient(clientId, clientSecret, refreshtoken);

var app = express()

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

function InsertData(data) {

	var datetime = new Date();
	//datetime = datetime.toISOString().slice(0,10).split('-').reverse().join('/');	var columnValues = {};
	var columnValues = {};
	columnValues['email'] = data.email;
	columnValues['phone'] = data.mobile;
	columnValues['name'] = data.name;
	columnValues["updatedAt"] = datetime.toString();

	var config = {};
	//config['dateFormat'] = 'dd/MM/yyyy';
	var view = ac.getViewInstance(orgId, workspaceId, viewId);
	view.addRow(columnValues, config).then((response) => {
		console.log(response);

	}).catch((error) => {
		console.log('errorCode : ' + error.errorCode);
		console.log('errorMessage : ' + error.errorMessage);
	});

}

function SendMail(email, body) {
	const msg = {
		to: email, // Change to your recipient
		from: 'test@example.com', // Change to your verified sender
		subject: 'OTP',
		text: 'Your OTP is:',
		html: '<strong>' + body + '</strong>',
	}
	sgMail
		.send(msg)
		.then((response) => {
			console.log('Email sent: '+response)
		})
		.catch((error) => {
			console.error(error)
		})
}

app.post('/submit', function (req, res) {
	try{	
	var { name, email, mobile } = req.body;
	console.log("REQ: " + JSON.stringify(req.body));
	InsertData(req.body);
	return res.redirect('signup_success.html');
	}
	catch(error)
	{
		console.log("Error: "+error);
		res.json({ "code": 0, "message": "Error submitting data." });
	}
})

app.post('/send_otp', function (req, res) {
	try{
	var { email, otp } = req.body;
	console.log("REQ: " + JSON.stringify(req.body));
	SendMail(email, otp);
	res.json({ "code": 1, "message": "otp sent sucessfully." });
	}
	catch(error)
	{
		console.log("Error: "+error);
		res.json({ "code": 0, "message": "Error sending otp." });
	}
	})


app.get('/', function (req, res) {
	res.set({
		'Access-control-Allow-Origin': '*'
	});
	return res.redirect('index.html');
}).listen(3000)


console.log("server listening at port 3000");
