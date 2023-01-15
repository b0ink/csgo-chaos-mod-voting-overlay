const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/js/index.js",
    target: "electron-renderer",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        esmodules: true,
                                    },
                                },
                            ],
                            "@babel/preset-react",
                        ],
                    },
                },
            },
            {
                test: [/\.s[ac]ss$/i, /\.css$/i],
                use: [
                    MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    "css-loader",
                ],
            },
        ],
    },
    resolve: {
        extensions: [".js"],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                minify: TerserPlugin.uglifyJsMinify,
                terserOptions: {},
            }),
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.css",
        }),
    ],
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, "build"),
    },
};
