const server = require('../index');
const chai = require('chai');
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp);


describe('bci_graded API tests', function () {

    before(function() {
        server.start();
    });

    after(function() {
        server.close();
    });

    describe('Get /posts', function () {
        it('should return all posts', function (done) {
        //send http request to
            chai.request('http://localhost:3000')
             .get('/posts')
             .end(function (err, res) {
                expect(err).to.be.null
                //check response status
                expect(res).to.have.status(200);
                
                //check response data structure
                
                
                done();
             });
        });
    });
});
