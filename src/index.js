import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import * as topojson from 'topojson-client';

class USChoropleth {
  /**
   * The main class that visualises the data on an US choropleth map.
   * Instances can be created from this class and properties can be acquired and
   * modified via the set/get functions provided.
   *
   * @constructor
   * @param {string} title - The title of the graph
   * @param {string} fileUrl - The file url of the dataset
   * @param {string} indexColName - The column name of the FIPS code index of the data
   * @param {string} dataColName - The column name of the data by regions
   * @param {string} [mapUrl = /static/counties-albers-10m.json] - The file url of the US map
   */
  constructor (
    title,
    fileUrl,
    indexColName,
    dataColName,
    mapUrl = '/static/counties-albers-10m.json'
  ) {
    this.title = title;
    this.mapUrl = mapUrl;
    this.fileUrl = fileUrl;
    this.indexColName = indexColName;
    this.dataColName = dataColName;
    this.scaleFunction = d3.scaleSequential;
    this.interpolateColor = d3.interpolateRainbow;
    this.legendStep = 6;
    this.statisLevel = 'states';
    this.strokeColor = 'white';
  }

  /**
   * This function sets the title of the graph.
   *
   * @param {string} title title of the graph
   */
  setTitle (title) {
    this.title = title;
  }

  /**
   * This function returns the title of the graph.
   *
   * @returns {string} title of the graph.
   * @memberof USChoropleth
   */
  getTitle () {
    return this.title;
  }

  /**
   * This function sets the file url of the dataset.
   *
   * @param {string} fileUrl url of the dataset.
   */
  setFileUrl (fileUrl) {
    this.fileUrl = fileUrl;
  }

  /**
   * This function returns the url of the current dataset.
   *
   * @returns {string} url of the current dataset.
   * @memberof USChoropleth
   */
  getFileUrl () {
    return this.fileUrl;
  }

  /**
   * This functions defines the index column by passing the
   * column name within the dataset (a csv file). The index column
   * is the column that contains the FIPS codes which are used to index
   * states and counties in America.
   *
   * @param {string} indexColName name of the FIPS code column.
   * @memberof USChoropleth
   */
  setIndexColName (indexColName) {
    this.indexColName = indexColName;
  }

  /**
   * This functions returns the index column. The index column
   * is the column that contains the FIPS codes which are used to index
   * states and counties in America.
   *
   * @returns {string} name of the FIPS code column.
   * @memberof USChoropleth
   */
  getIndexColName () {
    return this.indexColName;
  }

  /**
   * This function defines the data column by passing the
   * the column name within the dataset (a csv file). The data column
   * is the column that contains the statistic data measured by different regions.
   *
   * @param {string} indexColName name of the data column.
   * @memberof USChoropleth
   */
  setDataColName (dataColName) {
    this.dataColName = dataColName;
  }

  /**
   * This function returns the data column. The data column
   * is the column that contains the statistic data measured by different regions.
   *
   * @returns {string} name of the data column.
   * @memberof USChoropleth
   */
  getDataColName () {
    return this.dataColName;
  }

  /**
   * Set the statistic level of map. Two levels are allowed:
   *
   * <br> <br> "states" -- display the data on states level
   * <br> "counties" -- display the data on counties level.
   *
   * @param {string} level  statistic level
   * @memberof USChoropleth
   */
  setStatisLevel (level) {
    this.statisLevel = level;
  }

  /**
   * This function returns an object holds configurations
   * for different statistic level. This function does not
   * need to be accessed by users useless there is a special purpose
   *
   * @returns {object} statistic level configuration object
   * @memberof USChoropleth
   */
  getStatisLevelConfig () {
    const obj = { key: this.statisLevel, func: undefined };
    if (this.statisLevel === 'states') {
      obj.func = d => parseInt(d || 0) * 1000;
    } else if (this.statisLevel === 'counties') {
      obj.func = d => parseInt(d || 0);
    }
    return obj;
  }

  /**
   * This function set a scale function that scales the original data values
   * e.g. takes the square root of each value. Then each value will be mapped to
   * a rgb colour (through a d3 colour interpolate function). It allows a
   * d3 sequential scale function as the parameter. For example:
   * <br><br> d3.scaleSequentialSqrt,
   * <br> d3.scaleSequentialLog.
   *
   * @param {Function} scaleFunction d3 sequential scale function
   * @memberof USChoropleth
   */
  setScaleFunction (scaleFunction) {
    this.scaleFunction = scaleFunction;
  }

