// This script should be called from the root of the nx project
// It aims to merge the code coverage files into one with preserved project names

const { mergeInputs } = require('cobertura-merge/build/src/merge');
const parseArgs = require('minimist');
const glob = require('glob');
const path = require('path');
const { getJestProjects } = require('@nrwl/jest');
const { readFileSync } = require('fs');
const { getInputDataFromArgs } = require('cobertura-merge/build/src/input');
const { writeOutput } = require('cobertura-merge/build/src/output');

const OUTPUT_FILE_PATH = 'coverage/coverage-complete.xml';

const coverageFiles = glob.sync('coverage/**/cobertura-coverage.xml');
if (coverageFiles.length <= 0) {
	console.log('NoCoverageFiles');
	process.exit();
}

const projectPathPackageNames = getJestProjects().reduce((acc, configPath) => {
	configPath = configPath.replace('<rootDir>/', '');
	const packagePath = path.dirname(configPath);
	const configContent = readFileSync(configPath, 'utf8');
	acc[packagePath] = configContent
		.split("displayName: '")[1]
		.split('\n')[0]
		.slice(0, -2);

	return acc;
}, {});

const projectArgs = coverageFiles.map((filePath) => {
	const coverageFileDirname = path.dirname(filePath);
	const projectPath = coverageFileDirname.substring(
		coverageFileDirname.indexOf('/') + 1,
	);

	return `${projectPathPackageNames[projectPath]}=${filePath}`;
}, {});

console.log(projectArgs);

const result = mergeInputs(
	getInputDataFromArgs(parseArgs(['', '', ...projectArgs])), // expects 2 args before project args
);

writeOutput(OUTPUT_FILE_PATH, result);
