//trashesCollection collection
var trashesCollection = new Meteor.Collection('trashesCollection');
Meteor.publish("trashesCollection", function () {
    return trashesCollection.find();
});

var rawDataUrl,
    mapQuestUrl;

Meteor.startup(function () {
    HTTP.get(Meteor.absoluteUrl("url.json"), function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            var rawDataUrl = result.data.rawData,
                mapQuestUrl = result.data.mapQuest;
            getCleanData(rawDataUrl, mapQuestUrl);
        }
    });
});

//get geo data of trashes
var getCleanData = function (rawDataUrl, mapQuestUrl) {
    var rawData = HTTP.get(rawDataUrl).data,
        //create cleanData array
        //get amount of data strings
        amountDataStrings = rawData.feed.entry.length,
        //        amountDataStrings = 210,
        i = 210;

    //loop through data
    if (trashesCollection.find().fetch()[0] === undefined) {
        for (i; i < amountDataStrings; i++) {
            var AllTrashData = rawData.feed.entry[i].content.$t,
                SplicedTrashData = AllTrashData.split(','),
                city = "Amsterdam",
                street = SplicedTrashData[3].split(':')[1],
                houseNumber = SplicedTrashData[4].split(':')[1],
                //    var fulness = array[11].split(':')[1];
                url = mapQuestUrl[0] + "\"" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "," + city + "\"" + mapQuestUrl[1];
            var gps = HTTP.get(url).data;

            if (gps !== undefined) {
                if (gps.results[0].locations[0].latLng !== undefined) {
                    var longitude = gps.results[0].locations[0].latLng.lng,
                        latitude = gps.results[0].locations[0].latLng.lat,
                        cleanDataString = {
                            "street": street,
                            "houseNumber": houseNumber,
                            "log": longitude,
                            "lat": latitude
                        };
                    trashesCollection.insert(cleanDataString);
                    console.log(trashesCollection.find().fetch().length);
                }
            }
        }
    }
    //if you want to clean the trashesCollection.
    //         else {
    //            var deletelength = trashesCollection.find().fetch().length;
    //            var deletedata = trashesCollection.find().fetch();
    //            var a = 0
    //
    //            for (0; i < deletelength; i++) {
    //                trashesCollection.remove(deletedata[i]._id)
    //                console.log(trashesCollection.find().fetch().length)
    //            }
    //        }
};

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});