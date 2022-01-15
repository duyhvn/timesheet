var dateCurrent;

$('#datepicker').datepicker({
    todayHighlight: true
});

$(document).ready(function() {
    dateCurrent = firstDateOfWeek(new Date());
    loadProjectNameList(false);

    // admin mode
    if ($("#employee_dropdown").length !== 0) {
        loadEmployeeNameList(false);
    }

    loadWeekSheet(false);

    $('#datepicker').on("changeDate", function() {
        var datePicked = $('#datepicker').datepicker('getDate');
        var firstDate = firstDateOfWeek(datePicked);
        if (dateCurrent != firstDate) {
            dateCurrent = firstDate;
            console.log("Date select: Week sheet starting from " + firstDate);
            loadWeekSheet(true);
        }
    });
});

// ajax call to get employee name list
function loadEmployeeNameList(isAsync) {
    console.log("ajax loading employee name list ...");
    $.ajax({
        url: "/timesheet/admin/timesheet/employee?project=" + $('#project_name').text(),
        async: isAsync,
        type: "GET",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#employee_menu").empty();
            if (response.length == 0) {
                $(location).attr("href", "/timesheet/ajax-error?status=500&exception=no_employee_found");
            }
            for (var i = 0; i < response.length; i++) {
                $("#employee_menu").append("<li><a class='employee_item' href='#'>" + response[i] + "</a></li>");
            }
            $("#employee_name").text(response[0]);
            $(".employee_item").unbind().click(function() {
                $("#employee_name").text($(this).text());
                loadWeekSheet();
            });
        }
    });
}

// ajax call to get project name list
function loadProjectNameList(isAsync) {
    console.log("ajax loading project name list ...");
    $.ajax({
        url: "/timesheet/user/timesheet/project",
        async: isAsync,
        type: "GET",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#project_menu").empty();
            if (response.length == 0) {
                $(location).attr("href", "/timesheet/ajax-error?status=500&exception=no_project_found");
            }
            for (var i = 0; i < response.length; i++) {
                $("#project_menu").append("<li><a class='project_item' href='#'>" + response[i] + "</a></li>");
            }
            $("#project_name").text(response[0]);
            $(".project_item").unbind().click(function() {
                $("#project_name").text($(this).text());
                if ($("#employee_dropdown").length !== 0) {
                    loadEmployeeNameList(false);
                }
                loadWeekSheet();
            });
        }
    });
}

//ajax call to refresh sheet
function loadWeekSheet(isAsync) {
    console.log("ajax loading weeksheet ...");
    var employeeName = "";
    if ($("#employee_dropdown").length !== 0) {
        employeeName = $('#employee_name').text();
    }
    var json = { "employeeName": employeeName, "projectName": $('#project_name').text(),
            "dateString": dateCurrent};
    $.ajax({
        url: "/timesheet/user/timesheet/date",
        async: isAsync,
        data: JSON.stringify(json),
        type: "POST",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $('#sun_date').text(response.sunDate);
            $('#sun_hour').val(response.sunHours);
            $('#mon_date').text(response.monDate);
            $('#mon_hour').val(response.monHours);
            $('#tue_date').text(response.tueDate);
            $('#tue_hour').val(response.tueHours);
            $('#wed_date').text(response.wedDate);
            $('#wed_hour').val(response.wedHours);
            $('#thu_date').text(response.thuDate);
            $('#thu_hour').val(response.thuHours);
            $('#fri_date').text(response.friDate);
            $('#fri_hour').val(response.friHours);
            $('#sat_date').text(response.satDate);
            $('#sat_hour').val(response.satHours);
            $('#total_hour').text(response.totalHours);
            if (response.approved) {
                $("#status").text("Approved");
            }
            else if (response.submitted) {
                $("#status").text("Submitted");
            }
            else {
                $("#status").text("Un-submitted");
            }
            controlInputAndBtn(response.submitted, response.approved);
        },

        error: function(jqXHR, exception) {
            $(location).attr("href", "/timesheet/ajax-error?status=" + jqXHR.status + "&exception=" + exception);
        }
    });
}

function dateToString(date) {
    var year = date.getFullYear();
    var mon = date.getMonth() + 1; // zero-based
    var day = date.getDate();
    return year + "/" + mon + "/" + day;
}

function firstDateOfWeek(date) {
    var dateInt = date.getDay();
    date.setDate(date.getDate() - dateInt);
    return dateToString(date);
}

