/*
    Italia is divided into separate subdivisons.
    This script reads the geojson data, merge the Italia polygons, 
    then add it back to geojson.
*/
const fs = require('fs');
const { execSync } = require('child_process');

const italiaSubDivs = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function execCallback(error, stdout, stderr) {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
}

function extractSubdivisions() {
    const provinces = JSON.parse(fs.readFileSync('./provinces.geojson'));
    provinces.features = provinces.features.filter(p => italiaSubDivs.includes(p.properties.name));
    fs.writeFileSync('./italia_subdivisions.geojson', JSON.stringify(provinces));
}

function mergeSubdivisions() {
    execSync('mapshaper italia_subdivisions.geojson -dissolve2 -clean -o italia.geojson', execCallback);
}

function addMergedItalia() {
    const italia = JSON.parse(fs.readFileSync('./italia.geojson'));
    const italiaFeature = {
        type: 'Feature',
        properties: {name: 'Italia'},
        geometry: italia.geometries[0]
    };
    const italiaMerged = JSON.parse(fs.readFileSync('./provinces.geojson'));
    italiaMerged.features.push(italiaFeature);
    italiaMerged.features = italiaMerged.features.filter(p => !italiaSubDivs.includes(p.properties.name));
    fs.writeFileSync('./provinces_merged.geojson', JSON.stringify(italiaMerged));
}

function cleanFinalResult() {
    execSync('mapshaper provinces_merged.geojson -clean -o force provinces_merged.geojson', execCallback);
}

function removeTempFiles() {
    fs.unlink('./italia_subdivisions.geojson', (err) => {
        if (err) throw err;
    });
    fs.unlink('./italia.geojson', (err) => {
        if (err) throw err;
    });
}

console.log('extracting subdivisions...');
extractSubdivisions();
console.log('done');
console.log('merging subdivisions...');
mergeSubdivisions();
console.log('done');
console.log('adding merged Italia...');
addMergedItalia();
console.log('done');
console.log('cleaning final result...');
cleanFinalResult();
console.log('done');
console.log('removing temp files...');
removeTempFiles();
console.log('done');
