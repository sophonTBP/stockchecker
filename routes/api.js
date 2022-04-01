'use strict';

const mongoose = require('mongoose');
let UserModel = require('../models/user.model')
let StonkModel = require('../models/stonk.model')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
module.exports = function(app) {
  


  const storeData = async (name, req, res) => {
    try {
      let getStonkName = name;
      let like = JSON.parse(req.query.like);     
      let hash = req.headers['x-forwarded-for'];
      hash = hash.slice(0, -1) + "0";
      let user;

      let userExists = await UserModel.exists({ userID: hash })

      if (!userExists) {
        try {         
          user = await createAndSaveUser(hash, getStonkName)
        }
        catch (err) {
          console.log('err' + err);
          res.status(500).send(err);
        }
      }
      else {

        try {
          user = await UserModel.findOne({ userID: hash })

        }
        catch (err) {
          console.log('err' + err);
          res.status(500).send(err);
        }
      }

      let likes = await likeStonk(hash, user, getStonkName, like)
      return likes
    }
    catch (err) {
      console.log('err' + err);
      res.status(500).send(err);
    }
  }


  const createAndSaveUser = async (hash, stonk, like) => {
    try {

      let stonks = (like == true) ? stonk : []
      let user = new UserModel({ userID: hash, likedStonks: stonks })
      let saveUser = await user.save()
      return saveUser
    }
    catch (err) {
      console.log('err' + err);
      res.status(500).send(err);
    }
  }


  const createAndSaveStonk = async (id, stonkName, like) => {
    try {

      let likes = (like == true) ? 1 : 0
      
      let fans = [id]
      let stonk = new StonkModel({ stonkName: stonkName, likes: likes, fans: fans })
      let saveStonk = await stonk.save()
      return saveStonk
    }
    catch (err) {
      console.log('err' + err);
      res.status(500).send(err);
    }
  }

  const likeStonk = async (hash, user, stonkName, like) => {
    
    let id = user._id.toString()
    let stonk = {}
    stonk.likes = 0;

    if (like == true) {

      let stonkExists = await StonkModel.exists({ stonkName: stonkName })

      if (stonkExists) {
       
        stonk = await StonkModel.findOne({ stonkName: stonkName })
        let fanArr = stonk.fans
        
        let fanSet = new Set(fanArr)

        let newSet = fanSet.add(id)
        let currFanArr = Array.from(newSet)
        
        if (fanArr.length < currFanArr.length) {
          stonk = await StonkModel.findOneAndUpdate({ stonkName: stonkName }
            , { $inc: { likes: 1 }, $set: { fans: currFanArr } }
            , { new: true })
          return stonk.likes
        } else {
          stonk = await StonkModel.findOne({ stonkName: stonkName })
          return stonk.likes
        }

      } else {
       
        stonk = await createAndSaveStonk(id, stonkName, like)
        return stonk.likes
      }

    } else {
      
      let stonkExists = await StonkModel.exists({ stonkName: stonkName })
      if (stonkExists) {
        
        stonk = await StonkModel.findOne({ stonkName: stonkName })
        return stonk.likes
      } else {
        return stonk.likes
      }

    }
  }
  const fetchPrice = async (req, res) => {

    let name = req
    let priceObj = {}
    let url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${name}/quote`
    let fetchPrice =
      fetch(url, {
        method: 'GET',
        //mode: "no-cors",
        //cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      })

    return fetchPrice
      .then(res => { return res.text(); })
      .then(res => {
        let price = JSON.parse(res)
        console.log("price", price.latestPrice)
        return price.latestPrice
      })
      .catch(res => { console.log("Exception : ", res); });


  }





  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let isStonkList = Array.isArray(req.query.stock);
      console.log(isStonkList)
      console.log("query----------------------")
      console.log(req.query)
      //let data = await storeData(req);
      let priceArr = []
      const getPriceArr = async (req) => {
        let getStonkName = isStonkList ? JSON.parse(req.query.stock) : [JSON.parse(req.query.stock)]
      


        for (let name of getStonkName) {
          let price = await fetchPrice(name)
          let likes = await storeData(name, req)
          console.log(likes)
          let priceObj = { stock: name.toUpperCase(), price: price, likes: likes }

          priceArr = [...priceArr, priceObj]


        }

        if(isStonkList==true){
        let obj1 = { stock: priceArr[0].stock, price: priceArr[0].price, rel_likes: priceArr[0].likes - priceArr[1].likes }
        let obj2 = { stock: priceArr[1].stock, price: priceArr[1].price, rel_likes: priceArr[1].likes - priceArr[0].likes }




        let stockData = [obj1, obj2]
   return res.json({ "stockData": stockData })}
        else return res.json((JSON.stringify(JSON.parse({ "stockData": priceArr[0]}))))
      }
      let priceObject = await getPriceArr(req)
      //let getStockInfo = await Promise.all([priceObject])
      //.then((val) => {  })

    }



    )//get route
}//module  
