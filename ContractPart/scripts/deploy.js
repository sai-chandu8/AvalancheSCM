
const hre = require("hardhat");

async function main() {
 
  const todoList = await hre.ethers.deployContract("TodoList");

  await todoList.waitForDeployment();

  console.log(
    `TodoList deployed to ${todoList.target}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
