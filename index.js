// compare two list of addresses

// import libraries
const fs = require('fs-extra');

// import local modules
const compareFiles = require('./modules/compare-addresses');

// paths
const csvPathA = './data/2020_LIE_matched-final_v2_manual-clean.csv';
const csvPathB = './data/LMI-B_2015_www+teren+gis_v32_manual-clean.csv';

// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// ////////////////////////////////////////////////////////////////////////////
// // MAIN function
function main () {

  // help text
  const helpText = `\n Available commands:\n\n\
  1. -h : display help text\n\
  2. -c : compare the two addresses from provided files\n`;

  // get command line arguments
  const arguments = process.argv;
  console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.table(arguments);
  console.log('\n');

  // get third command line argument
  // if third argument is missing, -h is set by default
  const mainArg = process.argv[2] || '-h';
  // get the rest of the arguments
  // const inPathArg = process.argv[3];
  // const outPathArg = process.argv[4];

  // run requested command
  // 1. if argument is 'h' or 'help' print available commands
  if (mainArg === '-h') {
    console.log(helpText);

    // 2. else if argument is 'pf'
  } else if (mainArg === '-c') {
    // process all image files
    console.log('\x1b[34m%s\x1b[0m', '\nCompare files');

    // check in and out path arguments
    if (fs.pathExistsSync(csvPathA) && fs.pathExistsSync(csvPathB)) {
      compareFiles(csvPathA, csvPathB);

      // if path args are invalid or missing print error msg
    } else {
      console.log(`ERR: input path and/or output path is missing or invalid!`);
    };

    // else print help
  } else {
    console.log(helpText);
  }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();