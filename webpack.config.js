const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const dev = process.env.NODE_ENV !== 'production'


const config = {
	target: 'web',
	mode: dev ? 'development' : 'production',
	devtool: dev ? 'source-map' : 'none',
	entry: [
		'./src/index.ts',
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js?v=[chunkhash]',
		publicPath: '/platform-game/',
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [
			path.resolve('./src'),
			'node_modules',
		],
	},
	devServer: {
		compress: true,
		contentBase: path.join(__dirname, 'dist'),
		host: '0.0.0.0',
		openPage: 'http://localhost:8080/platform-game/',
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: [
						'@babel/plugin-transform-runtime',
						'@babel/plugin-proposal-class-properties',
					],
				},
			},
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader',
				exclude: /node_modules/,
				query: {
					declaration: false,
				},
			},
			{
				test: /\.wasm$/,
				loaders: ['base64-loader'],
				type: 'javascript/auto',
			}
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
		new CopyWebpackPlugin([
			{ from: 'src/public', to: '' },
		]),
	],
}


module.exports = config
