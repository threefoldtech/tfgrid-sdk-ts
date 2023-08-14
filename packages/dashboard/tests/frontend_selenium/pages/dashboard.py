from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.base import Base

"""
This module contains Dashboard homepage elements.
"""

class DashboardPage:

    dashboard_load_label = (By.XPATH, "//*[contains(text(), 'Connect your TFChain Wallet')]")
    close_login_button = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div[4]/button')
    discover_tfgrid_button = (By.XPATH, "//*[contains(text(), 'View ThreeFold Capacity')]")
    explorer_label = (By.XPATH,"//*[contains(text(), 'Nodes Online')]")
    threefold_guide_label = (By.XPATH, "//*[contains(text(), 'Your Guide to The ThreeFold Grid')]")
    learn_more_button = (By.XPATH, "//*[contains(text(), 'Learn More')]")
    generate_account_button = (By.XPATH, "//*[contains(text(), 'Generate Account')]")
    mnemonic_input = (By.XPATH, "/html/body/div[1]/div[3]/div/div/div[3]/div[2]/form/div[2]/div/div/div[1]/div[1]/input")
    password_input = (By.XPATH, "/html/body/div[1]/div[3]/div/div/div[3]/div[2]/form/div[3]/div/div[1]/div[1]/input")
    confirm_password_input = (By.XPATH, "/html/body/div[1]/div[3]/div/div/div[3]/div[2]/form/div[4]/div/div[1]/div[1]/input")
    connect_button = (By.XPATH, '//*[@id="app"]/div[3]/div/div/div[3]/div[2]/form/div[5]/button')
    login_password_input = (By.XPATH, "/html/body/div[1]/div[3]/div/div/div[3]/div[2]/form/div[2]/div/div[1]/div[1]/input")
    login_button = (By.XPATH, '//*[@id="app"]/div[3]/div/div/div[3]/div[2]/form/div[3]/button')
    terms_iframe = (By.TAG_NAME, 'iframe')
    iframe_load_image = (By.XPATH, '//*[@id="main"]/p[1]/img')
    tf_iframe_button = (By.XPATH, '/html/body/main/aside/div[2]/ul[3]/li/a')
    iframe_dialog_button = (By.XPATH, '//*[@id="cc_dialog"]/div/div[2]/button[1]')
    accept_terms_condition_button = (By.XPATH, '//*[@id="app"]/div[4]/div/button')
    mnemonic_input_reveal_button = (By.XPATH, '//*[@id="app"]/div[3]/div/div/div[3]/div/form/div/div/div[1]/div[2]/div/button')
    mnemonic_login_input = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div[3]/div/form/div/div/div[1]/div[1]/input')
    logout_button = (By.XPATH, "//*[contains(text(), 'Logout')]")
    tft_price_label = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[2]/div/div/div/p[2]')
    tft_swap_button = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[2]/div/div/div/button/span/i')
    tft_info_button = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[2]/div/div/div/button[2]/span/i')
    stellar_tft_price_label = (By.XPATH, '/html/body/div/div/div[3]/div/div/div[3]/div[1]/div[1]/dl/dd[9]/span')
    manual_button = (By.XPATH, "//*[contains(text(), 'the manual')]")
    connect_manual_button = (By.XPATH, "//*[contains(text(), 'ThreeFold Connect')]")
    connect_google_button = (By.XPATH, '//*[@id="app"]/div[3]/div/div/div[3]/div/section/div/a[1]')
    connect_apple_button = (By.XPATH, '//*[@id="app"]/div[3]/div/div/div[3]/div/section/div/a[2]')


    def __init__(self, browser):
        self.browser = browser
    
    def open_and_load(self):
        self.browser.get(Base.base_url)
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.dashboard_load_label))

    def navigate_to_explorer(self):
        self.browser.find_element(*self.close_login_button).click()
        self.browser.find_element(*self.discover_tfgrid_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.explorer_label))
        return self.browser.current_url

    def navigate_to_manual(self):
        self.browser.find_element(*self.close_login_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.threefold_guide_label))
        self.browser.find_element(*self.learn_more_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url
    
    def create_account(self):
        self.browser.find_element(*self.generate_account_button).click()

    def accept_terms_conditions(self):
        WebDriverWait(self.browser, 30).until(EC.frame_to_be_available_and_switch_to_it(self.terms_iframe))
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.iframe_load_image))
        self.browser.find_element(*self.tf_iframe_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.iframe_load_image))
        self.browser.find_element(*self.iframe_dialog_button).click()
        self.browser.switch_to.default_content()
        self.browser.find_element(*self.accept_terms_condition_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.generate_account_button))
        self.browser.switch_to.window(self.browser.window_handles[0])
        
    def import_account(self, seed):
        self.browser.find_element(*self.mnemonic_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.mnemonic_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.mnemonic_input).send_keys(seed)
    
    def connect_your_wallet(self, password):
        self.browser.find_element(*self.password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.password_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.password_input).send_keys(password)
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.confirm_password_input).send_keys(password)
        return self.browser.find_element(*self.connect_button)
    
    def confirm_password(self, password): 
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.DELETE)       
        self.browser.find_element(*self.confirm_password_input).send_keys(password)
    
    def login_account(self, password):
        self.browser.find_element(*self.login_password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.login_password_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.login_password_input).send_keys(password)
        return self.browser.find_element(*self.login_button)
    
    def get_mnemonic(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.logout_button))
        self.browser.find_element(*self.mnemonic_input_reveal_button).click()
        return self.browser.find_element(*self.mnemonic_login_input).get_attribute("value")
    
    def logout_account(self):
        self.browser.find_element(*self.logout_button).click()
        self.browser.refresh()
        alert = Alert(self.browser)
        alert.accept()
        self.browser.switch_to.window(self.browser.window_handles[0])
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.dashboard_load_label))

    def tft_price_result(self):
        return self.browser.find_element(*self.tft_price_label).text
    
    def tft_price_swap(self):
        price = self.browser.find_element(*self.tft_price_label).text
        self.browser.find_element(*self.tft_swap_button).click()
        while (price == self.browser.find_element(*self.tft_price_label).text):
            WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '1 USD')]")))

    def get_tft_price(self):
        self.browser.find_element(*self.tft_info_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return round(float(self.browser.find_element(*self.stellar_tft_price_label).text[:6]), 3)
    
    def get_link(self):
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url
    
    def manual_link(self):
        self.browser.find_element(*self.manual_button).click()
        return self.get_link()
    
    def connect_manual_link(self):
        self.browser.find_element(*self.connect_manual_button).click()
        return self.get_link()
    
    def get_connect_google_link(self):
        self.browser.find_element(*self.connect_google_button).click()
        return self.get_link()
    
    def get_connect_apple_link(self):
        self.browser.find_element(*self.connect_apple_button).click()
        return self.get_link()

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True