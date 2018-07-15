// 5.  Then create a Node application called `bamazonCustomer.js`. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
//
// 6.  The app should then prompt users with two messages.
//
//     - The first should ask them the ID of the product they would like to buy.
//     - The second message should ask how many units of the product they would like to buy.
//
// 7.  Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
//
//     - If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.
//
// 8.  However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//     - This means updating the SQL database to reflect the remaining quantity.
//     - Once the update goes through, show the customer the total cost of their purchase.
// ---
//
// - If this activity took you between 8-10 hours, then you've put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.
const mysql = require("mysql");
const inquirer = require("inquirer");
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

// initilize connection
connection.connect(function(err) {

  if (err) throw err;
// display all items in store
  showTable();

});

let showTable = () => {
  connection.query("SELECT * FROM products", (err, res) =>{
    res.forEach(element => {
      console.log(element.item_id+ " | "
      +element.product_name+ " | "
      +element.department_name+ " | $"
      +element.price+ " | "
      +element.stock_quantity);
    });
    customerOptions(res);
  });
  // start store
};// end of function

let customerOptions = (res) => {
  inquirer.prompt([
    {
      type:'input',
      name:'choise',
      message:'\nWhat would you like to purchase?\n'
    }
  ]).then(function (answer){
    let correct = false;
    res.forEach((element, i) => {
      if (element.product_name == answer.choise){
        correct = true;
        let product = answer.choise;
        let id= i;
        // ask how much
        inquirer.prompt(
          {
            type:'input',
            name:'qty',
            message:'Ho w many would you like to order?',
            validate: function(value){
              if(isNaN(value)==false){
                return true;
              } else {
                return false;
              }
            }
          }
        ).then(function(answer){
          if((res[id].stock_quantity-answer.qty)>0){
            connection.query("UPDATE products SET stock_quantity='"+(res[id].stock_quantity-answer.qty)+"'WHERE product_name='"+product+"'", function(err, res2){
              console.log("Product Bought!");
              showTable();
            })
          }
        });

      }; // end of if
    }); // if of foreach
  }); // end of promise
}; // end of function
