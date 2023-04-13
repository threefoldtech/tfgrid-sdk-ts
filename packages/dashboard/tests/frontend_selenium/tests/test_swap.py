from utils.utils import generate_leters, generate_string, get_seed, get_stellar_address
from pages.swap import SwapPage
from pages.polka import PolkaPage
from utils.grid_proxy import GridProxy

#  Time required for the run (11 cases) is approximately 3 minutes.


def before_test_setup(browser):
    swap_page = SwapPage(browser)
    polka_page = PolkaPage(browser)
    user = generate_string()
    password = generate_string()
    polka_page.load_and_authenticate()
    polka_page.import_account(get_seed(), user, password)
    swap_page.navigate_to_swap(user)
    return swap_page, polka_page, password


def test_navigate_swap(browser):
    """
      Test Case: TC1112 Navigate swap
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
      Result: swap page open.
    """
    before_test_setup(browser)
    assert 'Transfer TFT Across Chains' in browser.page_source


def test_transfer_chain(browser):
    """
      Test Case: TC1113 transfer chain
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
      Result: Steller should be selected.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()


def test_choose_deposit(browser):
    """
      Test Case: TC1114 choose deposit
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on deposit button.
          - Click on close button.
      Result: Deposit tft will be shown.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    swap_page.choose_deposit()
    assert 'Deposit TFT' in browser.page_source


def test_choose_withdraw(browser):
    """
      Test Case: TC1115 choose withdraw
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Click on close button.
      Result: withdraw tft will be shown.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    swap_page.choose_withdraw()
    assert 'Withdraw TFT' in browser.page_source


def test_how_it_done(browser):
    """
      Test Case: TC1116 how it done
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on how it's done text.
      Result: it will go to link
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    assert swap_page.how_it_done() in 'https://library.threefold.me/info/manual/#/manual__grid3_stellar_tfchain_bridge'


def test_check_deposit(browser):
    """
      Test Case: TC1117 check deposit
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on deposit button.
          - Click on close button.
      Result: Assert that Destination and memo text will come from drid proxy.
    """
    swap_page, _, _ = before_test_setup(browser)
    grid_proxy = GridProxy(browser)
    swap_page.transfer_chain()
    twin_id, amount_text, bridge_address = swap_page.check_deposit()
    assert swap_page.wait_for(amount_text)
    assert bridge_address == 'GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG'
    user_address = swap_page.twin_address()
    assert grid_proxy.get_twin_address(twin_id[twin_id.find('_')+1:]) == user_address


def test_check_withdraw_stellar(browser):
    """
      Test Case: TC1118 check withdraw stellar
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Put stellar Address.
          - Click on close button.
      Result: Assert that stellar address is right.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    assert swap_page.check_withdraw(get_stellar_address(), '1.01').is_enabled() == True


def test_check_withdraw_invalid_stellar(browser):
    """
      Test Case: TC1143 - Check withdraw invalid Stellar address
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Put stellar Address.
          - Click on close button.
      Result: Alert with message "invalid address" should be displayed.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    swap_page.setup_withdraw_tft(0.001)
    cases = [' ', generate_string(), generate_leters(), '!@##$%$E^/>|ز%^(;:^*)']
    for case in cases:
        assert swap_page.check_withdraw_invalid_stellar(case) == False
        assert swap_page.wait_for('invalid address')


def test_check_withdraw_tft_amount(browser):
    """
      Test Case: TC1131 check withdraw tft amount
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Put amount of tft you want to send.
          - Click on close button.
      Result: Assert that the amount of tft is right.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    cases = [1, 0.001, 1.111]
    balance = swap_page.setup_widthdraw_address(get_stellar_address())
    cases.append(format(float(balance)-1, '.3f'))
    for case in cases:
        assert swap_page.check_withdraw_tft_amount(case) == True


def test_check_withdraw_invalid_tft_amount(browser):
    """
      Test Case: TC1144 - Check withdraw invalid TFT amount
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Put amount of tft you want to send.
          - Click on close button.
      Result: Alert with message "Amount cannot be negative or 0" should be displayed.
    """
    swap_page, _, _ = before_test_setup(browser)
    swap_page.transfer_chain()
    balance = swap_page.setup_widthdraw_address(get_stellar_address())
    cases = [0, 0.000, 0.0, -0.1, -1, -22.2, -1.111]
    for case in cases:
        assert swap_page.check_withdraw_invalid_tft_amount(case) == False
        assert swap_page.wait_for('Amount cannot be negative or 0')
    assert swap_page.check_withdraw_invalid_tft_amount('1.0123') == False
    assert swap_page.wait_for('Amount must have 3 decimals only')
    assert swap_page.check_withdraw_invalid_tft_amount(format(float(balance)+100, '.3f')) == False
    assert swap_page.wait_for('Amount cannot exceed balance')


def test_check_withdraw(browser):
    """
      Test Case: TC1132 check withdraw 
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on swap from side menu.
          - Click on chain list.
          - Click on withdraw button.
          - Put stellar Address.
          - Put amount of tft you want to send.
          - Click on close button.
      Result: Assert that Amount of tft should send to the stellar.
    """
    swap_page, polka_page, password = before_test_setup(browser)
    swap_page.transfer_chain()
    balance = swap_page.get_balance()
    min_balance = float(balance)-1
    max_balance = float(balance)-1.1
    swap_page.check_withdraw(get_stellar_address(), '1.01').click()
    polka_page.authenticate_with_pass(password)
    assert swap_page.wait_for('Withdraw submitted!')
    assert format(float(max_balance), '.3f') <= format(float(swap_page.get_balance_withdraw(balance)), '.3f') <= format(float(min_balance), '.3f')
