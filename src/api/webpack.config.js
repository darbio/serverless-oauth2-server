const path = require("path");
const slsw = require("serverless-webpack");

module.exports = {
    entry: slsw.lib.entries,
    mode: "development",
    devtool: "source-map",
    resolve: {
        extensions: [".js", ".json", ".ts", ".tsx"]
    },
    externals: ["aws-sdk"],
    output: {
        libraryTarget: "commonjs",
        path: path.join(__dirname, ".webpack"),
        filename: "[name].js"
    },
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    }
};
