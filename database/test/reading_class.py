# Model class for a sensor reading

# Imports
import datetime

# Class Reading
class Reading(object):

    # Constructor with rack, sensor, sensor_type and value
    def __init__(self, rack, sensor, sensor_type, value):
        self.rack = rack
        self.sensor = sensor
        self.sensor_type = sensor_type
        self.value = value
        self.datetime = datetime.datetime.utcnow()

    # Return writeable reading for the database
    def make_writeable(self):
        reading = {
            "rack": self.rack,
            "sensor": self.sensor,
            "sensor_type": self.sensor_type,
            "value:": self.value,
            "datetime": self.datetime
        }
        return reading