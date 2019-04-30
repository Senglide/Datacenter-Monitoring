var getAverage = false,
    racks = [1, 2, 3],
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
    ]);