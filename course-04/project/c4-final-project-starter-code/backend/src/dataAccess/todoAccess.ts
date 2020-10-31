import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";

export class TodoDataAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoIndexName = process.env.TODO_INDEX_NAME) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();

        return result.Items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async updateTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();

        return todoItem;
    }

    async getTodoById(todoId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoIndexName,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise();

        if (result.Count !== 0) {
            return result.Items[0] as TodoItem
        }

        return undefined;
    }

    async deleteTodo(todoItem: TodoItem): Promise<boolean> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": todoItem.userId,
                "createdAt": todoItem.createdAt
            },
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoItem.todoId
            }
        }).promise();

        return true;
    }
}