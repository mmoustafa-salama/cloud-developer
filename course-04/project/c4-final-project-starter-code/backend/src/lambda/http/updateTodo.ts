import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info(`Updating a TODO item with the Id '${todoId}' ...`);

  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const todoItem = await updateTodo(todoId, updatedTodo);
  if (!todoItem) {

    logger.error(`No TODO item with the Id '${todoId}' exist`);

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: `No TODO item with the Id '${todoId}' exist`
      })
    }
  }

  logger.info('TODO item updated sucessfully', todoItem);

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      item: todoItem,
    })
  }
}