// ajax call to update weeksheet
function submitWeekSheet() {
    console.log("ajax submitting weeksheet ...");
    var json = {
            "startDate": dateCurrent, "projectName": $('#project_name').text(),
            "sunHours": $('#sun_hour').val(),
            "monHours": $('#mon_hour').val(),
            "tueHours": $('#tue_hour').val(),
            "wedHours": $('#wed_hour').val(),
            "thuHours": $('#thu_hour').val(),
            "friHours": $('#fri_hour').val(),
            "satHours": $('#sat_hour').val()
    };

    $.ajax({
        url: "/timesheet/user/timesheet/submit",
        data: JSON.stringify(json),
        type: "POST",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#ajax_response").removeClass().addClass("alert alert-success");
            $("#ajax_response").text(response.message);
            $("#status").text("Submitted");
            $('#total_hour').text(sumUpHours());
            controlInputAndBtn(true, false);
        }
    });
}

// ajax call to unsubmit weeksheet
function unsubmitWeekSheet() {
    console.log("ajax unsubmitting weeksheet ...");
    var json = { "projectName": $('#project_name').text(), "dateString": dateCurrent};

    $.ajax({
        url: "/timesheet/user/timesheet/unsubmit",
        data: JSON.stringify(json),
        type: "POST",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/json");
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#ajax_response").removeClass().addClass("alert alert-success");
            $("#ajax_response").text(response.message);
            $("#status").text("Un-submitted");
            controlInputAndBtn(false, false);
        }
    });
}

// ajax call to approve weeksheet
function approveWeekSheet() {
    console.log("ajax approve weeksheet ...");
    var employeeName =  $('#employee_name').text();
    var projectName = $('#project_name').text();

    $.ajax({
        url: "/timesheet/admin/timesheet/approve?employeeName=" + employeeName + "&projectName="
            + projectName + "&startDate=" + dateCurrent,
        type: "POST",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#ajax_response").removeClass().addClass("alert alert-success");
            $("#ajax_response").text(response.message);
            $("#status").text("Approved");
            controlInputAndBtn(true, true);
        }
    });
}

// ajax call to disapprove weeksheet
function disapproveWeekSheet() {
    console.log("ajax disapprove weeksheet ...");
    var employeeName =  $('#employee_name').text();
    var projectName = $('#project_name').text();

    $.ajax({
        url: "/timesheet/admin/timesheet/disapprove?employeeName=" + employeeName + "&projectName="
            + projectName + "&startDate=" + dateCurrent,
        type: "POST",

        beforeSend: function(xhrObj) {
            xhrObj.setRequestHeader("Accept", "application/json");
        },

        success: function(response) {
            $("#ajax_response").removeClass().addClass("alert alert-success");
            $("#ajax_response").text(response.message);
            $("#status").text("Submitted");
            controlInputAndBtn(true, false);
        }
    });
}

function sumUpHours() {
    var sum = 0;
    sum += parseInt($('#sun_hour').val());
    sum += parseInt($('#mon_hour').val());
    sum += parseInt($('#tue_hour').val());
    sum += parseInt($('#wed_hour').val());
    sum += parseInt($('#thu_hour').val());
    sum += parseInt($('#fri_hour').val());
    sum += parseInt($('#sat_hour').val());
    return sum;
}

function controlInputAndBtn(submitted, approved) {
    // admin mode
    if ($("#approve_btn").length !== 0) {
        $(".enable-control").prop("disabled", true);
        if (approved) {
            $("#approve_btn").removeClass().addClass("btn btn-block btn-danger");
            $("#approve_btn").text("Disapprove");
            $("#approve_btn").unbind().click(function(event) {
                disapproveWeekSheet();
                event.preventDefault();
            });
        }
        else {
            $("#approve_btn").removeClass().addClass("btn btn-block btn-primary");
            $("#approve_btn").text("Approve");
            if (submitted) {
                $("#approve_btn").unbind().click(function(event) {
                    approveWeekSheet();
                    event.preventDefault();
                });
            }
            else {
                $("#approve_btn").prop("disabled", true);
            }
        }
    }
    if ($("#submit_btn").length !== 0) {
        if (submitted) {
            $(".enable-control").prop("disabled", true);
            $("#submit_btn").removeClass().addClass("btn btn-block btn-danger");
            $("#submit_btn").text("Unsubmit");
            if (!approved) {
                $("#submit_btn").unbind().click(function(event) {
                    unsubmitWeekSheet();
                    event.preventDefault();
                });
            }
            else {
                $("#submit_btn").prop("disabled", true);
            }
        }
        else {
            $(".enable-control").prop("disabled", false);
            $("#submit_btn").removeClass().addClass("btn btn-block btn-primary");
            $("#submit_btn").text("submit");
            $("#submit_btn").unbind().click(function(event) {
                submitWeekSheet();
                event.preventDefault();
            });
        }
    }
}