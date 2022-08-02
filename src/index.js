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
  return response.status(201).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo)
    return response.status(404).send({ error: "this todo does not exist" });

  const updatedTodo = {
    ...todo,
    title,
    deadline: new Date(deadline),
  };
  const olderTodos = user.todos.filter((todo) => todo.id !== id);
  user.todos = [...olderTodos, updatedTodo];

  return response.status(201).send(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo)
    return response.status(404).send({ error: "this todo does not exist" });

  const updatedTodo = {
    ...todo,
    done: true,
  };

  const olderTodos = user.todos.filter((todo) => todo.id !== id);
  user.todos = [...olderTodos, updatedTodo];

  return response.status(201).send(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deletedTodo = user.todos.find((todo) => todo.id === id);

  if (!deletedTodo)
    return response.status(404).send({ error: "this todo does not exist" });

  const updatedTodos = user.todos.filter((todo) => todo.id !== id);
  user.todos = updatedTodos;
  return response.status(204).send(deletedTodo);
});

module.exports = app;
