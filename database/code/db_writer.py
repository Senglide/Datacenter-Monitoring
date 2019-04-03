# Test writing data to db

# Imports
import configparser
import pymongo

from pymongo import MongoClient

# Script variables
config_location = '/etc/monitoring/dbconfig.ini'
db_name = 'monitoring'

# Get db credentials from config file
dbconfig = configparser.ConfigParser()
dbconfig.sections()
dbconfig.read(config_location)
dbuser = dbconfig['configuration']['username']
dbpass = dbconfig['configuration']['password']
dbhost = dbconfig['configuration']['host']
dbport = dbconfig['configuration']['port']
dbauth = dbconfig['configuration']['auth']
dbmech = dbconfig['configuration']['mech']

# Connect to db
client = MongoClient('mongodb://%s:%s@%s:%s/%s?authMechanism=%s' % (dbuser, dbpass, dbhost, dbport, dbauth, dbmech))
db = client[db_name]

def write_reading(reading, collection_name):
    collection = db[collection_name]
    reading_id = collection.insert_one(reading).inserted_id
    print('Inserted: ' + str(reading_id))