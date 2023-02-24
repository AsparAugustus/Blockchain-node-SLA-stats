const fs = require('fs')
const path = require('path')




const saveBlockDeivation = (
    node_type, 
    date,
    currentTimestamp, 
    blockTimestamp,
    blockTimeDifference,
    gasUsed,
    blockNumber
    ) => {


    // Read the existing data from file, if any
    let existingData = [];
    const filename = `${node_type}_chartdata.json`

    data = {
        nodeType : node_type,
        date: date,
        currentTimestamp: currentTimestamp,
        blockTimestamp: blockTimestamp,
        blockTimeDifference : blockTimeDifference,
        gasUsed: gasUsed,
        blockNumber: blockNumber
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
        console.log('Data written to file successfully!');
      } catch (error) {
        console.log(`Error writing file ${filename}`, error);
      }




}


module.exports = {
    saveChartdata: saveChartdata
  };