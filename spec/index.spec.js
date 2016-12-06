/* eslint-env jasmine */
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var webpack = require('webpack');
var rm_rf = require('rimraf');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('../');

var OUTPUT_DIR = path.join(__dirname, '../dist');

describe('HtmlWebpackExcludeAssetsPlugin', function () {
  beforeEach(function (done) {
    rm_rf(OUTPUT_DIR, done);
  });

  it('should not exclude assets by default', function (done) {
    webpack({
      entry: {
        app: path.join(__dirname, 'fixtures', 'entry.js'),
        style: [path.join(__dirname, 'fixtures', 'app.css')]
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      module: {
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin(),
        new HtmlWebpackExcludeAssetsPlugin()
      ]
    }, function (err) {
      expect(err).toBeFalsy();
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
        expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
        done();
      });
    });
  });

  it('should exclude assets when regex matches asset file names', function (done) {
    webpack({
      entry: {
        app: path.join(__dirname, 'fixtures', 'entry.js'),
        styleInclude: path.join(__dirname, 'fixtures', 'app.css'),
        styleExclude: path.join(__dirname, 'fixtures', 'exclude.css')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      module: {
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
          excludeAssets: [/styleInclude.*.js/, /styleExclude.*.css/]
        }),
        new HtmlWebpackExcludeAssetsPlugin()
      ]
    }, function (err) {
      expect(err).toBeFalsy();
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="styleInclude.js"]').toString()).toBe('');
        expect($('link[href="styleInclude.css"]').toString()).toBe('<link href="styleInclude.css" rel="stylesheet">');
        expect($('link[href="styleExclude.css"]').toString()).toBe('');
        done();
      });
    });
  });

  it('should exclude assets when only use one regex instead of an array', function (done) {
    webpack({
      entry: {
        app: path.join(__dirname, 'fixtures', 'entry.js'),
        style: [path.join(__dirname, 'fixtures', 'app.css')]
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      module: {
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
          excludeAssets: /style.*.js/
        }),
        new HtmlWebpackExcludeAssetsPlugin()
      ]
    }, function (err) {
      expect(err).toBeFalsy();
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('');
        expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
        done();
      });
    });
  });
});
