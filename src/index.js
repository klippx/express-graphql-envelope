const express = require("express");
const { ApolloServer, gql } = require("apollo-server");

const { getEnveloped, typeDefs, resolvers } = require("./schema");

const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("OK!"));
app.post("/", (req, res) => {
  const { parse, validate, contextFactory, execute, schema } = getEnveloped({
    req,
  });

  // Parse the initial request and validate it
  const { query, variables } = req.body;
  const document = parse(query);
  const validationErrors = validate(schema, document);

  if (validationErrors.length > 0) {
    return res.end(JSON.stringify({ errors: validationErrors }));
  }

  Promise.resolve(contextFactory(req))
    .then((context) =>
      execute({
        document,
        schema,
        variableValues: variables,
        contextValue: context,
      })
    )
    .then((r) => res.end(JSON.stringify(result)))
    .catch((e) => res.end(JSON.stringify({ error: e })));
});

//create a server object:
const port = 8080;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const server = new ApolloServer({ typeDefs: gql(typeDefs), resolvers });

// The `listen` method launches a web server.
server
  .listen({
    port: 3000,
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });

// ab -n 20000 -c 3 -X -rk 'http://localhost:8080/' -H 'Content-Type: application/json' --data-raw '{ "query": "query test { hello }" }'
// ab -n 20000 -c 3 -p query.json -T application/json -rk http://localhost:8080
// ab -n 20000 -c 3 -p otp_query.json -T application/json -H 'authorization: Basic something' -rk http://localhost:3089/admin/graphql
