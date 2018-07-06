function flatData(error, obj) {
    //Validate jsonstat
    var jsonstat = JSONstat(obj);
    if (!jsonstat) {
        return;
    }
    var jsonArr = [];                   //stores query results as objects
    // do queries by year
    for (var i = 1975; i < 2016; i++) {
        var query1 = {                   //"id":["State","Year","Statistic"]
            "State": "-",
            "Year": i.toString(),
            "Statistic": "TSA01C1"
        };
        var query2 = {
            "State": "-",
            "Year": i.toString(),
            "Statistic": "TSA01C2"
        };
        var query3 = {
            "State": "-",
            "Year": i.toString(),
            "Statistic": "TSA01C3"
        };
        //Parse: Get value from jsonstat and query
        var value1 = getValue(jsonstat, query1);
        var value2 = getValue(jsonstat, query2);
        var value3 = getValue(jsonstat, query3);
        //	create Array of objects using query and value
        jsonArr.push(buildJObject(query1, value1));
        jsonArr.push(buildJObject(query2, value2));
        jsonArr.push(buildJObject(query3, value3));
    }
    return jsonArr;
}
function buildJObject(query, result) {
    var jObj = {};
    jObj.year = query["Year"];
    jObj.trade = query["Statistic"];
    jObj.result = result / 1000000;

    return jObj;
}

// code below to access JSON-stat values taken from  https://json-stat.org/tools/js------------------------------------
//
//getValue() converts a dimension/category object into a data value in three steps.
//Input example: {"concept":"UNR","area":"US","year":"2010"}
//Output example: 9.627692959
function getValue(jsonstat, query) {

    //1. {"concept":"UNR","area":"US","year":"2010"} ==> [0, 33, 7]
    var indices = getDimIndices(jsonstat, query);
    //2. [0, 33, 7] ==> 403
    var index = getValueIndex(jsonstat, indices);
    //3. 403 ==> 9.627692959
    return jsonstat.value[index];
}

//getDimIndices() converts a dimension/category object into an array of dimensions' indices.
//Input example: {"concept":"UNR","area":"US","year":"2010"}
//Output example: [0, 33, 7]
function getDimIndices(jsonstat, query) {
    var
        dim = jsonstat.dimension,
        ids = jsonstat.id || dim.id; //JSON-stat 2.0-ready

    for (var arr = [], i = 0, len = ids.length; i < len; i++) {
        arr[i] = getDimIndex(dim, ids[i], query[ids[i]]);
    }
    return arr;
}

//getValueIndex() converts an array of dimensions' indices into a numeric value index.
//Input example: [0, 33, 7]
//Output example: 403
function getValueIndex(jsonstat, indices) {
    var size = jsonstat.size || jsonstat.dimension.size; //JSON-stat 2.0-ready

    for (var i = 0, ndims = size.length, num = 0, mult = 1; i < ndims; i++) {
        mult *= (i > 0) ? size[ndims - i] : 1;
        num += mult * indices[ndims - i - 1];
    }
    return num;
}

//getDimIndex() converts a dimension ID string and a category ID string into the numeric index of that category in that dimension.
//Input example: "area", "US"
//Output example: 33
function getDimIndex(dim, name, value) {
    //In single category dimensions, "index" is optional
    if (!dim[name].category.index) {
        return 0;
    }

    var ndx = dim[name].category.index;

    //"index" can be an object or an array
    if (Object.prototype.toString.call(ndx) !== "[object Array]") { //Object
        return ndx[value];
    } else { //Array
        return ndx.indexOf(value); //Polyfill required in old browsers
    }
}

//Validate
function JSONstat(jsonstat) {
    if (!jsonstat) {
        window.alert("Error: no response could be retrieved.");
        return NULL;
    }

    //If no "class", "bundle" response:
    //use the first dataset available
    //(assuming single dataset bundle response)
    //[Of course, it'd be better to add an argument
    //to the function to pass a dataset ID if
    //bundle responses must be properly supported.]
    if (!jsonstat.class) {
        jsonstat = jsonstat[Object.keys(jsonstat)[0]]; //Polyfill required in old browsers
    } else { //Verify it's a "dataset" response
        if (jsonstat.class !== "dataset") {
            window.alert("Error: response was not a JSON-stat bundle or dataset response.");
            return NULL;
        }
    }
    //Program requires "value" and "dimension" properties
    if (!jsonstat.value || !jsonstat.dimension) {
        window.alert("Error: response is not valid JSON-stat or does not contain required information.");
        return NULL;
    }
    return jsonstat;
}
// end of code from  https://json-stat.org/tools/js----------------------------------