from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Transfer page elements.
"""

class TransferPage:
    
    transfer_page = (By.XPATH, '//*[@id="app"]/div[1]/nav/div[1]/div[1]/div[2]/div[2]/div/div/a[3]/div[2]')
    amount_textfield=(By.XPATH, '/html/body/div[1]/div[1]/div[3]/div/div/div[2]/form/div[2]/div/div[1]/div/input')
    receipient_textfield=(By.XPATH, '/html/body/div[1]/div[1]/div[3]/div/div/div[2]/form/div[1]/div/div[1]/div[1]/input[1]')
    submit_button=(By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[2]/div/button[2]')
    address=(By.XPATH, '/html/body/div[1]/div[3]/div/div/div/div')
    account_choice=(By.XPATH,'//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/div[1]/div')
    twin_details = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    transfer_tft_title = (By.XPATH, "//*[contains(text(), 'Transfer TFTs on the TFChain')]")
    balance_text = (By.XPATH,'//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div[1]/div[1]/div[1]/button/span/p[1]')
    twin_address_text = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/div/div/div/div[2]')
    second_twin_address_text = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/div[2]/div/div/div[2]') 
    
    def __init__(self, browser):
        self.browser = browser
    
    def navigate(self, user):
        self.browser.find_element(By.XPATH, "//*[contains(text(), '"+ user +"')]").click()
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
    
    def amount_tft_input(self, data):
        self.browser.find_element(*self.amount_textfield).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.amount_textfield).send_keys(Keys.DELETE)
        self.browser.find_element(*self.amount_textfield).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()

    def get_balance(self):
        return self.browser.find_element(*self.balance_text).text

    def get_balance_transfer(self, balance):
        new_balance = self.browser.find_element(*self.balance_text).text
        while(new_balance==balance):
            new_balance = self.browser.find_element(*self.balance_text).text
        return new_balance
        
    def get_submit(self):
        return self.browser.find_element(*self.submit_button)
    
    def get_twin_address(self):
        return self.browser.find_element(*self.twin_address_text).text
    
    def get_second_twin_address(self):
        return self.browser.find_element(*self.second_twin_address_text).text

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True
