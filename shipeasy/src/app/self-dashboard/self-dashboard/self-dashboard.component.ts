import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
// import * as Highcharts from 'highcharts/highmaps';
@Component({
  selector: 'app-self-dashboard',
  templateUrl: './self-dashboard.component.html',
  styleUrls: ['./self-dashboard.component.scss']
})
export class SelfDashboardComponent implements OnInit {
  
  // Highcharts: typeof Highcharts = Highcharts;
  constructor() { }

  ngOnInit(): void {
    // Highcharts.chart('portcallTrands', {
    //   title: {
    //     text: 'ShipEasy Performance',
    //     align: 'center',
    //     style: {
    //       color: 'gray'
    //     },
    //   },
    //   yAxis: {
    //     min: 0,
    //     title: {
    //       text: ''
    //     }
    //   },
    //   legend: {
    //     itemWidth: 150,
    //     itemMarginBottom: 5,
    //     itemStyle: {
    //       color: 'gray',
    //       fontWeight:'normal'
    //     },
        
    //   },
    //   plotOptions: {
    //     column: {
    //       stacking: 'normal',
    //       dataLabels: {
    //         enabled: true,
    //         format: '{point.y}',
    //       }
    //     }
    //   },
    //   xAxis: {
    //     categories: [
    //       "January",
    //       "February",
    //       "March",
    //       "April",
    //       "May",
    //       "June"
    //   ],
    //   },
    //   tooltip: {
    //     pointFormat: '<span >{series.name}</span>: <b>{point.y}</b><br/>',
    //     shared: true
    //   },
    //   series: [
    //     {
    //         "name": "manual count 2024",
    //         type:"line",
    //         "marker": {
    //             "symbol": "circle"
    //         },
    //         "data": [
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0
    //         ]
    //     },
    //     {
    //         "name": "reinitiate count 2024",
    //         type:"line",
    //         "marker": {
    //             "symbol": "circle"
    //         },
    //         "data": [
    //             0,
    //             0,
    //             0,
    //             0,
    //             0,
    //             0
    //         ]
    //     },
    //     {
    //         "name": "vms count 2024",
    //         type:"line",
    //         "marker": {
    //             "symbol": "circle"
    //         },
    //         "data": [
    //             161,
    //             171,
    //             122,
    //             25,
    //             83,
    //             49
    //         ]
    //     },
    //     {
    //         "name": "cancelled count 2024",
    //         type:"line",
    //         "marker": {
    //             "symbol": "circle"
    //         },
    //         "data": [
    //             127,
    //             436,
    //             297,
    //             144,
    //             258,
    //             104
    //         ]
    //     }
    // ]
    // });
  }
  initChart(data?) {
    var chartDom = document.getElementById('main')!;
    var myChart = echarts.init(chartDom);

    var option = {
      title: {
        text: 'Net Profit & Loss',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        bottom: 10
      },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: ['0%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data || [
            { value: 0.00, name: 'Prov. Income' },
            { value: 0.00, name: 'Prov. Expense' }, 
            { value: 0.00, name: 'Prov. Margin' }, 
          ],
          itemStyle: {
            color: function(params: any) {
              const colors = {
                'Prov. Income': '#5470C6',
                'Prov. Expense': '#EE6666',
                'Prov. Margin': '#91CC75', 
              };
              return colors[params.name] || '#000';
            }
          }
         
        }
      ]
    };

    option && myChart.setOption(option);
  }
  

  
}
