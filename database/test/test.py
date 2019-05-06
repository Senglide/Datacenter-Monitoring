#!/bin/bash

# Script used for testing because the mqtt broker doesn't throw python errors and exceptions

# Imports
import json
import threading
import sys
import datetime
import requests
import random

sys.path.insert(0, '/home/mis/datacenter-monitoring/database/code')
from reading_class import Reading
from db_writer import write_reading

class This_Class:
    def __init__(self):
        self.alarm = False
        self.alarm_int = 0

    def write_data(self, myobj):
        str_myobj = str(myobj)
        str_myobj = str_myobj.replace("'", '"')

        # print(str_myobj)

        json_myobj = json.loads(str_myobj)

        # print(json_myobj)
        
        currentDateTime = datetime.datetime.now()
        date = str(currentDateTime.date())
        time = str(currentDateTime.time())

        for reading in myobj['readings']:
            reading = reading.copy()
            new_reading = Reading(
                reading['rack'],
                reading['sensor'],
                reading['sensor_type'],
                reading['sensor_value'],
                date,
                time
            )
            new_writeable_reading = new_reading.make_writeable()
            write_reading(new_writeable_reading, 'dashboard_rack_' + str(reading['rack']))

    def insert_data(self):
        threading.Timer(10.0, self.insert_data).start()
        readings = []
        for x in range(1, 4):
            temp_sensor_value = random.randint(15, 35)
            hum_sensor_value = random.randint(75, 95)
            pow_sensor_value = random.randint(200, 250)
            s1_sensor_value = random.randint(25, 35)
            s2_sensor_value = random.randint(25, 35)
            st_sensor_value = random.randint(50, 70)
            movement_alarm_value = random.getrandbits(1)
            smoke_alarm_value = random.getrandbits(1)

            readings.append({"rack": x, "sensor": 1, "sensor_type": "temp", "sensor_value": temp_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "hum", "sensor_value": hum_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "pduPower", "sensor_value": pow_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "pduStatus1", "sensor_value": s1_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "pduStatus2", "sensor_value": s2_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "pduStatusT", "sensor_value": st_sensor_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "smoke", "sensor_value": movement_alarm_value})
            readings.append({"rack": x, "sensor": 1, "sensor_type": "movement", "sensor_value": smoke_alarm_value})

        myobj = {
            "readings": readings
        }

        # myobj2 = {
        #     "readings": [
        #         {"rack": 1, "sensor": 1, "sensor_type": "temp", "sensor_value": temp_sensor_value},
        #         {"rack": 1, "sensor": 1, "sensor_type": "hum", "sensor_value": hum_sensor_value}
        #     ]
        # }

        # print(myobj)
        # print(myobj2)
        # if(alarm_value != self.alarm):
        #     print('value: ' + str(alarm_value))
        #     session = requests.Session()
        #     session.trust_env = False
        #     r = session.post('http://localhost:8000/dashboard/alarm/' + str(self.alarm_int))
        #     print('b_alarm: ' + str(self.alarm) + ', b_alarm_int: ' + str(self.alarm_int))
        #     self.alarm = not self.alarm
        #     self.alarm_int = 1 - self.alarm_int
        #     print('a_alarm: ' + str(self.alarm) + ', a_alarm_int: ' + str(self.alarm_int))
        self.write_data(myobj)
        # self.write_data(myobj2)

this_class = This_Class()
this_class.insert_data()

# myobj = {
#     "readings": [
#         {"rack": 1, "sensor": 1, "sensor_type": "temp", "sensor_value": 25},
#         {"rack": 1, "sensor": 1, "sensor_type": "hum", "sensor_value": 70},
#         {"rack": 1, "sensor": 2, "sensor_type": "temp", "sensor_value": 23},
#         {"rack": 1, "sensor": 2, "sensor_type": "hum", "sensor_value": 80},
#         {"rack": 2, "sensor": 1, "sensor_type": "temp", "sensor_value": 24},
#         {"rack": 2, "sensor": 1, "sensor_type": "hum", "sensor_value": 72},
#         {"rack": 2, "sensor": 2, "sensor_type": "temp", "sensor_value": 25},
#         {"rack": 2, "sensor": 2, "sensor_type": "hum", "sensor_value": 76},
#         {"rack": 3, "sensor": 1, "sensor_type": "temp", "sensor_value": 26},
#         {"rack": 3, "sensor": 1, "sensor_type": "hum", "sensor_value": 85},
#         {"rack": 3, "sensor": 2, "sensor_type": "temp", "sensor_value": 28},
#         {"rack": 3, "sensor": 2, "sensor_type": "hum", "sensor_value": 82},
#         {"rack": 0, "sensor": 1, "sensor_type": "movement", "sensor_value": 1},
#         {"rack": 0, "sensor": 1, "sensor_type": "smoke", "sensor_value": 0},
#         {"rack": 0, "sensor": 2, "sensor_type": "movement", "sensor_value": 0},
#         {"rack": 0, "sensor": 2, "sensor_type": "smoke", "sensor_value": 1}
#     ]
# }