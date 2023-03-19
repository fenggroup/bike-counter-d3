// set chart dimensions and margins
const width = 800, 
      height = 400,
      margin = {top: 20, right: 50, bottom: 100, left: 60};

// set default variables to what is loaded in

var direction = "both";
var timeSelection = "daily";
var fileName = "./data/counter-data-resampled/counter-data-1day.csv";
var weatherFileName = "weather-noaa-annarbor.csv";

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
                .range([0, innerWidth])

const yScale = d3.scaleLinear()
                .range([innerHeight, 0]);

// parse the time
const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
const parseDate = d3.timeParse("%Y-%m-%d");

// convert a time back to a string
const formatDate = d3.timeFormat("%Y-%m-%d");

function updateChart(){

  d3.selectAll("rect, .x-axis, .y-axis, .axis-label").remove();  // clear previous chart

/*
// for doing weather

Promise.all([
  d3.csv(fileName),
  d3.csv(weatherFileName)
  ]).then(function(data) {
    if (fileName == "./data/counter-data-resampled/counter-data-1day.csv") {
      var directionType = "northsouth";
    }

    var counterData = data[0];
    var weatherData = data[1];

    weatherData.forEach(function(e) {
      e.parsedDateTimeWeather = 
    }

    // format the data
    counterData.forEach(function(d) {
      d.parsedDateTime = parseTime(d.date); // adjusts time reading for for 1hour/30min/15min csv
      d.in = +d.in;
      d.out = +d.out;
      d.total = d.in + d.out;
      d.precipitation = weatherData.find(function(e) {
        return e.PRCP;
      })
    });
  */

// get the data
  d3.csv(fileName).then(function(data) {
    if (fileName == "./data/counter-data-resampled/counter-data-1day.csv") {
      var directionType = "northsouth";
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
    timeSelection == "30mins" || timeSelection == "15mins") {
      data = data.filter(function(d) {
        return parseDate(start_date) <= d.parsedDateTime
      });
      data = data.filter(function(d) {
        return d.parsedDateTime <= d3.timeDay.offset(parseDate(end_date), 1)
      });
      xScale.domain(d3.extent(data, d=>d.parsedDateTime));
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
    .attr("fill", function(d) {
      if (direction == "both") {
        return "rgb(91, 121, 28)";
      }
      else if (direction == "in") {
        return "rgb(106, 106, 246)";
      }
      else if (direction == "out") {
        return  "rgb(220, 183, 55)";
      }
    })
    .append("title")
    .text(function(d) {
      var tooltipText = "";
      if (timeSelection == "daily" || timeSelection == "hourly" || 
          timeSelection == "15mins" || timeSelection == "30mins") {
        tooltipText += "Date: " + d3.timeFormat("%b %d, %Y (%a)")(d.parsedDateTime) + "\n";
      }
      else if (timeSelection == "weekly") {
        tooltipText += "Week beginning on " + d3.timeFormat("%b %d, %Y (%a)")(d.parsedDateTime) + "\n";
      }
      else if (timeSelection == "monthly") {
        tooltipText += d3.timeFormat("%B %Y")(d.parsedDateTime) + "\n";
      }
      if (timeSelection == "hourly" || timeSelection == "30mins" || timeSelection == "15mins") {
        tooltipText += "Time: " + d3.timeFormat("%I:%M %p")(d.parsedDateTime) + "\n";
      }

      if (direction == "both") {
        tooltipText += "Count: " + d.total;
      }
      else if (direction == "in") {
        tooltipText += "Count: " + d.in;
      }
      else if (direction == "out") {
        tooltipText += "Count: " + d.out;
      }

      if (timeSelection == "daily") {
        if (directionType = "northsouth" && direction == "both") {
          tooltipText +=  "\nNorthbound: " + d.in;
          tooltipText += "\nSouthbound: " + d.out;
        }
        else if (directionType = "eastwest" && direction == "both") {
          tooltipText +=  "\nEastbound: " + d.in;
          tooltipText += "\nWestbound: " + d.out;
        }
        tooltipText += "\nTemperature (F): ";
        tooltipText += "\nPrecipitation: ";
      }

      return tooltipText;
    });

      // add y axis
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
  // add x label
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

updateChart();

// is called when a button is clicked
d3.selectAll("input")
  .on("click", function() {

    var view = d3.select(this).node().value;

    switch (view) {
      case "in":
        direction = "in";
        updateChart();
        break;
      
      case "out":
        direction = "out";
        updateChart();
        break;
      
      case "both":
        direction = "both";
        updateChart();
        break;
      
      case "monthly":
        fileName = "./data/counter-data-resampled/counter-data-1month.csv";
        timeSelection = "monthly";
        updateChart();
        break;

      case "weekly":
        fileName = "./data/counter-data-resampled/counter-data-1week.csv";
        timeSelection = "weekly";
        updateChart();
        break;

      case "daily":
        fileName = "./data/counter-data-resampled/counter-data-1day.csv";
        timeSelection = "daily";
        updateChart();
        break;

      case "hourly":
        fileName = "./data/counter-data-resampled/counter-data-1hour.csv";
        timeSelection = "hourly";
        updateChart();
        break;

      case "30min":
        fileName = "./data/counter-data-resampled/counter-data-30min.csv";
        timeSelection = "30min";
        updateChart();
        break;

      case "15min":
        fileName = "./data/counter-data-resampled/counter-data-15min.csv";
        timeSelection = "15min";
        updateChart();
        break;
    }
});