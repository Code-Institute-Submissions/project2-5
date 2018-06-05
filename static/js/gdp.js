queue()
    .defer(d3.csv, "data/gdp20t.csv")
    .await(makeGraphs);
//region dollar rank country
function makeGraphs(error, gdpData) {
    var ndx = crossfilter(gdpData);
    gdpData.forEach(function(d){
        d.dollarthou = parseInt(d.dollarthou);
    })
    showSelector(ndx);
    showGdpPc(ndx);
    showAverageGdpPc(ndx);
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
function showGdpPc(ndx) {
    var dim = ndx.dimension(dc.pluck("region"));
    var group = dim.group();
    
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
        .yAxis().ticks(10);
        
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
             return d.value.average;
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Average per Capita Income")
        .yAxis().ticks(5);
    
}

