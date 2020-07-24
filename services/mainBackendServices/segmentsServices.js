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

const calculateTotalPunchs = (customers) => {
    const customersTotalPunchs = customers.reduce((total,customer)=>{
        return total + parseInt(customer.numberOfPunches);
    },0);
    
    return customersTotalPunchs;
}

// calculate superFan
const calculateSuperFans = (customers) => {
   
    const customersTotalVistits = customers.reduce((total,customer)=>{
        return total + parseInt(customer.visits);
    },0);

    const customserCount = customers.length;
    
    const avgCustomersVisits = (customersTotalVistits/customserCount);

    const SuperFsnCustomers = customers.filter(customer => {
        return customer.visits > avgCustomersVisits;
    });
    
    return {
        "customers": SuperFsnCustomers,
        "segmentData": {
            "mostActive": SuperFsnCustomers.length,
            "totalPunches": calculateTotalPunchs(SuperFsnCustomers)
        }
    };
}

// calculate newCustomers
const calculateNewCustomers = (customers) => {
    
    //calc new customers for this month
    const today = new Date();
    let customersData = []
    let createdLastMonth = []

    customers.map((customer) => {
        let currentTime = new Date(customer.createdAt)
        if (today.getFullYear() === currentTime.getFullYear() && today.getMonth() === currentTime.getMonth()) {
           customersData.push(customer);
        }
        if (today.getFullYear() === currentTime.getFullYear() && (today.getMonth() - 1) === (currentTime.getMonth())) {
            createdLastMonth.push(customer);
        }
    });

    return {
        
        "customers": customersData,
        "segmentData": {
            "createdThisMonth": customersData.length,
            "createdLastMonth": createdLastMonth.length
        }
    }
    
    
}

// calculate all customers
const  calculateAllCustomers = (customers) => {
    
        let customersData = [];
        let registeredThisMonth = []

        customers.map((customer) => {
            let date = new Date
            let createdAt = new Date(customer.createdAt)
            customersData.push(customer)
            if (date.getMonth() == createdAt.getMonth() && date.getFullYear() == createdAt.getFullYear()) {
                registeredThisMonth.push(customer)
            }
        })
       
        return {
            
            "customers": customersData,
            "segmentData": {
                "allCustomers": customersData.length,
                "registeredThisMonth": registeredThisMonth.length
            }
        }
        
}

// calculate lostCustomers
const calculateLostCustomers = (customers) => {
    
    const lostCustomers = customers.filter((customer) =>{
        return utilities.date.addDays(60,customer.lastVisit) <= new Date();
    });

    return {
        
        "customers": lostCustomers,
        "segmentData": {
            "zeroActivity": lostCustomers.length,
            "onlyOnePunch": calculateTotalPunchs(lostCustomers)
        }
    };
        
}

// calculate birthday customers.
const calculateBirthDayCustomers = (customers) => {
   
    let birthDayCustomers = []
    let birthDayMentioned = []

    customers.map((customer) => {
        let date = new Date
        let birthDay = new Date(customer.birthday)
        if (customer.birthdate) {
            let birthDate = new Date(customer.birthdate)
            if (birthDay.getMonth() == birthDate.getMonth())
                birthDayMentioned.push(customer)
        }
        if (birthDay.getMonth() == date.getMonth()) {
            birthDayCustomers.push(customer)
            
        }
    })
    return {
        "customers": birthDayCustomers,
        "segmentData": {
            "mentionedTheirBirthDay": birthDayMentioned.length,
            "birthDayThisMonth": birthDayCustomers.length
        }
    }

}

const getMerchantCustomersFromDb = (merchentId) => {

    return new Promise((resolve,reject) => {

        Customer.find({merchant:merchentId})

        .then(customers => resolve(customers))

        .catch(error => reject(error));

    });
}

