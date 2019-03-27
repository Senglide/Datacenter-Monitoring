# Script used for testing because the mqtt broker doesn't throw python errors and exceptions

import json

from reading_class import Reading
from db_writer import write_reading

myobj = {
    "readings": [
        {"rack": 1, "sensor": 1, "sensor_type": "temp", "sensor_value": 25},
        {"rack": 1, "sensor": 1, "sensor_type": "hum", "sensor_value": 70},
        {"rack": 1, "sensor": 2, "sensor_type": "temp", "sensor_value": 23},
        {"rack": 1, "sensor": 2, "sensor_type": "hum", "sensor_value": 80}
    ]
}

str_myobj = str(myobj)
str_myobj = str_myobj.replace("'", '"')
json_myobj = json.loads(str_myobj)

for reading in myobj['readings']:
    new_reading = Reading(
        reading['rack'],
        reading['sensor'],
        reading['sensor_type'],
        reading['sensor_value']
    )
    new_writeable_reading = new_reading.make_writeable()
    write_reading(new_writeable_reading, 'dashboard_rack_' + str(reading['rack']))

# new_reading = Reading(1, 1, 'temp', 25)
# writeable_reading = new_reading.make_writeable()
# print('what is going on')
# print(writeable_reading)