# Test writing data to db

# Imports
import configparser
import urllib.parse
import pymongo

from pymongo import MongoClient

# Get db credentials from config file
dbconfig = configparser.ConfigParser()
dbconfig.sections()
dbconfig.read('/etc/monitoring/dbconfig.ini')
dbuser = dbconfig['configuration']['username']
dbpass = dbconfig['configuration']['password']
dbhost = dbconfig['configuration']['host']
dbport = dbconfig['configuration']['port']
dbauth = dbconfig['configuration']['auth']
dbmech = dbconfig['configuration']['mech']

# Connect to db
client = MongoClient('mongodb://%s:%s@%s:%s/%s?authMechanism=%s' % (dbuser, dbpass, dbhost, dbport, dbauth, dbmech))
db = client['monitoring']

def write_reading(reading, collection_name):
    collection = db[collection_name]
    reading_id = collection.insert_one(reading).inserted_id
    print(reading_id)
