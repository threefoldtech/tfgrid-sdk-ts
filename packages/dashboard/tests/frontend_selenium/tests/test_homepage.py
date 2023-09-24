import pytest
from pages.dashboard import DashboardPage
from utils.utils import generate_string, get_seed
from utils.base import Base

#  Time required for the run (12 cases) is approximately 2 minutes.


def before_test_setup(browser):
    dashboard_page = DashboardPage(browser)
    dashboard_page.open_and_load()
    return dashboard_page


def test_discover_page(browser):
    """
      Test Case: TC975 - Discover the ThreeFold Grid
      Steps:
          - Navigate to dashboard.
          - Close profile manager.
          - Click "Discover the ThreeFold Grid" button
      Result: User should be navigated to the explorer stats page.
    """
    dashboard_page = before_test_setup(browser)
    assert dashboard_page.navigate_to_explorer() == (Base.base_url+'explorer/statistics')


def test_manual_page(browser):
    """
      Test Case: TC976 - Your Guide to The ThreeFold Grid
      Steps:
          - Navigate to dashboard.
          - Close profile manager.
          - Swipe to the next option.
          - Click "Learn More" button.
      Result: User should be navigated to the manual page.
    """
    dashboard_page = before_test_setup(browser)
    assert dashboard_page.navigate_to_manual() == 'https://manual.grid.tf/getstarted/tfgrid3_getstarted.html'


def test_create_account(browser):
    """
      Test Cases: TC978 - Create account
      Steps:
          - Navigate to dashboard.
          - Click on Generate account.
          - Enter Password and Confirmation password.
          - Click on Connect.
      Result: Login successfully and account saved.
    """
    dashboard_page = before_test_setup(browser)
    password = generate_string()
    dashboard_page.create_account()
    dashboard_page.accept_terms_conditions()
    dashboard_page.connect_your_wallet(password).click()
    dashboard_page.logout_account()
    assert dashboard_page.login_account(password).is_enabled() == True


def test_import_account(browser):
    """
      Test Cases: TC979 - Import account
      Steps:
          - Navigate to dashboard.
          - Enter Mnemonics, Password and Confirmation password.
          - Click on Connect.
      Result: Login successfully and account saved.
    """
    dashboard_page = before_test_setup(browser)
    password = generate_string()
    dashboard_page.import_account(get_seed())
    dashboard_page.connect_your_wallet(password).click()
    dashboard_page.logout_account()
    assert dashboard_page.login_account(password).is_enabled() == True


def test_account_validation(browser):
    """
      Test Cases: TC1777 - Connect your wallet Validation
      Steps:
          - Navigate to dashboard.
          - verify Mnemonics field.
          - Verify Password field.
          - Verify Confirm Password field.
          - Click on Connect and Logout.
          - verify Lgoin password.
      Result: Every input should have the correct validation.
    """
    dashboard_page = before_test_setup(browser)
    cases = [generate_string(), '123456', '!)$%&@#(+?', 'wrong hat egg gospel crowd foster lonely control cat recipe mean spoon']
    for case in cases:
        dashboard_page.import_account(case)
        assert dashboard_page.wait_for('seem to be valid')
    dashboard_page.import_account('')
    assert dashboard_page.wait_for('Mnemonic is required')
    dashboard_page.import_account(get_seed())
    assert dashboard_page.connect_your_wallet('12345').get_attribute("disabled") == 'true'
    assert dashboard_page.wait_for('Password must be at least 6 characters')
    assert dashboard_page.connect_your_wallet('123456').get_attribute("disabled") == None
    dashboard_page.confirm_password('12345')
    assert dashboard_page.wait_for('Passwords should match')
    dashboard_page.connect_your_wallet('123456').click()
    assert dashboard_page.get_mnemonic() == get_seed()
    dashboard_page.logout_account()
    assert dashboard_page.login_account('12345').get_attribute("disabled") == 'true'
    assert dashboard_page.wait_for('Password must be at least 6 characters')
    assert dashboard_page.login_account('1234567').get_attribute("disabled") == 'true'
    assert dashboard_page.wait_for('Please provide a valid password')
    assert dashboard_page.login_account('').get_attribute("disabled") == 'true'
    assert dashboard_page.wait_for('Password is required')
    assert dashboard_page.login_account('123456').get_attribute("disabled") == None


def test_tft_price(browser):
    """
      Test Case: TC1674 - TFT price
      Steps:
          - Navigate to dashboard.
          - Close profile manager.
          - Click on TFT swap icon.
          - Get TFT price from stellar site.
      Result: Assert TFT in USD and vice versa.
    """
    dashboard_page = before_test_setup(browser)
    browser.find_element(*dashboard_page.close_login_button).click()
    tft_in_usd = float(dashboard_page.tft_price_result()[:-4])
    dashboard_page.tft_price_swap()
    usd_in_tft = float(dashboard_page.tft_price_result()[:-4])
    assert tft_in_usd == dashboard_page.get_tft_price()
    assert 0.99 < tft_in_usd * usd_in_tft < 1.1


def test_login_links(browser):
    """
      Test Case: TC1801 - Verify login profile manager links
      Steps:
          - Navigate to dashboard.
          - Enter Mnemonics, Password and Confirmation password.
          - Click on Connect.
          - Verify Manual and Connect links
      Result: User should be navigated to the Manuak and Connect pages.
    """
    dashboard_page = before_test_setup(browser)
    password = generate_string()
    dashboard_page.import_account(get_seed())
    dashboard_page.connect_your_wallet(password).click()
    assert dashboard_page.manual_link() == 'https://manual.grid.tf/dashboard/dashboard.html#tfchain-wallet'
    assert dashboard_page.connect_manual_link() == 'https://manual.grid.tf/getstarted/TF_Connect/TF_Connect.html'
    assert dashboard_page.get_connect_google_link() == 'https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US'
    assert dashboard_page.get_connect_apple_link() == 'https://apps.apple.com/us/app/threefold-connect/id1459845885'