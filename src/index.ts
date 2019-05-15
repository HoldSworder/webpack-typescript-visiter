import * as echarts from 'echarts'
import axios from 'axios'
import './index.styl'
import 'normalize.css'

const themeColor: string = '#B7E2FF'

//区域id
const areaId: number = 24

interface causeDto {
  visitorCause: string
  count: string
}

interface deptInPersonDto {
  deptCode: string
  deptName: string
  inCount: number
}

abstract class Echarts {
  theme: string
  option: any
  id: string
  initDom: any
  constructor(id: string, option: object) {
    this.theme = 'macarons'
    this.option = option
    this.id = id
    this.initDom = echarts.init(document.querySelector(this.id))

    this.initFuc()
  }

  initFuc() {
    this.initDom.setOption(this.option)
  }

  changeOption(fun) {
    fun.call(this)

    this.initFuc()
  }
}

class PersonInEchart extends Echarts {
  indexArr: string[]
  trMax: number
  speed: number
  interval: any
  response: deptInPersonDto[]
  constructor(id: string) {
    let data = []

    let option: any = {
      dataset: {
        source: data
      },
      grid: {
        left: '0%',
        right: '5%',
        bottom: '5%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        name: 'inCount'
      },
      yAxis: {
        type: 'category'
      },
      textStyle: {
        fontFamily: 'Arial',
        color: themeColor,
        fontSize: '32px'
      },
      visualMap: {
        show: false,
        inRange: {
          color: '#026ab3'
        }
      },
      series: [
        {
          type: 'bar',
          label: {
            normal: {
              show: true
            }
          },
          encode: {
            x: 'inCount',
            y: 'deptName'
          }
        }
      ]
    }

    super(id, option)

    this.indexArr = ['inCount', 'deptName']
    this.trMax = 20
    this.speed = 15000
    this.interval
    this.response = []
  }

  updateData(src: deptInPersonDto[]) {
    let dataSrc: any = [[this.indexArr]]

    for (const item of src) {
      dataSrc.push([item.inCount, item.deptName])
    }
    this.option.dataset.source = dataSrc
    this.initFuc()
  }

  play(src: deptInPersonDto[]) {
    const THAT = this
    if (src.length == THAT.response.length) {
      THAT.response = src
      return
    }
    if (THAT.interval) clearInterval(THAT.interval)
    THAT.response = src
    let index: number = 0
    function playFun() {
      THAT.updateData(
        THAT.response.slice(index * THAT.trMax, (index + 1) * THAT.trMax)
      )
      index++
    }
    playFun()
    THAT.interval = setInterval(() => {
      if (index >= THAT.response.length / THAT.trMax) index = 0
      playFun()
    }, THAT.speed)
  }
}

class Table {
  id: string
  head: string
  trMax: number
  speed: number
  interval: any
  response: causeDto[]
  total: number
  constructor(id: string) {
    this.id = id
    this.trMax = 20
    this.speed = 15000
    this.interval
    this.response = []
    this.total
    this.head = `
    <tr>
      <th>车辆名称</th>
      <th>车数（辆）</th>
    </tr>
    `
  }

  uploadData(data: causeDto[], total: number = 0) {
    const tableDom = document.querySelector(this.id).children[0].children[0]
    const THAT = this

    let html: string = ''

    for (const item of data) {
      html += `
      <tr>
        <td>${item.visitorCause}</td>
        <td>${item.count}</td>
      </tr>
      `
    }

    tableDom.innerHTML = `
      ${this.head}
      ${html}
      <tr>
        <td>总数</td>
        <td>${total}</td>
      </tr>
    `
  }

  play(data: causeDto[], total: number = 0) {
    const THAT = this
    if (data.length == THAT.response.length) {
      THAT.response = data
      THAT.total = total
      return
    }
    if (THAT.interval) clearInterval(THAT.interval)
    THAT.response = data
    THAT.total = total
    let index: number = 0
    playFun()
    THAT.interval = setInterval(() => {
      if (index >= THAT.response.length / THAT.trMax) index = 0
      playFun()
    }, THAT.speed)

    function playFun() {
      THAT.uploadData(
        THAT.response.slice(index * THAT.trMax, (index + 1) * THAT.trMax),
        THAT.total
      )
      index++
    }
  }
}

const personInAuth = new PersonInEchart('#person_auth')
const causeTable = new Table('#cause_table')

// const baseUrl = 'https://www.easy-mock.com/mock/5cdb7945f2f8913ca63714d2/test'
function updateData() {
  axios
    .post('/basic/projectionreport', {
      areaId
    })
    .then(res => {
      let data = res.data
      personInAuth.play(data.deptInPersonDto)
      causeTable.play(data.causeDto, data.total)
    })
}

updateData()
setInterval(function() {
  updateData()
}, 15000)

// setTimeout(function() {
//   axios
//     .post(baseUrl + '/basic/projectionreport1', {
//       areaId
//     })
//     .then(res => {
//       console.log('change')
//       let data = res.data
//       personInAuth.play(data.deptInPersonDto)
//       causeTable.play(data.causeDto, data.total)
//     })
// }, 10000)

// setTimeout(function() {
//   axios
//     .post(baseUrl + '/basic/projectionreport2', {
//       areaId
//     })
//     .then(res => {
//       console.log('change2')
//       let data = res.data
//       personInAuth.play(data.deptInPersonDto)
//       causeTable.play(data.causeDto, data.total)
//     })
// }, 20000)
