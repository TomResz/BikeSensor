import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';
echarts.use([GaugeChart, TooltipComponent, SVGRenderer]);

export interface GaugeOptions{
  minimumValue: number;
  maximumValue: number;
  label: string;
}

@Component({
  selector: 'app-gauge',
  imports: [NgxEchartsModule],
  providers: [
    provideEchartsCore({
      echarts
    }),
  ],
  templateUrl: './gauge.component.html',
  styleUrl: './gauge.component.css',
})
export class GaugeComponent implements OnChanges, OnInit {
  @Input() value: number = 0;
  @Input({required: true}) options : GaugeOptions = {minimumValue: 0, maximumValue: 600, label: ''};
  themeService = inject(ThemeService);

  fontSize: number = 75;
  labelSize: number = 20;
  readonly green: string = '#00FF00';
  readonly yellowGreen: string = '#ADFF2F';
  readonly yellow: string = '#FFFF00';
  readonly orange: string = '#FFA500';
  readonly red: string = '#FF0000';
  gaugeOptions: EChartsOption = {}
  constructor(
    private breakpointObserver: BreakpointObserver,
    private axisLabelObserver: BreakpointObserver
  ) {
  }

  ngOnInit(): void {
    this.initGauge();
    this.initBreakpoints();
  }

  private initGauge(){
    this.gaugeOptions = {
      series: [
        {
          type: 'gauge',
          min: this.options.minimumValue,
          max: this.options.maximumValue,
          center: ['50%','40%'],
          radius: '80%',
          progress: {
            show: false,
            width: 18,
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [0.2, this.green],
                [0.4, this.yellowGreen],
                [0.6, this.yellow],
                [0.8, this.orange],
                [1, this.red],
              ],
            },
          },
          axisTick: {
            show: true,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 13,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10,
            },
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: false,
            fontSize: this.fontSize,
            offsetCenter: [0, '75%'],
            fontFamily: 'Roboto, sans-serif',
            formatter: (value) => `${value} ${this.options.label}`,
          },
          data: [
            {
              value: this.value || 0,
            },
          ],
        },
      ],
    };
  } 

  private initBreakpoints(): void {
    const FONT_SIZES = {
      SMALL: 30,
      LARGE: 45,
    };
  
    const LABEL_SIZES = {
      XSMALL_SMALL: 13,
      MEDIUM: 15,
      LARGE: 20,
    };
  
    this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall])
      .pipe(
        map((result) => {
          return (result.breakpoints[Breakpoints.XSmall] || result.breakpoints[Breakpoints.Small])
            ? FONT_SIZES.SMALL
            : FONT_SIZES.LARGE;
        })
      )
      .subscribe((newFontSize) => {
        this.fontSize = newFontSize;
        this.updateGaugeOptions();
      });
  
    this.axisLabelObserver
      .observe([Breakpoints.Large, Breakpoints.Small, Breakpoints.XSmall, '(max-height: 1000px)'])
      .pipe(
        map((result) => {
          const isXSmallOrSmall = result.breakpoints[Breakpoints.XSmall] || result.breakpoints[Breakpoints.Small];
          const isMaxHeight1000 = result.matches && result.breakpoints['(max-height: 1000px)'];
  
          if (isXSmallOrSmall || isMaxHeight1000) {
            return LABEL_SIZES.XSMALL_SMALL;
          }
          if (result.breakpoints[Breakpoints.Medium]) {
            return LABEL_SIZES.MEDIUM;
          }
          return LABEL_SIZES.LARGE;
        })
      )
      .subscribe((newLabelSize) => {
        this.labelSize = newLabelSize;
        this.updateGaugeOptions();
      });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['value'] ||
      changes['options'] 
    ) {
      console.log("Changes");
      this.updateGaugeOptions();
    }
  }

  updateGaugeOptions() {
    this.gaugeOptions = {
      ...this.gaugeOptions,
      series: [
        {
          ...(this.gaugeOptions.series as any[])[0],
          axisLabel: {
            ...(this.gaugeOptions.series as any[])[0].axisLabel,
            fontSize: this.labelSize,
          },
          detail: {
            ...(this.gaugeOptions.series as any[])[0].detail,
            fontSize: this.fontSize,
          },
          min: this.options.minimumValue,
          max: this.options.maximumValue,
          data: [{ value: this.value, name: this.options.label }],
        },
      ],
    };
  }

  getColorBasedOnValue(value: number): string {
    if (value < 0.2 * this.options.maximumValue) {
      return this.green;
    } else if (value < 0.4 * this.options.maximumValue) {
      return this.yellowGreen;
    } else if (value < 0.6 * this.options.maximumValue) {
      return this.yellow;
    } else if (value < 0.8 * this.options.maximumValue) {
      return this.orange;
    }
    return this.red;
  }
}
