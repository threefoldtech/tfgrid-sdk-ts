from utils.utils import generate_leters, generate_string, get_seed, valid_amount, invalid_address, invalid_amount, invalid_amount_negtive
from pages.polka import PolkaPage
from pages.transfer import TransferPage

#  Time required for the run (10 cases) is approximately 2 minutes.

def before_test_setup(browser, add_account):
    transfer_page = TransferPage(browser)
    polka_page = PolkaPage(browser)
    user = generate_string()
    password = generate_string()
    polka_page.load_and_authenticate()
    polka_page.import_account(get_seed(), user, password)
    if(add_account):
        user1 = generate_string()
        polka_page.add_account(user1, password)
        twin_address = transfer_page.get_second_twin_address()
    else:
        twin_address = transfer_page.get_twin_address()
    transfer_page.navigate(user)
    return transfer_page, polka_page, password, twin_address

def test_transfer_page(browser):
    """
      Test Case: TC982 - Navigate to transfer
      Steps:
          - Navigate to the dashboard.
          - Select an account.
          - Click on Transfer from side menu.
      Result: User should be navigated to Transfer page.
    """
    before_test_setup(browser, False)
    assert 'Transfer TFTs on the TFChain' in browser.page_source


def test_recipient_list(browser):
    """
      Test Case: TC983 - Recipient List
      Steps:
          - Navigate to the dashboard.
          - Create 2 accounts.
          - Select an account.
          - Click on Transfer from side menu
          - Click on recipient list
      Result: Other unselected account twin address should be the only listed.
    """
    transfer_page, _, _, twin_address = before_test_setup(browser, True)
    assert transfer_page.recipient_list() == twin_address


def test_valid_receipient(browser):
    """
    Test Case: TC984 - Valid Receipient
      Steps:
          -Navigate to the dashboard.
          -Select an account.
          -Click on Transfer from side menu. -Type valid address in recipient input.
      Results: Accepting address with no alerts
    """
    transfer_page, _, _, twin_address = before_test_setup(browser, False)
    transfer_page.recipient_input(twin_address)
    transfer_page.amount_tft_input(valid_amount())
    assert transfer_page.get_submit().is_enabled() == True


def test_invalid_address(browser):
    """
    Test Case: TC985 -Invalid Address
    Steps:
      - Navigate to the dashboard.
      - Select an account.
      - Click on Transfer from side menu.
      - Type invalid address in recipient input.
    Results: Alert message "invalid address"
    """
    transfer_page, _, _, _ = before_test_setup(browser, False)
    cases = [' ', generate_string(), invalid_address(), generate_leters()]
    transfer_page.amount_tft_input(valid_amount())
    for case in cases:
      transfer_page.recipient_input(case)
      assert transfer_page.get_submit().is_enabled() == False
      assert transfer_page.wait_for('invalid address')
    

def test_valid_amount(browser):
    """
    Test Case: TC986 - Valid amount
    Steps:
        - Navigate to the dashboard.
        - Select an account.
        - Click on Transfer from side menu.
        - Type valid amount in TFT input.
    Result: User gets no alerts
    """
    transfer_page, _, _, twin_address = before_test_setup(browser, False)
    transfer_page.recipient_input(twin_address)
    transfer_page.amount_tft_input(valid_amount())
    assert transfer_page.get_submit().is_enabled() == True


def test_invalid_amount(browser):
    """
    Test Case: TC987 - InValid amount
    Steps:
        - Navigate to the dashboard.
        - Select an account.
        - Click on Transfer from side menu.
        - Type Invalid amount in TFT input.
    Result: Alert with message "Amount cannot be negative or 0"
    """
    transfer_page, _, _, twin_address = before_test_setup(browser, False)
    transfer_page.recipient_input(twin_address)
    balance = transfer_page.get_balance()
    cases = [0, -900.009, invalid_amount_negtive()]
    for case in cases:
      transfer_page.amount_tft_input(case)
      assert transfer_page.get_submit().is_enabled() == False
      assert transfer_page.wait_for('Amount cannot be negative or 0')
    transfer_page.amount_tft_input(invalid_amount())
    assert transfer_page.get_submit().is_enabled() == False
    assert transfer_page.wait_for('Amount must have 3 decimals only')
    transfer_page.amount_tft_input(format(float(balance)+100,'.3f'))
    assert transfer_page.get_submit().is_enabled() == False
    assert transfer_page.wait_for('Amount cannot exceed balance')


def test_transfer_TFTs_on_TFChain (browser):
    """
    Test Case: TC988 -Transfer TFTs on the TFChain
    Steps:
        - Navigate to the dashboard.
        - Select an account.
        - Click on Transfer from side menu.
        - Type valid address in recipient input.
        - Type valid amount in TFT input.
        - Click submit button.
    Result: Amount should dedicate from this account twin and transferred to the typed address.
    """
    transfer_page, polka_page, password, twin_address = before_test_setup(browser, True)
    balance = transfer_page.get_balance()
    min_balance = float(balance)-1
    max_balance = float(balance)-1.1
    transfer_page.recipient_input(twin_address)
    transfer_page.amount_tft_input(1.01)
    transfer_page.get_submit().click()
    polka_page.authenticate_with_pass(password)
    assert transfer_page.wait_for('Transfer succeeded!')
    assert format(float(max_balance),'.3f') <= format(float(transfer_page.get_balance_transfer(balance)),'.3f') <= format(float(min_balance),'.3f')
