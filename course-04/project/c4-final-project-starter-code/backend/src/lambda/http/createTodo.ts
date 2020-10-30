import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { TodoItem } from '../../models/TodoItem'

import { getUserId } from '../utils'

import * as AWS from 'aws-sdk'
const uuid = require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // Implement creating a new TODO item
  const userId = getUserId(event);
  const todoId = uuid.v4();
  const newItem = await createToDo(userId, todoId, newTodo);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}

async function createToDo(userId: string, todoId: string, newTodo: CreateTodoRequest) {
  const todoItem: TodoItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo,
  }

  await docClient.put({
    TableName: todosTable,
    Item: todoItem
  }).promise()

  return todoItem;
}
