import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { getAllTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Getting all TODO items for a current user ...');

  // Get all TODO items for a current user
  const userId = getUserId(event);
  const todos = await getAllTodos(userId);

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      items: todos
    })
  }
}
