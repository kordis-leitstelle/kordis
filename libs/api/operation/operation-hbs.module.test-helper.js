const fs = require('fs');
const path = require('path');

const hbsFilePath = path.resolve(
	__dirname,
	'./src/lib/core/service/pdf/operation-pdf.hbs',
);

// as jest can not work with hbs module imports, we create a custom module for testing here which reference to the content of the original hbs
module.exports = fs.readFileSync(hbsFilePath, 'utf8');
