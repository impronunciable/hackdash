
var chartSize = { w: 800, h: 250 };
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var maxYear = minYear = 2013;

var titles = {
  users: 'Users',
  projects: 'Projects',
  dashboards: 'Dashboards',
  collections: 'Collections',
};

var colors = ['95AD7E', '8DC6C4', 'C983A4', 'E24F8B', '3992CA', 'F0DB79'];

window.addEventListener('load', function(){
  
  Chart.defaults.global.responsive = true;
  Chart.defaults.global.tooltipFontFamily = "'Open Sans', sans-serif";
  Chart.defaults.global.tooltipTitleFontFamily = "'Open Sans', sans-serif";

  setMaxYear();

  window.ctn = document.getElementById('page');

  sumByYear();

  for (var chart in titles){
    createLineChart(chart);
  }

});

function setMaxYear(){
  for (var type in window.metrics){
    var data = window.metrics[type].data;

    data.forEach(function(item){
      maxYear = (item.date.year > maxYear ? item.date.year : maxYear);
    });
  }
}

function sumByYear(){

  for (var type in window.metrics){

    var data = window.metrics[type].data;
    var years = [];

    for (var i=minYear; i<=maxYear; i++){
      years.push({
        year: i,
        sum: 0
      });
    }

    years.forEach(function(yearData){

      data.forEach(function(item){
        if (item.date.year === yearData.year){
          yearData.sum += item.count;
        }
      });

    });

    window.metrics[type].years = years;
  }
  
}

function getCounts(type, year){
  var data = window.metrics[type].data;
  var result = [];
  
  for(var i=0;i<12;i++) 
    result.push(0);
  
  data.forEach(function(item){
    if (item.date.year === year){
      result[item.date.month-1] = item.count;
    }
  });

  return result;
}

function createLineChart(type, options){
  var div = document.createElement('div');

  var h2 = document.createElement('h2');
  h2.innerHTML = titles[type];
  div.appendChild(h2);

  var canvas = document.createElement('canvas');

  var size = (options && options.size) || chartSize;
  canvas.width = size.w;
  canvas.height = size.h;
  div.appendChild(canvas);

  ctn.appendChild(div);
  createLine(type, canvas.getContext("2d"), div);
}

function createLine(type, ctx, div){
  var years = window.metrics[type].years;

  function getDataSet(year){
    var idx = year-minYear;
    var total = years[idx] ? years[idx].sum : 0;

    return {
      label: year,
      total: total,
      fillColor: rgba(colors[idx], 0.2),
      strokeColor: rgba(colors[idx], 0.5),
      pointColor: rgba(colors[idx], 1),
      pointHighlightFill: "#fff",
      pointHighlightStroke: rgba(colors[idx], 1),
      data: getCounts(type, year)
    };
  }

  var datasets = [];
  for (var i=minYear;i<=maxYear;i++)
    datasets.push(getDataSet(i));

  var data = {
    labels: months,
    datasets: datasets
  };

  // legend
  var str = '';

  for (var i=0; i<datasets.length; i++) {
    var color = datasets[i].pointColor;

    str += 
    '<li style=\"background-color:' + color + '\">' +
      '<h3>' + datasets[i].label + '</h3>' +
      '<span>' + datasets[i].total + '</span>' +
    '</li>';
  }

  str += '<li>' + window.metrics[type].total + '</li>';

  var lineChart = new Chart(ctx).Line(data);

  var frag = document.createElement('ul');
  frag.innerHTML = str;

  div.appendChild(frag);
}

function rgba(hex, a){
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  function c(idx){ return parseInt(result[idx], 16); }

  if (result){
    return 'rgba(' + c(1) + ',' + c(2) + ',' + c(3) + ',' + a + ')';
  }

  return 'rgb(100,100,100,' + a + ')';
}
