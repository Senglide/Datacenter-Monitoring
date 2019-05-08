// Nav click handler
$('.homeLink').click(function() {
    sessionStorage.setItem('getDetails', 'false');
});

// Previous button click handler
$('#previousButton').click(function() {
    adjustDetailTime(true);
});

// Next button click handler
$('#nextButton').click(function() {
    adjustDetailTime(false);
});

// Set date click handler
$('#datepicker').on('change.datetimepicker', function(e) {
    var inputDate = new Date(e.date);
    var newDate = inputDate.getFullYear() + '-' + ('0' + (inputDate.getMonth() + 1)).slice(-2) + '-' + ('0' + inputDate.getDate()).slice(-2);
    if(newDate !== detailReading.date) {
        detailReading.date = newDate;
        checkToGetReadings();
    }
});

// Set time click handler
$('#timepicker').on('change.datetimepicker', function(e) {
    var inputTime = new Date(e.date);
    var newTime = ('0' + inputTime.getHours()).slice(-2) + ':' + ('0' + inputTime.getMinutes()).slice(-2) + ':' + ('0' + inputTime.getSeconds()).slice(-2);
    if(!detailReading.time || newTime.substring(0, 5) !== detailReading.time.substring(0, 5)) {
        detailReading.time = newTime;
        checkDetailScope();
    }
});

// Set rack click handler
$('#detailRack').on('click', '.detailRackMenu a' , function() {
    if(!detailReading.rack || detailReading.rack !== $(this).text()) {
        detailReading.rack = $(this).text();
        $(this).parent().siblings('button').text('Rack ' + detailReading.rack);
        checkToGetReadings();
    }
});

// Set type click handler
$('#detailType').on('click', '.detailTypeMenu a' , function() {
    if(!detailReading.s_type || detailReading.s_type !== s_types.get($(this).text())) {
        detailReading.s_type = s_types.get($(this).text());
        $(this).parent().siblings('button').text($(this).text());
        checkDetailScope();
    }
});

// Set scope option
$('#scopeSetting').on('click', '#scopeMenu a', function() {
    detailSettings.scope = detailSettingsOptions.get('scope').get($(this).text());
    $('#scopeDropdown').html($(this).text());
});

// Set jump option
$('#jumpSetting').on('click', '#jumpMenu a', function() {
    detailSettings.jump = detailSettingsOptions.get('jump').get($(this).text());
    $('#jumpDropdown').html($(this).text());
});

// Set interval option
$('#intervalSetting').on('click', '#intervalMenu a', function() {
    detailSettings.interval = detailSettingsOptions.get('interval').get($(this).text());
    $('#intervalDropdown').html($(this).text());
});

// Open settings click handler
$('#settingsTrigger').click(function() {
    setBackupSettings();
});

// Save settings click handler
$('#saveSettings button').click(function() {
    if($(this).text() == 'Cancel') {
        detailSettings.scope = backupSettings.scope;
        detailSettings.jump = backupSettings.jump;
        detailSettings.interval = backupSettings.interval;
        detailSettingsOptions.forEach((value, key) => {
            $('#' + key + 'Dropdown').html(detailSettingsOptions.get(key).get(backupSettings[key]));
        })
    } else {
        if(detailsLoaded) {
            generateTimes();
            adjustDetailScope();
        }
    }
    $('#settingsModal').modal('toggle');
});