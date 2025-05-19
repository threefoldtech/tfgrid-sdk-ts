import configparser

class Base:
    config = configparser.ConfigParser()
    config.read('Config.ini')
    port = config['Base']['port']
    net = str(config['Base']['net']).lower()

    if str(net).lower() == 'main':
        bridge_address = 'GBNOTAYUMXVO5QDYWYO2SOCOYIJ3XFIP65GKOQN7H65ZZSO6BK4SLWSC'
        base_url = 'https://dashboard.grid.tf/'
        stats_url = 'https://stats.grid.tf/'
        gridproxy_url = 'https://gridproxy.grid.tf/'

    elif str(net).lower() == 'test':
        bridge_address = 'GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4'
        base_url = 'https://dashboard.test.grid.tf/'
        stats_url = 'https://stats.' + str(net) + '.grid.tf/'
        gridproxy_url = 'https://gridproxy.' + str(net) + '.grid.tf/'

    elif str(net).lower() == 'qa':
        bridge_address = 'GAQH7XXFBRWXT2SBK6AHPOLXDCLXVFAKFSOJIRMRNCDINWKHGI6UYVKM'
        base_url = 'https://dashboard.qa.grid.tf/'
        stats_url = 'https://stats.' + str(net) + '.grid.tf/'
        gridproxy_url = 'https://gridproxy.' + str(net) + '.grid.tf/'

    elif str(net).lower() == 'dev':
        bridge_address = 'GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG'
        base_url = 'https://staging.dashboard.dev.grid.tf/'
        stats_url = 'https://stats.' + str(net) + '.grid.tf/'
        gridproxy_url = 'https://gridproxy.' + str(net) + '.grid.tf/'

    elif str(net).lower() == 'local':
        bridge_address = 'GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG'
        base_url = 'http://localhost:' + str(port) + '/'
        stats_url = 'https://stats.dev.grid.tf/'
        gridproxy_url = 'https://gridproxy.dev.grid.tf/'

    else:
        raise ValueError('[%s] is not a valid network; please enter a valid network in Config.ini ["main","test", "qa", "dev", "local"]' % str(net))

    if str(net).lower() in ('main', 'test'):
        farm_payout_address1 = 'GCT2YESPSO5DLDQF6OKQZHVDVAUA7WIHOSV47WT6R2N636TBGS5XVVI6'
        farm_payout_address2 = 'GAGXCUJVK77C7XRMU66NU2GBALDFRQHCJGJ44VONUPIYNYNYETU56ICO'
    else:
        farm_payout_address1 = 'GCWQVJF4FKQ3IYVE4ERXZELN25SC7FBQ5ICYN3DOUTVDWLEJUAZ2A23D'
        farm_payout_address2 = 'GCJ445SZIK2FDUUZJD3VVFXQXKENFY4DDRM2AFBFGSRFUG452NEBCJBG'