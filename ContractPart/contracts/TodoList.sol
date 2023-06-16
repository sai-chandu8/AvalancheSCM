// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    
    struct Task {
        uint id;
        string content;
        bool completed;
    }

    uint public taskCount;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content);
    }

    function completeTask(uint _taskId) public {
        Task storage task = tasks[_taskId];
        task.completed = true;
        emit TaskCompleted(_taskId, true);
    }
}