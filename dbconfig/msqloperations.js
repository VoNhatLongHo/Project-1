var  config = require('./mssql');
const  sql = require('mssql');

//https://www.telerik.com/blogs/step-by-step-create-node-js-rest-api-sql-server-database

const getDulieumau = async (q) =>{
    try {

      let  pool = await  sql.connect(config);
      
      let  dulieumau = await  pool.request().query(q);
      return  dulieumau.recordset;
    }
    catch (error) {
      console.log(error);
    }
}

async function addDulieumau(q) {
  try {
    let  pool = await  sql.connect(config);
    await  pool.request().query(q);
    pool.close();
  }
  catch (error) {
    console.log(error);
  }
}

module.exports ={
  getDulieumau,
  addDulieumau};