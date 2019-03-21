# Script used for testing because the mqtt broker doesn't throw python errors and exceptions

# import json

# from reading_class import Reading
# from db_writer import write_reading

# myobj = {
#     "readings": [
#         {"type": "temp", "sensor": 1, "value": 25},
#         {"type": "hum", "sensor": 1, "value": 70},
#         {"type": "temp", "sensor": 2, "value": 23},
#         {"type": "hum", "sensor": 2, "value": 80}
#     ]
# }

# str_myobj = str(myobj)
# str_myobj = str_myobj.replace("'", '"')

# print('string:    ' + str_myobj)

# json_myobj = json.loads(str_myobj)

# print(json_myobj['readings'][0])

# for reading in myobj['readings']:
#     new_reading = Reading(
#         1,
#         reading['sensor'],
#         reading['type'],
#         reading['value']
#     )
#     new_writeable_reading = new_reading.make_writeable()
#     write_reading(new_writeable_reading, 1)

# new_reading = Reading(1, 1, 'temp', 25)
# writeable_reading = new_reading.make_writeable()
# print('what is going on')
# print(writeable_reading)