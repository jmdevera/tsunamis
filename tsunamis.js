







window.onload = function(){
  //checkbox elements for filtering
  var eBox = document.getElementById("eBox");
  var v_box = document.getElementById("vBox");
  var l_box = document.getElementById("lBox");
  eBox.onchange = filterDataBox;
  vBox.onchange = filterDataBox;
  lBox.onchange = filterDataBox;
  var values = [];



  d3.select(window).on("resize", throttle);

  var zoom = d3.behavior.zoom()
      .scaleExtent([1, 20])
      .on("zoom", move);

  var width = document.getElementById('container').offsetWidth;
  var height = document.getElementById('container').offsetHeight;
  console.log(width + "w");
  console.log(height + "h");
  var topo,projection,path,svg,g;
  var graticule = d3.geo.graticule();
  var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
  var dataset;

  var info = d3.select("#options").append("div")
    .attr("class", "info")
    .style("opacity",0);

  setup(width,height);

  function setup(width,height){
    projection = d3.geo.mercator()
      .translate([(width/2), (height/2)])
      .scale( width / 2 / Math.PI);

    path = d3.geo.path().projection(projection);

    svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("click", click)
        .append("g");

    g = svg.append("g");
  }

  d3.json("world-topo-min.json", function(error, world) {

    var countries = topojson.feature(world, world.objects.countries).features;
    topo = countries;
    draw(topo);
  });

  function draw(data) {
    svg.append("path")
       .datum(graticule)
       .attr("class", "graticule")
       .attr("d", path);

    g.append("path")
     .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
     .attr("class", "equator")
     .attr("d", path);

    var country = g.selectAll(".country").data(topo);

    country.enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("id", function(d,i) { return d.id; })
        .attr("title", function(d,i) { return d.properties.name; })
        .style("fill", function(d, i) { return d.properties.color = "#666633"; });

    //offsets for tooltips
    var offsetL = document.getElementById('container').offsetLeft+20;
    var offsetT = document.getElementById('container').offsetTop+10;

    //tooltips
    country
      .on("mousemove", function(d,i) {

        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

        tooltip.classed("hidden", false)
               .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
               .html(d.properties.name);
        })
        .on("mouseout",  function(d,i) {
          tooltip.classed("hidden", true);
        });

    //adding Tsunamis from external CSV file
    d3.csv("tsunamis.csv", function(error, tsunamis) {
      if (error) {
        return console.warn(error);
      }
      tsunamis.forEach(function(i){
        addpoint(i.Longitude, i.Latitude, i.Magnitude, i.Year, i.Deaths, i.Injuries, i.Country, i.Missing, i.Intensity);
      });

    dataset = tsunamis;
    });
  }

  function redraw() {
    width = document.getElementById('container').offsetWidth;
    height= document.getElementById('container').offsetHeight;
    d3.select('svg').remove();
    setup(width,height);
    draw(topo);
  }

  function move() {

    var t = d3.event.translate;
    var s = d3.event.scale;
    zscale = s;
    var h = height/4;

    t[0] = Math.min(
      (width/height)  * (s - 1),
      Math.max( width * (1 - s), t[0] )
    );

    t[1] = Math.min(
      h * (s - 1) + h * s,
      Math.max(height  * (1 - s) - h * s, t[1])
    );

    zoom.translate(t);
    g.attr("transform", "translate(" + t + ")scale(" + s + ")");

    //adjust the country hover stroke width based on zoom level
    d3.selectAll(".country").style("stroke-width", 1.5 / s);
  }

  var throttleTimer;
  function throttle() {
    window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
        redraw();
      }, 200);
  }

  //geo translation on mouse click in map
  function click() {
    var latlon = projection.invert(d3.mouse(this));
    console.log(latlon);
  }

  //function to add points and text to the map (used in plotting Tsunamis)
  function addpoint(Longitude, Latitude, Magnitude, Year, Deaths, Injuries, Country, Missing) {
    var gpoint = g.append("g").attr("class", "gpoint");
    var x = projection([Longitude,Latitude])[0];
    var y = projection([Longitude,Latitude])[1];

    gpoint.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("class","point")
          .attr("r", 3)
          .style("fill", "red")
          .style("opactity",0.5)
          .style("stroke","black")
      .on("mouseover", function() {
        d3.select(this)
          //.attr("fill", "blue")
          .attr("r", 6.5);
      info.transition()
        .duration(400)
        .style("opacity", 1);
      info.html("Year <b>"+Year+"</b><br>Country: "+Country+"<br>Magnitude: "+Magnitude+"<br>Deaths: "+Deaths+"<br>Injuries: "+Injuries+"<br>Missing People: "+Missing);
      })
      .on("mouseout", function() {
        d3.select(this)
        //.attr("fill","blue")
          .attr("r",3);
        info.transition()
          .duration(800)
          .style("fill","red")
      });
  }

  function drawVis(data) {
    var dataremove = [];

    var circles = svg.selectAll("circle")
      .data(dataremove);

    circles.exit().remove();

    data.forEach(function(i){
        addpoint(i.Longitude, i.Latitude, i.Magnitude, i.Year, i.Deaths, i.Injuries, i.Country, i.Missing);
    });
  }

  var attributes = ["Years", "Magnitude"];
  var ranges = [[1950,2014],[0,10]];
  var maxYear = 2014;
  var maxMagnitude = 10;
  var values;
  var mytype ="All";
  var patt = new RegExp("All");

  //filter data and draw vis
  function filterData(attr,values) {
    for (i = 0; i < attributes.length; i++){
        if (attr == attributes[i]){
            ranges[i] = values;
        }
      }
      var res = patt.test(mytype);
      if(res){
        var toVisual = dataset.filter(function(d) {
          return (d["Year"] >= ranges[0][0] && d["Year"] <= ranges[0][1]) && (d["Magnitude"] >=ranges[1][0] && d["Magnitude"] <= ranges[1][1]);
        });
      } else {
        var toVisual = dataset.filter(function(d) {
          return (d["Year"] >= ranges[0][0] && d["Year"] <= ranges[0][1]) && (d["Magnitude"] >= [1][0] && d["Magnitude"] <= ranges[1][1]) && d["Type"]==mytype;
        });
      }
      drawVis(toVisual);
  }

  //function for slider data
  $(function() {
      $("#yr").slider({
          range: true,
          min:  1950,
          max: maxYear,
          values: [1950, maxYear],
          slide: function(event, ui) {
            $("#rngyear").val(ui.values[0] + " - " + ui.values[1]);
            filterData("Years", ui.values);
          }
      });
      $("#rngyear").val($("#yr").slider("values", 0) + " - " + $("#yr").slider("values", 1));
  });

  $(function() {
      $("#magn").slider({
          range: true,
          min: 0,
          max: maxMagnitude,
          values: [0, maxMagnitude],
          slide: function(event, ui) {
              $("#magnitude").val(ui.values[0] + " - " + ui.values[1]);
              filterData("Magnitude", ui.values);
          }
      });
      $("#magnitude").val($("#magn").slider("values", 0) + " - " + $("#magn").slider("values", 1));
  });

  function filterDataBox(){
      values =[];
      d3.selectAll(".filter_button")
              .each(function(d) {
                  if (this.checked) {          //if the checkbox is checked...
                      values.push(this.value);    //Add it to values global array
                  }
              });
      console.log("values: "+ values);
      var toVisual = dataset.filter(function(d) {
          console.log(d);
          if( values.indexOf(d["Cause of Tsunami"]) >= 0 ) {
              return d;
          }})
      drawVis(toVisual);

  }
}
