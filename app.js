const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fetch = require("node-fetch");
const lodash = require('lodash');


const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

var enNames = []
var en_japNames = []
var japNames = []
var posterImages = []
var synopsisList = []
var ageRatings = []
var episodeCounts = []


let textfilter = ""


app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html")
});

app.post("/", function(req, res){

  enNames = []
  en_japNames = []
  japNames = []
  posterImages = []
  synopsisList = []
  ageRatings = []
  episodeCounts = []

  textfilter = lodash.trim(req.body.textfilter)

  const baseAPIPath = "https://kitsu.io/api/edge"

  const textFilter = "/anime?filter%5Btext%5D=" + textfilter
  const finalURL = baseAPIPath + textFilter

  https.get(finalURL, function(response){
    let chunks = []
    // console.log(response.headers);
    response.on("data", function(data){
      chunks.push(data)
    }).on("end", function(){
      let data   = Buffer.concat(chunks);
      let schema = JSON.parse(data);

      //console.log(schema.data[0]);

      // console.log(schema.data[0].attributes.ageRating);
      // console.log(schema.data[0].attributes.ageRatingGuide);
      // console.log(schema.data[0].attributes.episodeCount);

      for(var i = 0; i < schema.data.length; i++){
        let encJapName = encodeURIComponent(schema.data[i].attributes.titles.ja_jp)
        //console.log(encJapName);
        let japName = decodeURIComponent(encJapName)
        japNames.push(japName)
        //console.log(japName);
        // console.log(schema.data[0].attributes.titles.en);
        //console.log(schema.data[0].attributes.synopsis);
        en_japNames.push(schema.data[i].attributes.titles.en_jp);

        if(schema.data[i].attributes.titles.en === undefined){
          enNames.push("    ")
        } else {
          enNames.push("(" + schema.data[i].attributes.titles.en + ")");
        }

        if(schema.data[i].attributes.ageRating + schema.data[i].attributes.ageRatingGuide === undefined){
          ageRatings.push("Not Available")
        } else {
          ageRatings.push(schema.data[i].attributes.ageRating + " ( " + schema.data[i].attributes.ageRatingGuide + " )")
        }

        episodeCounts.push(schema.data[i].attributes.episodeCount)
        //res.write("<img src=" + schema.data[0].attributes.coverImage.small + ">");
        //res.write("<meta charset=\"utf-8\">" + "<h3>(" + japName + ")</h3>")
        posterImages.push(schema.data[i].attributes.posterImage.small);
        //youtubeVideos.push("https://www.youtube.com/embed/" + schema.data[i].attributes.youtubeVideoID + "?rel=0&wmode=opaque")
        synopsisList.push(schema.data[i].attributes.synopsis)
        // res.write("<br>")
        // res.write("<br>")
      }
      res.redirect("/anime");// + lodash.kebabCase(textfilter))
    })

    })

})

app.get("/anime", function(req, res){
  res.render("anime", {enNames: enNames, en_japNames: en_japNames, japNames: japNames, posterImages: posterImages, synopsisList: synopsisList, ageRatings: ageRatings, episodeCounts: episodeCounts})
});


app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
