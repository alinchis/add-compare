const levenshtein = require('js-levenshtein');

// @ts-ignore
const similarity = require('sentence-similarity');
const similarityScore = require('similarity-score');


//////////////////////////////////////////////////////////////////////////////
const testL = levenshtein('strada d i mendeleev 2', 'strada mendeleev d i 2');
console.log(testL);


let winkOpts = { f: similarityScore.winklerMetaphone, options : {threshold: 0} }
const testSS = similarity(['strada', 'covaci', '1'], ['strada', 'covaci', '6'], winkOpts);
console.log(testSS);
