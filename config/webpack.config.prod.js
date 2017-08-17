'use strict';

const autoprefixer = require('autoprefixer');
// const pxtorem = require('pxtorem');
// const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
// const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
var baseWebpackConfig = require('./webpack.config.base');
var merge = require('webpack-merge');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = 'static/css/[name].[contenthash:8].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = merge(baseWebpackConfig, {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: process.argv.includes('source-map') ? 'source-map' : false,
  // In production, we only want to load the polyfills and the app code.
  entry: {
    vendor: [
      'react',
      'react-dom',
      'prop-types',
      require.resolve('./polyfills'),
      'react-router-dom',
      'lodash',
      'echarts',
      'redux',
      'redux-thunk',
      'react-redux',
      'whatwg-fetch'
    ],
    app: [paths.appIndexJs]
  },
  output: {
    publicPath: './',
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'static/js/[name].js', //.[chunkhash:8]
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
  },
  module: {
    rules: [
      // The notation here is somewhat confusing.
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader normally turns CSS into JS modules injecting <style>,
      // but unlike in development configuration, we do something different.
      // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
      // (second argument), then grabs the result CSS and puts it into a
      // separate file in our build process. This way we actually ship
      // a single CSS file in production instead of JS code injecting <style>
      // tags. If you use code splitting, however, any async bundles will still
      // use the "style" loader inside the async code so CSS from them won't be
      // in the main CSS file.
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        exclude: [paths.appStatic],
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
              "transform-decorators-legacy",
              ['import', { libraryName: 'antd-mobile', style: true }],
          ]
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          Object.assign(
            {
              fallback: require.resolve('style-loader'),
              use: [
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    minimize: true,
                    sourceMap: true,
                  },
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      autoprefixer({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 11', // React doesn't support IE8 anyway
                        ],
                        flexbox: 'no-2009',
                      }),
                    ],
                  },
                }
              ],
            },
            extractTextPluginOptions
          )
        ),
        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
      },
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "file" loader exclusion list.
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        // This feature has been reported as buggy a few times, such as:
        // https://github.com/mishoo/UglifyJS2/issues/1964
        // We'll wait with enabling it by default until it is more solid.
        reduce_vars: false,
      },
      output: {
        comments: false,
      },
      sourceMap: true,
    }),
    // 抽离公共js 
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['vendor', 'app']
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: cssFilename,
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.

    // new ManifestPlugin({
    //   fileName: 'asset-manifest.json',
    // }),

    // Generate a service worker script that will precache, and keep up to date,
    // the HTML & assets that are part of the Webpack build.


    // new SWPrecacheWebpackPlugin({
    //   // By default, a cache-busting query parameter is appended to requests
    //   // used to populate the caches, to ensure the responses are fresh.
    //   // If a URL is already hashed by Webpack, then there is no concern
    //   // about it being stale, and the cache-busting can be skipped.
    //   dontCacheBustUrlsMatching: /\.\w{8}\./,
    //   filename: 'service-worker.js',
    //   logger(message) {
    //     if (message.indexOf('Total precache size is') === 0) {
    //       // This message occurs for every build and is a bit too noisy.
    //       return;
    //     }
    //     console.log(message);
    //   },
    //   minify: true,
    //   // For unknown URLs, fallback to the index page
    //   navigateFallback: publicUrl + '/index.html',
    //   // Ignores URLs starting from /__ (useful for Firebase):
    //   // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
    //   navigateFallbackWhitelist: [/^(?!\/__).*/],
    //   // Don't precache sourcemaps (they're large) and build asset manifest:
    //   staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    //   // Work around Windows path issue in SWPrecacheWebpackPlugin:
    //   // https://github.com/facebookincubator/create-react-app/issues/2235
    //   stripPrefix: paths.appBuild.replace(/\\/g, '/') + '/',
    // })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
});
