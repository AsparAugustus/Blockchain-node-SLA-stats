const router = require('express').Router();
const { PORT } = require('./config');
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const app = express();
const fs = require('fs');
require('./utils/schedule');


// Cors config
const whitelist = ['http://localhost:3000', 'http://localhost:4200'];
const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	methods: 'GET, POST, PUT, DELETE, OPTIONS',
	credentials: true,
};

// Cors and body parser
app.use(cors(corsOptions));
app.use(express.json());

// Static files
app.use(express.static('public'));
app.use('/assets', express.static('assets'));

// Health check
app.use(
	'/api',
	router.get('/health', (_, res) => res.status(200).send('OK'))
);


// app.use(
// 	'/results',
// 	(req, res) => {
// 		const stream = fs.createReadStream('./logs/availability-checks.log', { encoding: 'utf-8' });
// 		let data = '';
	  
// 		stream.on('data', chunk => {
// 		  data += chunk;
// 		});
	  
// 		stream.on('end', () => {
// 		  // Split the lines and parse each JSON object
// 		  const logs = data.split('\n').filter(line => line.trim() !== '').map(JSON.parse);
	  
// 		  res.json(logs);
// 		});
	  
// 		stream.on('error', err => {
// 		  console.error(err);
// 		  res.status(500).send('Server Error');
// 		});
// 	  });

app.get('/data', (req, res) => {

	// console.log(process.cwd(), fs.readdirSync(process.cwd()))

	if (fs.existsSync("EVM_chartdata.json")) {
		fs.readFile('EVM_chartdata.json', (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
		  });
	}



  });

app.get('/databtc', (req, res) => {

// console.log(process.cwd(), fs.readdirSync(process.cwd()))

if (fs.existsSync("NONEVM_chartdata.json")) {
	fs.readFile('NONEVM_chartdata.json', (err, data) => {
		if (err) throw err;
		let jsonData = JSON.parse(data);
		res.json(jsonData);
		});
}



});

app.get('/evm-sla', (req, res) => {

// console.log(process.cwd(), fs.readdirSync(process.cwd()))

const name = "EVM_SLAdata.json"

if (fs.existsSync(name)) {
	fs.readFile(name, (err, data) => {
		if (err) throw err;
		let jsonData = JSON.parse(data);
		res.json(jsonData);
		});
}



});

app.get('/non-evm-sla', (req, res) => {

	const name = "NON-EVM_SLAdata.json"
	
	if (fs.existsSync(name)) {
		fs.readFile(name, (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
			});
	}
	
	
	
	});

app.get('/evm-avail', (req, res) => {

	const name = "EVM_availabilitydata.json"
	
	if (fs.existsSync(name)) {
		fs.readFile(name, (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
			});
	}
	
	
	
	});

app.get('/nonevm-avail', (req, res) => {

	const name = "NON-EVM_availabilitydata.json"
	
	if (fs.existsSync(name)) {
		fs.readFile(name, (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
			});
	}
	
	
	
	});


app.get('/evm-integrity', (req, res) => {

	const name = "EVM_integritydata.json"
	
	if (fs.existsSync(name)) {
		fs.readFile(name, (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
			});
	}
		
		

});
	
app.get('/nonevm-integrity', (req, res) => {

	const name = "NON-EVM_integritydata.json"
	
	if (fs.existsSync(name)) {
		fs.readFile(name, (err, data) => {
			if (err) throw err;
			let jsonData = JSON.parse(data);
			res.json(jsonData);
			});
	}
	
	
	
	});
	
	


// Render SLA levels in HTML
app.use('/', require('./routes/sla-routes'));

app.listen(PORT, () => {
	console.log(chalk.cyan(`Express server listening on port ${PORT}`));
});
