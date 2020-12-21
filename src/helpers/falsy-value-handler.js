import _ from 'lodash'

export const getValue = (obj, variable, defaultValue = false) => {
  let isset = true
  if (typeof obj !== 'undefined') {
    let parts = variable.split('.')
    for (var i = 0; i < parts.length; i++) {
      if (isset !== false) {
        let variables = parts[i].match(/([a-zA-Z0-9-_]+)/g) || [parts[i]]
        variables.forEach(v => {
          if (isset !== false && typeof obj !== 'undefined' && obj !== null && typeof obj[v] !== 'undefined') {
            obj = obj[v]
          } else {
            isset = false
          }
        })
      }
    }
  } else {
    isset = false
  }
  return isset === true ? obj : defaultValue
}

export const isSet = (obj, variable, others = []) => {
  let isset = getValue(obj, variable)
  let result = []
  if (isset !== false && others.length > 0) {
    for (let other of others) {
      if (other === 'notNull') {
        result.push(isNull(obj, variable))
      } else if (other === 'notEmpty') {
        result.push(isEmpty(obj, variable))
      }
    }
    isset = !result.some(v => v === true)
  }
  return isset !== false
}

export const isNull = (obj, variable) => {
  let isnull = false
  if (typeof obj !== 'undefined') {
    if (typeof variable !== 'undefined') {
      let parts = variable.split('.')
      for (var i = 0; i < parts.length; i++) {
        if (isnull === false) {
          let variables = parts[i].match(/(?=\S*[_-])([a-zA-Z-_]+)/g) || [parts[i]]
          variables.forEach(v => {
            if (isnull === false && typeof obj[v] !== 'undefined' && obj[v] !== null) {
              obj = obj[v]
            } else {
              isnull = true
            }
          })
        }
      }
    } else {
      if (obj === null) {
        isnull = true
      }
    }
  } else {
    isnull = true
  }
  return isnull
}

export const isEmpty = (obj, variable) => {
  let isempty = false
  if (typeof obj !== 'undefined') {
    if (typeof variable !== 'undefined') {
      let parts = variable.split('.')
      for (var i = 0; i < parts.length; i++) {
        if (isempty === false) {
          let variables = parts[i].match(/(?=\S*[_-])([a-zA-Z-_]+)/g) || [parts[i]]
          variables.forEach(v => {
            if (
              isempty === false &&
              typeof obj[v] !== 'undefined' &&
              obj[v] !== null &&
              obj[v] !== '' &&
              obj[v] !== [] &&
              obj !== 0 &&
              obj !== false
            ) {
              obj = obj[v]
            } else {
              isempty = true
            }
          })
        }
      }
    } else {
      if (typeof obj === 'undefined' || obj === null || obj === '' || obj === [] || obj === 0 || obj === false) {
        isempty = true
      }
    }
  } else {
    isempty = true
  }
  return isempty
}

export const removeFalsyValues = data => {
  return _(data)
    .omitBy(_.isUndefined)
    .omitBy(_.isNull)
    .value()
}
