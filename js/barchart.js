// set chart dimensions and margins
var width = 800, 
    height = 400,
    margin = {top: 20, right: 50, bottom: 100, left: 60};

// set default variables to what is loaded in
var direction = "both";
var timeSelection = "daily";

// change the filepath to alter ann arbor to dearborn
var filePath = "./data/counter-data-resampled/annarbor-2022/"
// var filePath = "./data/counter-data-resampled/dearborn-2022/"
var fileName = filePath + "counter-data-1day.csv";

var weatherFileName = "weather-noaa-annarbor.csv";
//var weatherFileName = "weather-noaa-dearborn.csv";

var directionType;

var innerWidth = width - margin.left - margin.right, 
      innerHeight = height - margin.top - margin.bottom;

// append the svg to the chart
// append a 'group' element to svg
// move the 'group' element to the top left margin
const svg = d3.select("#barchart")
              .append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set the x & y scales
const xScale = d3.scaleTime()
                .range([0, innerWidth])

const yScale = d3.scaleLinear()
                .range([innerHeight, 0]);

// parse the time
const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
const parseDate = d3.timeParse("%Y-%m-%d");

// convert a time back to a string
const formatDate = d3.timeFormat("%Y-%m-%d");

function updateBarChart(){
  d3.selectAll("#barchart rect, .x-axis, .y-axis, .axis-label").remove();  // clear previous chart

  const color = 
    direction === "both" ? "rgb(91, 121, 28)" : 
    direction === "in" ? "rgb(106, 106, 246)" :
     "rgb(220, 183, 55)"; // out

// get the data
  d3.csv(fileName).then(function(data) {
    console.log(fileName);
    if (filePath == "./data/counter-data-resampled/annarbor-2022/") {
      directionType = "annarbor";
    }
    else if (filePath == "./data/counter-data-resampled/dearborn-2022/") {
      directionType = "dearborn";
    }

    // format the data
    data.forEach(function(d) {
      d.parsedDateTime = parseTime(d.date); // adjusts time reading for for 1hour/30min/15min csv
      d.in = +d.in;
      d.out = +d.out;
      d.total = d.in + d.out;
    });

    // uses the default mode of reading in data for these time series
    if (timeSelection == "daily" || timeSelection == "hourly" || 
    timeSelection == "30min" || timeSelection == "15min") {
      data = data.filter(function(d) {
        return parseDate(start_date) <= d.parsedDateTime
      });

      var endDateWithTime = new Date(parseDate(end_date));
      // sets the last bar to be 11:45 pm at the selected day
      endDateWithTime.setHours(23, 45);
    
      data = data.filter(function(d) {
        return d.parsedDateTime <= endDateWithTime;
      });

      // sets the last tic to be the next day at midnight
      xScale.domain([parseDate(start_date), d3.timeDay.offset(parseDate(end_date), 1)]);
    }
    // adjust the domain and manner of reading data for weekly data
    else if (timeSelection == "weekly") {
      // algorithm will not replace start_date to avoid errors if changing date resolution later.
      var new_start = parseDate(start_date);
      // converts day to the following sunday because of how data is formatted in the csv
      new_start.setDate(new_start.getDate() + (7 - new_start.getDay()));
      new_start = formatDate(new_start);
      
      var new_end = parseDate(end_date);
      new_end.setDate(new_end.getDate() + (7 - new_end.getDay()));
      new_end = formatDate(new_end);

      // filter the data with our new start/end dates
      data = data.filter(function(d) {
        return parseDate(new_start) <= d.parsedDateTime
      });
      data = data.filter(function(d) {
        return d.parsedDateTime <= d3.timeDay.offset(parseDate(new_end), 1)
      });

      // set new_start the sunday of the selected week
      new_start = parseDate(new_start);
      new_start.setDate(new_start.getDate() -7);
      // set new_end to the saturday of the selected week
      new_end = parseDate(new_end);
      new_end.setDate(new_end.getDate() - 1);

      xScale.domain([new_start, new_end]);
    }

    else if (timeSelection == "monthly") { // adjust the x-scale for monthly data
      // ensure the new start is the last day of the month to properly read in the csv
      var new_start = parseDate(start_date);
      var last_day = new Date(new_start.getFullYear(), new_start.getMonth() + 1, 0); // last day of selected month
      if (new_start.getDate() != last_day.getDate()) {
        new_start = last_day;
      }
      new_start = formatDate(new_start);

      // ensure the new end is the last day of the month to properly read in the csv
      var new_end = parseDate(end_date);
      last_day = new Date(new_end.getFullYear(), new_end.getMonth() + 1, 0);
      if (new_end.getDate() != last_day.getDate()) {
        new_end = last_day;
      }
      new_end = formatDate(new_end);

      // read in data
      data = data.filter(function(d) {
        return parseDate(new_start) <= d.parsedDateTime
      });
      data = data.filter(function(d) {
        return d.parsedDateTime <= d3.timeDay.offset(parseDate(new_end), 1)
      });

      // set new_start to be the 1st of the month to scale the x-axis tics
      new_start = parseDate(new_start);
      new_start.setDate(1);
      new_end = parseDate(new_end);

      xScale.domain([new_start, new_end]);
    }
    
    if (direction == "both") {
      // set the y scale to total
      yScale.domain([0, d3.max(data, d=>d.total)]);
    }
    else if (direction == "in") {
      // set the y scale to in
      yScale.domain([0, d3.max(data, d=>d.in)]);
    }
    else if (direction == "out") {
      // set the y scale to out
      yScale.domain([0, d3.max(data, d=>d.out)]);
    }

    svg.selectAll("bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) {
          // moves the bars to start at the beginning of the month (this is because of how the csv is structured)
          if (timeSelection == "monthly") {
            return xScale(d3.timeMonth.floor(d.parsedDateTime));
          }
          // moves the bars to start at the sunday prior (this is because of how the csv is structured)
          if (timeSelection == "weekly") {
            var temp = d.parsedDateTime;
            return xScale(temp.setDate(d.parsedDateTime.getDate() - 7));
          }
          else {
            return xScale(d.parsedDateTime);
          }
      })
    .attr("y", function(d) {
      if (direction == "both") {
        return yScale(d.total);
      }
      else if (direction == "in") {
        return yScale(d.in);
      }
      else if (direction == "out") {
        return yScale(d.out);
      }
    })
    .attr("width", ((innerWidth/data.length) - (0.1 * innerWidth / data.length)))
    .attr("height", function(d) {
      if (direction == "both") {
        return innerHeight - yScale(d.total);
      }
      else if (direction == "in") {
        return innerHeight - yScale(d.in);
      }
      else if (direction == "out") {
        return innerHeight - yScale(d.out);
      }
    })
    .attr("fill", color)
    .on("mouseover", function(event, d) {
      // Get the bar width and height
      var barWidth = parseFloat(d3.select(this).attr("width"));

      // Get the bar's x/y values in the SVG
      var barX = parseFloat(d3.select(this).attr("x"));
      var barY = parseFloat(d3.select(this).attr("y"));
    
      // Set the tooltip text
      d3.select("#tooltip")
        .select("#tooltipText")
        .html(tooltipText(d));
    
      // Temporarily show the tooltip to calculate its dimensions
      d3.select("#tooltip").classed("hidden", false);
    
      // Get the tooltip height after setting the text
      var tooltipHeight = d3.select("#tooltip").node().offsetHeight;

      // Calculate the tooltip's x and y position
      var xPosition = barX + barWidth;
      var yPosition = barY - (tooltipHeight / 2);
    
      // Convert the SVG coordinates to screen coordinates
      var svg = d3.select("svg").node();
      var svgRect = svg.getBoundingClientRect();
      var tooltipCoords = {
        x: svgRect.left + xPosition + margin.left + 5,
        y: svgRect.top + yPosition + margin.top
      };
    
      // Update the tooltip position
      d3.select("#tooltip")
        .style("left", tooltipCoords.x + "px")
        .style("top", tooltipCoords.y + "px")
        .style("background-color", color);

      // d3.select("#tooltip::after")
      //   .style("border-color", "transparent rgba(91,121,28,1.000) transparent transparent");

      // Show the tooltip
      d3.select("#tooltip").classed("hidden", false);
    }) 
  .on("mouseout", function() {
      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
     });

      // Add y axis
      svg.append("g")
        .attr("class", "y-axis")    
        .call(d3.axisLeft(yScale)
      );

    if (timeSelection == "monthly") {
      // fixes the x-axis to only show the month/year
      svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat("%B %Y"))
          .tickValues(data.map(d => d3.timeMonth.floor(d.parsedDateTime)))
      );
    }
    else {
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(xScale));
      }
  });
  // Add x label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth/2)
    .attr("y", innerHeight+50)
    .style("text-anchor", "middle")
    .text("Date & time");
  // add y label
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)    // offset the label position
    .attr("x", -innerHeight/2)
    .style("text-anchor", "middle")
    .text("Count");
}

