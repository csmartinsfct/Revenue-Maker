require('dotenv').config();
const dev = process.env.NODE_ENV === 'development';
const debug = () => dev ? console.log(message) : {};
var Web3 = require('web3');
var axios = require('axios');
var dayjs = require('dayjs');
const Tx = require('ethereumjs-tx');
const API = require('./constants/contracts/API');
const AssetCreation = require('./constants/contracts/AssetCreation');
const FundingHub = require('./constants/contracts/FundingHub');
const AssetBank = require('./constants/contracts/AssetBank');
const InitialVariables = require('./constants/contracts/InitialVariables');
const Constants = require('./constants');
const Airtable = require('./airtable');

const ADDRESS = process.env.ADDRESS;
const ADDRESS_PRIVATE_KEY = Buffer.from(process.env.ADDRESS_PRIVATE_KEY, 'hex');
let airtableAssetsById = {};
//index 0 = open for funding
//index 1 = failed
//index 3 = success but needs confirmation, payout()
//index 4 = live
let assetStateCounter = [0, 0, 0, 0];
let updatingEtherPrice = true;
var updatingAssets = 1;
let address = '';
let password = '';
let millisecondsToGo = 3600000; //60 minutes
const oneHourInMilliseconds = 3600000;
const sevenMinutesInMilliseconds = 420000;
const thirtySeconds = 30000;
const minTime = 0.5 * thirtySeconds;
const maxTime = 2 * thirtySeconds;
let oldEthPrice;

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`));
let etherPrice = 0;

const main = () =>{
  try{
    fetchAssets();
    millisecondsToGo = Math.floor(Math.random() * maxTime) + minTime;
    console.log("Running script again on: " + dayjs(new Date().getTime() + millisecondsToGo).toString());
    setTimeout(main, millisecondsToGo);
  } catch(err) {
    console.log("Error in main: " + err);
    setTimeout(main, 5000);
  }
}

const fetchPriceFromCoinmarketcap = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios(
        `https://api.coinmarketcap.com/v2/ticker/1027/`
      );
      const price = response.data.data.quotes.USD.price;
      const priceFormatted = Math.round(price * 100) / 100;
      logger('fetchPriceFromCoinmarketcap', 'priceFormatted', priceFormatted)
      resolve(priceFormatted);
    } catch (error) {
      logger('fetchPriceFromCoinmarketcap', 'error', error)
      reject(error);
    }
  });
}

const fetchAssets = async() => {
  logger('fetchAssets', 'updatingEtherPrice', updatingEtherPrice)
  if(updatingEtherPrice){
    return;
  }
  try {
    // pull asssets from newest contract
    let apiContract = new web3.eth.Contract(API.ABI, API.ADDRESS);
    let assetCreationContract = new web3.eth.Contract(
      AssetCreation.ABI,
      AssetCreation.ADDRESS,
    );

    let logAssetFundingStartedEvents = await assetCreationContract.getPastEvents(
      'LogAssetFundingStarted',
      { fromBlock: 0, toBlock: 'latest' },
    );

    let assets = logAssetFundingStartedEvents
      .map(({ returnValues }) => returnValues)
      .map(object => ({
        assetID: object._assetID,
        assetType: object._assetType,
        ipfsHash: object._ipfsHash,
      }));

    assets = assets.filter(asset => airtableAssetsById[asset.assetID]);

    assets = await Promise.all(
      assets.map(async asset => {
        return {
          ...asset,
          fundingStage: Number(await apiContract.methods.fundingStage(asset.assetID).call())
        }
      })
    );

    nonce = await web3.eth.getTransactionCount(ADDRESS) - 1;
    logger('fetchAssets', 'nonce', nonce)

    assets = assets.filter((asset, index) => asset.fundingStage === 3 || asset.fundingStage === 4)
    assets.map((asset, index) => {
      const assetID = asset.assetID;
        if(asset.fundingStage === 3){
          updatingAssets+=1;
          payoutAsset(assetID, nonce + index + 1);
        }
        else if(asset.fundingStage === 4){
          updatingAssets+=1;
          receiveIncome(assetID, nonce + index + 1);
        }
    });
  } catch (error) {
    console.log(error)
  }
}

