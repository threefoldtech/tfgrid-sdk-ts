import configparser

class Base:
    config = configparser.ConfigParser()
    config.read('Config.ini')
    port = config['Base']['port']
    net = config['Base']['net']
    base_url = 'http://localhost:' + str(port) + '/'
    gridproxy_url = 'https://gridproxy.' + str(net) + '.grid.tf/'
    extension_url = 'chrome-extension://mopnmbcafieddcagagdcbnhejhlodfdd/index.html#/'