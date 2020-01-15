# D3.js assignment: US choropleth map

## Introduction
A data visualisation of US choropleth map is implemented by d3.js as well as the original example from [Observable](https://observablehq.com/@d3/choropleth). It is developed from this example and is wrapped into an es6 style class. The user could furtherly work on the visualisation with their own dataset replaced.

The aim of this project is to wrap it into a reusable component so as to make it easy for users to use it with their own dataset. It provides a class for users to create instances from it and modify its properties by calling a number of set/get functions provided.

It requires a dataset (a csv file) that contains the statistical values measured by different regions (states or counties). Also, these regions should be indexed by the US [FIPS](https://www.nrcs.usda.gov/wps/portal/nrcs/detail/national/home/?cid=nrcs143_013697) code so as to visualise correctly on the map. An example file structural is as followed

```
id,value
01001,5.1
01003,4.9
01005,8.6
01007,6.2
01009,5.1
```

where the **id** is the FIPS index column and **value** is the data column.

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
npm install # only for the first time
npm run start
```

It will fetch all the necessary dependencies from the internet (may take a while) and start a hot-reload server hosting the webpage on **localhost port 8080** by default.

### For publishing:

Run:

```shell
npm install # only for the first time
npm run build
```

It will export all the files into the **dist** folder. Use could either host the webpage online e.g. using gitpages, or run the project in a web-sever locally. For example, open the terminal in the **dist** folder and run:

```
python -m http.server 8000
```

will host the project on **localhost port 8000**.

