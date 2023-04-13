import requests
from utils.base import Base

"""
This module contains Grid Proxy getters.
"""

class GridProxy:

    def __init__(self, browser):
        self.browser = browser

    def get_rentable_node(self):
        r = requests.post(Base.gridproxy_url + 'nodes?rentable=true&status=up')
        node_list = r.json()
        r = requests.post(Base.gridproxy_url + 'nodes?rented=true&status=up')
        node_list.extend(r.json())
        return node_list

    def get_farm_details(self, farm_name):
        r = requests.post(Base.gridproxy_url + 'farms?name=' + farm_name)
        details = r.json()
        return details
    
    def get_dedicate_status(self, node_id):
        r = requests.post(Base.gridproxy_url + 'nodes/'+ str(node_id))
        dedicate_status = r.json()
        return (dedicate_status['rentedByTwinId'])
    
    def get_node_ipv4(self, node_id):
        r = requests.post(Base.gridproxy_url + 'nodes/'+ str(node_id))
        farm_node = r.json()
        return (farm_node['publicConfig']['ipv4'])

    def get_twin_address(self, twin_id):
        r = requests.post(Base.gridproxy_url + 'twins?twin_id='+ twin_id)
        details = r.json()
        return details[0]['accountId']

    def get_farm_ips(self, farm_id):
        r = requests.post(Base.gridproxy_url + 'farms?farm_id='+ farm_id)
        farm_list = r.json()
        return len(farm_list[0]['publicIps'])

    def get_twin_node(self, twin_id):
        r = requests.post(Base.gridproxy_url + 'farms?twin_id=' + twin_id)
        details = r.json()
        farms = ''
        for detail in details:
            farms += str(detail['farmId']) + ','
        r = requests.post(Base.gridproxy_url + 'nodes?farm_ids=' + farms[:-1])
        details = r.json()
        return details