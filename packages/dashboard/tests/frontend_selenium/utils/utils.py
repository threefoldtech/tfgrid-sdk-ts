import configparser
import random
import string
import os

def get_seed():
    config = configparser.ConfigParser()
    config.read('Config.ini')
    seed = config['Utils']['seed']
    if (seed == ''):
        try:
            seed = os.environ["TFCHAIN_MNEMONICS"]
        except:
            print("You must add account seed either in Config.ini or by exporting TFCHAIN_MNEMONICS.")
    return str(seed)

def get_node_seed():
    config = configparser.ConfigParser()
    config.read('Config.ini')
    seed = config['Utils']['node_seed']
    if (seed == ''):
        try:
            seed = os.environ["TFCHAIN_NODE_MNEMONICS"]
        except:
            print("You must add account seed either in Config.ini or by exporting TFCHAIN_NODE_MNEMONICS.")
    return str(seed)

def get_stellar_address():
    config = configparser.ConfigParser()
    config.read('Config.ini')
    address = config['Utils']['address']
    if (address == ''):
        try:
            address = os.environ["STELLAR_ADDRESS"]
        except:
            print("You must add account stellar address either in Config.ini or by exporting STELLAR_ADDRESS.")
    return str(address)
      
def generate_string():
    chars = string.ascii_uppercase + string.digits
    return (''.join(random.choice(chars) for _ in range(10)))

def generate_leters():
    chars =  string.digits 
    return (''.join(random.choice(chars) for _ in range(10)))

def generate_ip():
    first = ['2']
    second=['','0','1','2','3','4','5']
    port=['16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32']
    ip=''.join(random.choice(first))+''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second)) +''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'/'
    ip+=''.join(random.choice(port))
    return ip     

def generate_gateway():
    first = ['1','2']
    second=['','0','1','2','3','4','5']
    gateway=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second)) +''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))
    return gateway  

def generate_inavalid_ip():
    first = ['6','7','8','9']
    second=['6','7','8','9']
    port=random.randrange(0,15)
    ip=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second)) +''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    ip+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'/'
    ip+=str(port)
    return ip

def generate_inavalid_gateway():
    first = ['6','7','8','9']
    second=['6','7','8','9']
    gateway=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second)) +''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))+'.'
    gateway+=''.join(random.choice(first))+''.join(random.choice(second))+''.join(random.choice(second))
    return gateway

def valid_amount():
    decimal= ((random.randrange(1,9)))
    rational= (str(random.uniform(0.001,0.1)))
    sum = rational[0:5]
    list=[decimal,float(sum)]
    return(random.choice(list))
      
def invalid_amount():
    rational= (str(random.uniform(100,10000)))
    return rational

def invalid_amount_negtive():
    negative= (str(random.randrange(1,99)))
    negative= '-'+negative
    return negative

def invalid_address():
    chars  =string.ascii_uppercase +string.digits
    begin='5'
    return (begin+''.join(random.choice(chars) for _ in range(47)))

def randomize_public_ipv4():
    ips = ['1.0.0.0', '9.255.255.255', '11.0.0.0', '126.255.255.255', '129.0.0.0', '169.253.255.255',
           '169.255.0.0', '172.15.255.255', '172.32.0.0', '191.0.1.255', '192.0.3.0', '192.88.98.255',
           '192.88.100.0', '192.167.255.255', '192.169.0.0', '198.17.255.255', '198.20.0.0']
    ip = random.choice(ips)
    ip_subnet = ip + '/' + random.choice(['26', '27', '28', '29'])
    return ip_subnet, ip
