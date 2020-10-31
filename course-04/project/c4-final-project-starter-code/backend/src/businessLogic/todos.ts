import { AttachementDataAccess as AttachementAccess } from "../dataAccess/attachementAccess";
import { TodoDataAccess as TodoAccess } from "../dataAccess/todoAccess";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const uuid = require('uuid');
const todoAccess = new TodoAccess();
const attachementAccess = new AttachementAccess();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId);
}

export async function getTodoById(todoId: string): Promise<TodoItem> {
    return todoAccess.getTodoById(todoId);
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {

    const todoId = uuid.v4();
    const todoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest,
    };

    return await todoAccess.createTodo(todoItem);
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoItem> {

    const todoItem = await getTodoById(todoId);
    if (todoItem) {
        todoItem.name = updatedTodo.name;
        todoItem.dueDate = updatedTodo.dueDate;
        todoItem.done = updatedTodo.done;

        return await todoAccess.updateTodo(todoItem);
    }
    return todoItem;
}

export function getAttachemenUploadUrl(todoId: string) {
    return attachementAccess.getUploadUrl(todoId);
}

export async function setTodoAttachementUrl(todoId: string) {
    const attachementUrl = attachementAccess.buildAttachementUrl(todoId);
    const todoItem = await getTodoById(todoId);
    if (todoItem) {
        todoItem.attachmentUrl = attachementUrl;
        return await todoAccess.updateTodo(todoItem);
    }
    return todoItem;
}

export async function deleteTodoById(todoId): Promise<boolean> {
    const todoItem = await getTodoById(todoId);
    if (!todoItem) {
        return false;
    }

    return await todoAccess.deleteTodo(todoItem);
}
