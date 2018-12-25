const Airtable = require('airtable');
const airtableBaseAssets = 'appnvQb0LqM1nKTTQ';
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(airtableBaseAssets);

const AIRTABLE_ASSETS_NUMBER_OF_FIELDS = 6;

async function getAssetsFromAirtable(){
  let records = await base('Imported table').select();
  records = await records.firstPage();
  const revenuesByAssetName = {};
  let assetsById = {};

  try{
    for(let i = 0; i < records.length; i++){
      let assetIds = records[i].get('Asset IDs');
      const assetName = records[i].get('Asset');
      let revenuePerHour = records[i].get('Revenue Per Hour');
      if(assetIds && assetName && revenuePerHour && Object.keys(records[i].fields).length >= AIRTABLE_ASSETS_NUMBER_OF_FIELDS){
        assetIds = assetIds.split(',');
        assetIds.forEach(assetIdInfo => {
          const assetId = assetIdInfo.split('|')[0];
          //if no info about revenue for a given asset name, process it
          if(!revenuesByAssetName[assetName]){
            revenuePerHour = revenuePerHour.split(',');
            revenuePerHour = {
              min: revenuePerHour[0],
              max: revenuePerHour[1],
            };
            revenuesByAssetName[assetName] = revenuePerHour;
            assetsById[assetId] = revenuesByAssetName[assetName];
          } else{
            assetsById[assetId] = revenuesByAssetName[assetName];
          }
        })
      }
    }
    return assetsById;
  }catch(err){
    console.log(err);
  }
}

module.exports = {
  getAssetsFromAirtable,
}
