import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk'
import { TodoItem } from '../../models/TodoItem'
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.TODO_ATTACHEMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todoIndexName = process.env.TODO_INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // Return a presigned URL to upload a file for a TODO item with the provided id
  const url = getUploadUrl(todoId);

  // Set imageUrl for a TOSO item
  await updateAttachementUrl(todoId);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

async function updateAttachementUrl(todoId: string) {
  const attachementUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const todoItem = await getTodoById(todoId);
  if (todoItem) {
    todoItem.attachmentUrl = attachementUrl;
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