import local_server

fn main (){
	config := local_server.VServerConfig{
		port: 3000
	}

	server := local_server.init(config)
	server.run_and_wait()
}