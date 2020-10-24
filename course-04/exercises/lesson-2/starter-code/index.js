'use strict'

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
  console.log('Processing event: ', event);

  // Read and parse "limit" and "nextKey" parameters from query parameters
  let nextKey; // Next key to continue scan operation if necessary
  let limit; // Maximum number of elements to return

  try {
    nextKey = parseNextKeyParameter(event);
    limit = parseLimitParameter(event) || 20;
  } catch (e) {
    console.log('Failed to parse parameters: ' + e.message);

    // Return 400 error if parameters are invalid
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify('Invalid query parameters')
    };
  }
  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    // Set correct pagination parameters
    Limit: limit,
    ExclusiveStartKey: nextKey
  };

  console.log('Scan params: ', scanParams);

  const result = await docClient.scan(scanParams).promise();

  const items = result.Items;

  console.log('Result: ', result);

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  };
};

function parseNextKeyParameter(event) {
  const nextKeyStr = getQueryParameter(event, 'nextKey');
  if (!nextKeyStr) {
    return undefined;
  }

  const urlDecoded = decodeURIComponent(nextKeyStr);
  return JSON.parse(urlDecoded);
}

function parseLimitParameter(event) {
  const limitStr = getQueryParameter(event, 'limit');
  if (!limitStr) {
    return undefined;
  }

  const limit = parseInt(limitStr);
  if (limit <= 0) {
    throw new Error('Limit should be an integer greater than 0.');
  }

  return limit;
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters;
  if (!queryParams) {
    return undefined;
  }

  return queryParams[name];
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null;
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}
