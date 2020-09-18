import express, { Router, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, deleteAllLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage/", async (req: Request, res: Response, next: NextFunction) => {

    let { image_url } = req.query;

    // 1. validate the image_url query
    if (!image_url) {
      return res.status(400)
        .send(`image_url is required`);
    }

    // 2. call filterImageFromURL(image_url) to filter the image
    const filteredPath = await filterImageFromURL(image_url);

    // 3. send the resulting file in the response
    res.sendFile(filteredPath);

   return next();
  }, (req, res) => {
    // 4. deletes any files on the server on finish of the response
    deleteAllLocalFiles();

    return res.status(200);
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();