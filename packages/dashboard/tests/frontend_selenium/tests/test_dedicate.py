from utils.utils import generate_string, get_seed
from pages.polka import PolkaPage
from utils.grid_proxy import GridProxy
from pages.dedicate import DedicatePage
import pytest

#  Time required for the run (12 cases) is approximately 3 minutes.


def before_test_setup(browser):
    dedicate_page = DedicatePage(browser)
    polka_page = PolkaPage(browser)
    grid_proxy = GridProxy(browser)
    user = generate_string()
    password = generate_string()
    polka_page.load_and_authenticate()
    polka_page.import_account(get_seed(), user, password)
    dedicate_page.navigate(user)
    return dedicate_page, polka_page, grid_proxy, password


def test_dedicate_page(browser):
    """
      Test Case: TC1138 - Navigate to dedicate node
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on Dedicate Node from side menu.
      Result: User should be navigated to Dedicate Node page.
    """
    before_test_setup(browser)
    assert 'Rentable' in browser.page_source
    assert 'Rented' in browser.page_source
    assert 'Mine' in browser.page_source


# def test_search_by_valid_name_address(browser):
#     """
#       Test Case: TC997 - Verify the search functionality by valid location or node id
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - In the Farms search bar enter the location or the id of the node
#       Test Data: [ ID - Location - case sensitive Location ]
#       Result: The search results should be displayed correctly according to the keywords used.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     ids = dedicate_page.get_node_id(node_list)
#     locations = dedicate_page.get_node_location(node_list)
#     for id in ids:
#       dedicate_page.search_nodes(id)
#       assert dedicate_page.get_node_count() == 1
#     for location in locations:
#       dedicate_page.search_nodes(location)
#       assert  dedicate_page.get_node_count() >= 1
#       dedicate_page.search_nodes(location.lower())
#       assert  dedicate_page.get_node_count() >= 1
#       dedicate_page.search_nodes(location.upper())
#       assert  dedicate_page.get_node_count() >= 1


# def test_search_by_invalid_name_address(browser):
#     """
#       Test Case: TC1133 - Verify the search functionality by invalid location or node id
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - In the Farms search bar enter invalid location or the id of the node
#       Result: The search results should be displayed nothing as search keywords are incorrect.
#     """
#     dedicate_page,_,_,_ = before_test_setup(browser)
#     dedicate_page.search_nodes(generate_string())
#     assert 'No data available' in browser.page_source


# def test_sort_node_id(browser):
#     """
#       Test Case: TC998 - Node table sorting by id
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node Id 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the id.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_id() == sorted(dedicate_page.get_node_id(node_list), reverse=False)
#     assert dedicate_page.sort_node_id() == sorted(dedicate_page.get_node_id(node_list), reverse=True)


# def test_sort_node_location(browser):
#     """
#       Test Case: TC998 - Node table sorting by location
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node location 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the location.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_location() == sorted(dedicate_page.get_node_location(node_list), reverse=False)
#     assert dedicate_page.sort_node_location() == sorted(dedicate_page.get_node_location(node_list), reverse=True)


# def test_sort_node_cru(browser):
#     """
#       Test Case: TC998 - Node table sorting by CRU
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node CRU 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the CRU.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_cru() == sorted(dedicate_page.get_node_cru(node_list), reverse=False)
#     assert dedicate_page.sort_node_cru() == sorted(dedicate_page.get_node_cru(node_list), reverse=True)


# def test_sort_node_hru(browser):
#     """
#       Test Case: TC998 - Node table sorting by HRU
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node HRU 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the HRU.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_hru() == sorted(dedicate_page.get_node_hru(False, node_list), reverse=False)
#     assert dedicate_page.sort_node_hru() == sorted(dedicate_page.get_node_hru(False, node_list), reverse=True)


