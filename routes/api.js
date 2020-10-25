'use strict';

const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Models.
// const Stocks = require('../models/stocks.js').Stocks;
const Stocks = require('../models/stocks.js');
const Likes = require('../models/likes.js');

// getQuote(): Uses node.fetch to get stock quote from FCC Stock API.
// Using 3.0.0-beta.9 to get the new await/async interface.
//
// GET
// https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote
//
// Return JSON:
//
// {
//    "symbol": "AAPL",
//    "companyName": "Apple, Inc.",
//    "primaryExchange": "NASDAQ",
//    "calculationPrice": "tops",
//    "open": null,
//    "openTime": null,
//    "openSource": "official",
//    "close": null,
//    "closeTime": null,
//    "closeSource": "official",
//    "high": null,
//    "highTime": 1603464485451,
//    "highSource": "15 minute delayed price",
//    "low": null,
//    "lowTime": 1603463064212,
//    "lowSource": "15 minute delayed price",
//    "latestPrice": 115.08,
//    "latestSource": "IEX real time price",
//    "latestTime": "11:03:05 AM",
//    "latestUpdate": 1603465385175,
//    "latestVolume": null,
//    "iexRealtimePrice": 115.08,
//    "iexRealtimeSize": 400,
//    "iexLastUpdated": 1603465385175,
//    "delayedPrice": null,
//    "delayedPriceTime": null,
//    "oddLotDelayedPrice": null,
//    "oddLotDelayedPriceTime": null,
//    "extendedPrice": null,
//    "extendedChange": null,
//    "extendedChangePercent": null,
//    "extendedPriceTime": null,
//    "previousClose": 115.75,
//    "previousVolume": 101987954,
//    "change": -0.67,
//    "changePercent": -0.00579,
//    "volume": null,
//    "iexMarketPercent": 0.021466908525283022,
//    "iexVolume": 552312,
//    "avgTotalVolume": 149379759,
//    "iexBidPrice": 115.07,
//    "iexBidSize": 400,
//    "iexAskPrice": 115.09,
//    "iexAskSize": 400,
//    "iexOpen": null,
//    "iexOpenTime": null,
//    "iexClose": 115.08,
//    "iexCloseTime": 1603465385175,
//    "marketCap": 1995176484000,
//    "peRatio": 34.68,
//    "week52High": 137.98,
//    "week52Low": 53.15,
//    "ytdChange": 0.535745,
//    "lastTradeTime": 1603465385175,
//    "isUSMarketOpen": true
//  }

async function getQuotes(stocks)
{
  let symbols = [];

  // Get the requested stocks into an array.
  if (Array.isArray(stocks))
  {
    symbols = [stocks[0], stocks[1]];
  }
  else
  {
    symbols = [stocks];
  }

  // Return array for the quotes.
  let data = [];

  for (let i = 0; i < symbols.length; i++)
  {
    const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbols[i]}/quote`);
    const json = await response.json();

    data.push(
      {
        "stock": symbols[i],
        "price": json.latestPrice.toString(),
        "likes": "0"
      }
    );
  }

  return data;
}

async function saveQuotes(data)
{
  let docs = [];

  try
  {
    for (let i = 0; i < data.length; i++)
    {
      const query = {"stock": data[i].stock}
      const update = {
        "stock": data[i].stock,
        "price": data[i].price,
        "updated": new Date()
      };
      const options = {"upsert": true, "new": true, "setDefaultsOnInsert": true};

      docs.push(await Stocks.findOneAndUpdate(query, update, options));
    }
  }
  catch (error)
  {
    console.log('error saving stock data');
    console.error(error);
  }

  return docs;
}

async function hasAddressLiked(id, ip)
{
  try
  {
    const query = {"stockId": id}
    const records = Likes.find(query);

    for (let j = 0; j < records.length; j++)
    {
      if (records[i].ip === ip)
      {
        return true;
      }
    }

    return false;
  }
  catch (error)
  {
    console.log('error checking liked ip addresses');
    console.error(error);
    // Return true on error to prevent updating likes.
    return true;
  }
}

async function countLikes(stocks, ip)
{
  let likes = [];

  try
  {
    for (let i = 0; i < stocks.length; i++)
    {
      const query = {"stockId": stocks[i]._id};
      const records = await Likes.find(query);

      if (! records)
      {
        likes.push(0);
      }
      else
      {
        likes.push(records.length);
      }
    }

    // console.log(likes);
    return likes;
  }
  catch (error)
  {
    console.log('error updating likes');
    console.error(error);
  }
}

async function updateLikes(stocks, ip)
{
  let likes = [];

  try
  {
    for (let i = 0; i < stocks.length; i++)
    {
      const query = {"stockId": stocks[i]._id};

      if (await hasAddressLiked(stocks[i]._id, ip))
      {
        likes.push(await Likes.find(query));
      }
      else
      {
        const update = {
          "stockId": stocks[i]._id,
          "ip": ip,
          "created": new Date()
        };
        const options = {"upsert": true, "new": true, "setDefaultsOnInsert": true};

        await Likes.findOneAndUpdate(query, update, options);
        likes.push(await Likes.find(query));
      }
    }

    return likes;
  }
  catch (error)
  {
    console.log('error updating likes');
    console.error(error);
  }
}

module.exports = (app) =>
  {
    app.route('/api/stock-prices')
      .get(async (request, response) =>
           {
             try
             {
               // Request the stock price data.
               const data = await getQuotes(request.query.stock);
               // Save the stock data.
               const docs = await saveQuotes(data);

               // Update likes.
               const like = request.query.like ? true : false;

               if (like)
               {
                 await updateLikes(docs, request.ip);
               }

               const likes = await countLikes(docs);

               // Return for one stock:
               // {
               //   "stockData":
               //     {
               //       "stock":"GOOG",
               //       "price":"786.90",
               //       "likes":1
               //     }
               // }
               // Return for two stocks:
               // {
               //   "stockData":
               //     [
               //       {"stock":"MSFT","price":"62.30","rel_likes":-1},
               //       {"stock":"GOOG","price":"786.90","rel_likes":1}
               //     ]
               // }

               if (data.length > 1)
               {
                 let arr = [];

                 for (let i = 0; i < data.length; i++)
                 {
                   arr.push({
                     "stock": data[i].stock,
                     "price": data[i].price,
                     "rel_likes": i == 0 ? likes[0] - likes[1] : likes[1] - likes[0]
                   });
                 }
                 
                 return response
                   .status(200)
                   .json({
                     "stockData": arr
                   });
               }
               else
               {
                 return response
                   .status(200)
                   .json({
                     "stockData": {
                       "stock": data[0].stock,
                       "price": data[0].price,
                       "likes": likes[0]
                     }});
               }
             }
             catch (error)
             {
               console.error(error);
               return response
                 .status(500);
             }
           });
  };
