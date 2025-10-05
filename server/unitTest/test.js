const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.should();
chai.use(chaiHttp);


var assert = require('assert'); //link in assertion library
describe('Accep Group Route', () => {
    describe('Test Case 1 #fnOne()', () => {
        it('should return -1 when the value is not present', () => {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
    describe('Test Case #fnOne()', () => {
        it('should return 3 as the value is present', () => {
            assert.equal([1, 2, 3, 4, 5].indexOf(4), 3);
        });
    });
});



describe('/api/acceptGroup', () => {
    it('it make the user join the group', (done) => {
        chai.request(app)
        .get('/productFind')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            //res.body.length.should.be.eql(2);
            done();
        });
    });
});
describe('/productInsert', () => {
    it('it should indert a doc', (done) => {
        chai.request(app).post('/productInsert').type('form').send({ 'name': 'Kaile', 'id': 3 })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('name');
                res.body.should.have.property('id');
                console.log(res.body);
                done();
            });
    });
});