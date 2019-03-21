# Test running and accessing an AIOHTTP API

# Imports
import configparser
import urllib.parse
import pymongo

from pymongo import MongoClient
from aiohttp import web
from bson.json_util import dumps

# Get db credentials from config file
dbconfig = configparser.ConfigParser()
dbconfig.sections()
dbconfig.read('/etc/databaseapi/dbconfig.ini')
dbuser = urllib.parse.quote_plus(dbconfig['configuration']['username'])
dbpass = urllib.parse.quote_plus(dbconfig['configuration']['password'])

# Connect to db
client = MongoClient('mongodb://%s:%s@localhost:27017/admin?authMechanism=SCRAM-SHA-1' % (dbuser, dbpass))
db = client['monitoring']

# Setup API request handler
async def getReadings(request):
    cursor = db.rack1.find()
    readinglist = list(cursor)
    readings = dumps(readinglist)

    return web.json_response(readings)

# Setup API with routes
app = web.Application()
app.add_routes([web.get('/readings', getReadings)])

# Run API
web.run_app(app)