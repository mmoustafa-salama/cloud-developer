import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk'
import { TodoItem } from '../../models/TodoItem'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIndexName = process.env.TODO_INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // Remove a TODO item by id
  const todoItem = await getTodoById(todoId);
  if (!todoItem) {
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: `No todo with the Id '${todoId}' exist`
      })
    }
  }

  await deleteTodo(todoItem);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}

async function deleteTodo(todoItem: TodoItem) {
  return await docClient.delete({
    TableName: todosTable,
    Key: {
      "userId": todoItem.userId,
      "createdAt": todoItem.createdAt
    },
    ConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoItem.todoId
    }
  }).promise()
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