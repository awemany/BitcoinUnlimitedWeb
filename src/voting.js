/* Frontend part of the Bitcoin Unlimited Voting infrastructure. 
   Passes /voting URL subspace to external microservice. */
'use strict';

import RateLimit from 'express-rate-limit';
import request from 'request';

    
export default function register(app) {
    /* Apply rate limiting to /voting/ part of the website, to hopefully keep
       the rest of the site up and running, if this part is attacked. */

    // setup with default parameters as per https://www.npmjs.com/package/express-rate-limit 
    var rateLimiter = new RateLimit({
	windowMs: 15 * 60 *1000,
	max : 1000,
	delayMs: 0
    }); 
    app.use("/voting/", rateLimiter);

    // inspired by http://stackoverflow.com/questions/10435407/proxy-with-express-js
    // (answer by  Henrik Peinar)
    app.use("/voting/", function (req, res) {
	var url = "http://localhost:9090/api1"+req.url;
	var r=null;
	if (req.method == "POST") {
	    r = request.post({
		uri : url,
		json: req.body
	    });
	} else {
	    r = request.get(url);
	}
	r.on('error', function(err) {
	    console.log(err);
	    res.sendStatus(500);
	});
	req.pipe(r).pipe(res);
    });
}
