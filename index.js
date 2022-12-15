const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');
const express = require("express");
const path = require("path");
const fs = require('fs')



const app = express();

const options = {
  dotfiles: "ignore",
  etag: true,
  extensions: ["htm", "html"],
  index: false,
  maxAge: "7d",
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set("x-timestamp", Date.now());
  },
};

app.use(express.static("public", options));

app.get("/", function (req, res) {

  const currentPage = req.params.page || "home";

  const pageContent = fs.readFileSync(path.join(__dirname, "/public/main2.html")).toString();

  const $ = cheerio.load(pageContent);

  $( "body" ).attr( "data-page",  currentPage );

  $('div[class*="request-specific-page-"]').not( `div[class*='${currentPage}']` ).remove();

  res.send($.html());

  //res.sendFile(path.join(__dirname, "/public/main2.html"));
});

//AlOldalak
app.get("/:page", function (req, res) {

  const currentPage = req.params.page;

  const pageContent = fs.readFileSync(path.join(__dirname, "/public/main2.html")).toString();

  const $ = cheerio.load(pageContent);

  $( ".header" ).addClass( currentPage );

  res.send($.html());
});



app.listen(5000, () => {
  console.log("Server running on port 5000");
});
