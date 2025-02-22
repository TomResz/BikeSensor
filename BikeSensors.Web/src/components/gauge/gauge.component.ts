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
  @Input() value: number | null = 0;
  @Input() minimumValue: number = 0;
  @Input() maximumValue: number = 600;
  @Input() label: string = '';
  themeService = inject(ThemeService);

  fontSize: number = 75;
  labelSize: number = 20;
  readonly green: string = '#00FF00';
  readonly yellowGreen: string = '#ADFF2F';
  readonly yellow: string = '#FFFF00';
  readonly orange: string = '#FFA500';
  readonly red: string = '#FF0000';

  constructor(
    private breakpointObserver: BreakpointObserver,
    private axisLabelObserver: BreakpointObserver
  ) {}

  gaugeOptions: EChartsOption = {
    series: [
      {
        type: 'gauge',
        min: this.minimumValue,
        max: this.maximumValue,
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
          offsetCenter: [0, '80%'],
          fontFamily: 'Roboto, sans-serif',
          formatter: (value) => `${value} ${this.label}`,
        },
        data: [
          {
            value: this.value || 0,
          },
        ],
      },
    ],
  };

  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.Large,
        Breakpoints.Medium,
        Breakpoints.Small,
        Breakpoints.XSmall,
      ])
      .pipe(
        map((result) => {
          if (
            result.breakpoints[Breakpoints.XSmall] ||
            result.breakpoints[Breakpoints.Small]
          ) {
            return 30;
          }
          return 45;
        })
      )
      .subscribe((newFontSize) => {
        this.fontSize = newFontSize;
        this.updateGaugeOptions();
      });

    this.axisLabelObserver
      .observe([
        Breakpoints.Large,
        Breakpoints.Small,
        Breakpoints.XSmall,
        'max-heigth: 1000px',
      ])
      .pipe(
        map((result) => {
          if (
            result.breakpoints[Breakpoints.XSmall] ||
            result.breakpoints[Breakpoints.Small] || 
            'max-heigth: 1000px'
          ) {
            return 13;
          } else if (result.breakpoints[Breakpoints.Medium,'max-heigth: 1000px']) {
            return 15;
          }
          return 20;
        })
      )
      .subscribe((newFontSize) => {
        {
          this.labelSize = newFontSize;
          this.updateGaugeOptions();
        }
      });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['value'] ||
      changes['maximumValue'] ||
      changes['minimumValue'] ||
      changes['label']
    ) {
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
          min: this.minimumValue,
          max: this.maximumValue,
          data: [{ value: this.value, name: this.label }],
        },
      ],
    };
  }

  getColorBasedOnValue(value: number): string {
    if (value < 0.2 * this.maximumValue) {
      return this.green;
    } else if (value < 0.4 * this.maximumValue) {
      return this.yellowGreen;
    } else if (value < 0.6 * this.maximumValue) {
      return this.yellow;
    } else if (value < 0.8 * this.maximumValue) {
      return this.orange;
    }
    return this.red;
  }
}
