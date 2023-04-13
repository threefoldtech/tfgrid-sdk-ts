from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Swap page elements.
"""

class SwapPage:

    swap=(By.XPATH, '//*[@id="app"]/div[1]/nav/div[1]/div[1]/div[2]/div[2]/div/div/a[2]/div[2]/div')
    twin_details = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    stellar_choose=(By.XPATH, "//*[contains(text(), 'stellar')]") 
    stellar=(By.XPATH,'//*[@role="option"]')
    deposit=(By.XPATH, "//*[contains(text(), 'deposit')]")
    withdraw=(By.XPATH, "//*[contains(text(), 'withdraw')]")
    howdone=(By.XPATH, "//*[contains(text(), 'How is it done?')]")
    submit_button=(By.XPATH, "//*[@id='app']/div[5]/div/div/div[3]/button[2]")
    stellar_address=(By.XPATH, '/html/body/div[1]/div[5]/div/div/div[2]/form/div[1]/div/div[1]/div/input')
    amount_tft=(By.XPATH, '/html/body/div[1]/div[5]/div/div/div[2]/form/div[2]/div/div[1]/div/input')
    transfer_tft_title = (By.XPATH, "//*[contains(text(), 'Transfer TFT Across Chains')]")
    twin_address_text = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/div/div/div/div[2]')
    tft_amount_text = (By.XPATH,"//*[contains(text(), 'Amount: should be larger than 1TFT (deposit fee is: 1TFT)')]")
    deposite_bridge_address = (By.XPATH, "//*[@id='app']/div[5]/div/div/div[1]/div/div[1]/div[1]/ul/li[1]/b")
    twin_id_text = (By.XPATH,"//*[@id='app']/div[5]/div/div/div[1]/div/div[1]/div[1]/ul/li[2]/b")
    balance_text = (By.XPATH,'//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div[1]/div[1]/div[1]/button/span/p[1]')
    balance_withdraw = (By.XPATH,'//*[@id="app"]/div[2]/div[1]/header/div/div[3]/div[1]/div[1]/div[1]/button/span/p[1]')
    
    def __init__(self, browser):
        self.browser = browser

    def navigate_to_swap(self, user):
        self.browser.find_element(By.XPATH, "//*[contains(text(), '"+ user +"')]").click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.swap))
        self.browser.find_element(*self.swap).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
    
    def twin_address(self):
        self.browser.refresh()
        return self.browser.find_element(*self.twin_address_text).text 

    def transfer_chain(self):
        self.browser.find_element(*self.stellar_choose).click()
        self.browser.find_element(*self.stellar).click()

    def choose_deposit(self):
        self.browser.find_element(*self.deposit).click()

    def choose_withdraw(self):
        self.browser.find_element(*self.withdraw).click()

    def how_it_done(self):
        self.browser.find_element(*self.howdone).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url
    
    def check_deposit(self):
        self.browser.find_element(*self.deposit).click() 
        amount_text = self.browser.find_element(*self.tft_amount_text).text
        bridge_address = self.browser.find_element(*self.deposite_bridge_address).text
        twin_id = self.browser.find_element(*self.twin_id_text).text
        return twin_id, amount_text, bridge_address

    def setup_withdraw_tft(self, data):
        self.browser.find_element(*self.withdraw).click()
        self.browser.find_element(*self.amount_tft).send_keys(data)
    
    def setup_widthdraw_address(self, data):
        balance = self.browser.find_element(*self.balance_text).text
        self.browser.find_element(*self.withdraw).click()
        self.browser.find_element(*self.stellar_address).send_keys(data)
        return balance

    def check_withdraw_invalid_stellar(self, data):
        self.browser.find_element(*self.stellar_address).send_keys(data)
        return self.browser.find_element(*self.submit_button).is_enabled()

    def check_withdraw_tft_amount(self, data):
        self.browser.find_element(*self.amount_tft).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.amount_tft).send_keys(Keys.DELETE)
        self.browser.find_element(*self.amount_tft).send_keys(data)
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.submit_button))
        return self.browser.find_element(*self.submit_button).is_enabled()

    def check_withdraw_invalid_tft_amount(self, data):
        self.browser.find_element(*self.amount_tft).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.amount_tft).send_keys(Keys.DELETE)
        self.browser.find_element(*self.amount_tft).send_keys(data)
        return self.browser.find_element(*self.submit_button).is_enabled()

    def check_withdraw(self, address, amount):
        self.browser.find_element(*self.withdraw).click()
        self.browser.find_element(*self.stellar_address).send_keys(address)
        self.browser.find_element(*self.amount_tft).send_keys(amount)
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.submit_button))
        return self.browser.find_element(*self.submit_button)
    
    def get_balance(self):
        return self.browser.find_element(*self.balance_text).text
    
    def get_balance_withdraw(self, balance):
        new_balance = self.browser.find_element(*self.balance_withdraw).text
        while(new_balance==balance):
            new_balance = self.browser.find_element(*self.balance_withdraw).text
        return new_balance

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True