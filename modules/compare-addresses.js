
// import libraries
const fs = require('fs-extra');
const levenshtein = require('js-levenshtein');

const similarity = require('sentence-similarity');
const similarityScore = require('similarity-score');


// ////////////////////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// levenshtein compare function
function levenshteinCompare (arrayA, arrayB) {
    // paths
    const outPath = './data/LMI-LIE_levenshtein.csv';

    // create addresses array for file A (LIE)
    const addArrA = arrayA.slice(1).map((item, index) => {
        const itemStrArr = cleanStrName(replaceROchars(item[4])).split(' ');
        // console.log(`${index}: [ ${cleanStrNo(item[6])} ]`);
        return [ replaceROchars(item[3]), ...itemStrArr, cleanStrNo(item[6])].join(' ');
    });

    // create addresses array for file B (LMI)
    const addArrB = arrayB.slice(1).map((item, index) => {
        const itemStrArr = cleanStrName(replaceROchars(item[10])).split(' ');
        // console.log(`${index}: [ ${cleanStrNo(item[11])} ]`);
        return [ replaceROchars(item[9]), ...itemStrArr, cleanStrNo(item[11]) ].join(' ');
    });

    // test brut
    // let counter = 0;
    // for each item in array A
    const newAddArrA = addArrA.map((itemA, indexA) => {
        let bestBIndex = -1;
        let bestBMatch = 1000;
        // check match for each item in array B
        for (let indexB = 0; indexB < addArrB.length; indexB += 1) {
            // let matchCounter = 0;
            
            // calculate levenshtein distance ( 0 = perfect match, 1+ = differences in 1+ characters)
            const currentMatch = levenshtein(itemA, addArrB[indexB]);
            // check value against current best and update if necessary
            if (currentMatch < bestBMatch) {
                bestBMatch = currentMatch;
                bestBIndex = indexB;
            };

            // // for each address component in itemA
            // for (let indexC = 0; indexC < itemA.length; indexC += 1) {
            //     // check if component is found in current itemB
            //     if (addArrB[indexB].indexOf(itemA[indexC]) > -1) {
            //         matchCounter += 1;
            //     };
            // };
            // // update best match, if necessary
            // const currentMatch = matchCounter / itemA.length;
            // if (currentMatch > bestBMatch) {
            //     bestBMatch = currentMatch;
            //     bestBIndex = indexB;
            // };
        };
        // if (bestBMatch === 1) counter += 1;

        // return best match values
        // return {indexA, bestBIndex, bestBMatch};
        return [bestBMatch, indexA, addArrA[indexA], bestBIndex, addArrB[bestBIndex]];
    });

    // write to file
    const outArray = newAddArrA.map(item => item.join(';'));
    outArray.unshift('levenshtein_distance;lie_index;lie_add;lmi_index;lmi_add');
    fs.writeFileSync(outPath, outArray.join('\n'));
    console.log('File write done!');
};

// /////////////////////////////////////////////////////////////////////
// sentence similarity compare function
function progressiveScore(scoreArr) {
    const arrLen = scoreArr.length - 1;
    // console.log(arrLen)
    const newArr = scoreArr.map((item, index) => { return item * Math.pow(10, arrLen - index)});
    // console.log(newArr)
    const retArr = newArr.reduce((acc, currval) => acc + currval);
    // console.log(retArr);
    return retArr;
};

// /////////////////////////////////////////////////////////////////////
// sentence similarity compare function

