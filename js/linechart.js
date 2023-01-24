// set chart dimensions and margins
const width = 800, 
      height = 400, 
      margin = {top: 20, right: 50, bottom: 100, left: 60};

const innerWidth = width - margin.left - margin.right, 
      innerHeight = height - margin.top - margin.bottom;
      

// append the svg to the chart
// append a 'group' element to svg
// move the 'group' element to the top left margin
const svg = d3.select("#chart")
              .append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set the x & y scales
const xScale = d3.scaleTime()
                .range([0, innerWidth]);

const yScale = d3.scaleLinear()
                .range([innerHeight, 0]);

// parse the time
const parseTime = d3.timeParse("%Y-%m-%d %H:%M");

const parseDate = d3.timeParse("%Y-%m-%d");

function updateChart(){

  d3.selectAll(".line, .x-axis, .y-axis, .axis-label").remove();  // clear previous chart

// get the data
d3.csv("./data/counter-data-annarbor-2022.csv").then(function(data) {
  
    // format the data
    data.forEach(function(d) {
        d.parsedDateTime = parseTime(d.date);
        d.in = +d.in;
        d.out = +d.out;
        d.total = d.in + d.out;
      });

      console.log(start_date)
      data = data.filter(function(d) {
        return parseDate(start_date) <= d.parsedDateTime
      })

      data = data.filter(function(d) {
        return d.parsedDateTime <= d3.timeDay.offset(parseDate(end_date), 1)
      })
   
    // specify the (input) domains
    xScale.domain(d3.extent(data, d=>d.parsedDateTime));
    yScale.domain([0, d3.max(data, d=>d.total)]);

    // define the line
    let line = d3.line()
                 .x(d=>xScale(d.parsedDateTime))
                 .y(d=>yScale(d.total));

    // Add the line
    path = svg.append("path")
              .datum(data)
                .attr("class", "line")
                .attr("d", line);

// add x axis
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(0," + innerHeight + ")")
  .call(d3.axisBottom(xScale)
  );  

// add y axis
svg.append("g")
  .attr("class", "y-axis")    
  .call(d3.axisLeft(yScale)
  );

})
;

// // add x label
// svg.append("text")
//   .attr("class", "axis-label")
//   .attr("x", innerWidth/2)
//   .attr("y", innerHeight+50)
//   .style("text-anchor", "middle")
//   .text("Date & time");

// add y label
svg.append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("y", -30)    // offset the label position
  .attr("x", -innerHeight/2)
  .style("text-anchor", "middle")
  .text("Count");

}

updateChart();