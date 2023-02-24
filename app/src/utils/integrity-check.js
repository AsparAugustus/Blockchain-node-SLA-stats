const { logIntegrity } = require('../winston');
const { fetchRPC } = require('./fetch-rpc');
const { cache } = require('../cache.js');
const fs = require('fs');

const check = (response, expected) => response === expected;

const saveIntegrityData = (node_type, integrity) => {

	// Read the existing data from file, if any
	let existingData = [];
	const filename = `${node_type}_integritydata.json`

	const currentTimestamp = Math.floor(new Date().getTime() / 1000);

	data = {
		node_type: node_type,
		currentTimestamp: currentTimestamp,
		integrity: integrity
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






const performIntegrityCheck = async (node) => {
	if (cache[node.type].length === 0) return;
	try {
		let integrityVerified;
		const trustedURL = node.endpoints.find((endpoint) => endpoint.trusted).url;

		if (!trustedURL) {
			logIntegrity(`No trusted node found for ${node.name}`, true);
			return;
		}

		for (let { requestData, response } of cache[node.type]) {
			let newResponse = await fetchRPC(trustedURL, requestData);
			integrityVerified = check(
				node.type === 'EVM' ? newResponse : newResponse?.initialblockdownload,
				response,
				node.name,
				integrityVerified
			);

		

		}

		if (!integrityVerified) {
			logIntegrity(`Integrity check failed for ${node.type}`, true);

			saveIntegrityData(node.type, false)
		} else {
			logIntegrity(`Integrity check passed for ${node.type}`);

			saveIntegrityData(node.type, true)
		}

	





	} catch (err) {
		logIntegrity(err, err);
	}
};

module.exports = {
	performIntegrityCheck,
};