function tooltipText(d) {
  var tooltipText = "";
  if (timeSelection == "daily" || timeSelection == "hourly" || 
      timeSelection == "15min" || timeSelection == "30min") {
    tooltipText += "Date: " + d3.timeFormat("%b %d, %Y (%a)")(d.parsedDateTime) + "<br>";
  }
  else if (timeSelection == "weekly") {
    tooltipText += "Week beginning on " + d3.timeFormat("%b %d, %Y (%a)")(d.parsedDateTime) + "<br>";
  }
  else if (timeSelection == "monthly") {
    tooltipText += d3.timeFormat("%B %Y")(d.parsedDateTime) + "<br>";
  }
  if (timeSelection == "hourly" || timeSelection == "30min" || timeSelection == "15min") {
    tooltipText += "Time: " + d3.timeFormat("%I:%M %p")(d.parsedDateTime) + "<br>";
  }

  if (direction == "both") {
    tooltipText += "Count: " + d.total + "<br>";
  }
  else if (direction == "in") {
    tooltipText += "Count: " + d.in + "<br>";
  }
  else if (direction == "out") {
    tooltipText += "Count: " + d.out + "<br>";
  }

  if (timeSelection == "daily") {
    if (directionType = "northsouth" && direction == "both") {
      tooltipText +=  "Northbound: " + d.in  + "<br>";
      tooltipText += "Southbound: " + d.out + "<br>";
    }
    else if (directionType = "eastwest" && direction == "both") {
      tooltipText +=  "Eastbound: " + d.in + "<br>";
      tooltipText += "Westbound: " + d.out + "<br>";
    }
    tooltipText += "Temperature (F): " + "<br>";
    tooltipText += "Precipitation: ";
  }
  return tooltipText;
}

updateBarChart();