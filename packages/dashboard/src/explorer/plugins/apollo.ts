import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import VueApollo from "vue-apollo";

const link = createHttpLink({
  uri: window.configs.APP_GRAPHQL_URL,
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export default new VueApollo({
  defaultClient: apolloClient,
});
