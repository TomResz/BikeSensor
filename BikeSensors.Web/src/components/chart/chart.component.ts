import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Color, EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts from 'echarts/core';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import { ThemeService } from '../../services/theme.service';
import { MeasurementService } from '../../services/measurement.service';

echarts.use([
  LineChart,
  TooltipComponent,
  GridComponent,
  CanvasRenderer,
  TitleComponent,
]);

export interface ChartData {
  name: Date;
  value: number;
}
export interface CustomChartOptions {
  yAxisName: string;
  seriesName: string;
  valueName: string;
  areaColor: string;
  lineColor: string;
  itemColor: string;
}

@Component({
  selector: 'app-chart',
  imports: [NgxEchartsModule],
  providers: [
    provideEchartsCore({
      echarts,
    }),
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() measurement: number = 0;
  @Input({ required: true }) options: CustomChartOptions | null = null;

  measurementService = inject(MeasurementService);
  themeService = inject(ThemeService);

  chartOption: EChartsOption = {};
  measurementData: ChartData[] = [];
  tempData: ChartData[] = [];

  chartData: any[] = [];
  avgLineData: any[] = [];

  ngOnInit(): void {
    if (!this.options) {
      console.error('No options provided');
      return;
    }

    this.loadData();
    this.setData();

    this.initChar(
      this.options!.yAxisName,
      this.options!.seriesName,
      this.options!.valueName,
      this.options!.lineColor,
      this.options!.areaColor,
      this.options!.itemColor
    );
  }

  private setData() {
    setInterval(() => {
      this.measurementService.setData(
        `${this.options!.seriesName}-data`,
        this.measurementData
      );

      this.measurementService.setData(
        `${this.options!.seriesName}-chart`,
        this.chartData
      );
      this.measurementService.setData(
        `${this.options!.seriesName}-avg`,
        this.avgLineData
      );
    }, 5000);
  }

  loadData() {
    this.measurementData = this.measurementService.getData(
      `${this.options!.seriesName}-data`
    );
    this.chartData = this.measurementService.getData(
      `${this.options!.seriesName}-chart`
    );
    this.avgLineData = this.measurementService.getData(
      `${this.options!.seriesName}-avg`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['measurement']) {
      const newData: ChartData = {
        name: new Date(),
        value: this.measurement,
      };
      this.updateChart(newData);
    }
  }

  initChar(
    yAxisName: string,
    seriesName: string,
    valueName: string,
    lineColor: Color,
    areaColor: Color,
    itemColor: Color
  ) {
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const timestamp = params[0].value[0];
          const value = params[0].value[1];
          const date = new Date(timestamp);
          return `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} : ${value} ${valueName}`;
        },
        axisPointer: {
          animation: false,
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        width: 'auto',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
        name: 'Date',
        min: (value: any) => value.min, 
        max: (value: any) => value.max, 
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '10%'],
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: '#ddd',
          },
        },
        name: yAxisName,
        min: (value: any) => (value.min * 0.92).toFixed(0),
      },
      series: [
        {
          name: seriesName,
          type: 'line',
          smooth: true,
          animation: true,
          showSymbol: true,
          symbolSize: 8,
          data: this.chartData,
          lineStyle: {
            width: 3,
            color: lineColor,
          },
          itemStyle: {
            color: itemColor,
          },
          areaStyle: {
            color: areaColor,
          },
        },
        {
          name: 'Avg',
          type: 'line',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 2,
            type: 'dashed',
            color: lineColor,
          },
          data: this.avgLineData,
          animation: false,
        },
      ],
    };
  }

  updateChart(newData: ChartData) {
    this.measurementData.push(newData);
    const tempDateLen = this.tempData.push(newData);

    const totalAvg =
      this.measurementData
        .filter((data) => data.value > 0)
        .reduce((a, b) => a + b.value, 0) /
      this.measurementData.filter((data) => data.value > 0).length;
    this.avgLineData = this.chartData.map((point) => [point[0], totalAvg]);

    if (tempDateLen < 2) {
      return;
    }

    const avg = Number(
      (
        this.tempData.reduce((a, b) => a + b.value, 0) / this.tempData.length
      ).toFixed(0)
    );

    this.tempData.shift();
    const timestamp = Date.now();
    const length = this.chartData.push([timestamp, avg]);

    if (length > 80) {
      this.chartData.splice(0, 5);
    }

    this.chartOption = {
      ...this.chartOption,
      series: [
        { ...(this.chartOption.series as any[])[0], data: this.chartData },
        { ...(this.chartOption.series as any[])[1], data: this.avgLineData },
      ],
    };
  }
 
}