const receiveIncome = async(assetId, nonce) => {
  try{
    const assetBankContract = new web3.eth.Contract(
      AssetBank.ABI,
      AssetBank.ADDRESS
    );

    const assetRevenueDetails = airtableAssetsById[assetId];
    logger('receiveIncome', 'assetRevenueDetails', assetRevenueDetails)

    if(!assetRevenueDetails){
      return;
    }

    const minAmount = Number(assetRevenueDetails.min);
    const maxAmount = Number(assetRevenueDetails.max);
    
    
    /*
    * the ranges are for two hours of work, we need to do the math to average out the income
    * example: if the script runs 10 mins after it had run then the revenue should be smaller
    * first run it isn't
    */
    
    const newMinRevenue = (millisecondsToGo * minAmount) / 7200000;
    const newMaxRevenue = (millisecondsToGo * maxAmount) / 7200000;
    
    const revenueInUSD = millisecondsToGo > 0 ? 
      Math.floor(Math.random() * newMaxRevenue) + newMinRevenue :
      Math.floor(Math.random() * maxAmount) + minAmount;
    

    const etherAmount = revenueInUSD / etherPrice;

    const weiAmount = web3.utils.toWei(etherAmount.toFixed(18), 'ether')

    console.log(`\n\n>>>>>> Sending ${etherAmount.toFixed(5)} ETH | $${revenueInUSD.toFixed(2)} to ${assetId} >>>>>>\n\n`)
    
    logger('receiveIncome', 'etherAmount', etherAmount.toFixed(5))
    logger('receiveIncome', 'revenueInUSD', revenueInUSD.toFixed(2))
    logger('receiveIncome', 'assetId', assetId)
    

    const data = await assetBankContract.methods.receiveIncome(assetId, web3.utils.sha3('note')).encodeABI();

    const rawTx = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(20000000000),
      gasLimit: web3.utils.toHex(140000),
      from: web3.utils.toHex(ADDRESS),
      to: AssetBank.ADDRESS,
      data: data,
      value: web3.utils.toHex(weiAmount),
    }

    const tx = new Tx(rawTx)
    tx.sign(ADDRESS_PRIVATE_KEY)
    const serializedTx = "0x" + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(serializedTx)
    .on('receipt', receipt => {
      logger('receiveIncome', 'sendSignedTransaction.on(receipt) => receipt', receipt)
    }).on('error', error => {
      logger('payoutAsset', 'sendSignedTransaction.on(error) => error', error)
    });
  }catch(err){
    updatingAssets-=1
    console.log(err);
  }
}

const payoutAsset = async(assetId, nonce) => {
  try {
    const fundingHubContract = new web3.eth.Contract(
      FundingHub.ABI,
      FundingHub.ADDRESS
    );

    logger('payoutAsset', 'assetId', assetId)
    const data = await fundingHubContract.methods.payout(assetId).encodeABI();

    const rawTx = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(20000000000),
      gasLimit: web3.utils.toHex(140000),
      from: web3.utils.toHex(ADDRESS),
      to: FundingHub.ADDRESS,
      data: data,
    }

    const tx = new Tx(rawTx)
    tx.sign(ADDRESS_PRIVATE_KEY)
    const serializedTx = "0x" + tx.serialize().toString('hex');
    
    web3.eth.sendSignedTransaction(serializedTx)
    .on('receipt', receipt => {
      logger('payoutAsset', 'sendSignedTransaction.on(receipt) => receipt', receipt)
    }).on('error', error => {
      logger('payoutAsset', 'sendSignedTransaction.on(error) => error', error)
    });
  } catch (err) {
      console.log(err);
  }
  updatingAssets-=1
}

const updateEtherPrice = async() => {
  return new Promise(async (resolve, reject) => {
    try{
      if(updatingAssets !== 1){
        resolve(false);
        return;
      }
      updatingEtherPrice = true;
      const initialVariablesContract = new web3.eth.Contract(
          InitialVariables.ABI,
          InitialVariables.ADDRESS
        );

      const newPrice = (etherPrice * 1.05).toFixed(0);
      if(oldEthPrice && oldEthPrice.toFixed(0) === newPrice){
        console.log(`\n\n>>>>>> Price is the same, skipping and resolving to false >>>>>>\n\n`)
        logger('updateEtherPrice', 'oldEthPrice', oldEthPrice)
        logger('updateEtherPrice', 'newPrice', newPrice)
        resolve(false);
        return;
      }
      console.log(`\n\n>>>>>> Setting Ether price to ${newPrice} >>>>>>\n\n`)

      var data = await initialVariablesContract.methods.setDailyPrices(newPrice, 1).encodeABI();

      const nonce = await web3.eth.getTransactionCount(ADDRESS);

      let rawTx = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(4000000000),
        gasLimit: web3.utils.toHex(140000),
        from: web3.utils.toHex(ADDRESS),
        to: InitialVariables.ADDRESS,
        data: data,
      }

      const tx = new Tx(rawTx)
      tx.sign(ADDRESS_PRIVATE_KEY)
      let serializedTx = "0x" + tx.serialize().toString('hex');
      web3.eth.sendSignedTransaction(serializedTx)
      .on('receipt', receipt => {
        oldEthPrice = etherPrice;
        console.log(`\n\n>>>>>> Set Ether price >>>>>>\n\n`)
      }).on('error', error => {
        console.log(error);
        console.log(`\n\n>>>>>> Failed to set Ether price >>>>>>\n\n`)
      });
    }catch(err){
      console.log(err);
    }
    resolve(false)
  })
}

const initialize = async() => {
  airtableAssetsById = await Airtable.getAssetsFromAirtable();
  do {
    etherPrice = await fetchPriceFromCoinmarketcap();
    logger('initialize', 'etherPrice', etherPrice)
    if(!dev){
      updatingEtherPrice = await updateEtherPrice();
    }
  } while (etherPrice == 0);
  main();
}

initialize();

setInterval(async() => {
  etherPrice = await fetchPriceFromCoinmarketcap();
}, 300000);

if(!dev){
  setInterval(async() => {
    updatingEtherPrice = await updateEtherPrice();
  }, thirtySeconds);
}


const logger = (method, variable, data) => console.log(`[ ${method} ] - ${variable}`, data)
