# Create configuration file for configparser

# Imports
import configparser

# Create file, fill in your own credentials
config = configparser.ConfigParser()
config['configuration'] = {'username': 'username', 'password': 'password', 'host': 'host', 'port': 'port', 'auth': 'auth', 'mech': 'mech'}

# Write file
with open('dbconfig.ini', 'w') as configfile: config.write(configfile)