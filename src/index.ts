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

class Echarts {
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
  constructor(id: string) {
    let data = [
      ['amount', 'product'],
      [58212, '枣庄市科瑞电力设备有限公司'],
      [78254, '苏州维赛克阀门检测技术有限公司'],
      [41032, '发电部'],
      [12755, '技术支持部'],
      [20145, '中地电气巡检'],
      [79146, '北京高能时代环境技术股份有限公司'],
      [91852, '烟台源帝物流']
      // [101852, 'hh'],
      // [101852, 'hhh'],
      // [101852, 'hh1'],
      // [101852, 'hh2'],
      // [101854, 'hh3'],
      // [101854, 'hh32'],
      // [101854, 'hh33'],
      // [101854, 'hh34'],
      // [101854, 'hh35'],
      // [101854, 'hh36'],
      // [101854, 'hh37'],
      // [101854, 'hh38'],
      // [101854, 'hh39'],
      // [101854, 'hh322'],
      // [101854, 'hh3212'],
      // [101854, 'hh312'],
      // [101854, 'hh35'],
      // [20112, 'ii']
    ]

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
        name: 'amount'
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
            x: 'amount',
            y: 'product'
          }
        }
      ]
    }

    super(id, option)

    this.indexArr = ['inCount', 'deptName']
    this.trMax = 20
    this.speed = 2000
  }

  updateData(src: deptInPersonDto[]) {
    let dataSrc: any = [[this.indexArr]]

    for (const item of src) {
      dataSrc.push([item.inCount, item.deptName])
    }
    console.log(dataSrc)
    this.option.dataset.source = dataSrc
    this.initFuc()
  }

  play(src: deptInPersonDto[]) {
    const THAT = this
    let index: number = 0
    function playFun() {
      THAT.updateData(src.slice(index * THAT.trMax, (index + 1) * THAT.trMax))
      index++
    }
    playFun()
    setInterval(() => {
      if (index >= src.length / this.trMax) index = 0
      playFun()
    }, THAT.speed)
  }
}

class Table {
  id: string
  head: string
  trMax: number
  speed: number
  constructor(id: string) {
    this.id = id
    this.trMax = 20
    this.speed = 2000
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
    let index: number = 0
    function playFun() {
      THAT.uploadData(
        data.slice(index * THAT.trMax, (index + 1) * THAT.trMax),
        total
      )
      index++
    }
    playFun()
    setInterval(() => {
      if (index >= data.length / this.trMax) index = 0
      playFun()
    }, THAT.speed)
  }
}

const personInAuth = new PersonInEchart('#person_auth')
const causeTable = new Table('#cause_table')

const baseUrl: string =
  'https://www.easy-mock.com/mock/5cdb7945f2f8913ca63714d2/test'
axios
  .post(baseUrl + '/basic/projectionreport', {
    areaId
  })
  .then(res => {
    let data = res.data
    personInAuth.play(data.deptInPersonDto)
    causeTable.play(data.causeDto, data.total)
  })
