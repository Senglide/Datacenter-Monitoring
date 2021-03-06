# Model class for a sensor reading

# Imports
import datetime

# Class Reading
class Reading(object):

    # Constructor with rack, sensor, sensor_type and value
    def __init__(self, rack, sensor, sensor_type, sensor_value):
        currentDateTime = datetime.datetime.now()
        self.rack = rack
        self.sensor = sensor
        self.sensor_type = sensor_type
        self.sensor_value = sensor_value
        self.datetime = currentDateTime.timestamp()
        self.date = currentDateTime.date()
        self.time = currentDateTime.time()

    # Return writeable reading for the database
    def make_writeable(self):
        reading = {
            "rack": self.rack,
            "sensor": self.sensor,
            "sensor_type": self.sensor_type,
            "sensor_value": self.sensor_value,
            "datetime": self.datetime,
            "date": str(self.date),
            "time": str(self.time)
        }
        return reading