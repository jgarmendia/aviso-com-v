require('dotenv').config();
module.exports = function(eleventyConfig) {
    // Add a filter using the Config API
   // eleventyConfig.addFilter( "myFilter", function() {});

   eleventyConfig.addPassthroughCopy("src/js");
   eleventyConfig.addPassthroughCopy("src/css");
   eleventyConfig.addPassthroughCopy("src/images");
   eleventyConfig.addPassthroughCopy("src/manifest.webmanifest");
   eleventyConfig.addPassthroughCopy("src/sitemap.xml");
   eleventyConfig.addPassthroughCopy("src/service-worker.js")
  
    // You can return your Config object (optional).
    return {
        passThroughFileCopy: true,
      dir: {
        input: "src",
        ouput: "_site",
       // include: "includes"
      }
    };
  };

  //console.log(process.env.API_KEY)