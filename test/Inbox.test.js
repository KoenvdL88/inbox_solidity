const assert = require('assert');
const ganache = require('ganache-cli')
const Web3 = require('web3');

const provider = ganache.provider(); // added this because of a bug in .26 web3 version
const web3 = new Web3(provider); // changed this because of a bug in .26 web3 version

const { interface, bytecode} = require('../compile'); // get the interface and bytecode from the compile.js output

let accounts;
let inbox;
const initial_message = 'Hi there!'; // to make sure that the initial_message is always equal to 'Hi there!' or can be changed in one location in the whole script

beforeEach(async () => {
  //Get a list of all accounts
  accounts = await web3.eth.getAccounts();   // This is the instance of web3. Accesing the .eth module, and in that module its the getAccounts() function. Every function in web3 is Async, which means it is always going to return with a promise thats get resolved with the output of the function. but we will use async await.
  //Use one of those accounts to deploy the contract
 inbox = await new web3.eth.Contract(JSON.parse(interface)) // Teaches web3 about what methods an Inbox contract has // Ethereum module with the Contract property (a contructor function to interact or deploy contracts). The ABI is a JSON interpretation of interface and the parse will break it down to a javascript object. // The inbox variable is the javascript representation of the contract and can be used in functions
    .deploy({data: bytecode, arguments: [initial_message]})     // Tells web3 that we want to deploy a new copy of this contract // Maes an transaction object, with a data property and an arguments object to parse into the constructor function in the Contract. Its an array as a Contructor function in the to deploy contract can have multiple values (['Hi there!','Yes'])
    .send({from: accounts[0], gas:'1000000'});               // Instructs web3 to send out a transaction that creates this contract // accounts[0] means that in the list of values that is stored in the accounts variable, we want to select the first.
  //Used because of a bug in .26 web3 version
    inbox.setProvider(provider);
});

describe('Inbox', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address); // inbox.options.address the contract, the options method, the address value. assert.ok() check if the value is defined (null or undifined will be False)
  });
  it('has a default message', async () => {
    const message = await inbox.methods.message().call(); // we reference the instance of the contract as a javascript object that is deployed on the test network (inbox), then we call the property methods .methods where the public functions of the contract are stored (see up in the previous notes), then in those methods we make a call for the value in message() (.message.call()). If the function needs arguments to function we can do that between the first set of () in message().
    assert.equal(message, initial_message);
  });
  it('can change the message', async () => {
    await inbox.methods.setMessage('bey').send({from: accounts[0], gas:'1000000'}) // we set the message value to bey and we will use the account[0] to pay for this transaction using .send . if the manipulation is unsucesful and thus the transaction an error will pop up so no need to assert this part.
    const message = await inbox.methods.message().call(); // check wat the message is now that we have updated the message in the previous line of code
    assert.equal(message, 'bey'); // run an assert so it gets tested with the new value
  });
});
