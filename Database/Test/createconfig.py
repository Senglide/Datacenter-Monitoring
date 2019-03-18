# Create configuration file for configparser

# Imports
import configparser

# Create file, fill in your own username and password
config = configparser.ConfigParser()
config['configuration'] = {'username': 'username', 'password': 'password'}

# Write file
with open('dbconfig.ini', 'w') as configfile: config.write(configfile)