import gql from ''

const QUERY_ME = gql`
query me {
    me {
      _id
      username
      email
    }
 }
`