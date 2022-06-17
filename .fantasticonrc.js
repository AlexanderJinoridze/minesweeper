module.exports = {
    inputDir: "./src/icons", // (required)
    outputDir: "./src/fonts", // (required)
    fontTypes: ["eot", "svg", "ttf", "woff2", "woff"],
    assetTypes: ['scss'],
    fontsUrl: "../fonts",
    pathOptions: {
        scss: "./src/scss/_icons.scss",
    },
    getIconId: ({
        basename,
        relativeDirPath,
        absoluteFilePath,
        relativeFilePath,
        index,
    }) => [basename].join("_"),
};
