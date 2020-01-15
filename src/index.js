import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import * as topojson from 'topojson-client';

class USChoropleth {
  constructor(
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
    this.interpolateColor = d3.interpolateBlues;
    this.legendStep = 6;
    this.statisLevel = 'states';
    this.strokeColor = '#212121';
  }

  setTitle(title) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  setFileUrl(fileUrl) {
    this.fileUrl = fileUrl;
  }

  getFileUrl() {
    return this.fileUrl;
  }

  setindexColName(indexColName) {
    this.indexColName = indexColName;
  }

  getIndexColName() {
    return this.indexColName;
  }

  setDataColName(dataColName) {
    this.dataColName = dataColName;
  }

  getDataColName() {
    return this.dataColName;
  }

  setStatisLevel(level) {
    this.statisLevel = level;
  }

  getStatisLevel() {
    let obj = { key: this.statisLevel, func: undefined };
    if (this.statisLevel === 'states') {
      obj['func'] = d => parseInt(d || 0) * 1000;
    } else if (this.statisLevel === 'counties') {
      obj['func'] = d => parseInt(d || 0);
    }
    return obj;
  }

  setScaleFunction(scaleFunction) {
    this.scaleFunction = scaleFunction;
  }

  getScaleFunction(usData) {
    const scaleFunction = this.scaleFunction;
    return scaleFunction(
      [d3.min(usData) || 1, d3.max(usData)],
      this.getColor()
    );
  }

  setColor(interpolateColor) {
    this.interpolateColor = interpolateColor;
  }

  getColor() {
    return this.interpolateColor;
  }

  setStrokeColor(strokeColor) {
    this.strokeColor = strokeColor;
  }

  getStrokeColor() {
    return this.strokeColor;
  }

  setLegendStep(legendStep) {
    this.legendStep = legendStep;
  }

  getLegengStep() {
    return this.legendStep;
  }

  getCsv() {
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

  getJson() {
    return d3.json(this.mapUrl).then(json => {
      return this.getCsv().then(column => {
        let statisLevel = this.getStatisLevel();
        let usStateID = json.objects[statisLevel.key].geometries.map(level => {
          return column.get(statisLevel.func(level.id));
        });
        return {
          us: json,
          column: column,
          usStateID: usStateID,
          statisLevel: statisLevel
        };
      });
    });
  }

  execute() {
    this.getJson().then(data => {
      d3.select('#title').text(this.getTitle());
      d3.select('#USChoropleth')
        .selectAll('*')
        .remove();
      const svg = d3
        .select('svg')
        .attr('width', '70%')
        .attr('viewBox', [0, 0, 975, 620]);
      const colorScale = this.getScaleFunction(data.usStateID);

      svg
        .append('path')
        .datum(
          topojson.mesh(data.us, data.us.objects.states, (a, b) => a !== b)
        )
        .attr('fill', 'none')
        .attr('stroke', this.getStrokeColor())
        .attr('stroke-linejoin', 'round')
        .attr('d', d3.geoPath());

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

var app = new USChoropleth(
  'US birth number by state (2016)',
  '/static/PopulationEstimates.csv',
  'FIPS',
  'Births_2016'
);

app.setStrokeColor('white');
app.execute();

d3.select('#colorDropDown').on('change', () => {
  let color = d3.event.target.value;
  let colorMap = {
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

d3.select('#funcDropDown').on('change', () => {
  let func = d3.event.target.value;
  let funcMap = {
    seque: d3.scaleSequential,
    sqrt: d3.scaleSequentialSqrt,
    pow: d3.scaleSequentialPow,
    log: d3.scaleSequentialLog
  };

  app.setScaleFunction(funcMap[func]);
  app.execute();
});

d3.select('#statisLevel').on('change', () => {
  app.setStatisLevel(d3.event.target.value);
  app.execute();
});

d3.select('#submit').on('click', () => {
  let title = d3.select('#titleVal').node().value;
  app.setTitle(title);
  app.execute();
});

var clickCount = 0;
d3.select('#toggle').on('click', () => {
  clickCount += 1;
  app =
    clickCount % 2 == 0
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

  if (app.getFileUrl() == '/static/PopulationEstimates.csv') {
    app.setStatisLevel('states');
  } else {
    app.setStatisLevel('counties');
  }

  app.setStrokeColor('white');
  app.execute();
});

d3.select('#reset').on('click', () => {
  let zoom = d3.zoom().on('zoom', () => {
    d3.select('#usMap').attr('transform', d3.event.transform);
  });
  d3.select('#USChoropleth')
    .transition()
    .duration(500)
    .call(zoom.transform, d3.zoomIdentity);
});
