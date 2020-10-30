import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'
import { TodoItem } from '../../models/TodoItem'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIndexName = process.env.TODO_INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const todoItem = await updateTodo(todoId, updatedTodo);
  if (!todoItem) {
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: `No todo with the Id '${todoId}' exist`
      })
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: todoItem,
    })
  }
}

async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest) {

  const todoItem = await getTodoById(todoId)
  if (todoItem) {
    todoItem.name = updatedTodo.name;
    todoItem.dueDate = updatedTodo.dueDate;
    todoItem.done = updatedTodo.done;

    await docClient.put({
      TableName: todosTable,
      Item: todoItem
    }).promise()
  }
  return todoItem;
}

async function getTodoById(todoId: string): Promise<TodoItem> {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: todoIndexName,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    }
  }).promise()

  if (result.Count !== 0) {
    return result.Items[0] as TodoItem
  }

  return undefined;
}