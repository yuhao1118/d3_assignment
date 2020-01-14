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
    // this.scaleFunction = d3.scaleSequential;
    // this.interpolateColor = d3.interpolateBlues;
    this.params = {
      funcType: 'log',
      color: 'blue',
      upBoundary: undefined,
      lowBoundary: undefined,
      legendStep: 6
    };
    this.funcType = {
      log: d3.scaleSequentialLog,
      seque: d3.scaleSequential,
      pow: d3.scaleSequentialPow,
      sqrt: d3.scaleSequentialSqrt,
      symLog: d3.scaleSequentialSymlog,
      quan: d3.scaleSequentialQuantile
    };
    this.interpolateColor = {
      blue: d3.interpolateBlues,
      orange: d3.interpolateOranges,
      green: d3.interpolateGreens,
      grey: d3.interpolateGreys,
      purple: d3.interpolatePurples,
      red: d3.interpolateReds
    };
  }

  setScaleFunction(funcType) {
    this.params.funcType = funcType;
  }

  setColor(color) {
    this.params.color = color;
  }

  setLegendStep(stepsArray) {
    this.params.legendStep = stepsArray;
  }

  setRange(lowBoundary, upBoundary) {
    this.params.lowBoundary = lowBoundary;
    this.params.upBoundary = upBoundary;
  }

  getRange() {
    return {
      lowBoundary: this.params.lowBoundary,
      upBoundary: this.params.upBoundary
    };
  }

  getLegengStep() {
    return this.params.legendStep;
  }

  getScaleFunction() {
    return this.funcType[this.params.funcType];
  }

  getColor() {
    return this.interpolateColor[this.params.color];
  }

  getColorScale(usCountyMap) {
    const scaleFunction = this.getScaleFunction();
    return scaleFunction(
      [
        this.getRange().lowBoundary(usCountyMap) || 1,
        this.getRange().upBoundary(usCountyMap) || d3.max(usCountyMap)
      ],
      this.getColor()
    );
  }

  getCsv() {
    return d3.csv(this.fileUrl).then(d => {
      return new Map(
        d.map(row => [
          parseInt(row[this.indexColName]),
          parseFloat(row[this.dataColName])
        ])
      );
    });
  }

  getJson() {
    return d3.json(this.mapUrl).then(d => {
      return this.getCsv().then(columnMap => {
        let usCountyMap = d.objects.states.geometries.map(d => {
          console.log(parseInt(d.id || 0) * 1000);

          return columnMap.get(parseInt(d.id || 0) * 1000);
        });
        return {
          us: d,
          columnMap: columnMap,
          usCountyMap: usCountyMap
        };
      });
    });
  }

  execute() {
    this.getJson().then(data => {
      const svg = d3.select('svg').attr('viewBox', [0, 0, 975, 620]);

      const color = this.getColorScale(data.usCountyMap);



      svg
        .append('path')
        .datum(
          topojson.mesh(data.us, data.us.objects.states, (a, b) => a !== b)
        )
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', d3.geoPath());

      svg
        .append('g')
        .attr('id', 'usMap')
        .selectAll('path')
        .data(topojson.feature(data.us, data.us.objects.states).features)
        .join('path')
        .attr('fill', d => {
          return color(data.columnMap.get(parseInt(d.id) * 1000));
        })
        .attr('stroke', '#212121')
        .attr('stroke-width', '1')
        .attr('d', this.path)
        .on('mouseover', (d, i) => {
          d3.select(d3.event.target).style('opacity', '.6');
        })
        .on('mouseout', (d, i) => {
          d3.select(d3.event.target).style('opacity', '1');
        })
        .append('title')
        .text(d => {
          return `${d.properties.name}, ${data.columnMap.get(
            parseInt(d.id) * 1000
          )}`;
        });

      svg
        .select('g')
        .append('g')
        .attr('transform', 'translate(860,400)')
        .call(
          legendColor()
            .title(this.title)
            .titleWidth(80)
            .labelFormat(d3.format('.2s'))
            .cells(this.getLegengStep())
            .scale(color)
        );

      svg.call(
        d3
          .zoom()
          .scaleExtent([0.5, 8])
          .on('zoom', () => {
            svg.selectAll('#usMap').attr('transform', d3.event.transform);
          })
      );

      d3.select('body')
      .append('button')
      .text('reset')
      .on('click', () => {
        svg.selectAll('#usMap').attr('transform', '1');
      });
    });
  }
}

const app = new USChoropleth(
  'Births_2016',
  '/static/PopulationEstimates.csv',
  'FIPS',
  'Births_2016'
);
app.setColor('blue');
app.setScaleFunction('seque');
app.setRange(d3.min, d3.max);
app.setLegendStep(5);
app.execute();
