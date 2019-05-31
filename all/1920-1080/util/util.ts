class util {
  static getTime(date: Date) {
    let n: Date = date
    let result: object = {
      year: n.getFullYear(),
      month: n.getMonth() + 1,
      day: n.getDate(),
      week: n.getDay(),
      hours: n.getHours(),
      min: n.getMinutes(),
      sec: n.getSeconds(),
      mil: n.getMilliseconds(),
      stamp: n.getTime()
    }

    let addZero: string[] = ['month', 'day', 'hours', 'min', 'sec']
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        result[key] = String(result[key])
        const element = result[key]
        if (addZero.find(x => x == key)) {
          if (element < 10) {
            result[key] = `0${element}`
          }
        }
      }
    }

    return result
  }

  static getUrlOption(url: string) {
    let result: object = {}
    const urlString = url.slice(url.indexOf('?') + 1)
    urlString.split('&').map(x => {
      let arr = x.split('=')
      result[arr[0]] = parseInt(arr[1])
    })
    return result
  }
}

export default util
