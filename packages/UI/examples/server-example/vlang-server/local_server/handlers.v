module local_server
import vweb
import time


pub fn (mut app VServerApp) before_request() {
	eprintln('${time.now()}: ${app.req.method} ${app.req.url}')
}

@[options;'/:path...']
pub fn (mut app VServerApp) preflight(path string) vweb.Result {
	app.add_header('Vary', 'Access-Control-Request-Headers')
	app.add_header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
	app.add_header('Access-Control-Allow-Headers', 'Content-Type') // Add this line
	app.add_header('Access-Control-Allow-Origin', '*')

	return app.text('options are ok')
}

@['/api/verify'; POST]
pub fn (mut app VServerApp) verify() vweb.Result {

	app.add_header('Access-Control-Allow-Origin', '*')
	app.set_status(200, "")
	data := app.req.data
	println("Payload: ${data}")
	return app.json({
		"data": data
	})
		
}
