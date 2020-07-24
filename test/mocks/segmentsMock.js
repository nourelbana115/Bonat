module.exports = {
  mockSegmentsStats: (req, res) => {
    res.send({
      "data": {
        "segmentsCount": {
          "everyone": 38,
          "lostCustomers": 22,
          "superFan": 6,
          "birthday": 16,
          "newCustomers": 0
        }
      },
      "errors": [],
      "message": "",
      "isNew": false
    })
  },
  
  mockSegmentsList: (req, res) => {
    res.send({
      "data": {
        "segments": [
          {
            "_id": "5da49398f24ff508756a20d5",
            "segmentType": "everyone",
            "segmentData": {
              "allCustomers": {
                "label": "All Customers",
                "value": 38
              },
              "registeredThisMonth": {
                "label": "Registered This Month",
                "value": 0
              },
              "segmentUserCount": {
                "label": "Segment Users Count",
                "value": 38
              }
            },
            "updatedAt": "2019-11-13T13:59:00.199Z",
            "createdAt": "2019-10-14T15:26:16.779Z"
          },
          {
            "_id": "5da49398f24ff508756a20d6",
            "segmentType": "lostCustomers",
            "segmentData": {
              "zeroActivity": {
                "label": "Zero Activity this month",
                "value": 22
              },
              "onlyOnePunch": {
                "label": "Only 1 Punch for 30 Days",
                "value": 46
              },
              "segmentUserCount": {
                "label": "Segment Users Count",
                "value": 22
              }
            },
            "updatedAt": "2019-11-13T13:59:00.260Z",
            "createdAt": "2019-10-14T15:26:16.779Z"
          },
          {
            "_id": "5da49398f24ff508756a20d7",
            "segmentType": "superFan",
            "segmentData": {
              "mostActive": {
                "label": "Most Active Customers",
                "value": 6
              },
              "totalPunches": {
                "label": "Total Punches",
                "value": 10
              },
              "segmentUserCount": {
                "label": "Segment Users Count",
                "value": 6
              }
            },
            "updatedAt": "2019-11-13T13:59:00.232Z",
            "createdAt": "2019-10-14T15:26:16.779Z"
          },
          {
            "_id": "5da49398f24ff508756a20d8",
            "segmentType": "birthday",
            "segmentData": {
              "mentionedTheirBirthDay": {
                "label": "Mentioned Their Birthday",
                "value": 16
              },
              "birthDayThisMonth": {
                "label": "Birthday This Month",
                "value": 0
              },
              "segmentUserCount": {
                "label": "Segment Users Count",
                "value": 16
              }
            },
            "updatedAt": "2019-11-13T13:59:00.257Z",
            "createdAt": "2019-10-14T15:26:16.781Z"
          },
          {
            "_id": "5da49398f24ff508756a20d4",
            "segmentType": "newCustomers",
            "segmentData": {
              "createdThisMonth": {
                "label": "Registered This Month",
                "value": 0
              },
              "createdLastMonth": {
                "label": "Registered Previous Month",
                "value": 0
              },
              "segmentUserCount": {
                "label": "Segment Users Count",
                "value": 0
              }
            },
            "updatedAt": "2019-11-13T13:59:00.288Z",
            "createdAt": "2019-10-14T15:26:16.778Z"
          }
        ]
      },
      "errors": [],
      "message": "",
      "isNew": false
    })
  },
  
  mockSegmentsCustomers: (req, res) => {
    res.send({
      "data": {
        "customers": [
          {
            "_id": "5da50bc413f625232601259a",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1001",
            "customerData": {
              "idCustomer": 1001,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-05-10T16:53:38.000Z",
              "email": null,
              "phoneNumber": "966559922217",
              "numberOfPunches": 1,
              "visits": 134,
              "payments": "1052000.00",
              "lastVisit": "2019-05-28T19:03:15.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.254Z"
          },
          {
            "_id": "5da50bc413f625232601259b",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1002",
            "customerData": {
              "idCustomer": 1002,
              "name": "Mahmoud j. Sabbah",
              "gender": "Male",
              "birthday": "2000-01-06T00:00:00.000Z",
              "age": 19,
              "createdAt": "2019-05-14T12:51:36.000Z",
              "email": "mahmouds639@gmail.com",
              "phoneNumber": "966588888888",
              "numberOfPunches": 5,
              "visits": 114,
              "payments": "2280439.00",
              "lastVisit": "2019-09-08T10:11:04.000Z",
              "birthdate": "2000-01-06T00:00:00.000Z",
              "usedRewards": "14",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.254Z"
          },
          {
            "_id": "5da50bc413f625232601259c",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1006",
            "customerData": {
              "idCustomer": 1006,
              "name": "Bader Bader",
              "gender": "Male",
              "birthday": "1992-04-10T00:00:00.000Z",
              "age": 27,
              "createdAt": "2019-05-14T20:52:50.000Z",
              "email": "baderalfouzan1@gmail.com",
              "phoneNumber": "966559757254",
              "numberOfPunches": 1,
              "visits": 23,
              "payments": "3046.50",
              "lastVisit": "2019-10-06T10:01:20.000Z",
              "birthdate": "1992-04-10T00:00:00.000Z",
              "usedRewards": "1",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.255Z"
          },
          {
            "_id": "5da50bc413f625232601259d",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7"
            ],
            "idCustomer": "1014",
            "customerData": {
              "idCustomer": 1014,
              "name": "Test Varanytsiasaaa",
              "gender": "Female",
              "birthday": "1995-01-15T00:00:00.000Z",
              "age": 24,
              "createdAt": "2019-03-14T18:31:36.000Z",
              "email": "atalhassan212aa@gmail.comssssa",
              "phoneNumber": "966559922106",
              "numberOfPunches": 0,
              "visits": 91,
              "payments": "22201.00",
              "lastVisit": "2019-10-08T03:34:41.000Z",
              "birthdate": "1995-01-15T00:00:00.000Z",
              "usedRewards": "5",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.255Z",
            "createdAt": "2019-10-14T23:59:00.255Z"
          },
          {
            "_id": "5da50bc413f625232601259e",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1029",
            "customerData": {
              "idCustomer": 1029,
              "name": "Mahmoud12313 Sabbah123",
              "gender": "Female",
              "birthday": "1987-04-01T00:00:00.000Z",
              "age": 32,
              "createdAt": "2019-04-23T12:15:32.000Z",
              "email": "n@n.com",
              "phoneNumber": "966533334535",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "10000.00",
              "lastVisit": "2019-05-26T11:07:06.000Z",
              "birthdate": "1987-04-01T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.255Z"
          },
          {
            "_id": "5da50bc413f625232601259f",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1078",
            "customerData": {
              "idCustomer": 1078,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-05-12T11:51:44.000Z",
              "email": null,
              "phoneNumber": "966594564564",
              "numberOfPunches": 0,
              "visits": 2,
              "payments": "0.00",
              "lastVisit": "2019-05-12T12:33:24.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.255Z"
          },
          {
            "_id": "5da50bc413f62523260125a0",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1095",
            "customerData": {
              "idCustomer": 1095,
              "name": "yfgffh",
              "gender": null,
              "birthday": "2019-04-23T00:00:00.000Z",
              "age": 0,
              "createdAt": "2019-04-23T13:46:44.000Z",
              "email": "dydg@tt.com",
              "phoneNumber": "966598878555",
              "numberOfPunches": 2,
              "visits": 9,
              "payments": "3031.50",
              "lastVisit": "2019-09-18T20:09:09.000Z",
              "birthdate": "2019-04-23T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.255Z"
          },
          {
            "_id": "5da50bc413f62523260125a1",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1109",
            "customerData": {
              "idCustomer": 1109,
              "name": "Basim Hammad",
              "gender": "Female",
              "birthday": "2012-01-26T00:00:00.000Z",
              "age": 7,
              "createdAt": "2019-05-29T11:37:26.000Z",
              "email": "bbyyhh123@gmail.com",
              "phoneNumber": "966512312312",
              "numberOfPunches": 0,
              "visits": 20,
              "payments": "106810.50",
              "lastVisit": "2019-09-11T10:54:49.000Z",
              "birthdate": "2012-01-26T00:00:00.000Z",
              "usedRewards": "1",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.256Z"
          },
          {
            "_id": "5da50bc413f62523260125a2",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1147",
            "customerData": {
              "idCustomer": 1147,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-04-27T14:09:15.000Z",
              "email": null,
              "phoneNumber": "966555555555",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "5555.00",
              "lastVisit": "2019-07-09T17:33:18.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.256Z"
          },
          {
            "_id": "5da50bc413f62523260125a3",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1170",
            "customerData": {
              "idCustomer": 1170,
              "name": "Mahmoud Sabbah",
              "gender": "Male",
              "birthday": "2010-02-15T00:00:00.000Z",
              "age": 9,
              "createdAt": "2019-04-22T11:05:29.000Z",
              "email": "x@x.com",
              "phoneNumber": "966511111111",
              "numberOfPunches": 2,
              "visits": 9,
              "payments": "60532.00",
              "lastVisit": "2019-07-07T14:18:56.000Z",
              "birthdate": "2010-02-15T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.256Z"
          },
          {
            "_id": "5da50bc413f62523260125a4",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d4",
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1192",
            "customerData": {
              "idCustomer": 1192,
              "name": "Ibrahem Amer",
              "gender": "Male",
              "birthday": "1995-07-14T00:00:00.000Z",
              "age": 24,
              "createdAt": "2019-06-20T09:39:13.000Z",
              "email": "ibrahem3amer@gmail.com",
              "phoneNumber": "966512345678",
              "numberOfPunches": 0,
              "visits": 3,
              "payments": "1050.00",
              "lastVisit": "2019-06-30T00:47:38.000Z",
              "birthdate": "1995-07-14T00:00:00.000Z",
              "usedRewards": "1",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.256Z"
          },
          {
            "_id": "5da50bc413f62523260125a5",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d8",
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1224",
            "customerData": {
              "idCustomer": 1224,
              "name": "Abdullah sdfg",
              "gender": "Female",
              "birthday": "2002-10-20T00:00:00.000Z",
              "age": 16,
              "createdAt": "2019-04-24T11:15:56.000Z",
              "email": "v@v.com",
              "phoneNumber": "966599999999",
              "numberOfPunches": 1,
              "visits": 1,
              "payments": "22.00",
              "lastVisit": "2019-05-30T19:29:56.000Z",
              "birthdate": "2002-10-20T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.256Z"
          },
          {
            "_id": "5da50bc413f62523260125a6",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1236",
            "customerData": {
              "idCustomer": 1236,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-05-12T12:46:19.000Z",
              "email": null,
              "phoneNumber": "966578448848",
              "numberOfPunches": 6,
              "visits": 4,
              "payments": "243411.00",
              "lastVisit": "2019-05-12T12:51:13.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125a7",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1244",
            "customerData": {
              "idCustomer": 1244,
              "name": "Saud Binsaeed",
              "gender": null,
              "birthday": "1987-03-20T00:00:00.000Z",
              "age": 32,
              "createdAt": "2019-05-14T21:04:20.000Z",
              "email": "binsaeeds2@gmail.com",
              "phoneNumber": "966509689999",
              "numberOfPunches": 1,
              "visits": 45,
              "payments": "33804.00",
              "lastVisit": "2019-07-14T18:01:50.000Z",
              "birthdate": "1987-03-20T00:00:00.000Z",
              "usedRewards": "6",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125a8",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1251",
            "customerData": {
              "idCustomer": 1251,
              "name": "Abdullah Alhassan",
              "gender": "Male",
              "birthday": "2019-05-31T00:00:00.000Z",
              "age": 0,
              "createdAt": "2019-07-27T17:42:19.000Z",
              "email": "bonat@gmail.com",
              "phoneNumber": "96655992210612",
              "numberOfPunches": 1,
              "visits": 91,
              "payments": "194511.00",
              "lastVisit": "2019-07-15T22:13:56.000Z",
              "birthdate": "2019-05-31T00:00:00.000Z",
              "usedRewards": "1",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125a9",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d7"
            ],
            "idCustomer": "1273",
            "customerData": {
              "idCustomer": 1273,
              "name": "Basim",
              "gender": null,
              "birthday": "2019-06-10T00:00:00.000Z",
              "age": 0,
              "createdAt": "2019-05-23T14:12:34.000Z",
              "email": "bbb@a.com",
              "phoneNumber": "966522222222",
              "numberOfPunches": 2,
              "visits": 398,
              "payments": "3188282.37",
              "lastVisit": "2019-09-30T08:07:50.000Z",
              "birthdate": "2019-06-10T00:00:00.000Z",
              "usedRewards": "7",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.255Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125aa",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1279",
            "customerData": {
              "idCustomer": 1279,
              "name": "Saud Binsaeed",
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-07-15T20:54:06.000Z",
              "email": "binsaeeds@gmail.com",
              "phoneNumber": "966559922109",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "55.00",
              "lastVisit": "2019-07-14T17:54:29.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125ab",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1280",
            "customerData": {
              "idCustomer": 1280,
              "name": "Test testa",
              "gender": "Male",
              "birthday": "2018-01-26T00:00:00.000Z",
              "age": 1,
              "createdAt": "2019-05-30T18:38:13.000Z",
              "email": "test@hot.dem",
              "phoneNumber": "966596885555",
              "numberOfPunches": 1,
              "visits": 1,
              "payments": "25.00",
              "lastVisit": "2019-05-30T18:44:55.000Z",
              "birthdate": "2018-01-26T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.257Z"
          },
          {
            "_id": "5da50bc413f62523260125ac",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1281",
            "customerData": {
              "idCustomer": 1281,
              "name": "Binsig",
              "gender": "Female",
              "birthday": "1980-05-30T00:00:00.000Z",
              "age": 39,
              "createdAt": "2019-05-30T18:53:13.000Z",
              "email": "bin@bins.com",
              "phoneNumber": "966542233333",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "150.00",
              "lastVisit": "2019-05-30T18:53:31.000Z",
              "birthdate": "1980-05-30T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125ad",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1283",
            "customerData": {
              "idCustomer": 1283,
              "name": "saud",
              "gender": null,
              "birthday": "1993-06-02T00:00:00.000Z",
              "age": 26,
              "createdAt": "2019-05-30T19:32:32.000Z",
              "email": "test@hto.vom",
              "phoneNumber": "966508688888",
              "numberOfPunches": 5,
              "visits": 7,
              "payments": "1676.00",
              "lastVisit": "2019-06-02T20:55:20.000Z",
              "birthdate": "1993-06-02T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125ae",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1284",
            "customerData": {
              "idCustomer": 1284,
              "name": "susushbe",
              "gender": "Male",
              "birthday": "1977-05-31T00:00:00.000Z",
              "age": 42,
              "createdAt": "2019-05-31T15:09:51.000Z",
              "email": "test@test.com",
              "phoneNumber": "966512341235",
              "numberOfPunches": 2,
              "visits": 3,
              "payments": "1022.00",
              "lastVisit": "2019-06-02T20:49:45.000Z",
              "birthdate": "1977-05-31T00:00:00.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125af",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1293",
            "customerData": {
              "idCustomer": 1293,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-06-12T08:32:00.000Z",
              "email": null,
              "phoneNumber": "966559922100",
              "numberOfPunches": 0,
              "visits": 3,
              "payments": "365.00",
              "lastVisit": "2019-06-14T07:33:29.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125b0",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1302",
            "customerData": {
              "idCustomer": 1302,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-07-05T14:10:04.000Z",
              "email": null,
              "phoneNumber": "966052222222",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "29.00",
              "lastVisit": "2019-09-24T09:37:07.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125b1",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1316",
            "customerData": {
              "idCustomer": 1316,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-07-17T18:35:38.000Z",
              "email": null,
              "phoneNumber": "966559979257",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "25.00",
              "lastVisit": "2019-07-17T18:35:40.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.258Z"
          },
          {
            "_id": "5da50bc413f62523260125b2",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1350",
            "customerData": {
              "idCustomer": 1350,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-08-27T08:09:46.000Z",
              "email": null,
              "phoneNumber": "966505281560",
              "numberOfPunches": 1,
              "visits": 1,
              "payments": "29.00",
              "lastVisit": "2019-08-27T08:09:47.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b3",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1374",
            "customerData": {
              "idCustomer": 1374,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-11T10:15:27.000Z",
              "email": null,
              "phoneNumber": "966546666774",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "50.00",
              "lastVisit": "2019-09-11T10:15:28.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b4",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5",
              "5da49398f24ff508756a20d6"
            ],
            "idCustomer": "1375",
            "customerData": {
              "idCustomer": 1375,
              "name": "علي",
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-11T10:42:03.000Z",
              "email": "oo@oo.com",
              "phoneNumber": "966541414141",
              "numberOfPunches": 2,
              "visits": 4,
              "payments": "4000.00",
              "lastVisit": "2019-09-11T11:47:13.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.285Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b5",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1377",
            "customerData": {
              "idCustomer": 1377,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-17T14:54:50.000Z",
              "email": null,
              "phoneNumber": "966592136673",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "123.00",
              "lastVisit": "2019-09-17T14:54:52.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b6",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1378",
            "customerData": {
              "idCustomer": 1378,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-17T14:56:20.000Z",
              "email": null,
              "phoneNumber": "96613",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "2132.00",
              "lastVisit": "2019-09-17T14:56:22.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b7",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1379",
            "customerData": {
              "idCustomer": 1379,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-17T14:57:37.000Z",
              "email": null,
              "phoneNumber": "966059123123",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "123.00",
              "lastVisit": "2019-09-17T14:57:38.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b8",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1380",
            "customerData": {
              "idCustomer": 1380,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-17T15:05:18.000Z",
              "email": null,
              "phoneNumber": "96612",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "6565.00",
              "lastVisit": "2019-09-17T15:05:19.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.259Z"
          },
          {
            "_id": "5da50bc413f62523260125b9",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1381",
            "customerData": {
              "idCustomer": 1381,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-17T15:08:27.000Z",
              "email": null,
              "phoneNumber": "9668",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "8987.00",
              "lastVisit": "2019-09-17T15:08:28.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5da50bc413f62523260125ba",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1386",
            "customerData": {
              "idCustomer": 1386,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-23T12:55:00.000Z",
              "email": null,
              "phoneNumber": "966522221452",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "149.00",
              "lastVisit": "2019-09-23T12:55:02.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5da50bc413f62523260125bb",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1387",
            "customerData": {
              "idCustomer": 1387,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-24T05:44:38.000Z",
              "email": null,
              "phoneNumber": "96666",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "366.00",
              "lastVisit": "2019-09-24T05:44:38.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5da50bc413f62523260125bc",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1388",
            "customerData": {
              "idCustomer": 1388,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-24T06:14:16.000Z",
              "email": null,
              "phoneNumber": "966888",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "525.89",
              "lastVisit": "2019-09-24T06:14:17.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5da50bc413f62523260125bd",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1389",
            "customerData": {
              "idCustomer": 1389,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-24T06:14:40.000Z",
              "email": null,
              "phoneNumber": "9660000",
              "numberOfPunches": 3,
              "visits": 1,
              "payments": "52.00",
              "lastVisit": "2019-09-24T06:14:41.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5da50bc413f62523260125be",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1390",
            "customerData": {
              "idCustomer": 1390,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-09-24T09:04:27.000Z",
              "email": null,
              "phoneNumber": "966552222222",
              "numberOfPunches": 2,
              "visits": 1,
              "payments": "22.00",
              "lastVisit": "2019-09-24T09:04:27.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-14T23:59:00.260Z"
          },
          {
            "_id": "5db4ddc45435360f2f4def91",
            "merchant": "5cec31ac8f81e2460ec742ac",
            "segments": [
              "5da49398f24ff508756a20d4",
              "5da49398f24ff508756a20d5"
            ],
            "idCustomer": "1416",
            "customerData": {
              "idCustomer": 1416,
              "name": null,
              "gender": null,
              "birthday": null,
              "age": null,
              "createdAt": "2019-10-26T13:23:41.000Z",
              "email": null,
              "phoneNumber": "966554402848",
              "numberOfPunches": 0,
              "visits": 1,
              "payments": "12.00",
              "lastVisit": "2019-10-26T16:23:42.000Z",
              "usedRewards": "0",
              "usedCoupons": "0"
            },
            "updatedAt": "2019-11-13T13:59:00.211Z",
            "createdAt": "2019-10-26T23:59:00.385Z"
          }
        ]
      },
      "errors": [],
      "message": "Segment Customers",
      "isNew": false
    })
  },
  mockSegmentsChart: (req, res) => {
    res.send({
      "data": {
        "segmentsStats": [
          {
            "type": "everyone",
            "label": "Everyone",
            "percentage": 100,
            "amount": 38,
            "decrease": 0,
            "increase": 2
          },
          {
            "type": "lostCustomers",
            "label": "Lost Customers",
            "percentage": 57,
            "amount": 22,
            "decrease": 0,
            "increase": 15
          },
          {
            "type": "superFan",
            "label": "Super Fan",
            "percentage": 15,
            "amount": 6,
            "decrease": 0,
            "increase": 0
          },
          {
            "type": "birthday",
            "label": "Birthday",
            "percentage": 2,
            "amount": 1,
            "decrease": 0,
            "increase": 0
          },
          {
            "type": "newCustomers",
            "label": "New Customers",
            "percentage": 5,
            "amount": 2,
            "decrease": 0,
            "increase": 100
          }
        ]
      },
      "errors": [],
      "message": "",
      "isNew": false
    })
  }
}