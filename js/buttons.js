// is called when a button is clicked
d3.selectAll("input")
  .on("click", function() {

    var view = d3.select(this).node().value;

    switch (view) {
              case "monthly":
        fileName = filePath + "counter-data-1month.csv";
        timeSelection = "monthly";
        updateBarChart();
        break;

      case "weekly":
        fileName = filePath + "counter-data-1week.csv";
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

      case "in":
        direction = "in";
        updateBarChart();
        updateBoxPlotWeek();
        updateBoxPlotHour();
        break;
      
      case "out":
        direction = "out";
        updateBoxPlotWeek();
        updateBarChart();
        updateBoxPlotHour();

        break;
      
      case "both":
        direction = "both";
        updateBarChart();
        updateBoxPlotWeek();
        updateBoxPlotHour();

        break;
    }
});