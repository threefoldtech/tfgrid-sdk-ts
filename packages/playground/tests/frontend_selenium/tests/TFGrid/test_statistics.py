import math
from utils.utils import byte_converter,convert_to_scaled_float
from pages.statistics import StatisticsPage
from utils.grid_proxy import GridProxy
from pages.dashboard import DashboardPage



def before_test_setup(browser):
    statistics_page = StatisticsPage(browser)
    dashboard_page = DashboardPage(browser)
    dashboard_page.open_and_load()
    statistics_page.navigate()
    return statistics_page


def test_statistics_details(browser):
    statistics_page = before_test_setup(browser)
    grid_proxy = GridProxy(browser)
    statistics_details = statistics_page.statistics_detials()
    print("Statistics Details:", statistics_details)
    grid_statistics_details = grid_proxy.get_stats()
    
    # Convert necessary values from string to integer before comparing
    statistics_details_converted = [int(detail.replace(',', '')) if detail is not None and detail.isdigit() else detail for detail in statistics_details]
    # Full set of assertions, comparing UI stats with proxy stats
    assert grid_statistics_details['nodes'] == statistics_details_converted[0]
    assert grid_statistics_details['dedicatedNodes'] == statistics_details_converted[1]
    assert grid_statistics_details['farms'] == statistics_details_converted[2]
    assert grid_statistics_details['countries'] == statistics_details_converted[3]
    assert grid_statistics_details['totalCru'] == statistics_details_converted[4]
    assert math.isclose(convert_to_scaled_float(grid_statistics_details['totalSru']), convert_to_scaled_float(byte_converter(statistics_details_converted[5])), abs_tol=0.002)
    assert math.isclose(convert_to_scaled_float(grid_statistics_details['totalHru']), convert_to_scaled_float(byte_converter(statistics_details_converted[6])), abs_tol=0.002)
    assert math.isclose(convert_to_scaled_float(grid_statistics_details['totalMru']), convert_to_scaled_float(byte_converter(statistics_details_converted[7])), abs_tol=0.002)
    assert grid_statistics_details['gpus'] == statistics_details_converted[8]
    assert grid_statistics_details['accessNodes'] == statistics_details_converted[9]
    assert grid_statistics_details['gateways'] == statistics_details_converted[10]
    assert grid_statistics_details['twins'] == statistics_details_converted[11]
    assert grid_statistics_details['publicIps'] == statistics_details_converted[12]
    assert grid_statistics_details['contracts'] == statistics_details_converted[13]
    assert grid_statistics_details['workloads_number'] == statistics_details_converted[14]
    assert statistics_page.grid_status_link() == 'https://status.grid.tf/status/threefold/'
    assert statistics_page.node_monitoring_link() == 'https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?orgId=2&refresh=30s/'


    
    