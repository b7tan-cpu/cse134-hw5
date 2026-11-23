module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
    eleventyConfig.addPassthroughCopy({ "src/theme.js": "theme.js" });
    return { dir: { input: "src", output: "_site", includes: "_includes" } };
};
