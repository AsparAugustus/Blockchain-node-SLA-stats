const { logMessage } = require('../winston');
const { checkEVMAvailability } = require('../handlers/evm');
const { checkBTCAvailability } = require('../handlers/btc');
const fs = require('fs')
const path = require('path')


const EVM = 'EVM',
	NON_EVM = 'NON-EVM';

const handlers = {
	[EVM]: checkEVMAvailability,
	[NON_EVM]: checkBTCAvailability,
};

const saveAvailabilityData = (node_type, availability) => {

	// Read the existing data from file, if any
	let existingData = [];
	const filename = `${node_type}_availabilitydata.json`

	const currentTimestamp = Math.floor(new Date().getTime() / 1000);

	data = {
		node_type: node_type,
		currentTimestamp: currentTimestamp,
		availability: availability
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



const checkAvailability = async (node, integrityCheck) => {
	try {

		saveAvailabilityData(node.type, await handlers[node.type](node, integrityCheck))

		return await handlers[node.type](node, integrityCheck);

	
	} catch (error) {
		logMessage(error, error);
		return false;
	}
};

module.exports = {
	checkAvailability,
};
