var express = require('express');
var router = express.Router();

const CSVToJSON = require('csvtojson');

const fs = require('fs');

//make region dataset
CSVToJSON().fromFile('./kaggleDataset/Region.csv')
  .then(bodies => {
    var dataList = new Array();

    for (const body of bodies) {

      let data = new Object();
      // console.log(body.uni);
      data.id = "urn:region:korea:" + body.code;
      data.type = "Region";
      data.createdAt = "2020-05-26T20:10:00,000+09:00";
      data.modifiedAt = "2020-05-26T20:10:00,000+09:00";
      data.address = {
        "type": "Property",
        "value": {
          "addressCountry": "KR",
          "addressRegion": body.province,
          "addressLocality": body.city
        }
      }

      for (const key of Object.keys(body)) {

        if (key == "longitude")
          var lng = body[key]

        if (key == "latitude")
          var lat = body[key]

        data.location = {
          "type": "GeoProperty",
          "value": {
            "type": "Point",
            "coordinates": [
              lng,
              lat
            ]
          }
        }
      }

      dataList.push(data);

    }

    var regionData = JSON.stringify(dataList);
    fs.writeFileSync('./ngsiDataset/region.json', regionData);

  }).catch(err => {
    console.log(err);
  })

//make diseaseTransmission dataset
CSVToJSON().fromFile('./kaggleDataset/Case.csv')
  .then(bodies => {
    var dataList = new Array();

    for (const body of bodies) {

      let data = new Object();
      // console.log(body.uni);
      data.id = "urn:disease:transmission:" + body.case_id;
      data.type = "DiseaseTransmission";
      data.createdAt = "2020-05-26T20:10:00,000+09:00";
      data.modifiedAt = "2020-05-26T20:10:00,000+09:00";

      var typeValue;
      if (body.group == "FALSE" && body.infection_case == "overseas inflow") {
        // console.log(body.uni);
        typeValue = "overseasInflow"
      } else if (body.group == "FALSE" && body.infection_case == "contact with patient") {
        // console.log(body.uni)
        typeValue = "personal"
      } else if (body.group == "FALSE" && body.infection_case == "etc") {
        // console.log(body.uni)
        typeValue = "others"
      } else if (body.group == "TRUE") {
        typeValue = "group"
        data.groupInfectionPlace = {
          "type": "Property",
          "value": body.infection_case,
          "location": {
            "type": "GeoProperty",
            "value": {
              "type": "Point",
              "coordinates": [
                Number(body.longitude),
                Number(body.latitude)
              ]
            }
          }
        }
      }

      data.transmissionType = {
        "type": "Property",
        "value": typeValue
      }

      data.numberOfCases = {
        "type": "Property",
        "value": body.confirmed
      }

      let rawdata = fs.readFileSync('./ngsiDataset/region.json');
      let regions = JSON.parse(rawdata);

      if (body.city == "-") {
        body.city = body.province;
      }

      for (const region of regions) {
        if (region.address.value.addressRegion == body.province && region.address.value.addressLocality == body.city) {
          data.region = {
            "type": "Relationship",
            "object": region.id
          }
          // console.log(region.id);
        }
      }

      dataList.push(data);

    }

    var transData = JSON.stringify(dataList);
    fs.writeFileSync('./ngsiDataset/diseaseTransmission.json', transData);

  }).catch(err => {
    console.log(err);
  })


//make visitedPlace dataset
CSVToJSON().fromFile('./kaggleDataset/PatientRoute.csv')
  .then(bodies => {
    var dataList = new Array();

    filtered = bodies.filter(function (body) {
      var key = ['date', 'province', 'city', 'type', 'latitude', 'longitude'].map(function (k) {
        return body[k];
      }).join('|');
      if (!this[key]) {

        let data = new Object();

        data.id = "urn:visitedPlace:" + body.uni;
        data.type = "VisitedPlace";
        data.createdAt = "2020-05-26T20:10:00,000+09:00";
        data.modifiedAt = "2020-05-26T20:10:00,000+09:00";
        data.placeType = {
          "type": "Property",
          "value": body.type
        }
        data.visitedAt = {
          "type": "Property",
          "value": body.date + "T20:10:00,000+09:00"
        }

        let rawdata = fs.readFileSync('./ngsiDataset/region.json');
        let regions = JSON.parse(rawdata);

        if (body.city == "-") {
          body.city = body.province;
        }

        for (const region of regions) {
          if (region.address.value.addressRegion == body.province && region.address.value.addressLocality == body.city) {
            data.region = {
              "type": "Relationship",
              "object": region.id
            }
          }
        }

        data.location = {
          "type": "GeoProperty",
          "value": {
            "type": "Point",
            "coordinates": [
              Number(body.longitude),
              Number(body.latitude)
            ]
          }
        }

        dataList.push(data);

        return this[key] = true;
      } else {
        // console.log(body)

        // for( const list of dataList) {
        //   if ( list.date == body.date && list.province == body.province && list.city == body.city && list.type == body.type && list.latitude == body.latitude && list.longitude == list.longitude) {

        //   }
        // }

      }
    }, Object.create(null));

    // for (const filter of filtered) {
    //   for (const body of bodies) {
    //     if (filter.uni == body.uni) {
    //       // console.log(filter)
    //     }
    //   }
    // }

    var placeData = JSON.stringify(dataList);
    fs.writeFileSync('./ngsiDataset/visitedPlace.json', placeData);

  }).catch(err => {
    console.log(err);
  })

