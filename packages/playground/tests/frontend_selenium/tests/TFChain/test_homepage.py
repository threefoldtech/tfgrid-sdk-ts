import math
from utils.grid_proxy import GridProxy
from pages.dashboard import DashboardPage
from utils.utils import generate_string, get_seed, get_email
from utils.base import Base
import pytest

#  Time required for the run (8 cases) is approximately 03:40 minutes.


def before_test_setup(browser):
    dashboard_page = DashboardPage(browser)
    dashboard_page.open_and_load()
    return dashboard_page


def test_validate_homepage_links(browser):
    """
      TC975 - Validate homepage links
      Steps:
          - Navigate to dashboard.
          - Close profile manager.
          - Check [Find More! - Explore ThreeFold Grid Capacity - Learn About The Gird].
      Result: User should be navigated to the correct page with no errors.
    """
    dashboard_page = before_test_setup(browser)
    assert dashboard_page.navigate_to_find_more() == ('https://threefold.io/')
    assert dashboard_page.navigate_to_explore_capacity() == (Base.stats_url)
    if Base.net in ['dev', 'local']:
        manual_link = 'https://manual.dev.grid.tf/'
    else:
        manual_link = 'https://manual.grid.tf/'
    assert dashboard_page.navigate_to_learn_about_grid() == (manual_link)


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
    dashboard_page.press_esc_key()
    tft_in_usd = float(dashboard_page.tft_price_result()[:-4])
    dashboard_page.tft_price_swap()
    usd_in_tft = float(dashboard_page.usd_price_result()[:-4])
    # Consider that the original value has a precision of 7 digits, but it's approximated to only 3 digits.
    # An error of 0.002 is considered acceptable.
    assert math.isclose(dashboard_page.get_tft_price(), tft_in_usd, abs_tol=0.002)
    assert 0.99 < tft_in_usd * usd_in_tft < 1.1


def test_stats(browser):
    """
      Test Case: TC1674 - TFT stats
      Steps:
          - Navigate to dashboard.
          - Close profile manager.
          - Get stats number from the cards.
          - Get stats number from stats endpoint.
      Result: Assert both stats.
    """
    dashboard_page = before_test_setup(browser)
    grid_proxy = GridProxy(browser)
    stats = grid_proxy.get_stats_capicity()
    dashboard_stats = dashboard_page.get_dashboard_stats()
    assert stats == dashboard_stats


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
    dashboard_page.press_esc_key()
    assert dashboard_page.manual_page() == 'https://manual.grid.tf/'

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
    dashboard_page.click_button(dashboard_page.connect_your_wallet(get_email(), password))
    dashboard_page.logout_account()
    dashboard_page.login_account(password, True)


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
    assert dashboard_page.wait_for('Mnemonic or Hex Seed is valid.')
    connect_button = dashboard_page.connect_your_wallet(get_email(), password)
    dashboard_page.click_button(connect_button)
    dashboard_page.logout_account()
    dashboard_page.login_account(password, True)


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
    grid_proxy = GridProxy(browser)
    mnemonics_cases = [
        generate_string(),
        '123456',
        '!)$%&@#(+?',
        '0x123456ae7be88dc11f7',
        'wrong hat egg gospel crowd foster lonely control cat recipe mean spoon'
    ]
    for case in mnemonics_cases:
        dashboard_page.import_account(case, False)
        assert dashboard_page.wait_for("Mnemonic or Hex Seed doesn't seem to be valid.")
    dashboard_page.import_account('', False)
    assert dashboard_page.wait_for('Mnemonic or Hex Seed is required.')
    dashboard_page.import_account(get_seed())
    email_cases = [generate_string(), '123456', '!)$%&@#(+?', '1@c@vva.ca', '1f@test,com', '@test.com', 'test@.com', 'test@com']
    for case in email_cases:
        assert not dashboard_page.connect_your_wallet(case, '123456').is_enabled()
        assert dashboard_page.wait_for('Please provide a valid email address')
    assert not dashboard_page.connect_your_wallet('', '123456').is_enabled()
    assert dashboard_page.wait_for('Email is required')
    assert not dashboard_page.connect_your_wallet(get_email(), '12345').is_enabled()
    assert dashboard_page.wait_for('Password must be at least 6 characters')
    dashboard_page.connect_your_wallet(get_email(), '123456')
    dashboard_page.confirm_password('12345')
    assert dashboard_page.wait_for('Passwords should match')
    dashboard_page.click_button(dashboard_page.connect_your_wallet(get_email(), '123456'))
    dashboard_page.open_profile()
    assert dashboard_page.get_mnemonic() == get_seed()
    assert dashboard_page.get_email() == get_email()
    assert grid_proxy.get_twin_address(dashboard_page.get_id()) == dashboard_page.get_address()
    dashboard_page.logout_account()
    assert not dashboard_page.login_account('12345').is_enabled()
    assert dashboard_page.wait_for('Password must be at least 6 characters')
    assert not dashboard_page.login_account('1234567').is_enabled()
    assert dashboard_page.wait_for("We couldn't find a matching wallet for this password. Please connect your wallet first.")
    assert not dashboard_page.login_account('').is_enabled()
    assert dashboard_page.wait_for('Password is required')
    dashboard_page.login_account('123456', True)


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
    dashboard_page.click_button(dashboard_page.connect_your_wallet(get_email(), password))
    dashboard_page.open_profile()
    if Base.net in ['dev', 'local']:
        wallet_manual_link = 'https://manual.dev.grid.tf/labs/documentation/dashboard/wallet_connector/'
        tf_connect_app_link = 'https://manual.dev.grid.tf/labs/documentation/threefold_token/storing_tft/tf_connect_app/'
    else:
        wallet_manual_link = 'https://manual.grid.tf/labs/documentation/dashboard/wallet_connector/'
        tf_connect_app_link = 'https://manual.grid.tf/labs/documentation/threefold_token/storing_tft/tf_connect_app/'
    assert dashboard_page.manual_link() == wallet_manual_link
    assert dashboard_page.connect_manual_link() == tf_connect_app_link
    assert dashboard_page.get_connect_google_link() == 'https://play.google.com/store/apps/details?id=org.jimber.threebotlogin&hl=en&gl=US'
    assert dashboard_page.get_connect_apple_link() == 'https://apps.apple.com/us/app/threefold-connect/id1459845885'
