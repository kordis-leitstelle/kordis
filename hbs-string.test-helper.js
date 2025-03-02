/*
 	The problem with hbs imports is, that we preprocess them as string in webpack.
 	Jest cannot work with that, thus leading to missing imports everytime a module containing an hbs import is imported and tested somewhere.
 */
module.exports = '';
