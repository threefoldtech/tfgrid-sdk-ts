from utils.utils import generate_inavalid_gateway, generate_inavalid_ip, generate_ip, generate_leters, generate_string, get_node_seed, randomize_public_ipv4, valid_amount
from pages.node import NodePage
from utils.grid_proxy import GridProxy
from pages.dashboard import DashboardPage
import math
import datetime
import random

#  Time required for the run (12 cases) is approximately 3 minutes.

def before_test_setup(browser):
    node_page = NodePage(browser)
    grid_proxy = GridProxy(browser)
    dashboard_page = DashboardPage(browser)
    password = generate_string()
    dashboard_page.open_and_load()
    dashboard_page.import_account(get_node_seed())
    dashboard_page.connect_your_wallet(password).click()
    node_page.navigate()
    return node_page, grid_proxy


def test_node_page(browser):
    """
      Test Case: TC1216 - Navigate to farm node
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on Farm from side menu.
      Result: User should be navigated to Farm Nodes page and see all his node.
    """
    node_page, grid_proxy = before_test_setup(browser)
    assert 'Your Farm Nodes' in browser.page_source
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    for node in nodes:
        assert str(node['nodeId']) in browser.page_source


# def test_search_node(browser):
#     """
#       Test Case: TC1217 - Search node
#       Steps:
#           - Navigate to the dashboard.
#           - Select an account (with node).
#           - Click on Farm from side menu.
#           - Enter keywords on search nodes input.
#           - Search by node ID, serial number, certification, farming policy ID
#       Result: Nodes searched for should be listed.
#     """
#     node_page, _, grid_proxy, _ = before_test_setup(browser)
#     nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
#     for node in nodes:
#         node_page.search_nodes(str(node['nodeId']))
#         assert node_page.get_node_count() == 1
#         node_page.search_nodes(str(node['serialNumber']))
#         assert node_page.get_node_count() == 1
#         node_page.search_nodes(str(node['certificationType']))
#         assert node_page.get_node_count() >= 1
#         node_page.search_nodes(str(node['farmingPolicyId']))
#         assert node_page.get_node_count() >= 1
#     node_page.search_nodes(generate_string())
#     assert 'No data available' in browser.page_source


# def test_sort_node(browser):
#     """
#       Test Case: TC1218 - Sort nodes
#       Steps:
#           - Navigate to the dashboard.
#           - Select an account (with node).
#           - Click on Farm from side menu.
#           - Click on column header to sort it (once ascend then descend then remove the sorting).
#           - Sort nodes in any order using Node ID, Farm ID, Country, Serial Number, Status
#       Result: Nodes should be sorted using specified column.
#     """
#     node_page, _, grid_proxy, _ = before_test_setup(browser)
#     node_list = grid_proxy.get_twin_node(str(node_page.twin_id))
#     # Sort by Node ID
#     assert node_page.sort_node_id() == sorted(node_page.get_node_id(node_list), reverse=False)
#     assert node_page.sort_node_id() == sorted(node_page.get_node_id(node_list), reverse=True)
#     # Sort by Farm ID
#     assert node_page.sort_farm_id() == sorted(node_page.get_farm_id(node_list), reverse=False)
#     assert node_page.sort_farm_id() == sorted(node_page.get_farm_id(node_list), reverse=True)
#     # Sort by Country
#     assert node_page.sort_country() == sorted(node_page.get_country(node_list), reverse=False)
#     assert node_page.sort_country() == sorted(node_page.get_country(node_list), reverse=True)
#     # Sort by Serial Number
#     assert node_page.sort_serial_number() == sorted(node_page.get_serial_number(node_list), reverse=False)
#     assert node_page.sort_serial_number() == sorted(node_page.get_serial_number(node_list), reverse=True)
#     # Sort by Status
#     assert node_page.sort_status() == sorted(node_page.get_status(node_list), reverse=False)
#     assert node_page.sort_status() == sorted(node_page.get_status(node_list), reverse=True)


