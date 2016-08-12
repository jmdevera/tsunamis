var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var w = 960 - margin.left - margin.right;
    var h = 500 - margin.top - margin.bottom;

var dataset; //to hold full dataset
d3.csv("stocks.csv", function(error, stocks) {
  //read in the data
  if (error) return console.warn(error);
     stocks.forEach(function(d) {
        d.price = +d.price;
        d.tValue = +d.tValue;
        d.vol = +d.vol;
     });
   dataset=stocks;
   drawVis(dataset);
});


var col = d3.scale.category10();


var colLightness = d3.scale.linear()
	.domain([0, 1200])
	.range(["#FFFFFF", "#000000"])

var svg = d3.select("body").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear()
        .domain([0, 1000])
        .range([0, w]);

var y = d3.scale.linear()
        .domain([0, 1000])
        .range([h, 0]);

function drawVis(data) {
  var circles = svg.selectAll("circle")
   .data(data)
   .enter()
   .append("circle")
    .attr("cx", function(d) { return x(d.price);  })
    .attr("cy", function(d) { return y(d.tValue);  })
    .attr("r", 4)
    .style("stroke", "black")
     //.style("fill", function(d) { return colLightness(d.vol); })
     .style("fill", function(d) { return col(d.type); })
    .style("opacity", 0.5)
}


var xAxis = d3.svg.axis()
    .ticks(4)
    .scale(x);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
     .append("text")
      .attr("x", w)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Price");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
   .attr("class", "axis")
   .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("True Value");
	  
// checkbox stuff below
var button = 
  
d3.selectAll(".filter_button").on("change", function() {
  var type = this.value, 
  // I *think* "inline" is the default.
  display = this.checked ? "inline" : "none";

  svg.selectAll(".circle")
    .filter(function(d) { return d.properties.type === type; })
    .attr("display", display);
)};




