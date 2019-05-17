#!/usr/local/bin/python3

# Receive data to be written to the database

# Imports
import paho.mqtt.client as mqtt
import json

from reading_class import Reading
from db_writer import write_reading

# Script variables
subscribe_channel = 'datacenter'
cert_location = '/etc/monitoring/ca_certificates/ca.crt'
client_cert_location = '/etc/monitoring/ca_certificates/client-API.crt'
key_location = '/etc/monitoring/ca_certificates/client-API.key'
client_ip = '10.140.4.160'
client_port = 8883
app_name = 'dashboard'
smoke_detected = None
movement_detected = None

# The callback for when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    print('Connected with result code ' + str(rc))

    # Subscribing in on_connect() means that if we lose the connection and reconnect then subscriptions will be renewed
    client.subscribe(subscribe_channel)

# The callback for when a PUBLISH message is received from the server
def on_message(client, userdata, message):
    # Receive and convert incoming message
    str_message = str(message.payload)[2:-1]
    str_message = str_message.replace("'", '"')
    json_message = json.loads(str_message)
    
    # Get individual readings from the message and send them to processing
    for incoming_reading in json_message['readings']:
        process_reading(incoming_reading)

# Process and write the reading
def process_reading(reading):
    # Create new reading
    new_reading = Reading(
        reading['rack'],
        reading['sensor'],
        reading['sensor_type'],
        reading['sensor_value']
    )

    # Check for alarms
    if (new_reading.sensor_type == 'smoke') or (new_reading.sensor_type == 'movement'):
        if new_reading.sensor_type == 'smoke':
            if (smoke_detected == None) or (new_reading.sensor_value != smoke_detected):
                session = requests.Session()
                session.trust_env = False
                r = session.post('http://localhost:8000/dashboard/alarm/' + new_reading.sensor_type + '/' + str(new_reading.sensor_value))
                smoke_detected = new_reading.sensor_value
        else:
            if (movement_detected == None) or (new_reading.sensor_value != movement_detected):
                session = requests.Session()
                session.trust_env = False
                r = session.post('http://localhost:8000/dashboard/alarm/' + new_reading.sensor_type + '/' + str(new_reading.sensor_value))
                movement_detected = new_reading.sensor_value

    # Format reading for the db
    new_writeable_reading = new_reading.make_writeable()
    # Determin the correct collection for the reading
    if new_reading.rack == '0':
        collection_name = app_name + '_' + new_reading.sensor_type
    else:
        collection_name = app_name + '_rack_' + str(new_reading.rack)
    # Send the reading to the db_writer
    write_reading(new_writeable_reading, collection_name)

# Configure client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Encryption settings
client.tls_set(cert_location, client_cert_location, key_location)

# Connect to client
client.connect(client_ip, client_port)

# Blocking call that processes network traffic, dispatches callbacks and handles reconnecting
client.loop_forever()

