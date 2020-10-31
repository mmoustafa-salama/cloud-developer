import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodoById } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info(`Removing a TODO item with the Id '${todoId}' ...`);

  // Remove a TODO item by id
  if (await deleteTodoById(todoId) !== true) {

    logger.error(`No TODO item with the Id '${todoId}' exist`);

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: `No TODO item with the Id '${todoId}' exist`
      })
    }
  }

  logger.info(`TODO item with the Id '${todoId}' removed sucessfully`);

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: ''
  }
}