def test_node_details(browser):
    """
      Test Case: TC1216 - Navigate to farm node
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on Farm from side menu.
      Result: User should be navigated to Farm Nodes page and see all his node.
    """
    node_page, grid_proxy = before_test_setup(browser)
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    node_details = node_page.node_details()
    for detail in node_details:
        for node in nodes:
            if detail[1] == node['nodeId']:
                assert node['id'] == detail[0]
                assert node['publicConfig']['domain'] == detail[1]
                assert node['publicConfig']['ipv4'] == detail[2]
                assert node['publicConfig']['gw4'] == detail[3]
                assert node['publicConfig']['ipv6'] == detail[4]
                assert node['publicConfig']['gw6'] == detail[5]
                assert node['nodeId'] == detail[6]
                assert node['farmId'] == detail[7]
                assert node['twinId'] == detail[8]
                assert node['country'] == detail[9]
                assert node['city'] == detail[10]
                assert node['created'] == (datetime.datetime.fromtimestamp(detail[11] / 1000).strftime("%a %b %d %Y %X ") + 'GMT+0200 (Eastern European Standard Time)')
                assert node['farmingPolicyId'] == detail[12]
                assert node['updatedAt'] == (datetime.datetime.fromtimestamp(detail[13] / 1000).strftime("%a %b %d %Y %X ") + 'GMT+0200 (Eastern European Standard Time)')
                assert f"{node['used_resources']['cru']} / {node['total_resources']['cru']}" == detail[14]
                assert f"{math.ceil(node['used_resources']['sru']/(1024**3))} / {math.ceil(node['total_resources']['sru']/(1024**3))} GB" == detail[15]
                assert f"{math.ceil(node['used_resources']['hru']/(1024**3))} / {math.ceil(node['total_resources']['hru']/(1024**3))} GB" == detail[16]
                assert f"{math.ceil(node['used_resources']['mru']/(1024**3))} / {math.ceil(node['total_resources']['mru']/(1024**3))} GB" == detail[17]
                assert node['status'] == detail[18]
                assert node['certificationType'] == detail[19]
                assert node['serialNumber'] == detail[20]