  /**
   * This function takes an array that contains statistic data from every
   * region to determine the upper and lower boundary of the scale function.
   * Then it returns the scale function with data range and intepolate
   * colour function defined. This function does not need to be accessed by users
   * useless there is a special purpose
   *
   * @param {Array} usRegionVal
   * @returns {Function} scale function with data range and intepolate
   * colour function defined
   * @memberof USChoropleth
   */
  getScaleFunction (usRegionVal) {
    const scaleFunction = this.scaleFunction;
    return scaleFunction(
      [d3.min(usRegionVal) || 1, d3.max(usRegionVal)],
      this.getColor()
    );
  }

  /**
   * This function set a d3 colour interpolate function which could map
   * a numberical value to a rgb colour. It allows
   * a d3 colour interpolate function to be the input. For example:
   * <br><br> d3.interpolateBlues -- interpolating blue colours
   * <br> d3.interpolateReds -- interpolating red colours.
   *
   * @param {Function} interpolateColor d3 interpolate function
   * @memberof USChoropleth
   */
  setColor (interpolateColor) {
    this.interpolateColor = interpolateColor;
  }

  /**
   * This function returns a d3 colour interpolate function which could map
   * a numberical value to a rgb colour. For example:
   * <br><br> d3.interpolateBlues -- interpolating blue colours
   * <br> d3.interpolateReds -- interpolating red colours.
   *
   * @returns {Function} the d3 colour interpolate function
   * @memberof USChoropleth
   */
  getColor () {
    return this.interpolateColor;
  }

  /**
   * This function set the colour of stroke (the region boundaries on the map).
   *
   * @param {string} strokeColor css colour
   * @memberof USChoropleth
   */
  setStrokeColor (strokeColor) {
    this.strokeColor = strokeColor;
  }

  /**
   * This function returns the colour of the stroke.
   *
   * @returns {string} css colour
   * @memberof USChoropleth
   */
  getStrokeColor () {
    return this.strokeColor;
  }

  /**
   * This function sets the legend step by passing an array containing
   * the numerical values that are going to be displayed in the legend.
   *
   * @param {Array} legendStep a list of legend step values
   * @memberof USChoropleth
   */
  setLegendStep (legendStep) {
    this.legendStep = legendStep;
  }

  /**
   * This function returns the current legend steps array
   *
   * @returns {Array} the current legend step values in an array
   * @memberof USChoropleth
   */
  getLegengStep () {
    return this.legendStep;
  }

  /**
   * This function returns the promise object that contains
   * a js map that maps each row of FIPS index with the corresponing
   * statistic value. This function does not need to be accessed by users
   * useless there is a special purpose
   *
   * @returns {object} the index -> data map within a promise object
   * @memberof USChoropleth
   */
  getCsv () {
    return d3.csv(this.fileUrl).then(csv => {
      console.log(this.getDataColName());
      return new Map(
        csv.map(row => [
          parseInt(row[this.getIndexColName()]),
          parseFloat(row[this.getDataColName()])
        ])
      );
    });
  }

  /**
   * This function returns the promise object that contains
   * geographical data which is used by d3 to render the map.
   * This function does not need to be accessed by users
   * useless there is a special purpose
   *
   * @returns {object} geographical data within a promise object
   * @memberof USChoropleth
   */
  getJson () {
    return d3.json(this.mapUrl).then(json => {
      return this.getCsv().then(column => {
        const statisLevel = this.getStatisLevelConfig();
        const usRegionVal = json.objects[statisLevel.key].geometries.map(
          level => {
            return column.get(statisLevel.func(level.id));
          }
        );
        return {
          us: json,
          column: column,
          usRegionVal: usRegionVal,
          statisLevel: statisLevel
        };
      });
    });
  }

