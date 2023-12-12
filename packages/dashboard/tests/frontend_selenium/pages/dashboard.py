from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils.base import Base
import time

"""
This module contains Dashboard homepage elements.
"""

class DashboardPage:

    profile_load_label = (By.XPATH, "//*[contains(text(), 'TFChain Wallet')]")
    close_login_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[6]/button[1]')
    threefold_load_label = (By.XPATH, "//*[contains(text(), 'A Co-Owned Global Sovereign Internet')]")
    manual_button = (By.XPATH, "//*[contains(text(), 'the manual')]")
    find_more_button = (By.XPATH, "//*[contains(text(), 'Find More!')]")
    Explore_grid_capacity_button = (By.XPATH, "/html/body/div[1]/div/div/main/div/div[2]/div/div/div[2]/div[2]/div[3]/a")
    learn_about_grid_button = (By.XPATH,"/html/body/div[1]/div/div/main/div/div[2]/div/div/div[2]/div[3]/div/a[1]") 
    use_grid_button = (By.XPATH,"/html/body/div[1]/div/div/main/div/div[2]/div/div/div[2]/div[3]/div/a[2]")
    tft_price_label = (By.XPATH, '/html/body/div[1]/div/div/main/header/div/div[2]/div/div/div/p[2]')
    tft_swap_button = (By.XPATH, '/html/body/div[1]/div/div/main/header/div/div[2]/div/div/div/button[1]/span[3]/i')
    tft_info_button = (By.XPATH, '/html/body/div[1]/div/div/main/header/div/div[2]/div/div/div/button[2]/span[3]/i')
    stellar_tft_price_label = (By.XPATH, '/html/body/div/div/div[3]/div/div/div[3]/div[1]/div[1]/dl/dd[9]/span')
    mnemonic_input = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[2]/div/div[1]/div/div[3]/input")
    password_input = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[4]/div/div[1]/div/div[3]/input")
    confirm_password_input = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[5]/div[1]/div/div[3]/input")
    generate_account_button = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[3]/button[2]")
    connect_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[6]/button[2]')
    logout_button = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[3]/button[2]")
    login_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item[1]/div/form/div[3]/button[2]')
    login_password_input = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item[1]/div/form/div[2]/div/div[1]/div/div[3]/input")
    accept_terms_condition_button = (By.XPATH, '/html/body/div[2]/div[26]/div[2]/button')
    connect_manual_button = (By.XPATH, "/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[2]/div[2]/section/p/a")
    connect_google_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[2]/div[2]/section/div/a[1]')
    connect_apple_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[2]/div[2]/section/div/a[2]')
    terms_iframe = (By.TAG_NAME, 'iframe')
    iframe_load_image = (By.XPATH, '//*[@id="main"]/p[1]/img')
    tf_iframe_button = (By.XPATH, '/html/body/main/aside/div[2]/ul[3]/li/a')
    iframe_dialog_button = (By.XPATH, '//*[@id="cc_dialog"]/div/div[2]/button[1]')
    hex_input_reveal_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div/div[4]/i')
    hex_login_input = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div/div[3]/input')
    manual_button = (By.XPATH, "//*[contains(text(), 'the manual')]")


    def __init__(self, browser):
        self.browser = browser
    
    def open_and_load(self):
        self.browser.get(Base.base_url)
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.profile_load_label))
        time.sleep(3)

    def navigate_to_manual(self):
        self.browser.find_element(*self.manual_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url =  self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        self.browser.find_element(*self.close_login_button).click()
        return url

    def navigate_to_find_more(self):
        self.browser.find_element(*self.close_login_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.find_more_button))
        self.browser.find_element(*self.find_more_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url

    def navigate_to_explore_capacity(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.Explore_grid_capacity_button))
        self.browser.find_element(*self.Explore_grid_capacity_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url

    def navigate_to_learn_about_grid(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.learn_about_grid_button))
        self.browser.find_element(*self.learn_about_grid_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url

    def navigate_to_use_grid_button(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.use_grid_button))
        self.browser.find_element(*self.use_grid_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url
        
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

    def logout_account(self):
        self.browser.find_element(*self.logout_button).click()
        self.browser.refresh()
        alert = Alert(self.browser)
        alert.accept()
        self.browser.switch_to.window(self.browser.window_handles[0])
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.profile_load_label))
    
    def login_account(self, password):
        self.browser.find_element(*self.login_password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.login_password_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.login_password_input).send_keys(password)
        return self.browser.find_element(*self.login_button)

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
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.password_input))

    def click_button(self, button):
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(button))
        button.click()

    def confirm_password(self, password): 
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.confirm_password_input).send_keys(Keys.DELETE)       
        self.browser.find_element(*self.confirm_password_input).send_keys(password)
    
    def get_hex(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.logout_button))
        self.browser.find_element(*self.hex_input_reveal_button).click()
        return self.browser.find_element(*self.hex_login_input).get_attribute("value")

    def tft_price_result(self):
        return self.browser.find_element(*self.tft_price_label).text
    
    def tft_price_swap(self):
        price = self.browser.find_element(*self.tft_price_label).text
        self.browser.find_element(*self.tft_swap_button).click()
        while (price == self.browser.find_element(*self.tft_price_label).text):
            WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '1 USD')]")))
        self.browser.find_element(*self.threefold_load_label).click()

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

    def wait_for_button(self, button):
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(button))
        return button
    
    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True