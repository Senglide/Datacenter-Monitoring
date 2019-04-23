# Model class for a sensor reading

# Class Reading
class Reading(object):

    # Constructor with rack, sensor, sensor_type and value
    def __init__(self, rack, sensor, sensor_type, sensor_value, date, time):
        self.rack = rack
        self.sensor = sensor
        self.sensor_type = sensor_type
        self.sensor_value = sensor_value
        self.date = date
        self.time = time

    # Return writeable reading for the database
    def make_writeable(self):
        reading = {
            "rack": self.rack,
            "sensor": self.sensor,
            "sensor_type": self.sensor_type,
            "sensor_value": self.sensor_value,
            "date": self.date,
            "time": self.time
        }
        return reading