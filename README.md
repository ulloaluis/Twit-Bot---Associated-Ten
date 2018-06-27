# Twit Bot - Associated Ten

Twitter bot implemented using twit (https://github.com/ttezel/twit), a Twitter API Client for Node.js.

**Twitter Account:** https://twitter.com/AssociatedTen


# Bot Functionality

"Associated Ten" is a bot that reports the top ten most common words, hashtags, and mentions used in tweets with a specified 'trend' on the day the program is executed (three separate tweets).

There are two constants that you can change: trending and tweetsLimit.

## trending

This constant specifies the trending hashtag/mention/phrase that you want to search for. The bot will then find tweets from the current day which use the specified string. It will keep track of how many times every word is used throughout all of the tweets the bot processes.

## tweetsLimit

This constant specifies a limit on the number of tweets the bot will process. Due to retweets, the way Twitter API works, and other factors, the program will hardly ever return exactly the number specified in tweetsLimit, which is why it is a limit. To maximize the real number of tweets processed, you should only use this bot on **_trending_** hashtags/phrases/mentions. The value of tweetsLimit, when it's greater than the amount of available tweets, does not matter/does not affect performance. It will process all valid tweets from those available.


### Excluded Words

Certain words are excluded from the search. They are specified in the excludedWords set. These are the most commonly used words, such as conjunctions and prepositions, but also a few quirky results, such as "RT." There is much room for development, so feel free to add to this set in order to improve and refine the top ten results.


# Getting Set Up

## What to install

**Using npm:**

> npm install twit

twit is the Twitter API Client for node

More details here: https://github.com/ttezel/twit


> npm install hashmap

hashmap is used in bot.js to keep track of how often a word appears throughout all of the tweets

More details here: https://github.com/flesler/hashmap


> npm install --save collections

collections contains SortedSet, which is used due to its set.has() speed/efficiency

More details here: http://www.collectionsjs.com/sorted-set


Note: proper import/require statements are in bot.js file, which is the file containing all of the bot's code

## keys.js file

To run this bot, you will need to fill in the details of the keys.js file (four keys/tokens). This file contains twitter authentication data, which you can get once you register a twitter account with https://apps.twitter.com/

Note: For this step, you will need a phone number associated with your twitter account. You don't have to keep the phone number associated after you have the keys.


# Running The Bot
Due to the specification made in the .json file under "scripts", you can run this program from its directory path (in terminal) using "npm start" or "node bot.js"

# Example Output

Using the following constants:

trending="Maradona"

tweetSize=10000;

  Tue Jun 26 2018's top ten trending words for Maradona:
  
  Maradona: 7247
  
  de: 5563
  
  que: 2893
  
  el: 2806
  
  la: 2563
  
  en: 1855
  
  es: 1439
  
  un: 1191
  
  lo: 1121
  
  se: 1118

  
  Tue Jun 26 2018's top ten trending hashtags for Maradona:
  
  #Maradona: 874
  
  #ARG: 216
  
  #Rusia2018: 171
  
  #maradona: 133
  
  #NGAARG: 119
  
  #WorldCup: 110
  
  #NGA: 67
  
  #ElDiego: 59
  
  #FIFA: 49
  
  #Argentina: 49

  
  Tue Jun 26 2018's top ten trending mentions for Maradona:
  
  @Faitelson_ESPN: 292
  
  @emilioelmago: 210
  
  @JuegaFutbolMX: 155
  
  @DiegoAMaradona: 150
  
  @dalmaradona: 135
  
  @MaradonaPICS: 130
  
  @Diego10_querido: 125
  
  @psbuffay: 116
  
  @MaradonaDA: 116
  
  @AngeldebritoOk: 115



Note: By observing the count of Maradona under the trending words tweet, we can see that there were roughly 7000 tweets out of the projected tweetsLimit of 10000. This gives you a rough amount of actual tweets processed, but we must be careful in interpretation since Maradona could have been used more than once in a single tweet (and other things). However, for cases with hashtags, it is unlikely for someone use the hashtag more than once, so the cumulative sum of hashtags matching the "trending" constant is very close to the actual tweet count (search is case insensitive, so #yes and #YeS both correspond to trending="YES").
