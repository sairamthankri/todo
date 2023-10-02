const express = require("express");
const {
    open
} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
    try {
        database = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () =>
            console.log("Server Running at http://localhost:3000/")
        );
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
    return {
        id: dbObject.id,
        todo: dbObject.todo,
        priority: dbObject.priority,
        status: dbObject.status,
    };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
 return (
  requestQuery.priority !== undefined && requestQuery.status !== undefined
 );
};

const hasPriorityProperty = (requestQuery) => {
 return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
 return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
 let data = null;
 let getTodosQuery = "";
 const { search_q = "", priority, status } = request.query;


 switch (true) {
  case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
   break;
  case hasPriorityProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
   break;
  case hasStatusProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
   break;
  default:
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
 }
 data = await database.all(getTodosQuery);
 response.send(data);
});

app.put("/todos/:todoId/", async (request, response) => {
    const {todo,priority,status} = request.body;
    const {id} = request.params;
    const updateMovieQuery = `
     UPDATE
      todo
     SET
      todo = '${todo}',
      status = '${status}',
      priority = '${priority}'
     WHERE
      id = ${id};`;

    await database.run(updateMovieQuery);
    response.send("Status Updated");
});

app.get("/todos/:todoId/", async(request, response)=>{
  const {id}=request.params;
  const getTodoQuery= `
    SELECT
     *
    FROM 
     todo 
    WHERE 
     id = ${id}; `; 
  const todo = await database.get(getTodoQuery);
  response.send(convertDbObjectToResponseObject(todo));
});

app.post("/todos/", async (request, response) => {
    const { id, todo, priority, status } = request.body; 
    const insertTodo = `
            INSERT INTO todo (id, todo, priority, status)
            VALUES (${id},'${todo}','${priority}','${status}');`; 
    await db.run(insertTodo);
    response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
    const {id} = request.params;
    const deleteTodoQuery = `
      DELETE FROM
        todo
      WHERE
        id = ${id};`;
    await database.run(deleteTodoQuery);
    response.send("Todo Removed");
});



module.exports=app;