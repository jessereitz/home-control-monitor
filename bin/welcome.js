#! /usr/bin/env node

/* *****************
 *     Welcome     *
 **************** */

/**
* This script welcomes a new Home Control user.
*
*/

const chalk = require('chalk');

const info = chalk.bgCyan;


async function welcome() {
  console.log(info('\n\nWelcome to Home Control Monitor!\n\n'));
  console.log("Home Control Monitor is the application which sits on your remote server to listen for shutdown/restart commands.");
  console.log("Please ensure you have Home Control installed on your main server. See https://github.com/jessereitz/home-control for more information.");
  console.log("\nLet's get things set up for you.", chalk.cyan("Press any key to continue."));
  process.stdin.once('data', () => process.exit(0));
}

welcome();
