queue()
    .defer(d3.csv, "data/gdp20t.csv")   //region dollarthou dollar rank country population
    .defer(d3.csv, "data/historic-gdp.csv") //"Region","year","gdpgrowth"
    .defer(d3.json, "data/trade.json")			// in JSON-stat format
    .await(makeGraphs);

var parseYear = d3.time.format("%Y").parse;

function makeGraphs(error, gdpData, gdpGrowth, jsonStat) {
    // row 1 charts-----------------
        // chart 1
    var ndx = crossfilter(gdpData);
    gdpData.forEach(function(d){
        d.dollarthou = parseInt(d.dollarthou, 10);
    });
    // row 2 charts--
     // chart 1 data---------------------------------------
    var hix = crossfilter(gdpGrowth);
    gdpGrowth.forEach(function(d){
            d.year = parseYear(d.year);
    });
    gdpGrowth.forEach(function(d){
            d.gdpgrowth = parseFloat(d.gdpgrowth);
    });
    // chart 2 data---------------------------------------------     
    // function flatData returns a flat json array from json-stat input
    var flatObj = flatData(error, jsonStat);
    var jix = crossfilter(flatObj);
    for (var i=0; i < flatObj.length; i++) {
            flatObj[i].year = parseYear((flatObj[i].year)); 
    }
    
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
            return 'Pop size: ' + d.key + "=" + d.value + " countries";}); 
}
function showGdpPcRegions(ndx) {
    var dim = ndx.dimension(dc.pluck("region"));
    var group = dim.group();
        
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
            .xAxisLabel("External Trade")
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