# def test_sort_node_mru(browser):
#     """
#       Test Case: TC998 - Node table sorting by MRU
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node MRU 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the MRU.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_mru() == sorted(dedicate_page.get_node_mru(False, node_list), reverse=False)
#     assert dedicate_page.sort_node_mru() == sorted(dedicate_page.get_node_mru(False, node_list), reverse=True)


# def test_sort_node_sru(browser):
#     """
#       Test Case: TC998 - Node table sorting by SRU
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node SRU 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the SRU.
#     """
#     dedicate_page,_,grid_proxy,_ = before_test_setup(browser)
#     node_list = grid_proxy.get_rentable_node()
#     assert dedicate_page.sort_node_sru() == sorted(dedicate_page.get_node_sru(False, node_list), reverse=False)
#     assert dedicate_page.sort_node_sru() == sorted(dedicate_page.get_node_sru(False, node_list), reverse=True)


# def test_sort_node_price(browser):
#     """
#       Test Case: TC998 - Node table sorting by Price
#       Steps:
#           - From the Twin Details Page Click on Dedicated nodes
#           - Click on the arrow behind node Price 'once up and once down and once to remove the sorting'
#       Result: You should see the sorting of the table change according to the Price.
#     """
#     dedicate_page,_,_,_ = before_test_setup(browser)
#     price = dedicate_page.get_node_price()
#     assert dedicate_page.sort_node_price() == sorted(price, reverse=True)
#     assert dedicate_page.sort_node_price() == sorted(price, reverse=False)


def test_node_details(browser):
    """
      Test Case: TC1139 - Node details
      Steps:
          - From the Twin Details Page Click on Dedicated nodes
          - Click on expand button on a node
      Result: You should see the node details.
    """
    dedicate_page, _, grid_proxy, _ = before_test_setup(browser)
    node_list = grid_proxy.get_rentable_node()
    nodes = dedicate_page.node_details()
    for i in range(len(nodes)):
        assert str(dedicate_page.get_node_cru(node_list)[i]) in nodes[i][1]
        assert str(dedicate_page.get_node_hru(True, node_list)[i]) in nodes[i][2]
        assert str(dedicate_page.get_node_sru(True, node_list)[i]) in nodes[i][3]
        assert str(dedicate_page.get_node_mru(True, node_list)[i]) in nodes[i][4]
        assert dedicate_page.get_node_location(node_list)[i] in nodes[i][5]
        assert dedicate_page.get_node_city(node_list)[i] in nodes[i][6]
        assert str(grid_proxy.get_farm_ips((dedicate_page.get_farm_id(nodes[i][0], node_list)))) in nodes[i][7]


def test_reserve_node(browser):
    """
      Test Case: TC1137 - Reserve a node
      Steps:
          - From the Twin Details Page Click on Dedicated nodes
          - Click reserve button on a node not taken
          - Authenticate polka with password
          - Click unreserve button on same node
      Result: You should see the node details.
    """
    dedicate_page, polka_page, grid_proxy, password = before_test_setup(browser)
    node_list = grid_proxy.get_rentable_node()
    node_id = dedicate_page.check_free_node(node_list)
    if (node_id):
        dedicate_page.reserve_node(node_id)
        polka_page.authenticate_with_pass(password)
        assert dedicate_page.wait_for('Transaction succeeded: Node ' + str(node_id) + ' reserved')
        status = counter = 0
        while (status == 0):
            status = grid_proxy.get_dedicate_status(node_id)
            counter += 1
            if (counter == 10):
                break
        assert grid_proxy.get_dedicate_status(node_id) == dedicate_page.twin_id
        dedicate_page.unreserve_node(node_id)
        polka_page.authenticate_with_pass(password)
        assert dedicate_page.wait_for(
            'Transaction succeeded: Node ' + str(node_id) + ' Unreserved')
        while (status != 0):
            status = grid_proxy.get_dedicate_status(node_id)
        assert grid_proxy.get_dedicate_status(node_id) == False
    else:
        pytest.skip("Can't test as there isn't a free dedicated node.")
