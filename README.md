# D3.js assignment: US choropleth map

## Introduction
A data visualisation of US choropleth map is implemented by d3.js as well as an example from [Observable](https://observablehq.com/@d3/choropleth). It is developed from this example and is wrapped into an es6 style class.

The aim of this project is to wrap the code into a reusable component so as to make it easy for people to use with their own dataset. It provides a class for users to create instances from it and acquire or modify the properties of the instance via several set/get functions provided.

```javascript
var app = new USChoropleth(
  'US birth number by state (2016)',
  '/static/PopulationEstimates.csv',
  'FIPS',
  'Births_2016'
);

app.execute();
```

It requires a dataset (a csv file) that contains the statistical values measured by different regions (states or counties) in America. Also, these regions should be indexed by the US [FIPS](https://www.nrcs.usda.gov/wps/portal/nrcs/detail/national/home/?cid=nrcs143_013697) code so as to display correctly on the map. An example dataset structural is as followed

```
id,value
01001,5.1
01003,4.9
01005,8.6
01007,6.2
01009,5.1
```

where the **id** is the name of the FIPS index column and **value** is the name of the data column.

## Set-up

This project is managed by **webpack**. The project structural is as followed

```
.
├── dist						# the final output folder for publishing
│   └── static
├── out							# the jsdoc output folder
│   ├── fonts
│   ├── scripts
│   │   └── prettify
│   └── styles
├── src							# the source folder that stores all the source codes
└── static						# the static folder that stores all the static files e.g. the dataset
```



### For developing:

Run:

```shell
npm install # for the first time only
npm run start
```

It will fetch all the necessary dependencies from the internet (may take a while) and start a hot-reload server hosting the webpage on **localhost port 8080** by default.

### For publishing:

Run:

```shell
npm install # for the first time only
npm run build
```

It will export all the files including the compressed source codes and statics files into the **dist** folder. 

This project should be run within a web-server to avoid **CORS** problems.

Users could either host the project online such as using gitpages, or run it locally in a web-sever. For example, open the terminal in the **dist** folder and run

```
python -m http.server 8000
```

will run a built-in http server from Python(3) that hosts the project on **localhost port 8000**.



## License

This project is developed from an example on [Observable](https://observablehq.com/@d3/choropleth) (M. Bostock, 2017). This project is open-sourced under the GPLv3 License.

