import local_server

fn main (){
	config := local_server.VServerConfig{
		port: 2000
	}

	server := local_server.init(config)
	server.run_and_wait()
}