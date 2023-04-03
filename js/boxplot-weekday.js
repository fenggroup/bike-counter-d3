width = 800,
    height = 400,
    margin = { top: 20, right: 50, bottom: 100, left: 60 };

innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

// group data by day of the week
function groupDataByDayOfWeek(data, start_date, end_date) {
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const groupedData = weekDays.map(day => ({ day, values: [] }));

  data.forEach(d => {
    if (d.parsedDateTime >= start_date && d.parsedDateTime <= end_date) {
      const dayIndex = d.parsedDateTime.getDay();
      const dayOfWeek = weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
      groupedData.find(group => group.day === dayOfWeek).values.push(d);
    }
  });

  return groupedData.filter(group => group.values.length > 0);
}

// draw boxplot
function drawBoxplot(groupedData) {
  // Set up the chart
  const svg = d3.select("#boxplot-weekday")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // x and y scales
  const xScale = d3.scaleBand()
    .range([0, innerWidth])
    .padding(0.5)
    .domain(groupedData.map(d => d.day));

  let maxVal;
  if (direction === "in") {
    maxVal = d3.max(groupedData, d => d3.max(d.values, dd => dd.in));
  } else if (direction === "out") {
    maxVal = d3.max(groupedData, d => d3.max(d.values, dd => dd.out));
  } else {
    maxVal = d3.max(groupedData, d => d3.max(d.values, dd => dd.total));
  }

  const yScale = d3.scaleLinear()
    .range([innerHeight, 0])
    .domain([0, maxVal]);

  // draw boxplot
  const boxWidth = xScale.bandwidth();

  groupedData.forEach((group, i) => {
    const x = xScale(group.day);
  
  const boxData = group.values.map(d => {
    console.log(d.total);
    if (direction === "both") return d.total;
    if (direction === "in") return d.in;
    if (direction === "out") return d.out;
  });

  const quartiles = [0.25, 0.5, 0.75].map(q => d3.quantile(boxData.sort(d3.ascending), q));
  const iqr = quartiles[2] - quartiles[0];
  const whiskerMin = Math.max(d3.min(boxData), quartiles[0] - 1.5 * iqr);
  const whiskerMax = Math.min(d3.max(boxData), quartiles[2] + 1.5 * iqr);

  const color = direction === "both" ? "rgb(91, 121, 28)" : direction === "in" ? "rgb(106, 106, 246)" : "rgb(220, 183, 55)";

  svg.append("rect")
    .attr("x", x)
    .attr("y", yScale(quartiles[2]))
    .attr("width", boxWidth)
    .attr("height", yScale(quartiles[0]) - yScale(quartiles[2]))
    .attr("fill", color)
    .attr("opacity", 0.5);

  // draw whiskers
  svg.append("line")
    .attr("x1", x + boxWidth / 2)
    .attr("x2", x + boxWidth / 2)
    .attr("y1", yScale(whiskerMin))
    .attr("y2", yScale(whiskerMax))
    .attr("stroke", color)
    .attr("stroke-width", 1);

  // draw whisker minimum
  const whiskerEndWidth = boxWidth / 2;
  svg.append("line")
    .attr("x1", x + boxWidth / 2 - whiskerEndWidth / 2)
    .attr("x2", x + boxWidth / 2 + whiskerEndWidth / 2)
    .attr("y1", yScale(whiskerMin))
    .attr("y2", yScale(whiskerMin))
    .attr("stroke", color)
    .attr("stroke-width", 1);

  // draw whisker maximum
  svg.append("line")
    .attr("x1", x + boxWidth / 2 - whiskerEndWidth / 2)
    .attr("x2", x + boxWidth / 2 + whiskerEndWidth / 2)
    .attr("y1", yScale(whiskerMax))
    .attr("y2", yScale(whiskerMax))
    .attr("stroke", color)
    .attr("stroke-width", 1);
  
  // draw median line
  svg.append("line")
    .attr("x1", x)
    .attr("x2", x + boxWidth)
    .attr("y1", yScale(quartiles[1]))
    .attr("y2", yScale(quartiles[1]))
    .attr("stroke", color)
    .attr("stroke-width", 1);

  // generate a random class for each boxplot group
  const randomClass = `dot-${Math.random().toString(36).substring(2)}`;

  // add dots for individual data points
  svg.selectAll(`.dot-${i}`)
    .data(group.values)
    .join("circle")
    .attr("class", randomClass)
    .attr("cx", d => x + (Math.random() * boxWidth))
    .attr("cy", d => yScale(direction === "both" ? d.total : direction === "in" ? d.in : d.out))
    .attr("r", 3)
    .attr("fill", color)
    .attr("opacity", 0.5);
});


  // Add axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (innerHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count");
}

// Load data and draw the chart
d3.csv(oneDayFile).then(function (data) {
    data.forEach(function (d) {
      d.parsedDateTime = parseTime(d.date);
      d.in = +d.in;
      d.out = +d.out;
      d.total = d.in + d.out;
    });

    const groupedData = groupDataByDayOfWeek(data, parseDate(start_date), parseDate(end_date));
    drawBoxplot(groupedData);
});

// redraw the chart with the updated direction
function updateBoxPlotWeek() {
  d3.selectAll("#boxplot-weekday svg").remove();
  d3.csv(oneDayFile).then(function (data) {
    data.forEach(function (d) {
        d.parsedDateTime = parseTime(d.date);
        d.in = +d.in;
        d.out = +d.out;
        d.total = d.in + d.out;
      });

      const groupedData = groupDataByDayOfWeek(data, parseDate(start_date), parseDate(end_date));
      drawBoxplot(groupedData);
  });
}

// // update chart when input is changed
// d3.selectAll("input")
//   .on("click", function () {
//     const view = d3.select(this).node().value;

//     switch (view) {
//       case "in":
//         direction = "in";
//         updateBoxPlotWeek();
//         break;

//       case "out":
//         direction = "out";
//         updateBoxPlotWeek();
//         break;

//       case "both":
//         direction = "both";
//         updateBoxPlotWeek();
//         break;
//     }
//   });

// is called when a button is clicked
d3.selectAll("input")
  .on("click", function() {

    var view = d3.select(this).node().value;

    switch (view) {
      case "in":
        direction = "in";
        updateBarChart();
        updateBoxPlotWeek();
        break;
      
      case "out":
        direction = "out";
        updateBoxPlotWeek();
        updateBarChart();
        break;
      
      case "both":
        direction = "both";
        updateBarChart();
        updateBoxPlotWeek();
        break;
      
      case "monthly":
        fileName = filePath + "counter-data-1month.csv";
        timeSelection = "monthly";
        updateBarChart();
        break;

      case "weekly":
        fileName = "counter-data-1week.csv";
        timeSelection = "weekly";
        updateBarChart();
        break;

      case "daily":
        fileName = filePath + "counter-data-1day.csv";
        timeSelection = "daily";
        updateBarChart();
        break;

      case "hourly":
        fileName = filePath + "counter-data-1hour.csv";
        timeSelection = "hourly";
        updateBarChart();
        break;

      case "30min":
        fileName = filePath + "counter-data-30min.csv";
        timeSelection = "30min";
        updateBarChart();
        break;

      case "15min":
        fileName = filePath + "counter-data-15min.csv";
        timeSelection = "15min";
        updateBarChart();
        break;
    }
});