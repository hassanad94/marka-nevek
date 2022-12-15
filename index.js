const cheerio = require('cheerio');
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

const pageInit = ( page ) => {

  const pageContent = fs.readFileSync(path.join(__dirname, "./frontend/main2.html")).toString();

  const $ = cheerio.load(pageContent);

  $( "body" ).attr( "data-page",  page );

  $('div[class*="request-specific-page-"]').not( `div[class*='${page}']` ).remove();

  return $;

}

app.use(express.static("frontend", options));

//Except JSON
app.use( express.json() );

const userRouter = require( "./backend/routes/user" );

app.use( "/api/user", userRouter )



app.get("/", function (req, res) {

  const currentPage = req.params.page || "home";

  var $ = pageInit( currentPage );

  res.send($.html());

  //res.sendFile(path.join(__dirname, "/public/main2.html"));
});

//AlOldalak
app.get("/:page", function (req, res) {

  const currentPage = req.params.page;

  var $ = pageInit( currentPage );

  res.send($.html());

});



app.listen(5000, () => {
  console.log("Server running on port 5000");
});
