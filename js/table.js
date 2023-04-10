
const oneDayFile = filePath + "counter-data-1day.csv";

// create the initial table
updateTable();
var inDirection;
var outDirection;

// get the data
function updateTable() {
    d3.selectAll("#table table").remove();
    
    d3.csv(oneDayFile).then(function(data) {
        // format the data
        data.forEach(function(d) {
            d.parsedDateTime = parseTime(d.date);
            d.in = +d.in;
            d.out = +d.out;
            d.both = d.in + d.out;
        });
    
        data = data.filter(function(d) {
            return parseDate(start_date) <= d.parsedDateTime;
        });
        data = data.filter(function(d) {
            return d.parsedDateTime <= d3.timeDay.offset(parseDate(end_date), 0);
        });

        createTable(data);
    });
}

function createTable(data) {

    var totalTraffic = {
        both: d3.sum(data, d => d.both),
        in: d3.sum(data, d => d.in),
        out: d3.sum(data, d => d.out)
    };

    var averageDailyTraffic = {
        both: totalTraffic.both / data.length,
        in: totalTraffic.in / data.length,
        out: totalTraffic.out / data.length
    };

    var percentTraffic = {
        both: 100,
        in: (totalTraffic.in / totalTraffic.both) * 100,
        out: (totalTraffic.out / totalTraffic.both) * 100
    };

    let inDirection = "In";
    let outDirection = "Out";
    
    if (directionType == "annarbor") {
        inDirection = "Northbound";
        outDirection = "Southbound";
    }
    else if (directionType == "dearborn") {
        inDirection = "Eastbound";
        outDirection = "Westbound";
    }
    
    var summaryData = [
        { label: "Both Directions", total: totalTraffic.both, average: averageDailyTraffic.both, percent: percentTraffic.both },
        { label: inDirection, total: totalTraffic.in, average: averageDailyTraffic.in, percent: percentTraffic.in },
        { label: outDirection, total: totalTraffic.out, average: averageDailyTraffic.out, percent: percentTraffic.out }
    ];

    var tableContainer = d3.select("#table")
    

    var table = tableContainer.append("table")
        .style("margin-left", "auto")
        .style("margin-right", "auto")
        .style("width", 500 + "px")
        .style("height", 120 + "px")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .attr("class", "table-padding-bottom");

    var thead = table.append("thead");
    var tbody = table.append("tbody");

    thead.append("tr")
        .selectAll("th")
        .data(["", "Total traffic", "Average daily traffic", "Percent"])
        .enter()
        .append("th")
        .text(d => d)
        .style("text-align", "right");

    var rows = tbody.selectAll("tr")
        .data(summaryData)
        .enter()
        .append("tr");

    rows.append("td")
        .text(d => d.label)
        .style("font-weight", "bold");

    rows.append("td")
        .text(d => d3.format(",")(d.total))
        .style("text-align", "right");

    rows.append("td")
        .text(d => d3.format(",.1f")(d.average))
        .style("text-align", "right");

    rows.append("td")
        .text(d => d.percent.toFixed(1) + "%")
        .style("text-align", "right");

}