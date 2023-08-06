from utils.utils import generate_leters, generate_string, get_seed
from pages.twin import TwinPage
from utils.grid_proxy import GridProxy
from pages.dashboard import DashboardPage

#  Time required for the run (6 cases) is approximately 3 minutes.


def before_test_setup(browser):
    twin_page = TwinPage(browser)
    dashboard_page = DashboardPage(browser)
    password = generate_string()
    dashboard_page.open_and_load()
    dashboard_page.import_account(get_seed())
    dashboard_page.connect_your_wallet(password).click()
    twin_page.navigate()
    return twin_page


def test_twin_details(browser):
    """
      Test Cases: TC1867 - Twin details
      Steps:
          - Navigate to dashboard
          - Login.
      Result: Assert twin details with the grid proxy.
    """
    twin_page = before_test_setup(browser)
    grid_proxy = GridProxy(browser)
    twin_id, twin_address, twin_relay = twin_page.get_twin_details()
    assert twin_address == grid_proxy.get_twin_address(twin_id)
    assert twin_relay == grid_proxy.get_twin_relay(twin_id)


def test_edit_twin_relay(browser):
    """
      Test Cases: TC925- edit twin relay
      Steps:
          - Navigate to dashboard
          - Login.
          - Click on edit button.
          - Choose relay from list option.
          - Click on submit button.
      Result: Assert that twin relay edited.
    """
    twin_page = before_test_setup(browser)
    twin_page.press_edit_btn()
    relay = twin_page.edit_twin_relay()
    twin_page.press_submit_btn()
    assert twin_page.wait_for('Chosen relay is the current relay!')
    assert twin_page.wait_for(relay)


def test_get_tft(browser):
    """
      Test Cases: TC933- Get TFT 
      Steps:
          - Navigate to dashboard
          - Login.
          - Check Get TFT right to TFT price on the top right corner.
          - Click on the Get TFT button.
          - Press on locked TFT info button
      Result: Assert that it should go to the correct link. 
    """
    twin_page = before_test_setup(browser)
    twin_page.get_tft()
    assert '/html' in browser.page_source
    # NO checking as devnet don't direct to TF Connect page https://gettft.com/auth/login?next_url=/gettft/shop/#/buy
    assert twin_page.press_locked_info() == 'https://manual.grid.tf/tfchain/tfchain.html?highlight=locked#contract-locking'