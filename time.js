var express=require('express')
var app=express()
const moment=require('moment')
// var d=new Date('5-5-2020').getMonth()
// var z=new Date().getDay()

// // console.log(z)
// // var days=["sun","mon","tue","wed","thu","fri","sat"]
// // var date=new Date().getDay()
// // // var month=days[date]
// // // // // console.log(month)
// // // // let date="1-9-2020"
// // // // let now=moment('2020-1-9').format()
// // //   const setDate=(date,newDate)=>{
// // //  let checkSame=moment(date).isSame(newDate,'year')
// // //  return checkSame
// // //   }
// // // //let y= moment('2010-10-20').isSame('2009-12-31', 'year');  // false

// // // //let checkSame=moment('20-10-2010').isSame('21-10-2010')
// // //   console.log(setDate('2009-10-20',('2009-12-31')))
// // // // let date=moment('2020-01-09').format('MMMM')
// // // var date=moment()
// // // var h=date.get('hour')
// // // var m=date.get('minute')
// // // var s=date.get('second')
// // // console.log (`${h}:${m}:${s}`)
// // const name={name:'ali'}

// // const arr=[
// //     {name:'ali'},
// //     {age:'15'}
// // ]

// //  const newCustomers=['ali','ahmed','maged']
// //  const existCustomers=['ali','wael','hassan','maged']

// // // const result=newCustomers.map(customer=>{
// // var union=[...new Set([...newCustomers,...existCustomers])];
// // // })
// // // console.log(result)
// // // var a = [34, 35, 45, 48, 49];
// // // var b = [48, 55];
// // // var union = [...new Set([...a, ...b])];
// // console.log(union);

// const info1 = {id: 1}
//  const info2 = {id: 1}
//  const info3 = {id: 3}

// // const array1 = [info1, info2]
// // const array2 = [info1, info3]

// // const union = [...new Set([...array1, ...array2])]


// const existCustomers=[
//     {
//       "idCustomer": 1001,
//       "name": null,
//       "gender": null,
//       "birthday": null,
//       "age": null,
//       "createdAt": "2019-05-10T16:53:38.000Z",
//       "email": null,
//       "phoneNumber": "966559922217",
//       "numberOfPunches": 1,
//       "visits": 134,
//       "payments": "1052000.00",
//       "lastVisit": "2019-05-28T19:03:15.000Z",
//       "usedRewards": "0",
//       "usedCoupons": "0"
//     },
//     {
//       "idCustomer": 1002,
//       "name": "Mahmoud j. Sabbah",
//       "gender": "Female",
//       "birthday": "2019-01-06T00:00:00.000Z",
//       "age": 0,
//       "createdAt": "2019-05-14T12:51:36.000Z",
//       "email": "mahmouds9@gmail.com",
//       "phoneNumber": "966588888888",
//       "numberOfPunches": 5,
//       "visits": 115,
//       "payments": "2280499.00",
//       "lastVisit": "2019-06-08T10:11:04.000Z",
//       "birthdate": "2019-01-06T00:00:00.000Z",
//       "usedRewards": "14",
//       "usedCoupons": "0"
//     },
//     {
//       "idCustomer": 1006,
//       "name": "Bader Bader",
//       "gender": "Male",
//       "birthday": "1992-04-10T00:00:00.000Z",
//       "age": 27,
//       "createdAt": "2019-05-14T20:52:50.000Z",
//       "email": "baderalfouzan1@gmail.com",
//       "phoneNumber": "966559757254",
//       "numberOfPunches": 1,
//       "visits": 23,
//       "payments": "3046.50",
//       "lastVisit": "2019-06-06T10:01:20.000Z",
//       "birthdate": "1992-04-10T00:00:00.000Z",
//       "usedRewards": "1",
//       "usedCoupons": "0"
//     }]

//     const newCustomers=[
//         {
//           "idCustomer": 1001,
//           "name": null,
//           "gender": null,
//           "birthday": null,
//           "age": null,
//           "createdAt": "2019-05-10T16:53:38.000Z",
//           "email": null,
//           "phoneNumber": "966559922217",
//           "numberOfPunches": 1,
//           "visits": 134,
//           "payments": "1052000.00",
//           "lastVisit": "2019-05-28T19:03:15.000Z",
//           "usedRewards": "0",
//           "usedCoupons": "0"
//         },
//         {
//           "idCustomer": 1009,
//           "name": "Mahmoud j. Sabbah",
//           "gender": "Female",
//           "birthday": "2019-01-06T00:00:00.000Z",
//           "age": 0,
//           "createdAt": "2019-05-14T12:51:36.000Z",
//           "email": "mahmouds9@gmail.com",
//           "phoneNumber": "966588888888",
//           "numberOfPunches": 5,
//           "visits": 115,
//           "payments": "2280499.00",
//           "lastVisit": "2019-06-08T10:11:04.000Z",
//           "birthdate": "2019-01-06T00:00:00.000Z",
//           "usedRewards": "14",
//           "usedCoupons": "0"
//         },
//         {
//           "idCustomer": 1007,
//           "name": "Bader Bader",
//           "gender": "Male",
//           "birthday": "1992-04-10T00:00:00.000Z",
//           "age": 27,
//           "createdAt": "2019-05-14T20:52:50.000Z",
//           "email": "baderalfouzan1@gmail.com",
//           "phoneNumber": "966559757254",
//           "numberOfPunches": 1,
//           "visits": 23,
//           "payments": "3046.50",
//           "lastVisit": "2019-06-06T10:01:20.000Z",
//           "birthdate": "1992-04-10T00:00:00.000Z",
//           "usedRewards": "1",
//           "usedCoupons": "0"
//         }]

//         const readfiyUpdateCustomersDocs = (existingCustomers,newCustomers) => {

//             return newCustomers.filter(customer => {
//                 const newCustomer = existingCustomers
//                 .filter(exCustomer => exCustomer.idCustomer == customer.idCustomer);
//                 if(!newCustomer.length) return customer;
//             })
//         }
//         console.log(readfiyUpdateCustomersDocs(existCustomers,newCustomers))

// const loop=(arr) =>{
//   const newArr=[];
//    arr.forEach(element => {
//    element= element*4;
//    newArr.push(element);
// });
// return newArr;
// }
// console.log(loop([5,6,7]));
var arr=[1,2,3]

// const outPut=arr.map(element=>{return element*2})

// console.log(outPut)
// const any=(arr)=>{
//   return arr.map(e=>e*2)
// }
// console.log(any(arr))
var any = arr . reduce ( ( acc , nextVal ) => {

return acc + nextVal

} , 50 )

console.log( any )  
// const array1 = [1, 4, 9, 16];

// // pass a function to map
// const map1 = array1.map(x => x * 2);

// console.log(map1);
// // expected output: Ar

app.listen(3000);

