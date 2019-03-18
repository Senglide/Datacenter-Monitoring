# Test writing data to db

# Imports
import configparser
import urllib.parse
import pymongo

from pymongo import MongoClient

# Get db credentials from config file
dbconfig = configparser.ConfigParser()
dbconfig.sections()
dbconfig.read('/etc/databaseapi/dbconfig.ini')
dbuser = urllib.parse.quote_plus(dbconfig['configuration']['username'])
dbpass = urllib.parse.quote_plus(dbconfig['configuration']['password'])

# Connect to db
client = MongoClient('mongodb://%s:%s@localhost:27017/admin?authMechanism=SCRAM-SHA-1' % (dbuser, dbpass))
db = client['admin']

# Random testdata
post = {'author': 'Mike', 'text': 'My first blog post!', 'tags': ['mongodb', 'python', 'pymongo']}

# Inserting data
posts = db.posts
post_id = posts.insert_one(post).inserted_id
print(post_id)