# Test writing data to db

# Imports
import configparser
import pymongo

from pymongo import MongoClient

# Script variables
config_location = '/etc/monitoring/dbConfig.ini'
db_name = 'monitoring'

# Get db credentials from config file
db_config = configparser.ConfigParser()
db_config.sections()
db_config.read(config_location)
db_user = dbconfig['dbConfiguration']['username']
db_pass = dbconfig['dbConfiguration']['password']
db_host = dbconfig['dbConfiguration']['host']
db_port = dbconfig['dbConfiguration']['port']
db_auth = dbconfig['dbConfiguration']['auth']
db_mech = dbconfig['dbConfiguration']['mech']

# Connect to db
client = MongoClient(db_host, username=db_user, password=db_pass, authSource=db_auth, authMechanism=db_mech)
db = client[db_name]

def write_reading(reading, collection_name):
    collection = db[collection_name]
    reading_id = collection.insert_one(reading).inserted_id
    print('Inserted: ' + str(reading_id))
