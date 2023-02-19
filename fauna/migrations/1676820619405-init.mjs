import faunadb from 'faunadb'
import createClient from '../utils/createClient.mjs'

const { query: q } = faunadb

const indexQueries = [
  q.CreateIndex({
    name: 'counters_by_key',
    source: q.Collection('counters'),
    terms: [
      {
        field: ['data', 'key'],
      },
    ],
  }),
  q.CreateIndex({
    name: 'counters_by_namespace',
    source: q.Collection('counters'),
    terms: [
      {
        field: ['data', 'namespace'],
      },
    ],
  }),
  q.CreateIndex({
    name: 'namespaces_by_key',
    source: q.Collection('namespaces'),
    terms: [
      {
        field: ['data', 'key'],
      },
    ],
  }),
  q.CreateIndex({
    name: 'unique_Counter_key_namespace',
    source: q.Collection('counters'),
    unique: true,
    values: [
      {
        field: ['data', 'key'],
      },
      {
        field: ['data', 'namespace'],
      },
    ],
  }),
]

const functionQueries = [
  q.Update(q.Function('counters_by_namespace_key'), {
    body: q.Query(
      q.Lambda(
        ['namespaceKey', 'size', 'after', 'before'],
        q.Let(
          {
            match: q.Match(
              q.Index('counters_by_namespace'),
              q.Select(
                'ref',
                q.Get(
                  q.Match(q.Index('namespaces_by_key'), q.Var('namespaceKey'))
                )
              )
            ),
            page: q.If(
              q.Equals(q.Var('before'), null),
              q.If(
                q.Equals(q.Var('after'), null),
                q.Paginate(q.Var('match'), {
                  size: q.Var('size'),
                }),
                q.Paginate(q.Var('match'), {
                  size: q.Var('size'),
                  after: q.Var('after'),
                })
              ),
              q.Paginate(q.Var('match'), {
                size: q.Var('size'),
                before: q.Var('before'),
              })
            ),
          },
          q.Map(q.Var('page'), q.Lambda('ref', q.Get(q.Var('ref'))))
        )
      )
    ),
  }),
  q.Update(q.Function('increment_counter'), {
    body: q.Query(
      q.Lambda(
        ['namespaceKey', 'key'],
        q.Let(
          {
            counter: q.Get(
              q.Intersection(
                q.Match(
                  q.Index('counters_by_namespace'),
                  q.Select(
                    'ref',
                    q.Get(
                      q.Match(
                        q.Index('namespaces_by_key'),
                        q.Var('namespaceKey')
                      )
                    )
                  )
                ),
                q.Match(q.Index('counters_by_key'), q.Var('key'))
              )
            ),
          },
          q.Update(q.Select('ref', q.Var('counter')), {
            data: {
              value: q.Add(q.Select(['data', 'value'], q.Var('counter')), 1),
            },
          })
        )
      )
    ),
  }),
]

export async function migration() {
  const client = createClient()

  await Promise.all(indexQueries.map((fqlQuery) => client.query(fqlQuery)))
  await Promise.all(functionQueries.map((fqlQuery) => client.query(fqlQuery)))
}

export async function applied() {
  const client = createClient()

  return client.query(q.Exists(q.Index('counters_by_key')))
}
