function pluralize(time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

export function timeAgo(time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}

export function lowerCase(str) {
  return str.toLowerCase()
}

export function lowerThenCapitalize(str) {
  let lowercase = str.toLowerCase()
  return lowercase.charAt(0).toUpperCase() + lowercase.slice(1)
}

export function capitalize(str) {
  return str.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }

  if ((time + '').length === 10) {
    time = +time * 1000
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    date = new Date(parseInt(time))
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['Year', 'Month', 'Day', 'Hours', 'Minute', 'Seconds', 'Milliseconds'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return 'Just'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + 'minutes ago'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + 'An hour ago'
  } else if (diff < 3600 * 24 * 2) {
    return '1 day ago'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + 'Month' + d.getDate() + 'Day' + d.getHours() + 'Time' + d.getMinutes() + 'Minute'
  }
}

export function nFormatter(num, digits) {
  const si = [
    { value: 1e18, symbol: 'E' },
    { value: 1e15, symbol: 'P' },
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'G' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'k' },
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function formatPrice(value, round, precision) {
  if (value) {
    return round !== undefined && round
      ? Number(Math.round(value + 'e' + precision) + 'e-' + precision).toFixed(2)
      : parseFloat(value).toFixed(2)
  }
  return parseFloat(0.0)
}

export function formatPercentage(value) {
  if (value) {
    return value.toFixed(6)
  }
  return parseFloat(0 + ' %')
}

export function roundDown(number, decimals) {
  decimals = decimals || 0
  return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

export function getNewPromise(handler) {
  let resolve, reject

  let promise = new Promise(function(_resolve, _reject) {
    resolve = _resolve
    reject = _reject
    if (handler) handler(resolve, reject)
  })

  promise.resolve = resolve
  promise.reject = reject
  return promise
}
