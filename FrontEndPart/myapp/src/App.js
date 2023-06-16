import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const web3 = new Web3(window.ethereum);

function App() {
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [account, setAccount] = useState(null);
  const abi =  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        }
      ],
      "name": "TaskCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "content",
          "type": "string"
        }
      ],
      "name": "TaskCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "completeTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_content",
          "type": "string"
        }
      ],
      "name": "createTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "taskCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "tasks",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "completed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]; // Your ABI here
  const address = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load the smart contract
        const todoList = new web3.eth.Contract(abi, address);
        setContract(todoList);

        // Get the user's account
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);

        // Fetch existing tasks
        const totalTasks = await todoList.methods.taskCount().call();
        const fetchedTasks = await Promise.all(
          Array.from({ length: totalTasks }, (_, i) => todoList.methods.tasks(i + 1).call())
        );
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    initialize();
  }, []);

  const createTask = async (content) => {
    if (!contract) {
      console.error('Contract is not initialized');
      return;
    }

    try {
      await contract.methods.createTask(content).send({ from: account });
      const newTask = await contract.methods.tasks(tasks.length + 1).call();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const completeTask = async (taskId) => {
    if (!contract) {
      console.error('Contract is not initialized');
      return;
    }

    try {
      await contract.methods.completeTask(taskId).send({ from: account });
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: true };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const connectToWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List</h1>
        {account ? (
          <p>Connected Account: {account}</p>
        ) : (
          <button onClick={connectToWallet}>Connect to Wallet</button>
        )}
      </header>
      <div className="task-list">
        <h2>Tasks:</h2>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task ${task.completed ? 'completed' : ''}`}
          >
            <p>{task.content}</p>
            {!task.completed && (
              <button onClick={() => completeTask(task.id)}>Complete</button>
            )}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const content = e.target.elements.content.value;
          createTask(content);
          e.target.reset();
        }}
      >
        <input type="text" name="content" placeholder="Task content" />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}

export default App;
