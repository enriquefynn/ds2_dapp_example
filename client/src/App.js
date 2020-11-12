import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
      
      // Get all events
      let events = await instance.getPastEvents('LogVote', { fromBlock: 0, toBlock: 'latest' } );

      let yesVotes = 0;
      let noVotes = 0;
      for (var i = 0; i < events.length; i++) {
          if (events[i].returnValues.vote) {
              yesVotes++
          } else {
              noVotes++
          }
      }
      this.setState({yesVotes: yesVotes, noVotes: noVotes});

      // Listen to new events
      instance.events.LogVote((err, ev) => {
          if (ev.returnValues.vote) {
            this.setState((prevState) => ({yesVotes: prevState.yesVotes+1}));
          } else {
            this.setState((prevState) => ({noVotes: prevState.noVotes+1}));
          }
      })
    //   instance.NewLogVote().on('data', event => console.log(event));

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  vote = async (v) => {
    const { accounts, contract } = this.state;
    await contract.methods.vote(v).send({ from: accounts[0] });

    // // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // // Update state with the result.
    // this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Voting</h1>
        <h2>Yes: {this.state.yesVotes}</h2>
        <h2>No: {this.state.noVotes}</h2>
        <button onClick={() => this.vote(true)}>
            Vote YES
        </button>
        <button onClick={() => this.vote(false)}>
            Vote No
        </button>
      </div>
    );
  }
}

export default App;
