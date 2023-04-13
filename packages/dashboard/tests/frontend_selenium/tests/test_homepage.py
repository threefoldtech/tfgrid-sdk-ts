import pytest
from random import randint
from pages.polka import PolkaPage
from pages.dashboard import DashboardPage
from utils.utils import generate_string, get_seed
from utils.base import Base

#  Time required for the run (12 cases) is approximately 2 minutes.


def before_test_setup(browser):
    dashboard_page = DashboardPage(browser)
    polka_page = PolkaPage(browser)
    polka_page.load_and_authenticate()
    return dashboard_page, polka_page


def test_polka_page(browser):
    """
      Test Case: TC974 - Download polkadot{.js} extension
      Steps:
          - Navigate to dashboard.
          - Authenticate polkadot.
          - Disconnect polka.
          - Click "Download polkadot{.js} extension" button.
      Result: User should be navigated to the download polkadot extesion page.
    """
    dashboard_page, _ = before_test_setup(browser)
    assert dashboard_page.navigate_to_polka() == 'https://polkadot.js.org/extension/'


def test_discover_page(browser):
    """
      Test Case: TC975 - Discover the ThreeFold Grid
      Steps:
          - Navigate to dashboard.
          - Authenticate polkadot.
          - Disconnect polka.
          - Swape to next option. 
          - Click "Discover the ThreeFold Grid" button
      Result: User should be navigated to the explorer stats page.
    """
    dashboard_page, _ = before_test_setup(browser)
    assert dashboard_page.navigate_to_explorer() == (Base.base_url+'explorer/statistics')


def test_manual_page(browser):
    """
      Test Case: TC976 - Your Guide to The ThreeFold Grid
      Steps:
          - Navigate to dashboard.
          - Authenticate polkadot.
          - Disconnect polka.
          - Swipe back to previous option.
          - Click "Learn More" button.
      Result: User should be navigated to the manual page.
    """
    dashboard_page, _ = before_test_setup(browser)
    assert dashboard_page.navigate_to_manual() == 'https://library.threefold.me/info/manual/#/'


def test_polka_connection(browser):
    """
      Test Case: TC977 - Polkadot connection
      Steps:
          - Navigate to dashboard.
          - Authenticate polkadot.
          - Disconnect from polka.
          - Reconnect to it.
      Result: Polka should be load and authenticated, Assert button works and polka connect and disconnect.
    """
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    dashboard_page.polka_disconnection()
    connected = dashboard_page.polka_connected_status()
    dashboard_page.polka_connection()
    disconnected = dashboard_page.polka_disconnected_status()
    assert ('green' in connected) and ('red' in disconnected)


def test_create_account(browser):
    """
      Test Cases: TC978 - Create account
      Steps:
          - Navigate to dashboard.
          - Authenticate and Navigate to polkadot.
          - Click on "Menu" then "Create new account".
          - Click on checkbox then "Next step".
          - Enter username, password (twice) and submit.
      Result: Account should be listed on the connected account.
    """
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    assert user in dashboard_page.accounts_list()


def test_import_account(browser):
    """
      Test Cases: TC979 - Import account
      Steps:
          - Navigate to dashboard.
          - Authenticate and Navigate to polkadot.
          - Click on "Menu" then "import account".
          - Enter seed then "Next".
          - Enter username, password (twice) and submit.
      Result: Account should be listed on the connected account.
    """
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.import_account(get_seed(), user, password)
    assert user in dashboard_page.accounts_list()


"""
  Test Cases: TC980 - Search by valid account name or address
  Steps:
      - Navigate to dashboard.
      - Authenticate polkadot.
      - Add or Import some accounts.
      - Type account name or address in SearchBar.
  Test Data: [ Name - Address - (First char,  Last char, Random char from middle,
                  Random char sequence, case sensitive chars) From Account Name or Address ]
  Result: List of all the accounts that matches search input.
"""


def test_search_by_name_address(browser):
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    address = dashboard_page.get_address((dashboard_page.accounts_list()))
    dashboard_page.search_accounts(user)
    account_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(address)
    address_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(user.lower())
    assert user in account_list and user in dashboard_page.accounts_list()
    dashboard_page.search_accounts(address.lower())
    assert address in address_list and address in dashboard_page.accounts_list()


@pytest.mark.parametrize('cases', [0, 9, randint(1, 8)])
def test_search_by_valid_name_address(browser, cases):
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    address = dashboard_page.get_address((dashboard_page.accounts_list()))
    dashboard_page.search_accounts(user[cases])
    account_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(address[cases])
    address_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(user[cases].lower())
    assert user in account_list and user in dashboard_page.accounts_list()
    dashboard_page.search_accounts(address[cases].lower())
    assert address in address_list and address in dashboard_page.accounts_list()


@pytest.mark.parametrize('begin, end', [(0, 1), (8, 9), (randint(1, 4), randint(5, 8))])
def test_search_by_valid_name_address(browser, begin, end):
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    address = dashboard_page.get_address((dashboard_page.accounts_list()))
    dashboard_page.search_accounts(user[begin: end])
    account_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(address[begin: end])
    address_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(user[begin: end].lower())
    assert user in account_list and user in dashboard_page.accounts_list()
    dashboard_page.search_accounts(address[begin: end].lower())
    assert address in address_list and address in dashboard_page.accounts_list()


@pytest.mark.parametrize('cases', [' ', generate_string()])
def test_search_by_invalid_name_address(browser, cases):
    """
      Test Cases: TC981 - Search by invalid account name or address
      Steps:
          - Navigate to dashboard.
          - Authenticate polkadot.
          - Add or Import some accounts.
          - Type account name or address in SearchBar.
      Test Data: [Empty - Random char or sequence not in both]
      Result: Empty list.
    """
    dashboard_page, polka_page = before_test_setup(browser)
    user = generate_string()
    password = generate_string()
    polka_page.add_account(user, password)
    address = dashboard_page.get_address((dashboard_page.accounts_list()))
    dashboard_page.search_accounts(cases)
    account_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(cases)
    address_list = dashboard_page.accounts_list()
    dashboard_page.search_accounts(cases.lower())
    assert user not in account_list and user not in dashboard_page.accounts_list()
    assert len(account_list) == 0 and len(dashboard_page.accounts_list()) == 0
    dashboard_page.search_accounts(cases.lower())
    assert address not in address_list and address not in dashboard_page.accounts_list()
    assert len(account_list) == 0 and len(dashboard_page.accounts_list()) == 0
