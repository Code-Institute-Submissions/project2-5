# Data Dashboard
Various graphs around gdp per capita data and trade data 
for Ireland vs various economic groups

## UX
 
The Dashboard provides a different perspective than the usual league table format.
It selects countries by small, medium and large populations to see what effect
population size might have on economic performance.

## Features  
- The first row shows the average GDP per capita by region using only the
    top 1/3 of world GDP per capita countries.
- The second row shows Ireland's growth from a poor to a rich country.
    A comparison is made with the two major trade groups of which Ireland is a member.

### Existing Features
-  The user can select to see the data for each population size grouping. 

### Features Left to Implement
- With the appropriate data, the other 2/3 of countries could be shown as middle third and lowest third

## Technologies Used

- [d3] (https://d3js.org/) . Used indirectly through dc.
    - D3.js is a JavaScript library for manipulating documents based on data
- [crossfilter] (http://square.github.io/crossfilter/)
    - Crossfilter is a JavaScript library for exploring large multivariate datasets in the browser
- [dc] (https://cdnjs.com/libraries/dc)
    -A multi-dimensional charting library built to work natively with crossfilter and rendered using d3.js
- [queue] (https://cdnjs.com/libraries/queue-async). Loads data for dc.
    -   A queue evaluates asynchronous tasks and  passes the results to the await callback
- [Bootstrap] (http://getbootstrap.com/docs/3.3/)
    A responsive, mobile first styling framework for html, css and javascript. 
- [JSON-stat] ( https://json-stat.org/tools/js)
    - JSON-stat format is used by many national and international bodies for data dissemination


## Testing

Site tested with google inspect for different screen sizes.
Also tested on IE and Opera browsers.
Tested on a Sony Xperia mobile using Firefox.

## Deployment

Site is deployed on GitHub pages; https://saor48.github.io/project2/

## Credits

### Content

- GDP per capita data from Wikipedia. Population and region data manually added to this.
    - https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(PPP)_per_capita
- Trade data for Ireland from Central Statistics Office 
    - cso.ie
- GDP growth rates from OECD
    - oecd.org
