import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import PurgeCDNPlugin from 'webpack-highwinds-purge-plugin';
import S3Plugin from 'webpack-s3-plugin';
import autoprefixer from 'autoprefixer';
import CompressPlugin from "compression-webpack-plugin";
import path from 'path';

const ENV = process.env.NODE_ENV || 'development';

const CSS_MAPS = ENV !== 'production';

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
	output: {
		comments: false
	},
	compress: {
		unsafe_comps: true,
		properties: true,
		keep_fargs: false,
		pure_getters: true,
		collapse_vars: true,
		unsafe: true,
		warnings: false,
		screw_ie8: true,
		sequences: true,
		dead_code: true,
		drop_debugger: true,
		comparisons: true,
		conditionals: true,
		evaluate: true,
		booleans: true,
		loops: true,
		unused: true,
		hoist_funs: true,
		if_return: true,
		join_vars: true,
		cascade: true,
		drop_console: false
	}
});

const commonConfig = {
	context: path.resolve(__dirname, 'src'),
	resolve: {
		extensions: ['.jsx', '.js', '.json', '.less'],
		modules: [
			path.resolve(__dirname, 'src/lib'),
			path.resolve(__dirname, 'node_modules'),
			'node_modules'
		],
		alias: {
			components: path.resolve(__dirname, 'src/components'),    // used for tests
			style: path.resolve(__dirname, 'src/style'),
			'react': 'preact-compat',
			'react-dom': 'preact-compat'
		}
	},

	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: path.resolve(__dirname, 'src'),
				enforce: 'pre',
				use: 'source-map-loader'
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				// Transform our own .(less|css) files with PostCSS and CSS-modules
				test: /\.(less|css)$/,
				include: [
					path.resolve(__dirname, 'src/components'),
					path.resolve(__dirname, 'src/docs/components'),
				],
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							modules: true,
							sourceMap: CSS_MAPS,
							importLoaders: 1,
							minimize: true,
							localIdentName: '[name]_[local]--[hash:base64:5]'
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: CSS_MAPS,
							plugins: () => {
								autoprefixer({browsers: ['last 2 versions']});
							}
						}
					},
					{
						loader: 'less-loader',
						options: {sourceMap: CSS_MAPS}
					}
				]
			},
			{
				test: /\.(less|css)$/,
				include: [
					path.resolve(__dirname, 'src/docs/style'),
					path.resolve(__dirname, 'node_modules/codemirror/lib/codemirror.css'),
				],
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'less-loader',
						options: {sourceMap: CSS_MAPS}
					}
				]
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			},
			{
				test: /\.(xml|html|txt|md)$/,
				use: 'raw-loader'
			},
			{
				test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
				use: ENV === 'production' ? 'file-loader' : 'url-loader'
			}
		]
	},

	stats: "verbose",

	node: {
		global: true,
		process: false,
		Buffer: false,
		__filename: false,
		__dirname: false,
		setImmediate: false
	},

	devtool: ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',

	devServer: {
		port: process.env.PORT || 8080,
		host: 'localhost',
		publicPath: '/',
		contentBase: './src',
		historyApiFallback: true,
		disableHostCheck: true,
		open: false,
		openPage: 'docs/',
		https: false
	}
};

const prodPlugins = [
	new CompressPlugin({
		include: "cmp.bundle.js"
	}),
	new S3Plugin({
		include: 'cmp.complete.bundle.js.gz',
		directory: `build`,
		basePath: `common/cmp/`,
		s3Options: {
			accessKeyId: process.env.VAULT_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.VAULT_AWS_SECRET_KEY_ID,
			region: 'us-east-1',
		},
		s3UploadOptions: {
			Bucket: 'presspo-content',
			ContentEncoding: 'gzip',
		}
	}),
	new PurgeCDNPlugin([
			{url: `http://common.forreason.com/cmp/cmp.complete.bundle.js.gz`},
			{url: `http://common.bakedfacts.com/cmp/cmp.complete.bundle.js.gz`},
			{url: `http://common.ofendy.com/cmp/cmp.complete.bundle.js.gz`},
			{url: `http://common.gotedit.com/cmp/cmp.complete.bundle.js.gz`},
			{url: `http://common.norush.io/cmp/cmp.complete.bundle.js.gz`},
		], {
			accountId: process.env.VAULT_HIGHWINDS_ACCOUNT_ID,
			token: process.env.VAULT_HIGHWINDS_TOKEN
		}
	),
	uglifyPlugin,
];

module.exports = [
	// CMP config
	{
		entry: {
			cmp: './index.js',
			'cmp.complete': './complete.js'
		},

		output: {
			path: path.resolve(__dirname, 'build'),
			publicPath: './',
			filename: '[name].bundle.js'
		},
		...commonConfig,
		plugins: ([
			new webpack.NoEmitOnErrorsPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(ENV)
			}),
			new webpack.ProvidePlugin({
				'Promise': 'promise-polyfill'
			}),
			new HtmlWebpackPlugin({
				filename: 'index.html',
				template: 'index.html',
				chunks: ['cmp']
			}),

		]).concat(ENV === 'production' ? prodPlugins : []),
	},
	// Docs config
	// {
	// 	entry: {
	// 		'docs': './docs/index.jsx',
	// 		'iframeExample': './docs/iframe/iframeExample.jsx',
	// 		'portal': './docs/assets/portal.js'
	// 	},
	//
	// 	output: {
	// 		path: path.resolve(__dirname, 'build/docs'),
	// 		publicPath: './',
	// 		filename: '[name].bundle.js'
	// 	},
	// 	...commonConfig,
	// 	plugins: ([
	// 		new webpack.NoEmitOnErrorsPlugin(),
	// 		new webpack.DefinePlugin({
	// 			'process.env.NODE_ENV': JSON.stringify(ENV)
	// 		}),
	// 		new webpack.ProvidePlugin({
	// 			'Promise': 'promise-polyfill'
	// 		}),
	// 		new HtmlWebpackPlugin({
	// 			filename: 'index.html',
	// 			template: 'docs/index.html',
	// 			chunks: ['docs']
	// 		}),
	// 		new HtmlWebpackPlugin({
	// 			filename: 'iframeExample.html',
	// 			template: './docs/iframe/iframeExample.html',
	// 			chunks: ['iframeExample']
	// 		}),
	// 		new HtmlWebpackPlugin({
	// 			filename: 'portal.html',
	// 			template: './docs/assets/portal.html',
	// 			chunks: ['portal']
	// 		}),
	// 		new CopyWebpackPlugin([
	// 			{from: 'docs/assets', to: '.'}
	// 		])
	// 	]).concat(ENV === 'production' ? uglifyPlugin : []),
	// }
];
