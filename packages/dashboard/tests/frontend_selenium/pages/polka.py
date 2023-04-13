from utils.base import Base
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains all polkadot needed functionality.
"""

class PolkaPage:
  
    polka_understand = (By.XPATH ,'//*[@id="root"]/main/div[4]/button')
    polka_allow = (By.XPATH ,'//*[@id="root"]/main/div[1]/div[2]/div/button')
    polka_menu = (By.XPATH , '//div[@class="popupMenus"]/div[1]')
    polka_add_account = (By.XPATH ,'//*[contains(text(), "Create new account")]') 
    polka_checkbox = (By.XPATH ,'//*[@id="root"]/main/div[6]/label/span')
    polka_next_step = (By.XPATH ,'//*[@id="root"]/main/div[7]/button')
    polka_user_name = (By.XPATH ,'//*[@id="root"]/main/div[4]/div/input')
    polka_user_pass = (By.XPATH ,'//*[@id="root"]/main/div[5]/div/input')
    polka_user_repass = (By.XPATH ,'//*[@id="root"]/main/div[6]/div/input')
    polka_submit = (By.XPATH ,'//*[@id="root"]/main/div[8]/button[2]')
    polka_import_account = (By.XPATH ,'//*[@id="root"]/main/div[1]/div/div[3]/div[4]/a')
    polka_mnemonic_seed = (By.XPATH ,'//*[@id="root"]/main/div[3]/div[1]/textarea')
    polka_next = (By.XPATH ,'//*[@id="root"]/main/div[5]/button')
    polka_import_user = (By.XPATH ,'//*[@id="root"]/main/div[3]/div/input')
    polka_import_pass = (By.XPATH ,'//*[@id="root"]/main/div[4]/div/input')
    polka_import_repass = (By.XPATH ,'//*[@id="root"]/main/div[5]/div/input')
    polka_add_import_account = (By.XPATH ,'//*[@id="root"]/main/div[7]/button[2]')
    polka_account_settings = (By.XPATH ,'//*[@id="root"]/main/div[2]/div[1]/div/div/div[3]')
    polka_forget_account = (By.XPATH ,'//*[@id="root"]/main/div[2]/div[1]/div/div/div[4]/a[4]')
    polka_submit_forget = (By.XPATH ,'//*[@id="root"]/main/div[2]/div/div[3]/button')
    polka_auth_pass = (By.XPATH ,'//*[@id="root"]/main/div[3]/div[1]/div/input')
    polka_auth_submit = (By.XPATH ,'//*[@id="root"]/main/div[3]/button/div[1]')
    dashboard_load = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[1]/div/div/div/div/div/div[1]/div[3]')

    def __init__(self, browser):
        self.browser = browser
      
    def load_and_authenticate(self):
        self.browser.get(Base.base_url)
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.dashboard_load))
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        self.browser.find_element(*self.polka_understand).click()
        self.browser.find_element(*self.polka_allow).click()
        self.browser.switch_to.window(self.browser.window_handles[0])
    
    def add_account(self, name, password):
        self.browser.execute_script("window.open('');")
        self.browser.switch_to.window(self.browser.window_handles[1])
        self.browser.get(Base.extension_url)
        WebDriverWait(self.browser, 30).until(EC.presence_of_element_located(self.polka_menu))
        self.browser.find_element(*self.polka_menu).click()
        self.browser.find_element(*self.polka_add_account).click()
        self.browser.find_element(*self.polka_checkbox).click()
        self.browser.find_element(*self.polka_next_step).click()
        self.browser.find_element(*self.polka_user_name).send_keys(name)
        self.browser.find_element(*self.polka_user_pass).send_keys(password)
        self.browser.find_element(*self.polka_user_repass).send_keys(password)
        self.browser.find_element(*self.polka_submit).click()
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Connected Accounts')]")))

    def import_account(self, seed, name, password):
        self.browser.execute_script("window.open('');")
        self.browser.switch_to.window(self.browser.window_handles[1])
        self.browser.get(Base.extension_url)
        WebDriverWait(self.browser, 30).until(EC.presence_of_element_located(self.polka_menu))
        self.browser.find_element(*self.polka_menu).click()
        self.browser.find_element(*self.polka_import_account).click()
        self.browser.find_element(*self.polka_mnemonic_seed).send_keys(seed)
        self.browser.find_element(*self.polka_next).click()
        self.browser.find_element(*self.polka_import_user).send_keys(name)
        self.browser.find_element(*self.polka_import_pass).send_keys(password)
        self.browser.find_element(*self.polka_import_repass).send_keys(password)
        self.browser.find_element(*self.polka_add_import_account).click()
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])

    def authenticate_with_pass(self, password):
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        self.browser.find_element(*self.polka_auth_pass).send_keys(password)
        self.browser.find_element(*self.polka_auth_submit).click()
        self.browser.switch_to.window(self.browser.window_handles[0])