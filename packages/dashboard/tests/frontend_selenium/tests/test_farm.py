from utils.utils import generate_gateway, generate_inavalid_gateway, generate_inavalid_ip, generate_ip, generate_string, get_seed, randomize_public_ipv4
from pages.farm import FarmPage
from pages.polka import PolkaPage
from utils.grid_proxy import GridProxy

#  Time required for the run (17 cases) is approximately 13 minutes.

def before_test_setup(browser):
    polka_page = PolkaPage(browser)
    farm_page=FarmPage(browser)
    user = generate_string()
    password = generate_string()
    farm_name=generate_string()
    polka_page.load_and_authenticate()
    polka_page.import_account(get_seed(), user, password)
    farm_page.navigetor(user)
    return farm_page, polka_page, farm_name, password

def test_create_farm(browser):
    """
    Test Case: TC907-Create farm with valid name
    Test Case: TC911-Create farm with existing name
    Test Case: TC908-Verify the search functionality
    Steps:
        - From the Twin Details Page Click on Farms.
        - In the Farms page Click on "Create Farm" button.
        - Enter the Farm Name.
        - Click on Submit.
        - Authenticate polkadot transaction.
        - Try to recreate a Farm with same name on the third step
        - Authenticate polkadot transactions.
        - In the Farms search bar enter the name or the id of the farm you just created
    Test Data: [ use the whole name of the farm, only the first part, the second part ]
    Result: The user can create a farm.
            You should see the bottom right alert with the message "farm creation failed".
            The search results should be displayed correctly according to the keywords used.
            You should see "No data available " on the table of farms.
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")
    assert farm_name in farm_page.search_functionality(farm_name) 
    assert farm_name in farm_page.search_functionality(farm_name[:len(farm_name)//2]) 
    assert farm_name in farm_page.search_functionality(farm_name[len(farm_name)//2:])
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm creation failed!')
    table=farm_page.search_functionality(generate_string())
    assert 'No data available' in table


def test_create_farm_invalid_name(browser):
    """
    Test Case: TC912 - create a farm with invalid name
    Steps:
        - From the Twin Details Page Click on Farms.
        - In the Farms page Click on " Create Farm ".
        - Enter the Farm Name.
        - Click on Submit.
        - Authenticate polkadot transactions.
    Test Data: [Empty Field, More than 40 char, Spaces, Special chr(@,#%^&*(_+-))]
    Result: You should display a warning message 'Name is not formatted correctly (All letters + numbers and (-,_) are allowed).
    """
    farm_page, _, _, _ = before_test_setup(browser)
    farm_page.close_create()
    cases = ['f', 'DD', '4', '88', '-', '_-']
    for case in cases:
        farm_page.create_farm_invalid_name(case)
        assert farm_page.wait_for('Name should be more than or equal 3 characters')
    cases = [' ', 'f f', 'ddd#', 'ddd@', '88!', 'gg$', 'aa%', 'bb^', 'cc&', 'h8*', 's5()', '|~</;:']
    for case in cases:
        farm_page.create_farm_invalid_name(case)
        assert farm_page.wait_for('Name is not formatted correctly (All letters + numbers and (-,_) are allowed')
    farm_page.create_farm_invalid_name(generate_string()+generate_string()+'_'+generate_string()+generate_string())
    assert farm_page.wait_for('Name too long, only 40 characters permitted')


def test_farm_table_sorting(browser):
    """
    Test Case: TC910 - Farm Node table sorting
    Steps:
        - From the Twin Details Page Click on Farms
        - Make sure to have at least 2 Farms , If you don't create them
        - Click on the arrow behind farm Id 'once up and once down and once to remove the sorting'
        - Click on the arrow behind the farm Name 'once up and once down and once to remove the sorting'
        - Click on the arrow behind the Linked twin id 'once up and once down and once to remove the sorting'
        - Click on the arrow behind the Certification type 'once up and once down and once to remove the sorting'
        - Click on the arrow behind the pricing policy id 'once up and once down and once to remove the sorting'
    Result: You should see the sorting of the table change according to each case
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    while (farm_page.check_farm_counts() < 2):
        farm_page.create_farm(farm_name + generate_string())
        polka_page.authenticate_with_pass(password)
        assert farm_page.wait_for('Farm created!')
        farm_page.search_functionality(farm_name)
        assert farm_page.wait_for(farm_name)
        farm_page.search_functionality("")
    farm_page.display_all_farms()
    #sort by ID
    id,sorted,rows = farm_page.farm_table_sorting_by_id()
    assert id == sorted
    id_up,sorted_up = farm_page.farm_table_sorting_by_id_up(id,rows)
    assert id_up == sorted_up
    #sort by Name
    name,sorted,table = farm_page.farm_table_sorting_by_name()
    assert name == sorted
    name_up,sorted_up = farm_page.farm_sorting_name_up(name,table)
    assert name_up == sorted_up
    #sort by Twin ID
    id,sorted,table = farm_page.farm_table_sorting_by_twin_id()
    assert id == sorted
    id_up,sorted_up = farm_page.farm_table_sorting_by_twin_id_up(id,table)
    assert id_up == sorted_up
    #sort by Cerification Type
    name ,sorted,table = farm_page.farm_table_sorting_by_cerification_type()
    assert name == sorted
    name_up,sorted_up = farm_page.farm_table_sorting_by_cerification_type_up(name,table)
    assert name_up == sorted_up
    #sort by Pricing Policy ID
    id,sorted,table = farm_page.farm_table_sorting_by_pp_id()
    assert id == sorted
    id_up,sorted_up = farm_page.farm_table_sorting_by_pp_id_up(id,table)
    assert id_up == sorted_up


def test_farmpayout_address(browser):
    """
    Test Case: TC915 - Add farm payout address
    Test Case: TC1140 - Add invalid farm payout address
    Test Case: TC916 - Edit farm payout address
    Steps:
        - From the Twin Details Page Click on Farms
        - Make sure you have at least one farm.
        - Click on the arrow behind any farm id
        - Click on add v2 address button
        - Put the address
        - Click Submit
    Result: You should see the bottom right alert with the message "address added"
            You should see alert with the message "invalid address"
            You should see the bottom right alert with the message "address added"
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")    
    farm_page.setup_farmpayout_address(farm_name)
    cases = [' ', 'dgdd',generate_string(), 'gdhjP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6Bcfg']
    for case in cases:
        assert farm_page.add_farmpayout_address(case).is_enabled()==False
        assert farm_page.wait_for('Edit')
    case = "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG"
    farm_page.add_farmpayout_address(case).click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Transaction submitted')
    assert farm_page.wait_for('Address added!')
    assert farm_page.wait_for('Edit')
    assert farm_page.wait_for('GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG')
    farm_page.close_detail()
    case = "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4"
    farm_page.setup_farmpayout_address(farm_name)
    farm_page.add_farmpayout_address(case).click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Transaction submitted')
    assert farm_page.wait_for('Address added!')
    assert farm_page.wait_for('GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4')


def test_ip(browser):
    """
    Test Case: TC1141 - Enter valid IP
    Test Case: TC919 - Enter Invalid IP
    Test Case: TC917 - Add IP to Farm
    Test Case: TC918 - Delete IP address from farm
    Steps:
        - From the Twin Details Page Click on Farms.
        - Make sure you have at least one farm.
        - Click on the arrow behind any farm id.
        - Click on Public IPs.
        - Click on add IP button.
        - Add ip and Gateway.
    Test Data for IP: [ should be numbers separated by '.' and end with '/' port ex: 127.0.0.01/16]
    Result: You should see the bottom right alert with the message "incorrect format".
            You should see the bottom right alert with the message "IP Created!"
            You should see the bottom right alert with the message "IP deleted!"
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")    
    cases = [generate_inavalid_ip(), '1.0.0.0/66', '239.255.255/17', '239.15.35.78.5/25', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    farm_page.setup_gateway(generate_gateway(), farm_name)
    for case in cases:
        assert farm_page.add_ip(case).is_enabled()==False
        assert farm_page.wait_for('Incorrect format')
    assert farm_page.add_ip('255.0.0.1/32').is_enabled()==False
    assert farm_page.wait_for('IP is not public')
    farm_page.close_ip()
    farm_page.close_detail()
    ip, gateway = randomize_public_ipv4()
    cases = [gateway, '2.0.0.1',  '3.0.0.0', '139.255.255.255', '59.15.35.78']
    for case in cases:
        farm_page.setup_gateway(case, farm_name)
        assert farm_page.wait_for('IP address in CIDR format xxx.xxx.xxx.xxx/xx')
        farm_page.close_ip()
        farm_page.close_detail()
    farm_page.setup_gateway(gateway, farm_name)
    farm_page.add_ip(ip).click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('IP created!')
    assert farm_page.wait_for(ip)
    assert farm_page.wait_for(gateway)
    farm_page.close_detail() 
    farm_page.delete_ip(farm_name, ip, gateway)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('IP deleted!')


def test_gateway(browser):
    """
    Test Case: TC1142 - Enter valid Gateway
    Steps:
        - From the Twin Details Page Click on Farms
        - Make sure you have at least one farm.
        - Click on the arrow behind any farm id
        - Click on Public IPs
        - Click on add IP button
        - Add IP and Getaway
    Test Data: [Empty Field,All letters, (-,_),54.54,....1270001,127.0.0..1]
    Test Data for Gateway: [ should be numbers separated by '.' ex: 127.0.0.01/16]
    Result: You should see the bottom right alert with the message "Gateway is not formatted correctly".
            No alert displayed and button is enabled.
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")    
    farm_page.setup_ip(generate_ip(), farm_name)
    cases = [generate_inavalid_gateway(), '1.0.0.',  '1:1:1:1', '522.255.255.255', '.239.35.78', '1.1.1.1/16', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    for case in cases:
        assert farm_page.add_gateway(case).is_enabled()==False
        assert farm_page.wait_for('Gateway IP not in the provided IP range')
    farm_page.close_ip()
    farm_page.close_detail()
    ip, gateway = randomize_public_ipv4()
    cases = [gateway, '1.0.0.1',  '1.0.0.0', '25.255.255.255', '239.15.35.78', '1.1.1.1']
    for case in cases:
        farm_page.setup_ip(case+'/16', farm_name)
        assert farm_page.add_gateway(case).is_enabled()==True
        assert farm_page.wait_for('Gateway for the IP in ipv4 format')
        farm_page.close_ip()
        farm_page.close_detail()


def test_range_ips(browser):
    """
    Test Case: TC1212 - Enter invalid to IP in add range of IPs
    Test Case: TC1211 - Add range of IPs to Farm
    Steps:
        - Open the twin
        - From sidebar Click on Farms.
        - Create a farm.
        - Expand farm details.
        - Click on Public IPs
        - Click on add IP button
        - Choose Range
        - Add From IP, To IP and Gateway.
        - Click on the save button.
        - Authenticate polkadot transaction.
    Test Data for Gateway: [Empty Field,All letters, (-,_),54.54,....1270001,127.0.0..1]
    Test Data for From IP: [ should be numbers separated by '.' and end with '/' port ex: 127.0.0.01/16]
    Test Data for To IP: [Invalid IP formats, IPs with smaller or bigger values]
    Result: You should see the alert with the correct message responding to invalid input entered and the save button will be disabled.
            You should see the bottom right alert with the message "IP Created!" and the IPs added to your farm.
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")    
    farm_page.change_to_range_ip(farm_name)
    cases = [generate_inavalid_ip(), '1.0.0.0/66', '239.255.255/17', '239.15.35.78.5/25', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    for case in cases:
        assert farm_page.add_range_ips(case, 0, 0).is_enabled()==False
        assert farm_page.wait_for('Incorrect format')
    assert farm_page.add_range_ips('255.0.0.1/32', 0, 0).is_enabled()==False
    assert farm_page.wait_for('IP is not public')
    assert farm_page.add_range_ips('1.1.1.254/16', '1.1.1.255/16', '1.1.1.1').is_enabled()==True
    cases = ['1.0.0.0/66', '239.255.253/17', '239.15.35.78.5/25', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    for case in cases:
        assert farm_page.add_range_ips(0, case, 0).is_enabled()==False
        assert farm_page.wait_for('IPs are not the same')
    assert farm_page.add_range_ips('1.1.1.1/16', '1.1.1.3/16', '1.1.1.1').is_enabled()==True
    cases = ['1.1.1.35/16', '1.1.1.17/16']
    for case in cases:
        assert farm_page.add_range_ips(0, case, 0).is_enabled()==False
        assert farm_page.wait_for('Range must not exceed 16')
    assert farm_page.add_range_ips('1.1.1.1/16', '1.1.1.3/16', '1.1.1.1').is_enabled()==True
    cases = ['1.1.1.--2/16', '1.1.1.sdf/16', '1.1.1.3a/16']
    for case in cases:
        assert farm_page.add_range_ips(0, case, 0).is_enabled()==False
        assert farm_page.wait_for('Incorrect format')
    assert farm_page.add_range_ips('1.1.1.17/16', '1.1.1.18/16', '1.1.1.1').is_enabled()==True
    cases = ['1.1.1.17/16', '1.1.1.15/16', '1.1.1.-1/16',]
    for case in cases:
        assert farm_page.add_range_ips(0, case, 0).is_enabled()==False
        assert farm_page.wait_for('To IP must be bigger than From IP')
    assert farm_page.add_range_ips('1.1.1.1/16', '1.1.1.3/16', '1.1.1.1').is_enabled()==True
    cases = [generate_inavalid_gateway(), '1.0.0.',  '1:1:1:1', '522.255.255.255', '.239.35.78', '1.1.1.1/1', '239.15.35.78.5', ' ', '*.#.@.!|+-']
    for case in cases:
        assert farm_page.add_range_ips(0, 0, case).is_enabled()==False
        assert farm_page.wait_for('Gateway IP not in the provided IP range')
    farm_page.add_range_ips('1.2.3.4/16', '1.2.3.6/16', '1.2.3.4').click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('IP created!')
    assert farm_page.wait_for('1.2.3.4/16')
    assert farm_page.wait_for('1.2.3.5/16')
    assert farm_page.wait_for('1.2.3.6/16')


def test_farm_details(browser):
    """
    Test Case: TC914 - Farm Details
    Test Case: TC921 - Verify the availability of zero os bootstrap
    Steps:
        - From the Twin Details Page Click on Farms
        - Make sure you have at least one farm.
        - Click on the arrow behind any farm id
    Result: You should see Farm id, Farm Name, Linked Twin Id, Certification Type, 
                Linked Pricing policy Id, stellar payout address, Bootstrap Image, Public IPs.
            You should see Zero-OS bootstrap page is opened   
    """
    farm_page, polka_page, farm_name, password = before_test_setup(browser)
    grid_proxy = GridProxy(browser)
    farm_page.create_farm(farm_name)
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Farm created!')
    farm_page.search_functionality(farm_name)
    assert farm_page.wait_for(farm_name)
    farm_page.search_functionality("")    
    case = "GDHJP6TF3UXYXTNEZ2P36J5FH7W4BJJQ4AYYAXC66I2Q2AH5B6O6BCFG"
    farm_page.setup_farmpayout_address(farm_name)
    farm_page.add_farmpayout_address(case).click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('Address added!')
    farm_page.close_detail()
    ip, gateway = randomize_public_ipv4()
    farm_page.setup_ip(ip, farm_name)
    farm_page.add_gateway(gateway).click()
    polka_page.authenticate_with_pass(password)
    assert farm_page.wait_for('IP created!')
    assert farm_page.wait_for('Edit')
    farm_page.close_detail()
    farm_details = farm_page.farm_detials(farm_name)
    grid_farm_details = grid_proxy.get_farm_details(farm_details[1])
    farm_page.close_detail()
    assert farm_page.verify_the_availability_of_zero_os_bootstrap() == "https://v3.bootstrap.grid.tf/"
    assert grid_farm_details[0]['farmId'] == int(farm_details[0])
    assert grid_farm_details[0]['name'] == farm_details[1]
    assert grid_farm_details[0]['twinId'] == int(farm_details[2])
    assert grid_farm_details[0]['certificationType'] == farm_details[3]
    assert grid_farm_details[0]['pricingPolicyId'] == int(farm_details[4])
    assert grid_farm_details[0]['stellarAddress'] == farm_details[5]
    for i in range(len(grid_farm_details[0]['publicIps'])):
        assert grid_farm_details[0]['publicIps'][i]['ip'] == farm_details[6+(i*3)]
        assert grid_farm_details[0]['publicIps'][i]['contractId'] == int(farm_details[7+(i*3)])
        assert grid_farm_details[0]['publicIps'][i]['gateway'] == farm_details[8+(i*3)]