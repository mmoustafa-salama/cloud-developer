import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAttachemenUploadUrl, setTodoAttachementUrl } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // Return a presigned URL to upload a file for a TODO item with the provided id
  const url = getAttachemenUploadUrl(todoId);

  // Set imageUrl for a TODO item
  await setTodoAttachementUrl(todoId);

  return {
    statusCode: 202,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}