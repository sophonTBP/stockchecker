
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const validStockNames = require("../stocks-symbols/NASDAQ.json")
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
chai.use(chaiHttp);




const randomNameGenerator = (namesArray) => {


  let lastIndex = namesArray.length - 1;
  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  };
  let rand = getRandomInt(lastIndex)
  return namesArray[rand]

}









const fetchPrice = async (req, res) => {

  let name = req
  let priceObj = {}
  let url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${name}/quote`
  let fetchPrice =
    fetch(url, {
      method: 'GET',
      mode: "no-cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: { 'Content-Type': 'application/json',}
    })

  return fetchPrice
    .then(res => { return res.text(); })
    .then(res => {
      let price = JSON.parse(res)
      console.log("price", price.latestPrice)
      return price.latestPrice
    })

}

let currentLikes;



suite('Functional Tests', () => {


  test('1: Viewing one stock: GET request to /api/stock-prices/', async () => {
    let stockName = randomNameGenerator(validStockNames)

    let price = await fetchPrice(stockName)


    chai
      .request(server)
      .get(`/api/stock-prices/`)
      .query({ stock: stockName, like: false })
      .set("X-Forwarded-For", '91.170.114.110')
      .end(function(err, res) {

        console.log(err)

        assert.nestedPropertyVal(res.body, "stockData.stock", stockName, "check stockname")
        assert.nestedPropertyVal(res.body, "stockData.price", price, "check price")
        assert.nestedProperty(res.body, "stockData.likes", "check if reponse has a 'likes' prop")

        currentLikes = res.body.stockData.likes
          //assert.deepEqual(res.body, { "stockData": { "stock": stockName, "price": price, "likes": 0 } })


          ;
      });

  });




  test('2: Viewing one stock and liking it: GET request to /api/stock-prices/', async () => {
    let stockName = randomNameGenerator(validStockNames);
    let price = await fetchPrice(stockName);


    var requester = chai.request(server).keepOpen();



    Promise.resolve(
      requester.get('/api/stock-prices/')
        .query({ stock: stockName, like: false })
        .set("X-Forwarded-For", '91.170.114.110')
    )

      .then(response => {


        let likes = response.body.stockData.likes + 1;



        chai
          .request(server)
          .get(`/api/stock-prices/`)
          .query({ stock: stockName, like: true })
          .set("X-Forwarded-For", '91.170.114.110')
          .end(function(err, res) {

            console.log(err)

            assert.nestedPropertyVal(res.body, "stockData.stock", stockName, "check stockname")
            assert.nestedPropertyVal(res.body, "stockData.price", price, "check price")
            assert.nestedPropertyVal(res.body, "stockData.likes", likes, "check likes")




          });

        requester.close();

      });
  });




  test('3: Viewing the same stock and liking it again: GET request to /api/stock-prices/', async () => {
    let stockName = randomNameGenerator(validStockNames);
    let price = await fetchPrice(stockName);


    var requester = chai.request(server).keepOpen();



    Promise.resolve(
      requester.get('/api/stock-prices/')
        .query({ stock: stockName, like: true })
        .set("X-Forwarded-For", '91.170.114.110')
    )

      .then(response => {


        let likes = response.body.stockData.likes;



        chai
          .request(server)
          .get(`/api/stock-prices/`)
          .query({ stock: stockName, like: true })
          .set("X-Forwarded-For", '91.170.114.110')
          .end(function(err, res) {

            console.log(err)

            assert.nestedPropertyVal(res.body, "stockData.stock", stockName, "check stockname")
            assert.nestedPropertyVal(res.body, "stockData.price", price, "check price")
            assert.nestedPropertyVal(res.body, "stockData.likes", likes, "check likes")




          });

        requester.close();

      });
  });






  "-------------------------------viewing 2 Stocks---------------------------------"







  test('4: Viewing two stocks: GET request to /api/stock-prices/',
    async () => {
      let stockName1 = randomNameGenerator(validStockNames)
      let stockName2 = randomNameGenerator(validStockNames)
      let price1 = await fetchPrice(stockName1)
      let price2 = await fetchPrice(stockName2)


      chai
        .request(server)
        .get(`/api/stock-prices/`)
        .query({ stock: [stockName1, stockName2], like: false })
        .set("X-Forwarded-For", '91.170.114.110')
        .end(function(err, res) {

          console.log(err)

          assert.nestedPropertyVal(res.body, "stockData[0].stock", stockName1, "check stockname")
          assert.nestedPropertyVal(res.body, "stockData[1].stock", stockName2, "check stockname")

          assert.nestedPropertyVal(res.body, "stockData[0].price", price1, "check price")
          assert.nestedPropertyVal(res.body, "stockData[1].price", price2, "check price")
          assert.nestedProperty(res.body, "stockData[0].rel_likes", "check if stockData[0] has a 'likes' prop")
          assert.nestedProperty(res.body, "stockData[1].rel_likes", "check if stockData[1] has a 'likes' prop")
          currentLikes = res.body.stockData.likes
            //assert.deepEqual(res.body, { "stockData": { "stock": stockName, "price": price, "likes": 0 } })


            ;
        });

    });




  test('5: Viewing two stocks and liking them: GET request to /api/stock-prices/', async () => {
    let stockName1 = randomNameGenerator(validStockNames)
    let stockName2 = randomNameGenerator(validStockNames)
    let price1 = await fetchPrice(stockName1)
    let price2 = await fetchPrice(stockName2)


    let requester1 = chai.request(server).keepOpen();
    let requester2 = chai.request(server).keepOpen();


    Promise.all([
      requester1.get('/api/stock-prices/')
        .query({ stock: stockName1, like: false })
        .set("X-Forwarded-For", '91.170.114.110'),
      requester2.get('/api/stock-prices/')
        .query({ stock: stockName2, like: false })
        .set("X-Forwarded-For", '91.170.114.110'),
    ]
    )

      .then((response) => {

        console.log("test5------------response")
        console.log(response[0].body.stockData.likes)
        let rel_likes1 = (response[0].body.stockData.likes + 1) - (response[1].body.stockData.likes + 1);
        let rel_likes2 = (response[1].body.stockData.likes + 1) - (response[0].body.stockData.likes + 1);

        return [rel_likes1, rel_likes2]
      })
      .then(response => {
        chai
          .request(server)
          .get(`/api/stock-prices/`)
          .query({ stock: [stockName1, stockName2], like: true })
          .set("X-Forwarded-For", '91.170.114.110')
          .end(function(err, res) {

            console.log(err)
            console.log("response------------------")
            console.log(response)
            console.log("res.body.stockdata------------------")
            console.log(res.body)

            assert.nestedPropertyVal(res.body, "stockData[0].stock", stockName1, "check stockname")
            assert.nestedPropertyVal(res.body, "stockData[1].stock", stockName2, "check stockname")
            assert.nestedPropertyVal(res.body, "stockData[0].price", price1, "check price")
            assert.nestedPropertyVal(res.body, "stockData[1].price", price2, "check price")
            assert.nestedPropertyVal(res.body, "stockData[0].rel_likes", response[0], "check rel_likes stock1")
            assert.nestedPropertyVal(res.body, "stockData[1].rel_likes", response[1], "check rel_likes stock2")


          });

        requester1.close();
        requester2.close();
      });
  });


});