CSVToJSON().fromFile('./kaggleDataset/Case.csv')
  .then(cases => {
    // console.log(cases);

    fs.writeFileSync('./kaggleDataset/case.json', JSON.stringify(cases));
  }).catch(err => {

  })

CSVToJSON().fromFile('./kaggleDataset/PatientRoute.csv')
  .then(cases => {
    // console.log(cases);

    fs.writeFileSync('./kaggleDataset/route.json', JSON.stringify(cases));
  }).catch(err => {

  })

//make infectionCase dataset
CSVToJSON().fromFile('./kaggleDataset/PatientInfo.csv')
  .then(bodies => {
    var dataList = new Array();

    for (const body of bodies) {

      let data = new Object();
      // console.log(body.uni);
      data.id = "urn:COVID-19:case:" + body.patient_id;
      data.type = "InfectionCase";
      data.createdAt = "2020-05-26T20:10:00,000+09:00";
      data.modifiedAt = "2020-05-26T20:10:00,000+09:00";
      if (body.global_num != "") {
        data.alias = {
          "type": "Property",
          "value": Number(body.global_num)
        };
      }
      if (body.birth_year != "") {
        data.yearOfBirth = {
          "type": "Property",
          "value": Number(body.birth_year)
        };
      }
      if (body.sex != "") {
        data.gender = {
          "type": "Property",
          "value": body.sex
        };
      }
      if (body.age != "") {
        data.ageGroup = {
          "type": "Property",
          "value": body.age
        };
      }
      if (body.city == "") {
        body.city = body.province;
      }

      let rawdata = fs.readFileSync('./ngsiDataset/region.json');
      let regions = JSON.parse(rawdata);

      for (const region of regions) {
        if (region.address.value.addressRegion == body.province && region.address.value.addressLocality == body.city) {
          data.region = {
            "type": "Relationship",
            "object": region.id
          }
        }
      }
      data.diseaseCode = {
        "type": "Relationship",
        "object": "urn:disease:COVID-19"
      };

      let diseaseValue;
      if (body.disease != "") {
        diseaseValue = true;
      } else {
        diseaseValue = false;
      }

      data.hasUnderlyingDisease = {
        "type": "Property",
        "value": diseaseValue
      }
      data.status = {
        "type": "Property",
        "value": body.state
      }
      if (body.symptom_onset_date != "") {
        data.symptomOnset = {
          "type": "Property",
          "value": body.symptom_onset_date + "T20:10:00,000+09:00"
        };
      }
      if (body.confirmed_date != "") {
        data.confirmedAt = {
          "type": "Property",
          "value": body.confirmed_date + "T20:10:00,000+09:00"
        };
      }
      if (body.released_date != "") {
        data.releasedAt = {
          "type": "Property",
          "value": body.released_date + "T20:10:00,000+09:00"
        };
      }
      if (body.infection_order != "") {
        data.infectionOrder = {
          "type": "Property",
          "value": Number(body.infection_order)
        };
      }

      if (body.infected_by != "") {

        var targetId = body.infected_by;

        for (const target of bodies) {
          if (target.patient_id == targetId) {
            data.infectedBy = {
              "type": "Relationship",
              "object": "urn:COVID-19:case:" + target.patient_id
            }
          }
        }
      }

      if (body.infection_case != "") {

        let casedata = fs.readFileSync('./kaggleDataset/case.json');
        let cases = JSON.parse(casedata);

        for (const tran of cases) {
          if (tran.province == body.province && tran.infection_case == body.infection_case) {
            // console.log(tran.case_id + ", " + body.patient_id);
            data.transmissionInfo = {
              "type": "Relationship",
              "object": "urn:disease:transmission:" + tran.case_id
            }
          }
        }

      }

      let routedata = fs.readFileSync('./kaggleDataset/route.json');
      let routes = JSON.parse(routedata);

      var placeList = new Array();

      filtered = routes.filter(function (route) {
        var key = ['date', 'province', 'city', 'type', 'latitude', 'longitude'].map(function (k) {
          return route[k];
        }).join('|');
        if (!this[key]) {

          if (route.patient_id == body.patient_id) {
            // console.log(route);
            let place = new Object();

            place = {
              "type": "Relationship",
              "object": "urn:visitedPlace:" + route.uni
            }

            placeList.push(place);
          }
          data.visitedPlace = placeList;

          return this[key] = true;

        } else {

          // console.log(route.uni);

          var sameList = new Array();
          for (const filter of routes) {
            // console.log(filter)
            if (route.date == filter.date && route.province == filter.province && route.city == filter.city && route.type == filter.type && route.latitude == filter.latitude && route.longitude == filter.longitude && route.uni > filter.uni) {

              sameList.push(filter.uni);
              // console.log(filter);
            }
          }
          // console.log(sameList[0]);

          if (route.patient_id == body.patient_id) {
            // console.log(route);
            let place = new Object();
            // console.log(sameList[0])

            place = {
              "type": "Relationship",
              "object": "urn:visitedPlace:" + sameList[0]
            }

            placeList.push(place);
          }
          data.visitedPlace = placeList;

        }
      }, Object.create(null));

      console.log(data.visitedPlace);

      dataList.push(data);

      // for (const key of Object.keys(body)) {

      // console.log(body[key]); //property value
      // console.log(key); //property
      // }

    }

    var patientData = JSON.stringify(dataList);
    fs.writeFileSync('./ngsiDataset/infectionCase.json', patientData);

  }).catch(err => {
    console.log(err);
  })

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });

});

module.exports = router;
