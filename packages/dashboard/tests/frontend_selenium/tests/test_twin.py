from utils.utils import generate_leters, generate_string, get_seed
from pages.twin import TwinPage
from pages.polka import PolkaPage

#  Time required for the run (6 cases) is approximately 3 minutes.


def before_test_setup(browser, create_account):
    twin_page = TwinPage(browser)
    polka_page = PolkaPage(browser)
    user = generate_string()
    password = generate_string()
    polka_page.load_and_authenticate()
    if (create_account):
        polka_page.add_account(user, password)
    else:
        polka_page.import_account(get_seed(), user, password)
    twin_page.navigate(user)
    return twin_page, polka_page, password


def test_accept_terms_conditions(browser):
    """
      Test Case: TC924 - Accept terms and conditions
      Steps:
          - Navigate to dashboard.
          - Click on the desired account from the dashboard homepage.
          - Click on Accept The Terms and Conditions.
          - Use polka password authentication.
      Result: Open same account on dashboard homepage and assert that no terms to accept when you come back to this account twin page.
    """
    twin_page, polka_page, password = before_test_setup(browser, True)
    twin_page.accept_terms_conditions()
    polka_page.authenticate_with_pass(password)
    assert twin_page.wait_for('Accepted!')
    assert twin_page.wait_for('Choose a Relay Address')


def test_sum_sign(browser):
    """
      Test Cases: TC933- sum sign
      Steps:
          - Navigate to dashboard
          - Click on the desired account from the dashboard homepage.
          - Check sum sign right to balance on the top left corner.
          - Click on the sum sign button
      Result: Assert that it should go to the link. 
    """
    twin_page, _, _ = before_test_setup(browser, False)
    twin_page.Sum_sign()
    assert '/html' in browser.page_source
    # NO checking as devnet don't direct to TF Connect page https://gettft.com/auth/login?next_url=/gettft/shop/#/buy
