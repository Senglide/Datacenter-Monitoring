# Create database configuration file for configparser

# Imports
import configparser

# Create file for the db, fill in your own credentials
db_config = configparser.ConfigParser()
db_config['dbConfiguration'] = {'username': 'username', 'password': 'password', 'host': 'host', 'port': 'port', 'auth': 'auth', 'mech': 'mech'}

# Write files
with open('dbConfig.ini', 'w') as configfile: db_config.write(configfile)