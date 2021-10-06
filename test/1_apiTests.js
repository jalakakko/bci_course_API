const server = require('../index');
const chai = require('chai');
const expect = chai.expect
const chaiHttp = require('chai-http');
const { users, posts } = require('../index');
chai.use(chaiHttp);

const ADDRESS = 'http://localhost:3000'
let validUser;
let validPost;

describe('bci_graded API tests', function () {

    before(function() {
        server.start();
    }); 
    after(function() {
        server.close();
    });

    describe('Creating a new user', function() {
        it('Should accept new user when data is correct', function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "foo123",
                    password: "Bar1234!"
                }) 
                .end(function(err, res) { 
                    validUser = users[0]
                    expect(err).to.be.null;
                    expect(res).to.have.status(201)
                    done();
                })
        })
        it("Should reject if username is taken", function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "foo123",
                    password: "Bar1234!"
                })
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        })
        it("Should reject if password doesn't contain capital letter", function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "fooo123",
                    password: "bar1234!"
                })
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        })
        it("Should reject if password doesn't contain special character", function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "fooo123",
                    password: "Bar12345"
                })
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        })
        
        it('Should reject if inputs are too short', function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "foo12",
                    password: "Bar12!"
                })
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        })

        it('Should reject empty post requests', function(done) {
            chai.request(ADDRESS)
                .post('/signup')
                .send({
                    username: "",
                    password: ""
                })
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        })  
    })  
    
    describe('Modifying users contact info and location', function () {
        it("should accept if user information is set correctly", function (done) {  
            chai.request(ADDRESS)
                .patch('/users/' + validUser.id)
                .auth("foo123", "Bar1234!")
                .send({
                    firstName: "etunimi",
                    secondName: "sukunimi",
                    email: "foo@bar.fi",
                    phoneNumber: "04001234567",
                    country: "Finland",
                    city: "Oulu",
                    address: "Professorintie 7",
                    postcode: "90220"
                })
                .end(function(err, res) { 
                    expect(err).to.be.null
                    expect(res).to.have.status(200) 
                    done();
                })
        }); 
    });
    
    describe('Creating new post', function () {
        it("should reject if user doesn't have contactinfo or location set", function (done) {
            validUser.location = {} 
            chai.request(ADDRESS)
                .post('/' + validUser.id + '/createPost')
                .auth("foo123", "Bar1234!")
                .send({
                    title: "testTitle",
                    description: "testDescription", 
                    price: "50.00",
                    deliveryType: "pickup",
                    category: "toys"
                })
                .end(function(err, res) {  
                    expect(err).to.be.null;
                    expect(res).to.have.status(422)
                    done();
                })
        });
        it("should accept if user has all constactinfo and location set", function(done) {
            validUser.location = {
                country: "Finland",
                city: "Oulu",
                address: "Professorintie 7",
                postcode: "90220"
            }
            chai.request(ADDRESS)
            .post('/' + validUser.id + '/createPost')
            .auth("foo123", "Bar1234!")
            .send({
                title: "testTitle",
                description: "testDescription", 
                price: "50.00",
                deliveryType: "pickup",
                category: "toys"
            })
            .end(function(err, res) { 
                validPost = posts[0] 
                expect(err).to.be.null;
                expect(res).to.have.status(200) 
                done();
            })
        })
    });

    describe('Modifying post', function () {
        it("should accept if post was modified successfully", function (done) {  
            chai.request(ADDRESS)
                .patch('/' + validUser.id + '/posts/' + validPost.id)
                .auth("foo123", "Bar1234!")
                .send({
                    title: "testTitle2",
                    description: "testDescription2", 
                    price: "150.00",
                    deliveryType: "shipping",
                    category: "cars"
                })
                .end(function(err, res) { 
                    expect(err).to.be.null 
                    expect(res).to.have.status(200) 
                    done();
                })
        });  
    });

    describe('Deleting post', function () {
        it("should accept if post was deleted successfully", function (done) {  
            chai.request(ADDRESS)
                .delete('/' + validUser.id + '/posts/' + validPost.id)
                .auth("foo123", "Bar1234!")
                .end(function(err, res) { 
                    expect(err).to.be.null 
                    expect(res).to.have.status(200)
                    done();
                })
        });  
    }); 
});
