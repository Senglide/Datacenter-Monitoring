var today = new Date(),
    racks = [1, 4, 6],
    s_types = new Map([
        ['temp', 'Temperature (°C)'],
        ['Temperature (°C)', 'temp'],
        ['hum', 'Humidity (%)'],
        ['Humidity (%)', 'hum'],
        ['pduPower', 'Power consumption (W)'],
        ['Power consumption (W)', 'pduPower'],
        ['pduStatus1', 'Top Amperage (A)'],
        ['Top Amperage (A)', 'pduStatus1'],
        ['pduStatus2', 'Bottom Amperage (A)'],
        ['Bottom Amperage (A)', 'pduStatus2'],
        ['pduStatusT', 'Total Amperage (A)'],
        ['Total Amperage (A)', 'pduStatusT']
    ]),
    alarm_types = ['smoke', 'movement'],
    detailSettingsOptions = new Map([
        ['scope', new Map([
            ['15 Minutes', 900],
            [900, '15 Minutes'],
            ['30 Minutes', 1800],
            [1800, '30 Minutes'],
            ['1 Hour', 3600],
            [3600, '1 Hour'],
            ['2 Hours', 7800],
            [7800, '2 Hours']
        ])],
        ['jump', new Map([
            ['5 Minutes', 300],
            [300, '5 Minutes'],
            ['15 Minutes', 900],
            [900, '15 Minutes'],
            ['30 Minutes', 1800],
            [1800, '30 Minutes'],
            ['1 Hour', 3600],
            [3600, '1 Hour']
        ])],
        ['interval', new Map([
            ['10 Seconds', 10],
            [10, '10 Seconds'],
            ['1 Minute', 60],
            [60, '1 Minute'],
            ['5 Minutes', 300],
            [300, '5 Minutes'],
            ['10 Minutes', 600],
            [600, '10 Minutes']
        ])],
        // ['numberOfTables', new Map([
        //     ['1', 1],
        //     [1, '1'],
        //     ['2', 2],
        //     [2, '2']
        // ])]
    ]),
    dashboardSettingsOptions = new Map([
        ['row', [1, 2, 3]],
        ['refresh', new Map([
            ['10 Seconds', {'time': 10, 'amount': 1}],
            ['5 Minutes', {'time': 300, 'amount': 30}],
        ])],
        ['scope', new Map([
            ['15 Minutes', {'prefix': 'get_newest_readings/', 'suffix': '/90'}],
            ['1 Hour', {'prefix': 'get_newest_readings/', 'suffix': '/360'}],
            ['1 Day', {'prefix': 'get_readings_by_date/', 'suffix': '/' + today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate(),}]
        ])]
    ]),
    visualOptions = new Map([
        ['graphType', ['Linechart', 'Gauge']]
    ]);
    defaultDetailVariables = {
        'time': '12:00:00',
        's_type': 'temp'
    },
    defaultDashboardVariables = {
        'row': s_types.size / 2,
        'refresh': '5 Minutes',
        'scope': '15 Minutes'
    },
    gaugeSettings = new Map([
        ['temp', {'min': 0, 'max': 45}],
        ['hum', {'min': 0, 'max': 100}],
        ['pduPower', {'min': 0, 'max': 245}],
        ['pduStatus1', {'min': 0, 'max': 45}],
        ['pduStatus2', {'min': 0, 'max': 45}],
        ['pduStatusT', {'min': 0, 'max': 90}]
    ]),
    linechartSettings = new Map([
        ['temp', {'delta': 3}],
        ['hum', {'delta': 3}],
        ['pduPower', {'delta': 15}],
        ['pduStatus1', {'delta': 3}],
        ['pduStatus2', {'delta': 3}],
        ['pduStatusT', {'delta': 6}]
    ]),
    colorPickerOptions = {
        valueElement: null,
        width: 300,
        height: 120,
        sliderSize: 20,
        position: 'bottom'
    };