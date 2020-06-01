INSERT INTO departments (departments) VALUES ("At Home"), ("Office");
INSERT INTO roles (title, salary, department_id) VALUES ("Manager", "100000", "1"), ("Worker", "50000", "1"), ("Manager", "75000", "2"), ("Worker", "25000", "2");
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("tony", "garces", "1", NULL), ("stephanie", "marquez", "3", NULL), ("brandie", "carvajal", "2", "1"), ("frankie", "dela", "4", "2"),  ("danny", "mejia", "4", "2");
