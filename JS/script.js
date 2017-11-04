

// Basic Set-up
var dopeUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
var margin = {top: 30, right: 100, bottom: 30, left: 60};
var width = 800 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;
var radius = 5;

// X Set-up
var xScale = d3.scale.linear()
  .range([0, width]);
var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom");

// Y Set-up
var yScale = d3.scale.linear()
  .range([height, 0]);
var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient("left");

var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
  .classed("tooltip", true)

// Asynchronous call to get data and build plot
var doping = d3.json(dopeUrl, function(error, data) {
  if (error) throw error;

  // Build array to hold data
  // x is offset in seconds from best time
  var xTimes = [];
  var xSeconds = [];
  var bestTime = data[0].Seconds;
  data.forEach(function(d){
    var diff = d.Seconds - bestTime;
    xSeconds.push(diff);
    var date = new Date(null);
    date.setSeconds(diff);
    var timeString = date.toISOString().substr(15, 4);
    xTimes.push(date.toISOString().substr(15, 4));
    d.SecOff = diff;
    d.TimeOff = timeString;
  });

  // Add domain info from data to x and y scales
  xScale.domain([d3.max(data, function(d) {
    return d.SecOff;
  })+5, d3.min(data, function(d) {
    return d.SecOff;
  })]);

  yScale.domain([d3.max(data, function(d){
    return d.Place;
  })+1, d3.min(data, function(d){
    return d.Place;
  })]);

  // X-axis
  svg.append('g')
      .classed("axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Seconds Behind Fastest Time");

  // Y-axis
  svg.append("g")
      .classed("axis", true)
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Athlete Rank");

  // Scatter plot
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .classed("dot", true)
      .attr("r", radius)
      .attr("cx", function(d) {
        return xScale(d.SecOff);
      })
      .attr("cy", function(d) {
        return yScale(d.Place);
      })
      .classed("doped", function(d) {
        return (d.Doping.length > 1);
      })
      .classed("clean", function(d) {
        return !(d.Doping.length > 1);
      })
      .on("mouseover", function(d) {
        var dataPoint = "<div class='text-center'><strong>"+ d.Name +": " + d.Nationality +"</strong><br />Year: "+ d.Year + ", Time: " + d.Time +"<br />" + d.Doping + "</div>";
        tooltip.transition()
          .style('opacity', .9)
        tooltip.html(dataPoint)
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        d3.select(this).style('opacity', 0.5)
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .style("opacity", 0);
        d3.select(this).style('opacity', 1);
      })

  svg.selectAll(".label")
      .data(data)
    .enter().append("text")
      .attr("class", "label")
      .attr("x", function(d) {
        return xScale(d.SecOff);
      })
      .attr("y", function(d) {
        return yScale(d.Place);
      })
      .attr("dx", ".71em")
      .attr("dy", ".35em")
      .style("font-weight", "normal")
      .text(function(d) {
        return d.Name;
      });

  // Legend - Doping
  var dopeX = 60;
  var dopeY = 20;

  svg.append("circle")
    .attr("cx", function(d) {
      return xScale(dopeX);
    })
    .attr("cy", function(d) {
      return yScale(dopeY);
    })
    .attr("r", radius)
    .classed({"doped": true, "dot": true});

  svg.append("text")
    .attr("x", function(d) {
      return xScale(dopeX - 3);
    })
    .attr("y", function(d) {
      return yScale(dopeY)+4;
    })
    .attr("text-anchor", "left")
    .attr("font-weight", "normal")
    .text("Riders with doping allegations");

  // Legend - No Doping
  var nodopeX = dopeX;
  var nodopeY = 22;

  svg.append("circle")
    .attr("cx", function(d) {
      return xScale(nodopeX);
    })
    .attr("cy", function(d) {
      return yScale(nodopeY);
    })
    .attr("r", radius)
    .classed({"clean": true, "dot": true});

  svg.append("text")
    .attr("x", function(d) {
      return xScale(nodopeX - 3);
    })
    .attr("y", function(d) {
      return yScale(nodopeY)+4;
    })
    .attr("text-anchor", "left")
    .attr("font-weight", "normal")
    .text("No doping allegations");
});

