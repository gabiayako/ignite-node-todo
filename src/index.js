const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ message: "user does not exist" });
  }

  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).send({ error: "user already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  console.log("user", user);
  return response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  console.log("user", user);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    createdAt: new Date(),
  };
  const allTodos = [...user.todos, todo];
  console.log("$$$$ users", users);
  const userFromUsers = users.find((u) => u.username === user.username);
  userFromUsers.todos = allTodos;

  console.log("***** users", users);

  return response.status(200).send(allTodos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  const updatedTodos = {
    ...todo,
    title,
    deadline: new Date(deadline),
  };

  request.user = {
    ...user,
    todos: updatedTodos,
  };
  return response.status(201);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  const updatedTodos = {
    ...todo,
    done: true,
  };

  request.user = {
    ...user,
    todos: updatedTodos,
  };
  return response.status(201);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  request.user = {
    ...user,
    todos: user.todos.filter((todo) => todo.id !== id),
  };
  return response.status(200);
});

module.exports = app;
