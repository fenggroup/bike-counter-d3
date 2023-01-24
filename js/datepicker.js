let start_date = "2022-08-26", 
    end_date = "2022-11-19";

$('.input-daterange').datepicker({
    format: 'yyyy-mm-dd',
    startDate: start_date,
    endDate: end_date,
    orientation: 'bottom',
    // autoclose: true,
})
.on("changeDate", function() {

    start_date = document.getElementsByName('start')[0].value;
    end_date = document.getElementsByName('end')[0].value;

    updateChart();

});
