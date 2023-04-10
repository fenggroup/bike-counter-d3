const hourlyFile = filePath + "counter-data-1hour.csv";

// create checkboxes for each day of the week
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const checkboxContainer = d3.select("#checkbox-container");

weekDays.forEach(day => {
  checkboxContainer.append("input")
    .attr("type", "checkbox")
    .attr("id", `checkbox-${day}`)
    .attr("checked", true)
    .on("change", updateBoxPlotHour);
  checkboxContainer.append("label")
    .attr("for", `checkbox-${day}`)
    .text(day);
  checkboxContainer.append("span").text(" ");
});

// group data by hour of the day
function groupDataByHourOfDay(data, start_date, end_date) {
  const groupedData = Array.from({ length: 24 }, (_, i) => ({ hour: i, values: [] }));

  // filter data based on the date range
  const filteredData = data.filter(d => {
    return d.parsedDateTime >= start_date && d.parsedDateTime <= end_date;
  });

  filteredData.forEach(d => {
    const hourIndex = d.parsedDateTime.getHours();
    groupedData[hourIndex].values.push(d);
  });

  return groupedData;
}

// filter data by checked days of the week
function filterDataByCheckedDays(data) {
  return data.filter(d => {
    const dayIndex = d.parsedDateTime.getDay();
    const dayOfWeek = weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
    const checkbox = document.getElementById(`checkbox-${dayOfWeek}`);
    return checkbox.checked;
  });
}

// update the drawBoxplotHourly function to handle hourly data
function drawBoxplotHourly(groupedData) {
  // set up the chart
  const svg = d3.selectAll("#boxplot-hourly")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // x and y scales
  const xScale = d3.scaleBand()
    .range([0, innerWidth])
    .padding(0.5)
    .domain(groupedData.map(d => d.hour));

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
    const x = xScale(group.hour);

    const boxData = group.values.map(d => {
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
  
    // add dots for individual data points
    svg.selectAll(`.dot-${i}`)
      .data(group.values)
      .join("circle")
      .attr("class", `dot-${i}`)
      .attr("cx", x + boxWidth / 2)
      .attr("cy", d => yScale(direction === "both" ? d.total : direction === "in" ? d.in : d.out))
      .attr("r", 3)
      .attr("fill", color)
      .attr("opacity", 0.5);  
  });

  // add axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d => d + ":00");
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (innerHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count");
}

// load data and draw the chart
d3.csv(hourlyFile).then(function (data) {
    data.forEach(function (d) {
        d.parsedDateTime = parseTime(d.date);
        d.in = +d.in;
        d.out = +d.out;
        d.total = d.in + d.out;
      });
  
  const filteredData = filterDataByCheckedDays(data);

  const groupedData = groupDataByHourOfDay(filteredData, parseDate(start_date), parseDate(end_date));
  drawBoxplotHourly(groupedData);
});

// redraw the chart with the updated direction and checked days
function updateBoxPlotHour() {
  d3.selectAll("#boxplot-hourly svg").remove();
  d3.csv(hourlyFile).then(function (data) {
    data.forEach(function (d) {
        d.parsedDateTime = parseTime(d.date);
        d.in = +d.in;
        d.out = +d.out;
        d.total = d.in + d.out;
      });

    const filteredData = filterDataByCheckedDays(data);
    const groupedData = groupDataByHourOfDay(filteredData, parseDate(start_date), parseDate(end_date));
    drawBoxplotHourly(groupedData);
  });
}
