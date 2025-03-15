import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from '@ngneat/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map } from 'rxjs';
import { SignalrService } from '../../services/signalr.service';
import { ChartComponent, CustomChartOptions } from '../chart/chart.component';
import { GaugeOptionsDialogComponent } from '../gauge-options-dialog/gauge-options-dialog.component';
import { GaugeComponent, GaugeOptions } from '../gauge/gauge.component';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { HeaderComponent } from '../header/header.component';
import { HeartbeatComponent } from '../heartbeat/heartbeat.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    GaugeComponent,
    DropdownComponent,
    HeartbeatComponent,
    ChartComponent,
    CommonModule,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  signalrService = inject(SignalrService);
  dialogService = inject(DialogService);
  toastrService = inject(ToastrService);

  power: number = 0;
  heartRate: number = 0;
  maxPower: number = 600;
  isSmallScreen = false;
  subscriptions: Subscription = new Subscription();

  powerGuageOptions: GaugeOptions = {
    minimumValue: 0,
    maximumValue: 400,
    label: 'W',
  };

  chartPowerOptions: CustomChartOptions = {
    yAxisName: 'Power',
    seriesName: 'Power',
    valueName: 'W',
    areaColor: 'rgba(218, 206, 137, 0.692)',
    lineColor: 'rgba(255, 136, 0, 1)',
    itemColor: '#f3ff50da',
  };

  chartHeartRateOptions: CustomChartOptions = {
    yAxisName: 'Heart rate',
    seriesName: 'Heart rate',
    valueName: 'BPM',
    areaColor: 'rgba(255, 0, 0, 0.56)',
    lineColor: '#ff7f50',
    itemColor: 'rgba(255, 0, 0, 1)',
  };

  powerOptions = [
    { label: 'Set Limits', action: () => this.openSetLimitDialog('power') },
    { label: 'Reset parameters', action: () => this.resetParameters('power') },
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 1000px)'])
      .pipe(map((value) => value.matches))
      .subscribe((result) => {
        this.isSmallScreen = result;
      });
  }

  resetParameters(parameter: string) {
    if (parameter === 'power') {
      this.powerGuageOptions = {
        ...this.powerGuageOptions,
        minimumValue: 0,
        maximumValue: 400,
      };
      this.toastrService.info('Parameters reset successfully', 'Information');
    } else {
      console.log(parameter);
    }
  }
  openSetLimitDialog(parameter: string) {
    const dialogRef = this.dialogService.open(GaugeOptionsDialogComponent, {
      data: {
        minValue: this.powerGuageOptions.minimumValue,
        maxValue: this.powerGuageOptions.maximumValue,
      },
      size: 'sm',
    });

    dialogRef.afterClosed$.subscribe((result) => {
      if (result) {
        this.powerGuageOptions = {
          ...this.powerGuageOptions,
          minimumValue: dialogRef.data.minValue,
          maximumValue: dialogRef.data.maxValue,
        };
        this.toastrService.success('Limits set successfully', 'Success');
      }
    });
  }

  ngOnInit(): void {
    this.signalrService.startConnection();
    this.signalrService.addMessageListener();
    this.signalrService.addHeartRateListener();
    this.signalrService.handleDisconnects();

    this.subscriptions.add(
      this.signalrService.power$.subscribe((value) => {
        this.power = value || 0;
      })
    );
    this.subscriptions.add(
      this.signalrService.heartRate$.subscribe((value) => {
        this.heartRate = value || 60;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
