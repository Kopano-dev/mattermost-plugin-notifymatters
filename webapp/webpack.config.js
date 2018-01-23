/* eslint-env node */
/* eslint func-names: ["off", "as-needed"] */
/* eslint-disable no-process-env */

const fs = require('fs');
const path = require('path');
const BannerPlugin = require('webpack').BannerPlugin;
const DefinePlugin = require('webpack').DefinePlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const buildVersion = process.env.BUILD_VERSION || '0.0.0-no-proper-build';
const buildDate = process.env.BUILD_DATE || new Date();

module.exports = function(env) {
    const isProd = Boolean(env && env.prod);

    const config = {
        context: path.resolve(__dirname),
        entry: './index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'notifymatters_bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.(js|jsx)?$/,
                    loader: 'babel-loader',
                    exclude: /(node_modules|non_npm_dependencies)/,
                    query: {
                        presets: [
                            'react',
                            ['es2015', {modules: false}],
                            'stage-0'
                        ],
                        plugins: ['transform-runtime']
                    }
                }
            ]
        },
        plugins: [
        ]
    };

    if (isProd) {
        config.devtool = 'hidden-source-map';
        config.plugins.push.apply(config.plugins, [
            new UglifyJsPlugin({
                sourceMap: true,
                uglifyOptions: {
                    ecma: 6,
                    warnings: true
                }
            })
        ]);
    } else {
        config.devtool = 'inline-source-map';
    }

    config.plugins.push.apply(config.plugins, [
        new LicenseWebpackPlugin({
            pattern: /^(MIT|ISC|BSD.*)$/,
            unacceptablePattern: /GPL/,
            abortOnUnacceptableLicense: true,
            perChunkOutput: false,
            outputFilename: '3rdparty-licenses.txt'
        }),
        new DefinePlugin({
            __VERSION__: JSON.stringify(buildVersion),
            'process.env.NODE_ENV': isProd ? '"production"' : '"development"'
        }),
        new BannerPlugin(
            fs.readFileSync(path.resolve(__dirname, '..', 'LICENSE.txt')).toString() +
				'\n\n@version ' + buildVersion + ' (' + buildDate + ')' + (isProd ? '' : ' dev')
        )
    ]);

    return config;
};
