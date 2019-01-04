// Configuration file for server

// make port settable
let setport = process.env.APIPORT || '2000'

module.exports = {

	// Path to REST API
	apiPath: '/api/v1/',
	apiPort: setport,
	//apiPort: 2000,

	// DB connection
	connectionString: process.env.DATABASE_URL || 'postgres://postgres:xxxx@localhost:5432/naxl-test', 
	schema: 'naxl',
	//connectionString: process.env.DATABASE_URL || 'postgres://evol:love@localhost:5432/Evolutility', 
	//schema: 'evolutility',

	// Pagination and maximum number of rows
	pageSize: 50,
	lovSize: 100,
	csvSize: 1000,
	csvHeader: 'id', //label', // possible values: id, label

	// - Timestamp columns u_date and c_date w/ date of record creation and last update 
	wTimestamp: true,
	// - "WhoIs" columns u_uid and c_uid w/ userid of creator and last modifier
	wWhoIs: false,

	// - Comments & Ratings (community feature) 
	wComments: false,
	wRating: false,

	// - API discovery
	apiInfo: true,

	// Directory for uploaded files
	uploadPath: '../naxl-ui/public/pix/',
	publicPath: '../naxl-ui/public/',

	// Console log
	consoleLog: true,

};
