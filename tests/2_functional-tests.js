const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function()
      {
        
        suite('GET /api/stock-prices => stockData object', function()
              {
                
                test('one stock', function(done)
                     {
                       chai.request(server)
                         .get('/api/stock-prices')
                         .query({stock: 'goog'})
                         .end(function(error, response)
                              {
                                assert.equal(response.status, 200);
                                assert.isObject(response.body.stockData, 'Response should be an object.');
                                assert.containsAllKeys(response.body.stockData, ['stock', 'price', 'likes'], 'Stock data should include stock, price, and likes.');
                                assert.equal(response.body.stockData.stock, 'goog', 'Stock symbols should be the same.');

                                done();
                              });
                     });
                
                test('one stock with like', function(done)
                     {
                       chai.request(server)
                         .get('/api/stock-prices')
                         .query({stock: 'goog', like: true})
                         .end(function(error, response)
                              {
                                assert.equal(response.status, 200);
                                assert.isObject(response.body.stockData, 'Response should be an object.');
                                assert.containsAllKeys(response.body.stockData, ['stock', 'price', 'likes'], 'Stock data should include stock, price, and likes.');
                                assert.equal(response.body.stockData.stock, 'goog', 'Stock symbols should be the same.');

                                done();
                              });
                     });
                
                test('one stock with like again (insure likes are not counted twice)', function(done)
                     {
                       chai.request(server)
                         .get('/api/stock-prices')
                         .query({stock: 'goog', like: true})
                         .end(function(error, response)
                              {
                                assert.equal(response.status, 200);
                                assert.isObject(response.body.stockData, 'Response should be an object.');
                                assert.containsAllKeys(response.body.stockData, ['stock', 'price', 'likes'], 'Stock data should include stock, price, and likes.');
                                assert.equal(response.body.stockData.stock, 'goog', 'Stock symbols should be the same.');
                                assert.equal(response.body.stockData.likes, 1, 'Stock symbols should be the same.');

                                done();
                              });
                     });
                
                test('two stocks', function(done)
                     {
                       chai.request(server)
                         .get('/api/stock-prices')
                         .query({stock: ['goog', 'msft']})
                         .end(function(error, response)
                              {
                                assert.equal(response.status, 200);
                                assert.isObject(response.body, 'Response should be an object.');
                                assert.isArray(response.body.stockData, 'Stock data should be an array.');
                                assert.containsAllKeys(response.body.stockData[0], ['stock', 'price', 'rel_likes'], 'Stock data should include stock, price, and rel_likes.');
                                assert.containsAllKeys(response.body.stockData[1], ['stock', 'price', 'rel_likes'], 'Stock data should include stock, price, and rel_likes.');
                                assert.equal(response.body.stockData[0].stock, 'goog', 'Stock symbols should be the same.');
                                assert.equal(response.body.stockData[1].stock, 'msft', 'Stock symbols should be the same.');

                                done();
                              });
                     });
                
                test('two stocks with like', function(done)
                     {
                       chai.request(server)
                         .get('/api/stock-prices')
                         .query({stock: ['goog', 'aapl'], like: true})
                         .end(function(error, response)
                              {
                                // console.log(response.body);
                                assert.equal(response.status, 200);
                                assert.isObject(response.body, 'Response should be an object.');
                                assert.isArray(response.body.stockData, 'Stock data should be an array.');
                                assert.containsAllKeys(response.body.stockData[0], ['stock', 'price', 'rel_likes'], 'Stock data should include stock, price, and rel_likes.');
                                assert.containsAllKeys(response.body.stockData[1], ['stock', 'price', 'rel_likes'], 'Stock data should include stock, price, and rel_likes.');
                                assert.equal(response.body.stockData[0].stock, 'goog', 'Stock symbols should be the same.');
                                assert.equal(response.body.stockData[1].stock, 'aapl', 'Stock symbols should be the same.');
                                assert.equal(response.body.stockData[0].rel_likes, 0, 'Relative likes should be equal.');
                                assert.equal(response.body.stockData[1].rel_likes, 0, 'Relative likes should be equal.');

                                done();
                              });
                     });
              });
      });
