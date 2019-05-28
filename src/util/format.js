import { GRAY, CYAN, YELLOW, RED } from './colors'

const KEYWORDS = {
  'SELECT': GRAY,
  'UPDATE': CYAN,
  'INSERT': YELLOW,
  'DELETE': RED,
}

const formatQuery = (qry, params) => {
  let q = qry.replace('Executing (default):', '')
  q = q.replace('WITH rows as (', '')
  q = q.replace(') SELECT count(*) FROM rows', '')

  for (const kw in KEYWORDS)
    q = q.replaceAll(kw, KEYWORDS[kw](kw))

  let p = params != undefined ? `[${params.join(', ')}]` : ''

  return `${q} ${p}`
}

export default formatQuery