function similarityCompare (arrayA, arrayB) {
    // paths
    const outPath = './data/LMI-LIE_sentence-similarity.csv';

    // create addresses array for file A (LIE)
    const addArrA = arrayA.slice(1).map((item, index) => {
        const itemStrArr = cleanStrName(replaceROchars(item[4])).split(' ');
        // console.log(`${index}: [ ${cleanStrNo(item[6])} ]`);
        return [ replaceROchars(item[3]), ...itemStrArr, cleanStrNo(item[6])];
    });

    // create addresses array for file B (LMI)
    const addArrB = arrayB.slice(1).map((item, index) => {
        const itemStrArr = cleanStrName(replaceROchars(item[10])).split(' ');
        // console.log(`${index}: [ ${cleanStrNo(item[11])} ]`);
        return [ replaceROchars(item[9]), ...itemStrArr, cleanStrNo(item[11]) ];
    });

    // for each item in array A
    const newAddArrA = addArrA.map((itemA, indexA) => {
        // console.log(`${indexA}: ${itemA}`);
        let bestBIndex = -1;
        let bestBMatch = {
            matched: [],
            matchScore: [0],
            exact: 0,
            score: 0,
            order: 0,
            size: 0
        };
        let bestBscore = 0;

        // check match for each item in array B
        for (let indexB = 0; indexB < addArrB.length; indexB += 1) {            
            // calculate similarity
            let winkOpts = { f: similarityScore.winklerMetaphone, options : {threshold: 0} }
            const currentMatch = similarity(itemA, addArrB[indexB], winkOpts);
            // console.log(currentMatch.matchScore);
            // calculate current progressive score
            currentScore = progressiveScore(currentMatch.matchScore);
            // console.log(currentScore);
            // check value against current best and update if necessary
            if (currentMatch.exact >= bestBMatch.exact && currentScore > bestBscore) {
                // console.log(currentMatch);
                bestBMatch = currentMatch;
                bestBIndex = indexB;
                bestBscore = currentScore;
            };
        };

        // return best match values
        const matchedItems = [ arrayA.slice(1)[indexA][0], arrayB.slice(1)[bestBIndex][0], JSON.stringify(bestBMatch), bestBscore, indexA, addArrA[indexA].join(' '), bestBIndex, addArrB[bestBIndex].join(' ') ];
        console.log(matchedItems);
        return matchedItems;
    });

    // write to file
    const outArray = newAddArrA.map(item => item.join(';'));
    outArray.unshift('id_lie;cod_lmi;similarity;a_score;lie_index;lie_add;lmi_index;lmi_add');
    fs.writeFileSync(outPath, outArray.join('\n'));
    console.log('File write done!');
}

// /////////////////////////////////////////////////////////////////////
// load csv file
function readCSV (filePath, delimiter) {
    // if file is found in path
    if (fs.existsSync(filePath)) {
        // return parsed file
        const newArray = fs.readFileSync(filePath, 'utf8').split('\n');
        return newArray.filter(line => line).map(line => line.split(delimiter || ','));
    };
    // else return empty object
    console.log('\x1b[31m%s\x1b[0m', `ERROR: ${filePath} file NOT found!`);
    return [];
};

// /////////////////////////////////////////////////////////////////////
// clean string
function replaceROchars (inString) {
    return inString
        .toLowerCase()
        .replace(/ă/gi, 'a')
        .replace(/î/gi, 'i')
        .replace(/ş/gi, 's')
        .replace(/ș/gi, 's')
        .replace(/ţ/gi, 't')
        .replace(/ț/gi, 't')
        .replace(/â/gi, 'a')
        .replace(/á/gi, 'a');
};

// /////////////////////////////////////////////////////////////////////
// clean street name
function cleanStrName (inString) {
    return inString
        .replace(/\"/gi, '')
        .replace(/\./gi, ' ')
        .replace(/\,/gi, ' ')
        .replace(/ dr(\s|$)/gi, '')
        .replace(/ arh(\s|$)/gi, '')
        .replace(/ ing(\s|$)/gi, '')
        .replace(/ av(\s|$)/gi, '')
        .replace(/ poet(\s|$)/gi, '')
        .replace(/ lt(\s|$)/gi, '')
        .replace(/ serg(\s|$)/gi, '')
        .replace(/ maj(\s|$)/gi, '')
        .replace(/ cap(\s|$)/gi, '')
        .replace(/ cpt(\s|$)/gi, '')
        .replace(/ col(\s|$)/gi, '')
        .replace(/ pictor(\s|$)/gi, '')
        .replace(/ maresal(\s|$)/gi, '')
        .replace(/ g-ral(\s|$)/gi, '')
        .replace(/ prof(\s|$)/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/-/gi, ' ')
        .trim();
}

// /////////////////////////////////////////////////////////////////////
// clean street no
function cleanStrNo (inString) {
    return inString
        .trim()
        .toLowerCase()
        .replace('÷', '-')
        .replace('+', '-');
}


// ////////////////////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (pathA, pathB) => {
    // images counter
    let matchCounter = 0;

    // read arrays
    const arrayA = readCSV(pathA, '#');
    console.log(`Array A :: ${arrayA.length} items`);
    const arrayB = readCSV(pathB, '#');
    console.log(`Array B :: ${arrayB.length} items`);

    // levenshtein compare
    // levenshteinCompare(arrayA, arrayB);

    // sentence similarity compare
    similarityCompare(arrayA, arrayB);
    
}