  /**
   * The main function that renders the corresponding visualisation on the webpage.
   * Users should always call this function after modifing the properties
   * properly (via the set methods provided)
   */
  execute () {
    this.getJson().then(data => {
      /** Draw the Title */
      d3.select('#title').text(this.getTitle());

      /** Clean the svg */
      d3.select('#USChoropleth')
        .selectAll('*')
        .remove();

      /** Get the svg selection */
      const svg = d3
        .select('#USChoropleth')
        .attr('width', '75%')
        .attr('viewBox', [0, 0, 975, 620]);

      /** Get the colour interpolate function */
      const colorScale = this.getScaleFunction(data.usRegionVal);

      /** Draw the US map */
      svg
        .append('g')
        .attr('id', 'usMap')
        .selectAll('path')
        .data(
          topojson.feature(data.us, data.us.objects[data.statisLevel.key])
            .features
        )
        .join('path')
        .attr('fill', d =>
          colorScale(data.column.get(data.statisLevel.func(d.id)))
        )
        .attr('stroke', this.getStrokeColor())
        .attr('stroke-width', '0.1')
        .attr('d', d3.geoPath())
        .on('mouseover', () => {
          d3.select(d3.event.target).style('opacity', '.6');
        })
        .on('mouseout', () => {
          d3.select(d3.event.target).style('opacity', '1');
        })
        .append('title')
        .text(d => {
          return `${d.properties.name}, ${data.column.get(
            data.statisLevel.func(d.id)
          )}`;
        });

      /** Draw the legend */
      svg
        .select('g')
        .append('g')
        .attr('transform', 'translate(860,400)')
        .call(
          legendColor()
            .title(this.getTitle())
            .titleWidth(80)
            .labelFormat(d3.format('.2s'))
            .cells(this.getLegengStep())
            .scale(colorScale)
        );

      /** Allow zoom and drag */
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.5, 8])
          .on('zoom', () => {
            svg.select('#usMap').attr('transform', d3.event.transform);
          })
      );
    });
  }
}

/** An example instance created from the class */
var app = new USChoropleth(
  'US birth number by state (2016)',
  '/static/PopulationEstimates.csv',
  'FIPS',
  'Births_2016'
);
app.execute();

/** Belows are serveral interactive elements that shows
 * how the set functions could be used to modify the properties.
 */

/** A drop-down menu allows selecting different colours */
d3.select('#colorDropDown').on('change', () => {
  const color = d3.event.target.value;
  const colorMap = {
    rainbow: d3.interpolateRainbow,
    blue: d3.interpolateBlues,
    orange: d3.interpolateOranges,
    green: d3.interpolateGreens,
    grey: d3.interpolateGreys,
    purple: d3.interpolatePurples,
    red: d3.interpolateReds
  };

  app.setColor(colorMap[color]);
  app.execute();
});

/** A scale function drop-down menu allows selecting different scale functions  */
d3.select('#funcDropDown').on('change', () => {
  const func = d3.event.target.value;
  const funcMap = {
    seque: d3.scaleSequential,
    sqrt: d3.scaleSequentialSqrt,
    log: d3.scaleSequentialLog
  };

  app.setScaleFunction(funcMap[func]);
  app.execute();
});

/** A statistic drop-down menu allows selecting different statistic levels */
d3.select('#statisLevel').on('change', () => {
  app.setStatisLevel(d3.event.target.value);
  app.execute();
});

/** A sumbit button changes the title of the visualisation */
d3.select('#submit').on('click', () => {
  const title = d3.select('#titleVal').node().value;
  app.setTitle(title);
  app.execute();
});

/** toggle between two different datasets
 * Notice that the second dataset does not support
 * state-level visualisation.
 */

 /**
  * Toggle button count.
  */
var clickCount = 0;
d3.select('#toggle').on('click', () => {
  clickCount += 1;
  app =
    clickCount % 2 === 0
      ? new USChoropleth(
          'US birth number by state (2016)',
          '/static/PopulationEstimates.csv',
          'FIPS',
          'Births_2016'
        )
      : new USChoropleth(
          'Unemployment rate by counties',
          './static/unemployment-x.csv',
          'id',
          'rate'
        );

  if (app.getFileUrl() === '/static/PopulationEstimates.csv') {
    app.setStatisLevel('states');
  } else {
    app.setStatisLevel('counties');
  }

  app.setStrokeColor('white');
  app.execute();
});

/** reset the zoom of the svg graph */
d3.select('#reset').on('click', () => {
  const zoom = d3.zoom().on('zoom', () => {
    d3.select('#usMap').attr('transform', d3.event.transform);
  });
  d3.select('#USChoropleth')
    .transition()
    .duration(500)
    .call(zoom.transform, d3.zoomIdentity);
});
