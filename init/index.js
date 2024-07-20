require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");


const dbUrl = process.env.ATLASDB_URL ;

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj , owner : '669b5154470e8b7bb1cbf93b', geometry : [77.2088 , 28.6139 ]}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();

