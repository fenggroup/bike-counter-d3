// set default variables to what is loaded in
const tableFile = "./data/counter-data-resampled/counter-data-1day.csv";


// create the initial table
updateTable();
console.log("test 15");

// get the data
function updateTable() {
    d3.selectAll("table, thead, tbody, tr, td").remove();
    
    d3.csv(tableFile).then(function(data) {
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

    console.log("test 14");
}

function createTable(data) {
    console.log("test 1");

    var totalTraffic = {
        both: d3.sum(data, d => d.both),
        in: d3.sum(data, d => d.in),
        out: d3.sum(data, d => d.out)
    };

    console.log("test 2");

    var averageDailyTraffic = {
        both: totalTraffic.both / data.length,
        in: totalTraffic.in / data.length,
        out: totalTraffic.out / data.length
    };

    console.log("test 3");

    var percentTraffic = {
        both: 100,
        in: (totalTraffic.in / totalTraffic.both) * 100,
        out: (totalTraffic.out / totalTraffic.both) * 100
    };

    console.log("test 4");

    var summaryData = [
        { label: "Both", total: totalTraffic.both, average: averageDailyTraffic.both, percent: percentTraffic.both },
        { label: "In", total: totalTraffic.in, average: averageDailyTraffic.in, percent: percentTraffic.in },
        { label: "Out", total: totalTraffic.out, average: averageDailyTraffic.out, percent: percentTraffic.out }
    ];
    console.log("test 5");

    var tableContainer = d3.select("#table")
    
    console.log("test 6");

    var table = tableContainer.append("table")
        .style("margin-left", "auto")
        .style("margin-right", "auto")
        .style("width", 500 + "px")
        .style("height", 120 + "px")
        .style("border", "1px solid black")
        .style("padding", "5px");

    var thead = table.append("thead");
    var tbody = table.append("tbody");

    console.log("test 7");

    thead.append("tr")
        .selectAll("th")
        .data(["", "Total traffic", "Average daily traffic", "Percent"])
        .enter()
        .append("th")
        .text(d => d);
    console.log("test 8");


    var rows = tbody.selectAll("tr")
        .data(summaryData)
        .enter()
        .append("tr");
    console.log("test 9");

    
    rows.append("td")
        .text(d => d.label);
    console.log("test 10");

    
    rows.append("td")
        .text(d => d.total);
    console.log("test 11");

    rows.append("td")
        .text(d => d.average.toFixed(2));
    console.log("test 12");

    rows.append("td")
        .text(d => d.percent.toFixed(1) + "%");
    console.log("test 13");

}