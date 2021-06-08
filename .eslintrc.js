module.exports = {
	extends: ['react-app', 'plugin:jsdoc/recommended'],
	env: {
		browser: true,
		commonjs: true,
		node: true,
		es6: true,
	},
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
	plugins: [
		'jsdoc',
	],
	rules: {
		'curly': 'warn',
		'comma-dangle': ['error', 'only-multiline'],
		'indent': ['error', 'tab'],
		'no-extra-semi': 'error',
		'semi': ['error', 'always'],
		'jsdoc/require-jsdoc': 0,
		'jsx-quotes': ['error', 'prefer-double'],
		'no-unexpected-multiline': 'warn',
		'no-extra-boolean-cast': 'warn',
		'no-unsafe-finally': 'warn',
		'no-irregular-whitespace': 'error',
		'object-curly-spacing': ['error', 'always'],
		'block-scoped-var': 'error',
		'consistent-return': 'warn',
		'yoda': 'error',
	},
};
