// Create a new Node application called `bamazonManager.js`. Running this application will:

//   - List a set of menu options:

//     - View Products for Sale

//     - View Low Inventory

//     - Add to Inventory

//     - Add New Product

//   - If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.

//   - If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.

//   - If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.

//   - If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.

const mysql = require("mysql");
const inquirer = require("inquirer");
// require('./bamazonCustomer');
require("dotenv").config();

let connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.SQL_PASSWORD,
  database: "bamazon"
});

// initilize connection and test conection
connection.connect(function (err) {
  if (err) throw err;
  // display all items in store
  showTable();
});

let showTable = () => {
  connection.query("SELECT * FROM products", (err, res) => {
    console.log('----------------------------------------------------');
    console.log("ID | Product Name | Department | Price | Stock");
    res.forEach(element => {
      console.log(element.item_id + " | " +
        element.product_name + " | " +
        element.department_name + " | $" +
        element.price + " | " +
        element.stock_quantity);
    });
    console.log('----------------------------------------------------');
    managerOptions(res);
  });
  // start store
}; // end of function

let managerOptions = (res) => {
  inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: ['Add new item', 'Update item qty', 'show items', 'Quit']
  }]).then(function (answer) {

    if (answer.choice == 'Add new item') {
      addItem();
    };
    if (answer.choice == 'Update item qty') {
      updateItem(res);
    }
    if (answer.choice == 'show items') {
      showTable();
    }
    if (answer.choice == 'Quit') {
      connection.end();
    };
  });
};

let addItem = () => {
  // console.log('added item')
  inquirer.prompt([{
      type: 'input',
      name: 'productname',
      message: 'What is the name of the product?'
    },
    {
      type: 'input',
      name: 'departmentname',
      message: 'What depatment is it in?'
    },
    {
      type: 'input',
      name: 'price',
      message: 'how much does it cost?'
    },
    {
      type: 'input',
      name: 'stock',
      message: 'how much do we have in stock?'
    }
  ]).then(function (value) {
    console.log("adding");
    connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + value.productname + "','" + value.departmentname + "'," + value.price + "," + value.stock + ");", function (err, res) {
      if (err) throw err;
      console.log(value.productname + " Has been added to Bamazon");
      managerOptions();
    });
  });
};


let updateItem = (res) => {
  // console.log('updated item');
  inquirer.prompt([{
      type: 'input',
      name: 'productname',
      message: 'What product would you like to update?'
    },
    {
      type: 'input',
      name: 'added',
      message: 'How much stock would you like to add?'
    }
  ]).then(function (answer) {
    // console.log('I got a something');
    res.forEach((element, i) => {
      if(element.product_name == answer.productname){
        connection.query('UPDATE products SET stock_quantity = (stock_quantity +'+answer.added+ ') WHERE item_id='+element.item_id+';', function(err, res){
          if (err) throw err;
          // console.log(res);
          if(res.affectedRows ==0){
            console.log('notting happened');
            showTable();
          } else {
            console.log('item updated');
            showTable();
          }
        });
      } else {
        // console.log('No product with that name', i);
      }
    });
  });
};