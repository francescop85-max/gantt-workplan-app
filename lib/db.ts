import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _client: NeonQueryFunction<false, false> | null = null

function getClient() {
  if (!_client) _client = neon(process.env.DATABASE_URL!)
  return _client
}

// Tagged template proxy — defers neon() call until first query (safe during build)
const sql = (strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values)

export default sql as NeonQueryFunction<false, false>
