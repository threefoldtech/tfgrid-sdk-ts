from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Transfer page elements.
"""

class TransferPage:
    
    transfer_page = (By.XPATH, '//*[@id="app"]/div[1]/nav/div[1]/div[1]/div[2]/div[2]/div/div/a[3]/div[2]')
    twin_page = (By.XPATH, '//*[@id="app"]/div[1]/nav/div[1]/div[1]/div[2]/div[2]/div/div/a[1]/div[2]')
    amount_textfield = (By.XPATH, '/html/body/div[1]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div/div/form/div[2]/div/div[1]/div/input')
    receipient_textfield = (By.XPATH, '/html/body/div[1]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div/div/form/div[1]/div/div[1]/div[1]/input[1]')
    submit_button = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div/div/div/button[2]')
    submit_id_button = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div[2]/div/div/button[2]')
    address = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div/div')
    twin_details = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    transfer_tft_title = (By.XPATH, "//*[contains(text(), 'Transfer TFTs on the TFChain')]")
    balance_text = (By.XPATH,'//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div/section/div[1]/div/p/span[1]')
    balance_transfer = (By.XPATH,'//*[@id="app"]/div[2]/div[1]/header/div/div[3]/div/section/div[1]/div/p/span[1]')
    close_login_button = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div[4]/button')
    twin_address_text = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[2]/div[2]')
    twin_id_input = (By.XPATH, '/html/body/div[1]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div[2]/div/form/div[1]/div/div[1]/div[1]/input[1]')
    twin_id_amount_input = (By.XPATH, '/html/body/div[1]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div/div[2]/div/form/div[2]/div/div[1]/div/input')
    twin_id_label = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[2]/div[1]')
    by_twin_id_button = (By.XPATH, "//*[contains(text(), ' By Twin ID ')]")

    def __init__(self, browser):
        self.browser = browser
    
    def navigate(self):
        self.browser.find_element(*self.close_login_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_page))
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))

    def recipient_list(self):
        self.browser.find_element(*self.receipient_textfield).click()
        return self.browser.find_element(*self.address).text

    def recipient_input(self, data):
        self.browser.find_element(*self.receipient_textfield).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.receipient_textfield).send_keys(Keys.DELETE)
        self.browser.find_element(*self.receipient_textfield).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
        
    def recipient_id_input(self, data):
        self.browser.find_element(*self.twin_id_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_id_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_id_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
    
    def amount_tft_input(self, data):
        self.browser.find_element(*self.amount_textfield).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.amount_textfield).send_keys(Keys.DELETE)
        self.browser.find_element(*self.amount_textfield).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
        
    def amount_tft_id_input(self, data):
        self.browser.find_element(*self.twin_id_amount_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_id_amount_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_id_amount_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
    
    def by_twin_id(self):
        self.browser.find_element(*self.by_twin_id_button).click()
    
    def get_twin_address(self):
        self.browser.find_element(*self.twin_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        twin_address = self.browser.find_element(*self.twin_address_text).text
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        return twin_address
    
    def get_twin_id(self):
        self.browser.find_element(*self.twin_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        twin_id = self.browser.find_element(*self.twin_id_label).text
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        return twin_id

    def get_balance(self):
        return self.browser.find_element(*self.balance_text).text[9:-4]

    def get_balance_transfer(self, balance):
        new_balance = self.browser.find_element(*self.balance_text).text[9:-4]
        self.browser.refresh()
        alert = Alert(self.browser)
        alert.accept()
        while(new_balance==balance):
            new_balance = self.browser.find_element(*self.balance_transfer).text[9:-4]
        return new_balance

    def get_submit(self):
        return self.browser.find_element(*self.submit_button)
    
    def get_id_submit(self):
        return self.browser.find_element(*self.submit_id_button)

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True
