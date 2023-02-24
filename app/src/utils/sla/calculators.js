const { fetchRPC } = require('../fetch-rpc');
const { logSLA } = require('../../winston');
const { NODES } = require('../../config');
const { saveChartdata } = require('../save-chartdata.js')



const fetchSLAandBlockDeviation = async (Type) => {

	try {
		console.log(`Calculating SLA levels for ${Type} nodes...`);
		for (const { type, endpoints, name } of NODES) {
			if(type !== Type) return

			const level = await SLAHandlers[type](endpoints, name);

			if (SLALevels[type].length > 0 && SLALevels[type][0].level === level) {
				continue;
			}

			SLALevels[type].push({ level, name });
			
			const SLAlevel = calculateSLALevel(level)

			console.log(SLAlevel)
		}
	} catch (err) {
		console.log(`Error: ${err}`, err);
	}


}

const ethDowntimeCalculator = async (endpoints, name) => {
	try {


		for (const { url } of endpoints) {
			const blockNumber = await fetchRPC(url, {
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_blockNumber',
				params: [],
			});
			const getSingleBlock = await fetchRPC(url, {
				jsonrpc: '2.0',
				id: 1,
				method: 'eth_getBlockByNumber',
				params: [blockNumber, true],
			});


			//for frontend
			const hex_gasUsed = getSingleBlock.gasUsed
			const gasUsed = parseInt(hex_gasUsed)

			console.log(gasUsed)



			const currentTimestamp = Math.floor(new Date().getTime() / 1000);
			const blockTimestamp = parseInt(getSingleBlock?.timestamp, 16);
			const blockTimeDifference = currentTimestamp - blockTimestamp;
			logSLA(`Block time difference for ${name} is ${blockTimeDifference} seconds.`);

			const date = new Date(currentTimestamp * 1000)

	

			saveChartdata("EVM", 
			date,
			currentTimestamp,
			blockTimestamp,
			blockTimeDifference,
			gasUsed,
			blockNumber
			)



			return {blockTimeDifference, currentTimestamp};
		}
	} catch (err) {
		logSLA(`Error: ${err}`, err);
	}
};

const btcDowntimeCalculator = async (endpoints, name) => {
	try {
		for (const { url } of endpoints) {
			const blockchainInfo = await fetchRPC(url, {
				jsonrpc: '2.0',
				id: 1,
				method: 'getblockchaininfo',
				params: [],
			});


			const blockstats = await fetchRPC(url, {
				jsonrpc: '2.0',
				id: 1,
				method: 'getblockstats',
				"params": [blockchainInfo?.blocks, 
				],
			});

			let trustedUrl;
			let nodeUrl;
			for (const { trusted, url } of endpoints) {
				if (trusted) {
					console.log("trusted", url)
					trustedUrl = url;
				} else {
					console.log("not trusted", url)
					nodeUrl = url;
				}
			}

			const GetLatestBlock = async () => {

				const blockchainInfo_trusted = await fetchRPC(trustedUrl, {
					jsonrpc: '2.0',
					id: 1,
					method: 'getblockchaininfo',
					params: [],
				});
	
	
				const LatestBlock = await fetchRPC(nodeUrl, {
					jsonrpc: '2.0',
					id: 1,
					method: 'getblockchaininfo',
					"params": [],
				});

				const LastBlock = parseInt(blockchainInfo_trusted?.blocks, 16);
				const LatestBlock_trusted = parseInt(LatestBlock?.blocks, 16);

				return {LastBlock, LatestBlock_trusted}

			}

			
			const {LastBlock, LatestBlock_trusted} = await GetLatestBlock()

		

	
			const blocksBehind = LatestBlock_trusted - LastBlock;





			const total_fee = blockstats.totalfee
			const blockNumber = blockchainInfo?.blocks



			const currentTimestamp = Math.floor(new Date().getTime() / 1000);
			const blockTimestamp = blockchainInfo?.mediantime;
			const blockTimeDifference = currentTimestamp - blockTimestamp;
			logSLA(`Block time difference for ${name} is ${blockTimeDifference} seconds.`);

			const date = new Date(currentTimestamp * 1000)

			saveChartdata("NONEVM", 
			date,
			currentTimestamp,
			blockTimestamp,
			blocksBehind,
			blockNumber,
			total_fee
			)





			return {blockTimeDifference, currentTimestamp};
		}
	} catch (err) {
		logSLA(`Error: ${err}`, err);
	}
};

const calculateSLALevel = (downtime) => {
	if (downtime <= 900) {
		return 0.99;
	} else if (downtime <= 3600) {
		return 0.96;
	} else if (downtime <= 10800) {
		return 0.88;
	} else if (downtime <= 21600) {
		return 0.75;
	} else {
		return 0.5;
	}
};

const SLALevels = {
	EVM: [],
	'NON-EVM': [],
};

const SLAHandlers = {
	EVM: ethDowntimeCalculator,
	'NON-EVM': btcDowntimeCalculator,
};

module.exports = {
	calculateSLALevel,
	ethDowntimeCalculator,
	btcDowntimeCalculator,
};
