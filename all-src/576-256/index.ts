/**
 * 256 * 576
 */
import * as echarts from 'echarts'
import axios from 'axios'
import './index.styl'
import 'normalize.css'
import util from './util/util'

// const themeColor: string = '#B7E2FF'
const themeColor: string = 'white'

interface optionObj {
  echartsTrMax?: number //左表格单页最大条目数
  tableTrMax?: number //右表格单页最大条目数
  echartsSpeed?: number //左表格速度
  tableSpeed?: number //右表格速度
  ajaxSpeed?: number //ajax更新速度
  echartsFontSize?: number //左表格字体大小
  tableFontSize?: number //右表格字体大小
  areaId?: number //区域ID
}

const urlOptionString: string = window.location.search
let Option: optionObj = {
  echartsTrMax: 11,
  tableTrMax: 8,
  echartsSpeed: 5000,
  tableSpeed: 5000,
  ajaxSpeed: 1000,
  echartsFontSize: 14,
  tableFontSize: 13,
  areaId: 24
}

let urlOption: optionObj = util.getUrlOption(urlOptionString)
for (const key in urlOption) {
  const element = urlOption[key]
  Option[key] = element
}

const echartsTrMax: number = Option.echartsTrMax
const tableTrMax: number = Option.tableTrMax
const echartsSpeed: number = Option.echartsSpeed
const tableSpeed: number = Option.tableSpeed
const echartsFontSize: number = Option.echartsFontSize

let total_table = ((document.querySelector(
  '#total_table'
) as HTMLElement).style.fontSize = `${Option.tableFontSize}px`)
let cause_table = ((document.querySelector(
  '#cause_table'
) as HTMLElement).style.fontSize = `${Option.tableFontSize}px`)

//区域id
const areaId: number = Option.areaId

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
        bottom: '0%',
        top: '2%',
        containLabel: true
      },
      xAxis: {
        name: '',
        minInterval: 1,
        show: false
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          fontSize: echartsFontSize
        },
        axisTick: {
          interval: 0
        }
      },
      textStyle: {
        fontFamily: 'Arial',
        color: themeColor
      },
      visualMap: {
        show: false,
        inRange: {
          color: '#026ab3'
        }
      },
      series: [
        {
          barCategoryGap: '30%',
          barMinHeight: 5,
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
    let index: number = 0
    if (src.length == THAT.response.length) {
      THAT.response = src
      return
    }
    if (THAT.interval) clearInterval(THAT.interval)
    THAT.response = src
    function playFun() {
       // 最后一页如果数量不足 取第一页的信息填补
       let target = THAT.response.slice(index * THAT.trMax, (index + 1) * THAT.trMax)
       if(target.length < THAT.trMax) {
         let diffNum = THAT.trMax - target.length
         target = [...THAT.response.slice(0, diffNum), ...target]
         // let diffArr = THAT.response.splice(0, diffNum)
         // THAT.response = [...THAT.response, ...diffArr]
       }
       THAT.updateData(target)
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
      const trMax: number = personInAuth.trMax
      const deptArr = []
      //过滤小于等于0的数据
      data.deptInPersonDto = data.deptInPersonDto.filter(x => {
        return x.inCount > 0
      })
      for (let i = 0; i < Math.ceil(data.deptInPersonDto.length / trMax); i++) {
        deptArr.push(
          data.deptInPersonDto.slice(i * trMax, (i + 1) * trMax).reverse()
        )
      }
      let carTotal: number = 0
      data.causeDto.map(x => {
        carTotal += Number(x.count)
      })

      personInAuth.play(Array.prototype.concat.apply([], deptArr))
      causeTable.play(data.causeDto)

      total.update(data.total, carTotal)
    })
}

updateData()
setInterval(function() {
  updateData()
}, Option.ajaxSpeed)

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

setInterval(function() {
  let nowTime: any = util.getTime(new Date())
  let timeDom: Element = document.querySelector('#nowTime')

  timeDom.innerHTML = `<p>${nowTime.year}年${nowTime.month}月${
    nowTime.day
  }日</p><p>${nowTime.hours}:${nowTime.min}:${nowTime.sec}</p>`
}, 1000)
