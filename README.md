# Data Dashboard
- Row 1; Regionalized gdp per capita data with country population size selection
- Row 2; Historic trade and gdp growth for Ireland vs related economic groups

## UX
 
The Dashboard provides a different perspective than the usual league table format.
It selects countries by small, medium and large populations to see what effect
population size might have on economic performance. 
Data is regionalised to show continental average.
Ireland's historic economic performance is then shown in this context.

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

- [d3] (https://d3js.org/) 
    - Used indirectly through dc
- [crossfilter] (http://square.github.io/crossfilter/)
    - Crossfilter handles data for dc
- [dc] (https://cdnjs.com/libraries/dc)
    - Draws the graphs
- [queue] (https://cdnjs.com/libraries/queue-async). Loads data for dc.
    - Does asynchronous task of data loading and passes result to its await function
- [Bootstrap] (http://getbootstrap.com/docs/3.3/)
    - The styling framework  
- [JSON-stat] ( https://json-stat.org/tools/js)
    - JSON-stat format is used by many national and international bodies for data dissemination
    - This project demonstrates how to access and chart this more complex data format.

## Testing

- Site tested with google inspect for different screen sizes.
- Also tested on IE and Opera browsers.
- Tested on a Sony Xperia mobile using Firefox.

## Deployment

- Site is deployed on GitHub pages; https://saor48.github.io/project2/
- Repository; https://github.com/saor48/project2

## Credits

### Content

- GDP per capita data from Wikipedia. Population and region data manually added to this.
    - https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(PPP)_per_capita
- Trade data for Ireland from Central Statistics Office 
    - cso.ie
- GDP growth rates from OECD
    - oecd.org
