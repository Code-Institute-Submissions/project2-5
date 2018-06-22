queue()
    .defer(d3.csv, "data/gdp20t.csv")   //region dollarthou dollar rank country
    .defer(d3.csv, "data/historic-gdp.csv") //"Region","year","gdpgrowth"
    .defer(d3.json, "/data/trade.json")			// in JSON-stat format
    .await(makeGraphs);

var parseYear = d3.time.format("%Y").parse;

function makeGraphs(error, gdpData, gdpGrowth, jsonStat) {
    // row 1 charts-----------------
        // chart 1
    var ndx = crossfilter(gdpData);
    gdpData.forEach(function(d){
        d.dollarthou = parseInt(d.dollarthou);
    })
    // row 2 charts
     // chart 1 data---------------------------------------
    var hix = crossfilter(gdpGrowth);
    gdpGrowth.forEach(function(d){
            d.year = parseYear(d.year)
    });
    gdpGrowth.forEach(function(d){
            d.gdpgrowth = parseFloat(d.gdpgrowth)
    });
    // chart 2 data---------------------------------------------     
    // function flatData returns a flat json array from json-stat input
    var flatObj = flatData(error, jsonStat);
    var jix = crossfilter(flatObj);
    for (var i=0; i < flatObj.length; i++) {
            flatObj[i].year = parseYear((flatObj[i].year)) 
    };
    
    showSelector(ndx);
    showGdpPcRegions(ndx);
    showAverageGdpPc(ndx);
    showHistoricGrowth(hix);
    showJstat(jix);
    dc.renderAll();
}
function showSelector(ndx) { 
    var dim = ndx.dimension(dc.pluck('population')); 
    var group = dim.group(); 

    dc.selectMenu("#selector")
        .width(150)
        .dimension(dim) 
        .group(group)
        .title(function (d){
            return 'Population: ' + d.key + "=" + d.value;}); 
}
function showGdpPcRegions(ndx) {
    var dim = ndx.dimension(dc.pluck("region"));
    var group = dim.group();
/*    
    dc.barChart("#gdp") 
        .width(400) 
        .height(300) 
        .margins({top: 10, right: 50, bottom: 30, left: 50}) 
        .dimension(dim) 
        .group(group) 
        .transitionDuration(500) 
        .x(d3.scale.ordinal()) 
        .xUnits(dc.units.ordinal) 
        .elasticY(true) 
        .xAxisLabel("Region")
        .yAxisLabel("No. of countries")
        .yAxis().ticks(5);
*/        
    dc.pieChart('#gdpie')
            .width(250)
            .height(200)
            .radius(90)
            .transitionDuration(1500)
            .dimension(dim)
            .group(group);
}
function showAverageGdpPc(ndx) {
    var dim = ndx.dimension(dc.pluck('region'));
    
    function add_item(p, v) {
        p.count++;
        p.total += v.dollarthou;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if(p.count == 0) {
            p.total = 0;
            p.average = 0;
        } else {
            p.total -= v.dollarthou;
            p.average = p.total / p.count;
        }
        return p;
    }
    
    function initialise() {
        return {count: 0, total: 0, average: 0};
    }

    var averageGdpPc = dim.group().reduce(add_item, remove_item, initialise);
    
    dc.barChart("#average-gdppc")
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(averageGdpPc)
        .valueAccessor(function(d){
             return d.value.average.toFixed(3);
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Average per Capita Income")
        .yAxisLabel("$1000")
        .yAxis().ticks(5);
    
}

function showHistoricGrowth(hix) {
    var ydim = hix.dimension(dc.pluck("year"));
    
    var minYear = ydim.bottom(1)[0].year;
    var maxYear = ydim.top(1)[0].year;
    var irlgrowth = ydim.group().reduceSum(function (d) {
            if (d.Region === 'Ireland') {
                return +d.gdpgrowth;
            } else {
                return 0;
                }
            });
    var eurogrowth = ydim.group().reduceSum(function (d) {
            if (d.Region === 'Euro area') {
                return +d.gdpgrowth;
            } else {
                return 0;
                }
            });
    var oecdgrowth = ydim.group().reduceSum(function (d) {
            if (d.Region === 'OECD members') {
                return +d.gdpgrowth;
            } else {
                return 0;
                }
            });
    
    var compositeChart = dc.compositeChart('#historic-gdp-growth');
        compositeChart
            .width(400)
            .height(300)
            .dimension(ydim)
            .xAxisLabel("Annual growth")
            .yAxisLabel("gdp-%")
            .x(d3.time.scale().domain([minYear, maxYear]))
            .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('green')
                    .group(irlgrowth, 'Ireland'),
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(eurogrowth, 'Euro area'),
                dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(oecdgrowth, 'OECD')
            ])
            .brushOn(false);
           
}
function showJstat(jix) {
    var ydim = jix.dimension(dc.pluck("year"));
    
    var minYear = ydim.bottom(1)[0].year;
    var maxYear = ydim.top(1)[0].year;
    var imports = ydim.group().reduceSum(function (d) {
            if (d.trade === 'TSA01C1') {
                return +d.result;
            } else {
                return 0;
                }
            });
     var exports = ydim.group().reduceSum(function (d) {
            if (d.trade === 'TSA01C2') {
                return +d.result;
            } else {
                return 0;
                }
            });
     var balance = ydim.group().reduceSum(function (d) {
            if (d.trade === 'TSA01C3') {
                return +d.result;
            } else {
                return 0;
                }
            });
    
    var compositeChart = dc.compositeChart('#trade-balance');
        compositeChart
            .width(400)
            .height(300)
            .dimension(ydim)
            .yAxisLabel("$bln")
            .x(d3.time.scale().domain([minYear, maxYear]))
            .legend(dc.legend().x(60).y(20).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('green')
                    .group(imports, 'Imports'),
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(exports, 'Exports'),
               dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(balance, 'Balance of Trade')            
            ])
            .brushOn(false); 
}
function flatData( error, obj ) {
	return main( error, obj);
		function main( error, obj ){
			//Validate jsonstat
			var jsonstat=JSONstat( obj );
			if( !jsonstat ){
				return;
			}
			var jsonArr = [];  //stores each query result as objects
			// do queries by year
			for(var i=1975; i<2016; i++) {
				var query1={						//"id":["State","Year","Statistic"]
					"State" : "-",
					"Year" : i.toString(),
					"Statistic" : "TSA01C1"
				};
				var query2={						
					"State" : "-",
					"Year" : i.toString(),
					"Statistic" : "TSA01C2"
				};
				var query3={					
					"State" : "-",
					"Year" : i.toString(),
					"Statistic" : "TSA01C3"
				};
				//Parse: Get value from jsonstat and query
				var value1=getValue( jsonstat , query1 );
				var value2=getValue( jsonstat , query2 );
				var value3=getValue( jsonstat , query3 );
			//	create Array of objects using query and value;
				jsonArr.push(buildJObject( query1, value1 ));
				jsonArr.push(buildJObject( query2, value2 ));
				jsonArr.push(buildJObject( query3, value3 ));
			}
		//	jsonArr.forEach(showObs);  //  write obs to console
			
			return jsonArr;
		}

		//getValue() converts a dimension/category object into a data value in three steps.
		//Input example: {"concept":"UNR","area":"US","year":"2010"}
		//Output example: 9.627692959
		function getValue( jsonstat , query ){

			//1. {"concept":"UNR","area":"US","year":"2010"} ==> [0, 33, 7]
			var indices=getDimIndices( jsonstat , query );
			//2. [0, 33, 7] ==> 403
			var index=getValueIndex( jsonstat , indices );
			//3. 403 ==> 9.627692959
			return jsonstat.value[index];
		}

		//getDimIndices() converts a dimension/category object into an array of dimensions' indices.
		//Input example: {"concept":"UNR","area":"US","year":"2010"}
		//Output example: [0, 33, 7]
		function getDimIndices( jsonstat , query ){
			var 
				dim=jsonstat.dimension,
				ids=jsonstat.id || dim.id
			; //JSON-stat 2.0-ready

			for( var arr=[], i=0, len=ids.length; i<len ; i++ ){
				arr[i]=getDimIndex( dim , ids[i] , query[ids[i]] );
			}
			return arr;
		}

		//getValueIndex() converts an array of dimensions' indices into a numeric value index.
		//Input example: [0, 33, 7]
		//Output example: 403
		function getValueIndex( jsonstat , indices ){
			var size=jsonstat.size || jsonstat.dimension.size; //JSON-stat 2.0-ready

			for( var i=0, ndims=size.length, num=0, mult=1; i<ndims; i++ ){
				mult*=( i>0 ) ? size[ndims-i] : 1;
				num+=mult*indices[ndims-i-1];
			}
			return num;
		}

		//getDimIndex() converts a dimension ID string and a category ID string into the numeric index of that category in that dimension.
		//Input example: "area", "US"
		//Output example: 33
		function getDimIndex( dim , name , value ){
			//In single category dimensions, "index" is optional
			if( !dim[name].category.index ){
				return 0;
			}

			var ndx=dim[name].category.index;

			//"index" can be an object or an array
			if( Object.prototype.toString.call(ndx) !== "[object Array]" ){ //Object
				return ndx[value];
			}else{ //Array
				return ndx.indexOf( value ); //Polyfill required in old browsers
			}
		}

		//Validate
		function JSONstat( jsonstat ){
			if( !jsonstat ){
				window.alert( "Error: no response could be retrieved." );
				return NULL;
			}

			//If no "class", "bundle" response:
			//use the first dataset available
			//(assuming single dataset bundle response)
			//[Of course, it'd be better to add an argument
			//to the function to pass a dataset ID if
			//bundle responses must be properly supported.]
			if( !jsonstat.class ){
				jsonstat=jsonstat[Object.keys( jsonstat )[0]]; //Polyfill required in old browsers
			}else{ //Verify it's a "dataset" response
				if( jsonstat.class!=="dataset" ){
					window.alert( "Error: response was not a JSON-stat bundle or dataset response." );
					return NULL;
				}
			}
			//Program requires "value" and "dimension" properties
			if( !jsonstat.value || !jsonstat.dimension ){
				window.alert( "Error: response is not valid JSON-stat or does not contain required information." );
				return NULL;
			}
			return jsonstat;
		}

		function showObs(item, index){
			console.log(item);
		}
		
		function buildJObject( query, result ){
		    var jObj = {};
			jObj.year = query["Year"];
			jObj.trade = query["Statistic"];
			jObj.result = result/1000000;
			
			return jObj;
		}
}