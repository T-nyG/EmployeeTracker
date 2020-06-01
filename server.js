var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Monopoly12",
  database: "management_db"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

var allEmployees = [];
var allRoles = [];

async function runSearch() {
    var employeesData = await connection.query("SELECT * FROM employees", function(err, res) {
        if (err) throw err;
        res.forEach (function(employees) {
            allEmployees.push(employees.first_name + " " + employees.last_name);
        });
    });
    var rolesData = await connection.query("SELECT * FROM roles LEFT JOIN departments ON roles.department_id = departments.id", function (err, res) {
        if (err) throw err;
        res.forEach(function(roles) {
            allRoles.push(roles.departments + " " + roles.title)
        });
    });
    inquirer.prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View all Departments",
        "View all Roles",
        "View all Employees",
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Update an employee's role",
        "Finish"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "View all Departments":
        viewDepartments();
        break;

      case "View all Roles":
        viewRoles();
        break;

      case "View all Employees":
        viewEmployees();
        break;

      case "Add a Department":
        addDepartment();
        break;

        case "Add a Role":
        addRole();
        break;

      case "Add an Employee":
        addEmployee();
        break;

      case "Update an employee's role":
        updateEmployeeRole();
        break;

      case "Finish":
        connection.end();
        break;
      }
    });
}

async function addDepartment() {
    inquirer.prompt ([
        {
            name: "departments",
            type: "input",
            message: "What would you like the name of your new department to be?"
        }
    ]).then(function(response) {
        connection.query("INSERT INTO departments (departments) VALUES (?)",
        [response.departments],
        function(err) {
            if (err) throw (err);
            viewDepartments();
        });
    });
}

async function addRole() {
    var deptsArray = [];
    var dataRoles = await connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        res.forEach(function(departments) {
            deptsArray.push(departments.departments);
        })
    })
    inquirer.prompt ([
        {
            name: "roles",
            type:"input",
            message: "What would you like the name of your new role to be?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary of your new job? Numbers only."
        },
        {
            name: "departments",
            type: "rawlist",
            message: "Which department does this role belong to?",
            choices: deptsArray
        }
    ]).then(function(response) {
        var dept_id = deptsArray.indexOf(response.departments) + 1;
        connection.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
        [response.roles, response.salary, dept_id],
        function(err) {
            if (err) throw err;
            // console.log("Added role!")
            viewRoles();
        })
    });
}

async function addEmployee() {
    var employeesArray = ["null"];
    var dataEmployees = await connection.query("SELECT * FROM employees", function (err, res) {
        if (err) throw err;
        res.forEach(function(employees) {
            employeesArray.push(employees.first_name + " " + employees.last_name);
        });
    });
    inquirer.prompt ([
        {
            name: "first_name",
            type:"input",
            message: "What is the first name of the new employee"
        },
        {
            name: "last_name",
            type: "input",
            message: "What is the last name of the new employee?"
        },
        {
            name: "roles",
            type: "rawlist",
            message: "What is the role of the new employee?",
            choices: allRoles
        },
        {
            name: "manager",
            type: "rawlist",
            message: "Who is the manager of the new employee?",
            choices: employeesArray
        }
    ]).then(function(response) {
        var role_id = allRoles.indexOf(response.roles) +1;
        var manager_id = employeesArray.indexOf(response.manager);
        connection.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
        [response.first_name, response.last_name, role_id, manager_id],
        function(err) {
            if (err) throw err;
            viewEmployees();
        });
    });
}

async function viewDepartments() {
    var data = await connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        console.table(res);
        runSearch();
    });
}

async function viewRoles() {
    var data = await connection.query("SELECT roles.title, departments.departments FROM departments RIGHT JOIN roles ON roles.department_id = departments.id", function (err, res) {
        if (err) throw err;
        console.table(res);
        runSearch();
    });
}

async function viewEmployees() {
    var data = await connection.query("SELECT employees.id, employees.first_name, employees.last_name, departments.departments, roles.title, employees.manager_id FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id", function (err, res) {
        if (err) throw err;
        console.table(res);
        runSearch();
    });
}

async function updateEmployeeRole() {
    inquirer
      .prompt([
        {
          name: "employees",
          type: "rawlist",
          message: "Which employee do you want to update?",
          choices: allEmployees
        },
        {
          name: "roles",
          type: "rawlist",
          message: "What is the new role of this employee?",
          choices: allRoles
        }
      ])
      .then(function(response) {
        var role_id = allRoles.indexOf(response.roles) + 1;
        var employee_id = allEmployees.indexOf(response.employees) + 1;
        var query = "UPDATE employees SET role_id = ? WHERE id = ?";
        connection.query(query, [role_id, employee_id], function(err) {
          if (err) throw err;
          viewEmployees();
        });
      });
}

// async function removeEmployee() {
//     const employees = await db.findAllEmployees();
//     const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
//       name: `${first_name} ${last_name}`,
//       value: id
//     }));
//     const { employeeId } = await prompt([
//       {
//         type: "list",
//         name: "employeeId",
//         message: "Which employee do you want to remove?",
//         choices: employeeChoices
//       }
//     ]);
//     await db.removeEmployee(employeeId);
//     console.log("Removed employee from the database");
//     loadMainPrompts();
//   }