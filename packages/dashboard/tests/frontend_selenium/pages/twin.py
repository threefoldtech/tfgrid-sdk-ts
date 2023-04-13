from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

"""
This module contains Twin page elements.
"""
class TwinPage:

    accept_terms_condition = (By.XPATH, '//*[@id="app"]/div[3]/div/button')
    relay_list = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[2]/div/form/div/div/div[1]/div[1]/div[1]/div')
    relay_list_imput = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div/div')
    relay_edit_list = (By.XPATH, '//*[@id="app"]/div[4]/div/div/div[1]/form/div/div/div[1]/div[1]/div[1]/div')
    relay_edit_option = (By.XPATH, '/html/body/div[1]/div[5]/div/div/div/div')
    EditButton=(By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[1]/div[2]/div[2]/button')
    SubmitButton=(By.XPATH, '//*[@id="app"]/div[4]/div/div/div[2]/button[2]')
    CreateButton=(By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[2]/div/button')
    BalanceButton=(By.XPATH,'//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div[1]/div[1]/div[1]/button')
    SumButton=(By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div[1]/div[1]/div[2]/button')
    terms_ifram = (By.XPATH, '//*[@id="app"]/div[3]/div/iframe')
    iframe_img_load = (By.XPATH, '//*[@id="main"]/p[1]/img')
    tf_iframe_page = (By.XPATH, '/html/body/main/aside/div[2]/ul[3]/li/a')
    iframe_dialog_icon = (By.XPATH, '//*[@id="cc_dialog"]/div/div[2]/button[1]')
    accept_alert = (By.XPATH, "//*[contains(text(), 'Accepted!')]")

    def __init__(self, browser):
        self.browser = browser
        
    def navigate(self, user):
        self.browser.find_element(By.XPATH, "//*[contains(text(), '"+ user +"')]").click()

    def accept_terms_conditions(self):
        WebDriverWait(self.browser, 30).until(EC.frame_to_be_available_and_switch_to_it(self.terms_ifram))
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.iframe_img_load))
        self.browser.find_element(*self.tf_iframe_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.iframe_img_load))
        self.browser.find_element(*self.iframe_dialog_icon).click()
        self.browser.switch_to.default_content()
        time.sleep(6)
        self.browser.find_element(*self.accept_terms_condition).click()
        time.sleep(6)
        
    def create_twin_valid_relay(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.accept_alert))
        self.browser.find_element(*self.relay_list).click()
        self.browser.find_element(*self.relay_list_imput).click()
        return self.browser.find_element(*self.relay_list).text

    def edit_twin_relay(self):
        self.wait_for('Edit Twin')
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.relay_edit_list))
        self.wait_for('relay')
        self.browser.find_element(*self.relay_edit_list).click()
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.relay_edit_option))
        self.browser.find_element(*self.relay_edit_option).click()
        return self.browser.find_element(*self.relay_edit_list).text
    
    def Check_Balance(self):        
        self.browser.find_element(*self.BalanceButton).click()

    def Sum_sign(self):
        self.browser.find_element(*self.SumButton).click()
    
    def press_edit_btn(self):
        self.browser.find_element(*self.EditButton).click()
    
    def press_submit_btn(self):
        self.browser.find_element(*self.SubmitButton).click()
    
    def press_create_btn(self):
        self.browser.find_element(*self.CreateButton).click()

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True