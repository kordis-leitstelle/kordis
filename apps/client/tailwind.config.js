const { createGlobPatternsForDependencies } = require('@nrwl/angular/tailwind');
const { join } = require('path');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		join(__dirname, 'src/**/!(*.spec).{ts,html}'),
		...createGlobPatternsForDependencies(__dirname),
	],
	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			white: colors.white,
			black: colors.black,
			red: colors.red,
			blue: colors.blue,
			gray: colors.gray,
			green: colors.green,
			yellow: colors.yellow,
			primary: colors.blue['500'],
			'primary-dark': colors.blue['700'],
			secondary: colors.gray['400'],
			'secondary-dark': colors.gray['600'],
			danger: colors.red['500'],
			'danger-dark': colors.red['600'],
		},
		extend: {},
	},
	darkMode: 'class',
	plugins: [require('@tailwindcss/forms')],
};
