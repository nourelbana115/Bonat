const _ = require('lodash');

const axios = require('axios');

const logger = require('../logger');

const Segment = require('../../db/models/Segments');

const Customer = require('../../db/models/Customers');

const {SegmentStatistics} = require('../../db/models/SegmentStatistics');

const utilities = require('../../utilities');

// get merchant users
function getMerchantCustomers(merchant) {
    return new Promise((resolve, reject) => {
       // console.log(merchant);
        let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers`;
        let config = {
            headers: {
                "Authorization": `Bearer ${merchant.token}`
            }
        }
        axios.get(url, config)
            .then((response) => {
                //console.log(response.data.length)
                logger.log('general','info',`${merchant.idMerchant},${response.data.length}`,'getMerchantCutomers');
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Get Merchant Customers')
                return reject(err)
            });
    })
}

//calculate all customers segment
const calculateAllCustomers = async(customers) => {

let customersData=[];

let registeredThisMonth=[];

customers.map(customer=>{

    let date=new Date

    let createdAt=new Date(customer.createdAt)

    customersData.push(customer)
    

    if(date.getMonth() == createdAt.getMonth && date.getFullYear() == createdAt.getFullYear() )

    registeredThisMonth.push(customer)
})

return{
    "customers":customersData,
    "segmentData":{
        "allCustomers":customersData.length,
        "registeredThisMonth":registeredThisMonth.length
    }
}
}


const updateSegmentDoc = (queryObj,updateObj) => {
return new Promise((resolve,reject)=>{
    Segment.findOneAndUpdate(queryObj,updateObj)
    .exec()
    .then(updatedSegment=>resolve(updatedSegment))
    .catch(e=>reject(e))
})   
}

const getMerchantcustomersFromDB=(merchant)=>{
    return new Promise((resolve,reject)=>{
        Customer.find({merchant:merchant})
        .then(customers=>resolve(customers))
        .catch(e=>reject(e))
    })
}


const readfyInsertCustomersDocs = (customers,segment) => {

    return customers.map(customer => {
        return {
            idCustomer:customer.idCustomer,
            customerData:customer,
            merchant:segment.merchant,
            segments:[segment._id],
            updatedAt:new Date()
        }
    })
}
const removeCustomerSegment=(segmentId)=>{
    return Customer.updateMany(
        {},
        {$pull:{segments:{$in:[segmentId]}}}
    )
}

const updateCustomersCollection=async(customers,segment)=>{
if(customers.length){
    const currentMerchantCustomers=await getMerchantcustomersFromDB(segment.merchant)
    if(!currentMerchantCustomers.length){
       return await Customer.insertMany(readfyInsertCustomersDocs(customers,segment))
    }
    const customerWithRemovedSegment=await removeCustomerSegment(segment._id)
    if(!customersWithRemovedsegment) 
    return Promise.reject("can't remove old segment id from customers");
    const 

}

}

const updateAllCustomersSegment=(segmentObj,merchantId)=>{
    return new Promise((resolve,reject)=>{
        updateSegmentDoc({
            merchant:merchantId,
            segmentType:"everyOne"

        },
        {
            "$set":{
                "segmentData.allCustomers.value":segmentObj.segmentData.allCustomers,
                "segmentData.registeredThisMonth.value":segmentObj.segmentData.registeredThisMonth,
                "segmentData.segmentUserCount.value": segmentObj.segmentData.allCustomers,
                "updatedAt":new Date()
            }
        }
        )
        .then(segment=>{
            updateCustomersCollection(segmentObj.customers,segment)
        })
    })
}


const updateSegmentData = async (merchant) => {
const customers=await getMerchantCustomers(merchant);

if(!customers || !customers.length) return Promise.reject('no customers found');

const everyOneSegmentData= await calculateAllCustomers(customers);

const allCustomersSegment= await updateAllCustomersSegment(everyOneSegmentData,merchant._id)

}