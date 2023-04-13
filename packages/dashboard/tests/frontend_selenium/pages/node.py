from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Dedicate Node page elements.
"""

class NodePage:

    farm_page = (By.XPATH , "//*[contains(text(), 'farms')]")
    node_page = (By.XPATH , "//*[contains(text(), 'Your Farm Nodes')]")
    twin_id_label = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[1]/div[2]/div[1]/div[1]')
    search_node_input = (By.XPATH, '/html/body/div[1]/div[1]/div[3]/div/div/div[5]/div/div[1]/div/div[1]/div/input')
    node_table = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div[5]/div[2]/div[1]/div[1]/table/tbody/tr')
    node_id = (By.XPATH , "//*[contains(text(), 'Node ID')]")
    farm_id = (By.XPATH , '//*[@id="app"]/div[1]/div[3]/div/div/div[5]/div[2]/div[1]/div[1]/table/thead/tr/th[3]')
    country = (By.XPATH , "//*[contains(text(), 'Country')]")
    serial_number = (By.XPATH , "//*[contains(text(), 'Serial Number')]")
    status = (By.XPATH , "//*[contains(text(), 'Status')]")
    id = (By.XPATH , "//*[contains(text(), 'Add a public config to your node with ID:')]")
    update_msg = (By.XPATH , "//*[contains(text(), 'This action is irreversible')]")
    ipv4 = (By.XPATH , '/html/body/div[1]/div[4]/div/div/div[2]/form/div[1]/div/div[1]/div/input')
    ipv4_gateway = (By.XPATH , '/html/body/div[1]/div[4]/div/div/div[2]/form/div[2]/div/div[1]/div/input')
    ipv6 = (By.XPATH , '/html/body/div[1]/div[4]/div/div/div[2]/form/div[3]/div/div[1]/div/input')
    ipv6_gateway = (By.XPATH , '/html/body/div[1]/div[4]/div/div/div[2]/form/div[4]/div/div[1]/div/input')
    domain = (By.XPATH , '/html/body/div[1]/div[4]/div/div/div[2]/form/div[5]/div/div[1]/div/input')
    remove = (By.XPATH , '//*[@id="app"]/div[4]/div/div/div[3]/button[1]')
    cancel = (By.XPATH , '//*[@id="app"]/div[4]/div/div/div[3]/button[2]')
    save = (By.XPATH , '//*[@id="app"]/div[4]/div/div/div[3]/button[3]')
    submit = (By.XPATH , '//*[@id="app"]/div[6]/div/div/div[3]/button[1]')
    table_xpath = '//*[@id="app"]/div[1]/div[3]/div/div/div[5]/div[2]/div[1]/div[1]/table/tbody/tr'

    def __init__(self, browser):
        self.browser = browser
      
    def navigate(self, user):
        self.browser.find_element(By.XPATH, "//*[contains(text(), '"+ user +"')]").click()
        id = self.browser.find_element(*self.twin_id_label).text
        self.twin_id = int(id[id.find(':')+2:])
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.farm_page))
        self.browser.find_element(*self.farm_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.node_page))
    
    def search_nodes(self, node):
        self.browser.find_element(*self.search_node_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.search_node_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.search_node_input).send_keys(node)
    
    def get_node_count(self):
        return len(self.browser.find_elements(*self.node_table))
    
    def get_node_id(self, node_list):
        ids = []
        for node in node_list:
            ids.append(node['nodeId']) 
        return ids
    
    def get_farm_id(self, node_list):
        ids = []
        for node in node_list:
            ids.append(node['farmId']) 
        return ids
    
    def get_country(self, node_list):
        country = []
        for node in node_list:
            country.append(node['country']) 
        return country
    
    def get_serial_number(self, node_list):
        numbers = []
        for node in node_list:
            numbers.append(node['serialNumber']) 
        return numbers
    
    def get_status(self, node_list):
        status = []
        for node in node_list:
            status.append(node['status']) 
        return status

    def sort_node_id(self):
        self.browser.find_element(*self.node_id).click()
        node_id = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            node_id.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[2]").text))
        return node_id

    def sort_farm_id(self):
        self.browser.find_element(*self.farm_id).click()
        farm_id = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            farm_id.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[3]").text))
        return farm_id

    def sort_country(self):
        self.browser.find_element(*self.country).click()
        country = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            country.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[4]").text)
        return country

    def sort_serial_number(self):
        self.browser.find_element(*self.serial_number).click()
        serial_number = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            serial_number.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[5]").text)
        return serial_number

    def sort_status(self):
        self.browser.find_element(*self.status).click()
        status = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            status.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[6]").text)
        return status
    
    def node_details(self):
        self.browser.find_element(*self.node_id).click()
        nodes = []
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            self.browser.execute_script("window.scrollTo(0,document.body.scrollHeight)")
            self.browser.find_element(By.XPATH, self.table_xpath+ '['+ str(i) +']/td[1]/button').click()
            self.browser.execute_script("window.scrollTo(0,document.body.scrollHeight)")
            details = []
            WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, self.table_xpath+ '['+ str(i) +']/td[7]/button')))
            WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable((By.XPATH, self.table_xpath+ '['+ str(i) +']/td[7]/button')))
            self.browser.find_element(By.XPATH, self.table_xpath+ '['+ str(i) +']/td[7]/button').click()
            WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.id))
            details.append(self.browser.find_element(*self.id).text[42:]) # ID
            details.append(self.browser.find_element(*self.ipv4).text) # IPV4
            details.append(self.browser.find_element(*self.ipv4_gateway).text) # IPV4 Gateway
            details.append(self.browser.find_element(*self.ipv6).text) # IPV6
            details.append(self.browser.find_element(*self.ipv6_gateway).text) # IPV6 Gateway
            details.append(self.browser.find_element(*self.domain).text) # Domain
            self.browser.find_element(*self.cancel).click()
            self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[2]/div/div").click()
            self.browser.execute_script("window.scrollTo(0,document.body.scrollHeight)")
            details.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[1]/div[2]/span").text)) # Node ID
            details.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[2]/div[2]/span").text)) # Farm ID
            details.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[3]/div[2]/span").text)) # Twin ID
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[7]/div[2]/span").text) # Country
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[8]/div[2]/span").text) # City
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[5]/div[2]/span").text) # Created Time
            details.append(int(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[10]/div[2]/span").text)) # Farming Policy ID
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[6]/div[2]/span").text) # Updated Time
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[2]/div/div/div/div/div/div[1]/div[2]/span[2]").text) # CRU
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[2]/div/div/div/div/div/div[4]/div[2]/span[2]").text) # SRU
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[2]/div/div/div/div/div/div[2]/div[2]/span[2]").text) # HRU
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[2]/div/div/div/div/div/div[3]/div[2]/span[2]").text) # MRU
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[6]/p/span/span").text) # Status
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[4]/div[2]/span").text) # Certification
            details.append(self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i+1)}]/td/div[1]/div/div/div[9]/div[2]/span").text) # Serial Number
            nodes.append(details)
        return nodes
    
    def setup_config(self, node_id):
        for i in range(1, len(self.browser.find_elements(*self.node_table))+1):
            if (self.browser.find_element(By.XPATH, f"{self.table_xpath}[{str(i)}]/td[2]/p").text==str(node_id)):
                self.browser.find_element(By.XPATH, self.table_xpath+ '['+ str(i) +']/td[7]/button').click()
                WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.id))

    def add_config_input(self, ipv4, gw4, ipv6, gw6, domain):
        if(ipv4):
            self.browser.find_element(*self.ipv4).send_keys(Keys.CONTROL + "a")
            self.browser.find_element(*self.ipv4).send_keys(Keys.DELETE)
            self.browser.find_element(*self.ipv4).send_keys(ipv4)
        if(gw4):
            self.browser.find_element(*self.ipv4_gateway).send_keys(Keys.CONTROL + "a")
            self.browser.find_element(*self.ipv4_gateway).send_keys(Keys.DELETE)
            self.browser.find_element(*self.ipv4_gateway).send_keys(gw4)
        if(ipv6):
            self.browser.find_element(*self.ipv6).send_keys(Keys.CONTROL + "a")
            self.browser.find_element(*self.ipv6).send_keys(Keys.DELETE)
            self.browser.find_element(*self.ipv6).send_keys(ipv6)
        if(gw6):
            self.browser.find_element(*self.ipv6_gateway).send_keys(Keys.CONTROL + "a")
            self.browser.find_element(*self.ipv6_gateway).send_keys(Keys.DELETE)
            self.browser.find_element(*self.ipv6_gateway).send_keys(gw6)
        if(domain):
            self.browser.find_element(*self.domain).send_keys(Keys.CONTROL + "a")
            self.browser.find_element(*self.domain).send_keys(Keys.DELETE)
            self.browser.find_element(*self.domain).send_keys(domain)
        return self.browser.find_element(*self.save)

    def submit_config(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.update_msg))
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.submit))
        self.browser.find_element(*self.submit).click()

    def remove_config(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.remove))
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.remove))
        self.browser.find_element(*self.remove).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.update_msg))
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.submit))
        self.browser.find_element(*self.submit).click()

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True