const cron = require('node-cron');
const { logSLA } = require('../../winston');
const { NODES } = require('../../config');
const { ethDowntimeCalculator, btcDowntimeCalculator, calculateSLALevel } = require('./calculators');
const fs = require('fs')
const path = require('path')





const SLALevels = {
	EVM: [],
	'NON-EVM': [],
};

const SLAHandlers = {
	EVM: ethDowntimeCalculator,
	'NON-EVM': btcDowntimeCalculator,
};


const saveSLAdata = (node_type, currentTimestamp, date, SLAlevel) => {

	// Read the existing data from file, if any
	let existingData = [];
	const filename = `${node_type}_SLAdata.json`

	data = {
		node_type: node_type,
		currentTimestamp: currentTimestamp,
		date: date,
		SLAlevel: SLAlevel
	}

	try {
        if (fs.existsSync(filename)) {
            console.log(filename)
            existingData = JSON.parse(fs.readFileSync(filename));
          }

    } catch (err) {
        console.log(err)
    }

      
      // Append the new data to the existing data array
      const newData = existingData.concat(data);
      
      try {
        fs.writeFileSync(filename, JSON.stringify(newData));
		console.log(`${filename} written successfully!`);
      } catch (error) {
        console.log(`Error writing file ${filename}`, error);
      }


}




// cron.schedule('0 0 0 * * *', async () => {
cron.schedule('*/15 * * * * *', async () => {
	try {
		logSLA('Calculating SLA levels for Ethereum and Bitcoin nodes...');
		for (const { type, endpoints, name } of NODES) {
			const level = await SLAHandlers[type](endpoints, name);

			if (SLALevels[type].length > 0 && SLALevels[type][0].level === level) {
				continue;
			}

			SLALevels[type].push({ level, name });
			logSLA(`Calculation complete. ${name} is at ${calculateSLALevel(level)} SLA level.`);

			const currentTimestamp = Math.floor(new Date().getTime() / 1000);
			const date = new Date(currentTimestamp * 1000)

			
			saveSLAdata(type, currentTimestamp, date, calculateSLALevel(level))
		}
	} catch (err) {
		logSLA(`Error: ${err}`, err);
	}
});

logSLA('');

module.exports = {
	SLALevels,
};
