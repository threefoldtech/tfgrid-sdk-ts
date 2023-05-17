import GridProxyClient, { Network } from 'tf_gridproxy_client'
import TFGridGqlClient, { Networks } from 'tfgrid-gql'

const gqlClient = new TFGridGqlClient(process.env.NETWORK as Networks)
const gridProxyClient = new GridProxyClient(process.env.NETWORK as Network)

export { gqlClient, gridProxyClient }