const readfiyInsertCustomersDocs = (customers,segment) => {

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

//need to be refactored for better performance
const readfiyUpdateCustomersDocs = (existingCustomers,newCustomers) => {

    return newCustomers.filter(customer => {
        const newCustomer = existingCustomers
        .filter(exCustomer => exCustomer.idCustomer == customer.idCustomer);
        if(!newCustomer.length) return customer;
    })
}

const removeCustomerSegment = (segmentId) => {

    return Customer.updateMany({},
        {
            $pull:{ segments: { $in: [ segmentId ] } }
        },
        { multi:true,new:true}
    );
}

const updateCustomersSegment = (customers,segmentId) => {

    const customersIds = customers.map(customer => customer.idCustomer);
    
    return Customer.updateMany({idCustomer: { $in: customersIds}},
        {
            $set:{ 
                "updatedAt": new Date()
            },
            $push:{"segments":segmentId},
        },
        {multi:true, new:true}
    );
}

const updateCustomersSegmentByDocId = (customersIds,segmentId) => {

    return Customer.updateMany({_id: { $in: customersIds}},
        {
            $set:{ 
                "updatedAt": new Date()
            },
            $push:{"segments":segmentId},
        },
        {multi:true, new:true}
    ).exec();
}

const updateCustomersCollection = async (customers,segment) => {

    if(customers.length){

        const currentMerchantCustomers = await getMerchantCustomersFromDb(segment.merchant);
        
        if(!currentMerchantCustomers.length){

           return await Customer.insertMany(readfiyInsertCustomersDocs(customers,segment),{ ordered : false });

        }else{
             
            const customersWithRemovedsegment = await removeCustomerSegment(segment._id);
          
            if(!customersWithRemovedsegment) 
            return Promise.reject("can't remove old segment id from customers");

            const newCustomersToAdd = readfiyUpdateCustomersDocs(currentMerchantCustomers,customers);
           
            if(newCustomersToAdd.length) await Customer.insertMany(readfiyInsertCustomersDocs(newCustomersToAdd,segment),{ ordered : false });
      
            return await updateCustomersSegment(customers,segment._id);
        }
    }

    return Promise.resolve("no customers");
}

const updateSegmentDoc = (queryObj,updateObj) => {

    return new Promise((resolve,reject) => {
        //need to update send mail campaign job
        Segment.findOneAndUpdate(queryObj,updateObj,{upsert:true, returnNewDocument:true, useFindAndModify: false})
    
        .exec()
    
        .then((segment) => resolve(segment))
        
        .catch(error => reject(`error in save segment:${error}`));
    })
}

const updateAllCustomersSegment = (segmentObj,merchantId) => {
    return new Promise((resolve,reject) => {
       
       updateSegmentDoc(
            {
                "merchant":merchantId,
                "segmentType":"everyone",
            },
            { 
                "$set": {
                    "segmentData.allCustomers.value": segmentObj.segmentData.allCustomers,
                    "segmentData.registeredThisMonth.value": segmentObj.segmentData.registeredThisMonth,
                    "segmentData.segmentUserCount.value": segmentObj.segmentData.allCustomers,
                    "updatedAt": new Date()
                }
            }
       )
       .then((segment) => {

            updateCustomersCollection(segmentObj.customers,segment)

            .then(result => 
                
                {
                    logger.log('general', 'info', result, ' customers of Everyone segment');

                    resolve(result)})

            .catch(error => 
                {
                    logger.log('general', 'error', error, `Update customers of Everyone segment ${merchantId} `);
        
                    reject(error)
                });
       })
       .catch(error => 
        {
            logger.log('general', 'error', error, 'Update Everyone Segment ');

            reject(error)
        });

    });
}

const updateSuperFanSegment = (segmentObj,merchantId) => {

    return new Promise((resolve,reject) => {
       updateSegmentDoc(
            {
                "merchant":merchantId,
                "segmentType":"superFan",
            },
            { 
                "$set": {
                    "segmentData.mostActive.value": segmentObj.segmentData.mostActive,
                    "segmentData.totalPunches.value": segmentObj.segmentData.totalPunches,
                    "segmentData.segmentUserCount.value": segmentObj.segmentData.mostActive,
                    "updatedAt": new Date()
                }
            }
       )
       .then((segment) => {

            updateCustomersCollection(segmentObj.customers,segment)

            .then(result => resolve(result))

            .catch(error => reject(error));
       })
       .catch(error => reject(error));

    });
}

const updateBirthDaySegment = (segmentObj,merchantId) => {
    return new Promise((resolve,reject) => {
       updateSegmentDoc(
            {
                "merchant":merchantId,
                "segmentType":"birthday",
            },
            { 
                "$set": {
                    "segmentData.mentionedTheirBirthDay.value":segmentObj.segmentData.mentionedTheirBirthDay,
                    "segmentData.birthDayThisMonth.value":segmentObj.segmentData.birthDayThisMonth,
                    "segmentData.segmentUserCount.value":segmentObj.segmentData.mentionedTheirBirthDay,
                    "updatedAt": new Date()
                }
            }
       )
       .then((segment) => {

            updateCustomersCollection(segmentObj.customers,segment)

            .then(result => resolve(result))

            .catch(error =>  reject(error));
       })
       .catch(error => reject(error));

    });
}

const updateLostCustomersSegment = (segmentObj,merchantId) => {

    return new Promise((resolve,reject) => {
       updateSegmentDoc(
            {
                "merchant":merchantId,
                "segmentType":"lostCustomers",
            },
            { 
                "$set": {
                    "segmentData.zeroActivity.value": segmentObj.segmentData.zeroActivity,
                    "segmentData.onlyOnePunch.value": segmentObj.segmentData.onlyOnePunch,
                    "segmentData.segmentUserCount.value": segmentObj.segmentData.zeroActivity,
                    "updatedAt": new Date()
                }
            }
       )
       .then((segment) => {

            updateCustomersCollection(segmentObj.customers,segment)

            .then(result => resolve(result))

            .catch(error =>  reject(error));
       })
       .catch(error => reject(error));

    });
}

const updateNewCustomersSegment = (segmentObj,merchantId) => {

    return new Promise((resolve,reject) => {
       updateSegmentDoc(
            {
                "merchant":merchantId,
                "segmentType":"newCustomers",
            },
            { 
                "$set": {
                    "segmentData.createdThisMonth.value": segmentObj.segmentData.createdThisMonth,
                    "segmentData.createdLastMonth.value": segmentObj.segmentData.createdLastMonth,
                    "segmentData.segmentUserCount.value": segmentObj.segmentData.createdThisMonth,
                    "updatedAt": new Date()
                }
            }
       )
       .then((segment) => {

            updateCustomersCollection(segmentObj.customers,segment)

            .then(result => resolve(result))

            .catch(error =>  reject(error));
       })
       .catch(error => reject(error));

    });
}

const updateSegmentsData = async (merchant) => {
    //console.log("customers")
    const customers = await getMerchantCustomers(merchant);
    //console.log(customers.length)
    if(!customers || !customers.length) return Promise.reject('no customers found');
  
    const everyOneSegmentData = calculateAllCustomers(customers);
    //console.log("everyOneSegmentData")
    const allCustomersSegment = await updateAllCustomersSegment(everyOneSegmentData,merchant._id);
    
    if(!allCustomersSegment) return Promise.reject(allCustomersSegment);

    //console.log(allCustomersSegment)

    const superFanSegmentData =  calculateSuperFans(customers);
    //console.log(superFanSegmentData)
    const superFanSegment = await updateSuperFanSegment(superFanSegmentData,merchant._id);

    if(!superFanSegment) return Promise.reject(superFanSegment);
    //console.log(superFanSegment)
    const birthDaySegmentData = calculateBirthDayCustomers(customers);

    const birthdaySegment = await updateBirthDaySegment(birthDaySegmentData,merchant._id);

    if(!birthdaySegment) return Promise.reject(birthdaySegment);
    //console.log(birthdaySegment)
    const lostCustomersSegmentData = calculateLostCustomers(customers);

    const lostCustomersSegment = await updateLostCustomersSegment(lostCustomersSegmentData,merchant._id);
    
    if(!lostCustomersSegment) return Promise.reject(lostCustomersSegment);
    //console.log(lostCustomersSegment)
    const newCustomersSegmentData = calculateNewCustomers(customers);

    const newCustomersSegment = await updateNewCustomersSegment(newCustomersSegmentData,merchant._id);

    if(!newCustomersSegment) return Promise.reject(newCustomersSegment);
    //console.log(newCustomersSegment)
    return Promise.resolve('default segments updated');
   
}

const getDefaultSegmentTypes = () => {
    return [
     "newCustomers",
     "everyone",
     "lostCustomers",
     "superFan",
     "birthday"
    ];
 }

const getSegmentCustomers = (merchant,segmentIds) => {
    return new Promise((resolve,reject) => {
        
        Customer.find({merchant:merchant._id,segments:{$in:segmentIds}})

        .then(customers => resolve(customers))

        .catch(error => reject(error))
    });
}

const getExactSegmentCustomers = (merchant,segmentIds) => {
    return new Promise((resolve,reject) => {
    console.log(segmentIds)
        
        Customer.find({merchant:merchant._id,segments:{$all:segmentIds}})

        .then(customers => resolve(customers))

        .catch(error => reject(error))
    });
}
const getDefaultSegments = (merchant) => {

    return new Promise((resolve,reject) => {
        
        Segment.find({merchant:merchant._id,segmentType:{$in:getDefaultSegmentTypes()}})

        .then(segments =>resolve(segments))

        .catch(error => reject(error))
    });
}

const getSpecificSegments = (merchant,arrayOfSegment) => {

    return new Promise((resolve,reject) => {
        
        Segment.find({merchant:merchant._id,segmentType:{$in:arrayOfSegment}})

        .then(segments =>resolve(segments))

        .catch(error => reject(error))
    });
}
const getSegmentsData = (merchant,defaultSegments,customerCount) => {

    return Promise.all(defaultSegments.map(segment => {

        return new Promise((resolve,reject) => {

            getSegmentCustomers(merchant,[segment._id])

            .then(customers =>{
                resolve({
                    segment:segment._id,
                    usersCount:customers.length,
                    customerCount:customerCount
                });
            })

            .catch(error => reject(error))
    
        })
        
    }));
}

const calculateIncAndDecInSegmentStats = (olderUsersCount,newUsersCount) => {
    
    if(olderUsersCount == 0) return 0;

    return Math.floor(((newUsersCount/olderUsersCount)*100)-100);
}

const calculatePercentage = (num,denom) => {
    
    if(num == 0) return 0;

    return Math.floor(((num/denom)*100));
}


const getLatestSegmentStats = (segmentId) =>{

    return new Promise((resolve,reject) => {

        SegmentStatistics.findOne({segment:segmentId}).sort({ createdAt : -1 }).limit(1)
        
        .exec()

        .then(segmentStats =>resolve(segmentStats))

        .catch(error => reject(error))
    })
}

const addNewSegmentStats = (segmentStatsObj) =>{
    return new Promise((resolve,reject) => {
       
        const segmentStats = new SegmentStatistics(segmentStatsObj);

        segmentStats.save()

        .then(newSegmentStats => resolve(newSegmentStats))

        .catch(error => reject(error));

    });
}

const findSegmentStatsAndUpdate = async (segmentData) => {
   
    const segmentStatsData = {
        segment:segmentData.segment,
        userCount:segmentData.usersCount,
        percentageDiff:0,
        percentageOfSegment:calculatePercentage(segmentData.usersCount,segmentData.customerCount)
    };
    
    const oldSegmentStats = await getLatestSegmentStats(segmentData.segment);
    
    if(oldSegmentStats){
        const precent = calculateIncAndDecInSegmentStats(oldSegmentStats.userCount,segmentData.usersCount);
         segmentStatsData.percentageDiff = (precent == 0)?oldSegmentStats.percentageDiff:precent;
    }
    //console.log(segmentStatsData);
    const addedSegmentStats = await addNewSegmentStats(segmentStatsData);
    
    if(!addedSegmentStats) Promise.reject(addedSegmentStats);

    return  addedSegmentStats;
}

const updateSegmentStatsCollection = (segmentsdata) => {
      
    return Promise.all(segmentsdata.map((segmentdata) => {
       
        return new Promise((resolve,reject) => {

            findSegmentStatsAndUpdate(segmentdata)

            .then(result => resolve(result))

            .catch(error => {
                logger.log('general', 'error', error, 'Update Segment Stats');
                reject(error);
            });
        });

    }));

}

const getTotalUserCount = (merchant) => {

    return new Promise ((resolve,reject) => {
        
        Customer.countDocuments({merchant:merchant._id})

        .then(customersCount => resolve(customersCount))

        .catch(error => reject(error));
    });
}

const updateSegmentStats = async (merchant) => {

    const defaultSegments = await getDefaultSegments(merchant);
    //console.log("defaultSegments");

    if(!defaultSegments || !defaultSegments.length) 
    return Promise.reject(`no default segments for merchant ${merchant._id}`);
    //console.log("defaultSegments")
    const customersCount = await getTotalUserCount(merchant);
    
    if(!customersCount)
    return Promise.reject(`can't get customers count ${merchant._id}`);
    //console.log(customersCount);
    const segmentsdata = await getSegmentsData(merchant,defaultSegments,customersCount);
   // console.log(segmentsdata);
    if(!segmentsdata || !segmentsdata.length) 
    return Promise.reject(`no segments data for merchant ${merchant._id}`);
   
    const updatedSegments = await updateSegmentStatsCollection(segmentsdata);
   
    if(!updatedSegments) 
    return Promise.reject(`we can't update segments for merchant ${merchant._id}`);
    //console.log(updatedSegments);
    return updatedSegments;

}

const addSegment = (segmentObj,merchantId) => {
    return new Promise((resolve,reject) =>{
        segmentObj.merchant = merchantId;
        const segment = new Segment(segmentObj);
        segment.save()
        .then(segment => resolve(segment))
        .catch( error => {
            logger.log("general","error",error,'create segment');
            reject(error);
        });
    }); 
}

const readyfiySegmentObj = (segmentData) => {
    return {
        segmentType: "customSegment",
        segmentData: segmentData
    };
}

const createCustomSegment = async (merchantId,customersIds,segmentData = {}) => {
    
    if(!customersIds.length) return Promise.reject("no customers");

    const segmentObj = readyfiySegmentObj(segmentData);

    const newSegment = await  addSegment(segmentObj,merchantId);

    await updateCustomersSegmentByDocId(customersIds,newSegment._id);

    return newSegment;
}

const findSegmentBySegmentType = (merchant,segmentType) => {
    return new Promise((resolve,reject) => {
        Segment.findOne({merchant:merchant._id,segmentType:segmentType})
        .exec()
        .then(segment =>resolve(segment))
        .catch(error => reject(error));
    });
}

const getSegmentsInitData = () =>{
    return [
        {
            segmentType: "newCustomers",
            segmentData: {
                createdThisMonth: {
                    label: "Registered This Month",
                    value: 0
                },
                createdLastMonth: {
                    label: "Registered Previous Month",
                    value: 0
                },
                segmentUserCount:{
                    label: "Segment Users Count",
                    value: 0
                }
            }
        },
        {
            segmentType: "everyone",
            segmentData: {
                allCustomers: {
                    label: "All Customers",
                    value: 0
                },
                registeredThisMonth: {
                    label: "Registered This Month",
                    value: 0
                },
                segmentUserCount:{
                    label: "Segment Users Count",
                    value: 0
                }
            }
        },
        {
            segmentType: "lostCustomers",
            segmentData: {
                zeroActivity: {
                    label: "Zero Activity this month",
                    value: 0
                },
                onlyOnePunch: {
                    label: "Only 1 Punch for 30 Days",
                    value: 0
                },
                segmentUserCount:{
                    label: "Segment Users Count",
                    value: 0
                }
            }
        },
        {
            segmentType: "superFan",
            segmentData: {
                mostActive: {
                    label: "Most Active Customers",
                    value: 0
                },
                totalPunches: {
                    label: "Total Punches",
                    value: 0
                },
                segmentUserCount:{
                    label: "Segment Users Count",
                    value: 0
                }
            }
        },
        {
            segmentType: "birthday",
            segmentData: {
                mentionedTheirBirthDay: {
                    label: "Mentioned Their Birthday",
                    value: 0
                },
                birthDayThisMonth: {
                    label: "Birthday This Month",
                    value: 0
                },
                segmentUserCount:{
                    label: "Segment Users Count",
                    value: 0
                }
            }
        }
    ];
}

const findIfDefaultSegmetsExist = (merchantId) => {
    return new Promise ((resolve,reject) =>{
        Segment.find( {merchant:merchantId , "segmentType" : { $in : getDefaultSegmentTypes() } })
        .then(segments => resolve(segments))
        .catch(error => reject(error));
    });
}

const addingDefaultSegments = (merchantId) => {
    const segments = getSegmentsInitData();
    const segmentList = segments.map(segment => {
        return new Promise((resolve,reject) => {
            addSegment(segment,merchantId)
            .then((oky) => resolve(oky))
            .catch(error => reject(error));
        });
    });
    return Promise.all(segmentList);
}
const getCustomersInMultiSegments = async (merchant,segmentId) =>{

    let superFanSegment = await findSegmentBySegmentType(merchant,'superFan')


    if(!superFanSegment) return `cant find superFan segment ${merchant}`

    else
    {

     const customers = await getExactSegmentCustomers(merchant,[segmentId,superFanSegment._id]);

     return customers

    }
}

module.exports = {
    updateSegmentsData,
    updateSegmentStats,
    createCustomSegment,
    addSegment,
    getSpecificSegments,
    getExactSegmentCustomers,
    getSegmentCustomers,
    getDefaultSegments,
    findSegmentBySegmentType,
    getDefaultSegmentTypes,
    getSegmentsInitData,
    findIfDefaultSegmetsExist,
    addingDefaultSegments,
    getCustomersInMultiSegments,
    calculateSuperFans,
    calculateAllCustomers,
    calculateLostCustomers,
    calculateNewCustomers,
    calculateBirthDayCustomers
}