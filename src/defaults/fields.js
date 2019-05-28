

export default (fields) => {
  if (fields === undefined)
    return {}
  
  if (fields == 'id') {
    const { INTEGER } = require('../datatypes')
    return {
      id: {
        type: INTEGER,
        key: true,
        nullable: false
      }
    }
  }

  return fields
}