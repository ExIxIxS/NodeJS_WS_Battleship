const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/api_server/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.cjs',
  },
  target: "node",
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
