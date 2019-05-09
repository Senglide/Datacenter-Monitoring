# Create database configuration file for configparser

# Imports
import configparser

# Create file for the webserver, fill in Django secret key
web_config = configparser.ConfigParser()
web_config['webConfiguration'] = {'secretKey': 'secretKey'}

# Write files
with open('webConfig.ini', 'w') as configfile: config.write(configfile)