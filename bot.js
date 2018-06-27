/*
 * Twitter bot using the node.js based twit API: https://github.com/ttezel/twit
 * The purpose of this bot is to report the daily top ten most common words, hashtags,
 * and mentions used in tweets with a specified hashtag. Hashtags/mentions don't show up
 * in the top 10 words. Hashtags/mentions have separate top 10's. Very common-usage
 * words, such as prepositions like "to" or conjunctions like "and" are excluded
 * from the top 10. This bot is generalized enough to report the top ten trending
 * words for any specified hashtag, though the excludedWords variable may vary.
 *
 * Author: Luis Ulloa   -   Github: ulloaluis
 */

const trending = "Maradona"; //trend used for top tens

/*
 * This specifies the upper limit of tweets. However, given the way twitter API
 * responds (and the way T.get reads the data), the actual tweet count may differ.
 * You can see how many unique tweets were read by observing the counter for
 * const hashtag under the Top 10 Hashtags list. The more popular and controversial
 * the hashtag, the closer you will get to the tweetsLimit.
 */
const tweetsLimit = 10000;

var SortedSet = require("collections/sorted-set"); //http://www.collectionsjs.com/sorted-set
var HashMap = require('hashmap'); //https://github.com/flesler/hashmap
var Twit = require('twit'); //import statement for twit
var keys = require('./keys'); //keys abstracted away for security

/* List of overly common words that this bot will not keep track of. Otherwise,
 * the daily 10 words would always be essentially the same thing. SortedSet
 * allows for rapid excludedWords.has() operation.
 */
var excludedArr = ["rt", "the", "to", "of", "and", "is", "for", "a", "in", "i",
                "on", "via", "not", "was", "with", "are", "see", "now",
                "placed", "has", "do", "this", "you", "&", "&amp", "have",
                "&amp;", "can", "that", "aboard", "about", "above", "after",
                "along", "among", "around", "as", "atop", "ontop", "before",
                "by", "from", "onto", "through", "with", "without", "or", "-",
                "it", "at", "your", "her", "she", "https", "http", "www",
                 "...", "=", "//t:", "a", "b", "c", "d", "e", "f", "g", "h",
                  "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
                  "u", "v", "w", "x", "y", "z", "co", "be", "…", "#…"];
var excludedWords = SortedSet(excludedArr);

var T = new Twit(keys);
var dateObj = new Date();
var date = dateObj.toDateString(); //string format: DayOfWeek Month Day Year, natural read
var dateISO = dateObj.toISOString().substr(0, 10); //ISO string has year-mon-day as first 10 char

/*
 * tweetMap is initialized as an associative container that maps a unique
 * word to its number of occurrences throughout all observed tweets.
 * All words are valid in initialization, differentiation occurs in parsing map.
 */
function initTweetMap(tweets, tweetMap) {
  for (var i = 0; i < tweets.length; i++) {
    var text = tweets[i].text;
    var words = text.split(/(?:,|!|\.|\?|:|;|\/|\s)+/); //regex: split on punctuation and whitespace
    for (var j = 0; j < words.length; j++) {
      var word = words[j];
      if (!excludedWords.has(word.toLowerCase())) { //exclude certain words from tweet map
        var count = 0;
        if (tweetMap.has(word)) count = tweetMap.get(word);
        tweetMap.set(word, count+1);
      }
    }
  }
}

//Will get the most frequent word/hashtag/mention (varies by num) from tweetMap.
function getMostFreq(tweetMap, num) {
  var mostFreq = "";
  tweetMap.forEach(function(value, key) {
    switch (num) {
      case 0: //words only - no mentions or hashtags
        if ((mostFreq == "" && key.indexOf("#") == -1 && key.indexOf("@") == -1)
          || (key.indexOf("#") == -1 && key.indexOf("@") == -1 && tweetMap.get(mostFreq) < value))
           mostFreq = key;
        break;
      case 1: //hashtags only
        if ((mostFreq == "" && key.indexOf("#") == 0)
          || (key.indexOf("#") == 0 && tweetMap.get(mostFreq) < value))
           mostFreq = key;
        break;
      case 2: //mentions only
        if ((mostFreq == "" && key.indexOf("@") == 0)
          || (key.indexOf("@") == 0 && tweetMap.get(mostFreq) < value))
           mostFreq = key;
        break;
      default:
        mostFreq = "n/a"
        console.log("getMostFreq: default case (likely error)");
    }
  });
  return mostFreq;
}

function getTweetType(num) {
  if (num == 0) {
    return "words";
  } else if (num == 1) {
    return "hashtags";
  }
  return "mentions"; //num == 2
}

//Will get the ten most common words in tweetMap given a specific num
// O(N) w/ N=map elements
function parseTweetMap(tweetMap, num) {
  var tweetType = getTweetType(num);
  var tweet = date + "'s top ten trending " + tweetType + " for " + trending + ":\n";
  for (var i = 0; i < 10; i++) {
    var mostFreq = getMostFreq(tweetMap, num);
    tweet += mostFreq + ": " + tweetMap.get(mostFreq) + "\n";
    tweetMap.delete(mostFreq); //subsequent calls now get subsequent most freq
  }
  return tweet;
}

//Will parse and tweet the three top ten tweets (words/hashtags/mentions).
function parseAndTweet(tweetMap) {
  for (var i = 0; i < 3; i++) { //0: words, 1: hashtags, 2: mentions
    var tweet = parseTweetMap(tweetMap, i);
    T.post('statuses/update', {status: tweet}, function(err, data, response) {
      if (err) {
        console.log("An error occurred while posting.");
        console.log(err);
      } else {
        console.log(tweet);
      }
    });
  }
}

/*
 * continueSearch is a recursive function that allows a search of any size.
 * By design, twitter API search cannot exceed a search limit of 100, so a
 * function of this nature is necessary in order to set any upper search limit.
 */
function continueSearch(tweetMap, nextResults, counter, searchStr) {
  if (!nextResults || counter >= tweetsLimit) { //no more results available or met tweets limit
    parseAndTweet(tweetMap);
  } else {
    var start = nextResults.indexOf("=") + 1, end = nextResults.indexOf("&");
    maxID = nextResults.substr(start, end - start); //length = end - start

    T.get('search/tweets', { q: searchStr, count: 100, include_entities: "true", max_id: maxID },
      function(err, data, response) {
        if (err) {
          console.log("An error occurred while continuing search.");
          console.log(err);
        } else {
          var tweets = data.statuses;
          initTweetMap(tweets, tweetMap);
          nextResults = data.search_metadata.next_results;
          continueSearch(tweetMap, nextResults, counter + 100, searchStr);
        }
      });
  }
}

/*
 * Tweet map maps every unique word to its number of appearances in the first 'count'
 * tweets containing the specified hashtag on the day the program executes.
 * Can specify limit. Recursive behavior.
 */
function tweetIt() {
  var searchStr = trending + " since:" + dateISO;
  T.get('search/tweets', { q: searchStr, count: 100 }, function(err, data, response) {
    if (err) {
      console.log("An error occurred while beginning search.");
      console.log(err); //note: can only call API ~ 100 times per hour
    } else {
      var tweetMap = new HashMap();
      var tweets = data.statuses;
      initTweetMap(tweets, tweetMap);

      var nextResults = data.search_metadata.next_results; //contains max_id
      continueSearch(tweetMap, nextResults, 100, searchStr);
    }
  });
}


tweetIt();

//setInterval(tweetIt, 1000*60*60*24); //can be used to tweet daily
