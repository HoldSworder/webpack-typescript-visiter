import * as echarts from 'echarts'
import axios from 'axios'
import './index.styl'
import 'normalize.css'

// const themeColor: string = '#B7E2FF'
const themeColor: string = 'white'

const echartsTrMax:number = 20
const tableTrMax:number = 15
const echartsSpeed:number = 15000
const tableSpeed:number = 15000
const echartsFontSize:number = 30

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
        name: '',
        minInterval: 1,
        axisLabel: {
          fontSize: echartsFontSize
        }
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          fontSize: echartsFontSize
        }
      },
      textStyle: {
        fontFamily: 'Arial',
        color: themeColor,
        fontSize: echartsFontSize
      },
      visualMap: {
        show: false,
        inRange: {
          color: '#026ab3'
        }
      },
      series: [
        {
          barMinHeight: 20,
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
    this.trMax = echartsTrMax
    this.speed = echartsSpeed
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
  constructor(id: string) {
    this.id = id
    this.trMax = tableTrMax
    this.speed = tableSpeed
    this.interval
    this.response = []
    this.head = `
    <tr>
      <th>车辆类型</th>
      <th>车数</th>
    </tr>
    `
  }

  uploadData(data: causeDto[]) {
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
    `
  }

  play(data: causeDto[]) {
    const THAT = this
    if (data.length == THAT.response.length) {
      THAT.response = data
      return
    }
    if (THAT.interval) clearInterval(THAT.interval)
    THAT.response = data
    let index: number = 0
    playFun()
    THAT.interval = setInterval(() => {
      if (index >= THAT.response.length / THAT.trMax) index = 0
      playFun()
    }, THAT.speed)

    function playFun() {
      THAT.uploadData(
        THAT.response.slice(index * THAT.trMax, (index + 1) * THAT.trMax)
      )
      index++
    }
  }
}

class totalTable {
  personTotal: number
  carTotal: number
  dom: any
  constructor(id: string) {
    this.personTotal
    this.carTotal
    this.dom = document.querySelector(id).children[0].children[0]
  }

  update(personTotal: number, carTotal: number) {
    this.personTotal = personTotal
    this.carTotal = carTotal
    this.dom.innerHTML = `
    <tr>
      <th>车辆总数</th>
      <th>${this.carTotal}</th>
    </tr>
    <tr>
        <th>人员总数</th>
        <th>${this.personTotal}</th>
    </tr>
    `
  }
}

const personInAuth = new PersonInEchart('#person_auth')
const causeTable = new Table('#cause_table')
const total = new totalTable('#total_table')

let baseUrl: string
if (process.env.NODE_ENV == 'production') {
  baseUrl = ''
} else {
  baseUrl = 'https://www.easy-mock.com/mock/5cdb7945f2f8913ca63714d2/test'
}

function updateData() {
  axios
    .post(baseUrl + '/basic/projectionreport', {
      areaId
    })
    .then(res => {
      let data = res.data
      const trMax:number = personInAuth.trMax
      const deptArr = []
      for (let i = 0; i < Math.ceil(data.deptInPersonDto.length / trMax); i++) {
        deptArr.push(data.deptInPersonDto.slice(i * trMax, (i + 1) * trMax).reverse())
      }
      personInAuth.play(Array.prototype.concat.apply([], deptArr))
      causeTable.play(data.causeDto)

      let carTotal: number = 0
      data.causeDto.map(x => {
        carTotal += Number(x.count)
      })

      total.update(data.total, carTotal)
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