def test_config_validation(browser):
    """
      Test Case: TC1220 - Add a public config validation
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on Farm from side menu.
          - Click on 'Add a public config' button.
          - Enter values.
      Result: Alert should be displayed and save button will be disabled.
    """
    node_page, grid_proxy = before_test_setup(browser)
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    node_id = nodes[random.randint(0,len(nodes)-1)]['nodeId']
    node_page.setup_config(node_id)
    cases = [generate_inavalid_ip(), '1.0.0.0/66', '239.255.255/17', '239.15.35.78.5/25', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    assert node_page.add_config_input( "1.1.1.1/16", '1.1.1.1', '::2/16', '::2', 'tf.grid').is_enabled() == True
    for case in cases:
        assert node_page.add_config_input( case, 0, 0, 0, 0).is_enabled()==False
        assert node_page.wait_for('IP address is not formatted correctly')
    assert node_page.add_config_input( '255.0.0.1/32', 0, 0, 0, 0).is_enabled()==False
    assert node_page.wait_for('IP is not public')
    assert node_page.add_config_input( "1.1.1.1/16", '1.1.1.1', '::2/16', '::2', 'tf.grid').is_enabled() == True
    cases = [generate_inavalid_gateway(), '1.0.0.',  '1:1:1:1', '522.255.255.255', '.239.35.78', '1.1.1.1/16', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    for case in cases:
        assert node_page.add_config_input( 0, case, 0, 0, 0).is_enabled()==False
        assert node_page.wait_for('Gateway is not formatted correctly')
    assert node_page.add_config_input( 0, '255.0.0.1', 0, 0, 0).is_enabled()==False
    assert node_page.wait_for('Gateway is not public')
    assert node_page.add_config_input( "1.1.1.1/16", '1.1.1.1', '::2/16', '::2', 'tf.grid').is_enabled() == True
    cases = [' ', '::g', '::+', ':: /65', '::2/15', '1:2:3', ':a', '1:2:3:4:5:6:7:8:9', generate_string(), generate_leters()]
    for case in cases:
        assert node_page.add_config_input( 0, 0, case, 0, 0).is_enabled()==False
        assert node_page.wait_for('IPV6 address is not formatted correctly')
    assert node_page.add_config_input( 0, 0, 'fd12:3456:789a:1::/64', 0, 0).is_enabled()==False
    assert node_page.wait_for('IP is not public')
    assert node_page.add_config_input( "1.1.1.1/16", '1.1.1.1', '::2/16', '::2', 'tf.grid').is_enabled() == True
    cases = [' ', '::g', '1:2:3', ':a', '1:2:3:4:5:6:7:8:9', generate_string(), generate_leters()]
    for case in cases:
        assert node_page.add_config_input( 0, 0, 0, case, 0).is_enabled()==False
        assert node_page.wait_for('Gateway is not formatted correctly')
    assert node_page.add_config_input( 0, 0,0, 'fd12:3456:789a:1::1', 0).is_enabled()==False
    assert node_page.wait_for('Gateway is not public')
    assert node_page.add_config_input( "1.1.1.1/16", '1.1.1.1', '::2/16', '::2', 'tf.grid').is_enabled() == True
    cases = [generate_inavalid_ip(), generate_inavalid_gateway(), generate_string(), generate_leters(), ' ', '.', '/', 'q', '1', 'ww', 'ww/ww', '22.22']
    for case in cases:
        assert node_page.add_config_input( 0, 0, 0, 0, case).is_enabled()==False
        assert node_page.wait_for('Invalid url format')


def test_add_config(browser):
    """
      Test Case: TC1221 - Add a public config
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on Farm from side menu.
          - Click on 'Add a public config' button.
          - Enter values and click on save button.
      Result: User should be able to add the public config to his farm node.
    """
    node_page, grid_proxy = before_test_setup(browser)
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    rand_node = random.randint(0,len(nodes)-1)
    node_id = nodes[rand_node]['nodeId']
    old_ipv4 = nodes[rand_node]['publicConfig']['ipv4']
    node_page.setup_config(node_id)
    new_ipv4, gateway = randomize_public_ipv4()
    node_page.add_config_input( new_ipv4, gateway, '2600:1f13:0d15:95:00::/64', '2600:1f13:0d15:95:00::', 'tf.grid').click()
    node_page.submit_config()
    node_page.wait_for('Transaction submitted')
    node_page.wait_for('Node public config added!')
    counter = 0
    while(old_ipv4 != new_ipv4):
        old_ipv4 = grid_proxy.get_node_ipv4(node_id)
        counter += 1
        if(counter==40):
            break
    assert grid_proxy.get_node_ipv4(node_id) == new_ipv4


def test_remove_config(browser):
    """
      Test Case: TC1222 - Remove a public config
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on Farm from side menu.
          - Click on 'Add a public config' button.
          - Click on Remove config button.
      Result: User should be able to remove his node config.
    """
    node_page, grid_proxy = before_test_setup(browser)
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    rand_node = random.randint(0,len(nodes)-1)
    node_id = nodes[rand_node]['nodeId']
    node_page.setup_config(node_id)
    node_page.remove_config()
    node_page.wait_for('Node public config removed!')
    counter = 0
    ipv4 = grid_proxy.get_node_ipv4(node_id)
    while(ipv4 != ''):
        ipv4 = grid_proxy.get_node_ipv4(node_id)
        counter += 1
        if(counter==40):
            break
    assert grid_proxy.get_node_ipv4(node_id) == ''


def test_additional_fee(browser):
    """
      Test Case: TC1750 - Additional Fee
      Steps:
          - Navigate to the dashboard.
          - Login into an account (with node).
          - Click on farms from side menu.
          - Click on 'Set Additional Fee' button.
          - Enter Fee and press 'Set' button.
      Result: Additional fee should have been set on dashboard and grid proxy.
    """
    node_page, grid_proxy = before_test_setup(browser)
    nodes = grid_proxy.get_twin_node(str(node_page.twin_id))
    rand_node = random.randint(0,len(nodes)-1)
    node_id = nodes[rand_node]['nodeId']
    node_page.setup_fee(node_id)
    cases = ['-10', '0', '-5', '-0', '-8.84']
    for case in cases:
        assert node_page.set_fee(case).is_enabled()==False
        assert node_page.wait_for('Extra fee cannot be negative or 0')
    fee = grid_proxy.get_node_fee(node_id)
    new_fee = valid_amount()
    node_page.set_fee(new_fee).click()
    node_page.wait_for('Transaction succeeded: Fee is added to node ' + str(node_id))
    counter = 0
    while(fee != new_fee):
        fee = grid_proxy.get_node_fee(node_id)
        counter += 1
        if(counter==40):
            break
    assert grid_proxy.get_node_fee(node_id) == new_fee