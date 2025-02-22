import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalrService } from '../services/signalr.service';
import { GaugeComponent } from '../components/gauge/gauge.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { HeartbeatComponent } from '../components/heartbeat/heartbeat.component';
import { ChartComponent, CustomChartOptions } from '../components/chart/chart.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { map, Subscription } from 'rxjs';
import { HeaderComponent } from "../components/header/header.component";

@Component({
  selector: 'app-root',
  imports: [
    // RouterOutlet,
    GaugeComponent,
    DropdownComponent,
    HeartbeatComponent,
    ChartComponent,
    CommonModule,
    HeaderComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  signalrService = inject(SignalrService);
  power: number = 0;
  heartRate: number = 0;
  maxPower: number = 600;
  isSmallScreen = false;
  subscriptions: Subscription = new Subscription();


  chartPowerOptions : CustomChartOptions = {
    yAxisName: "Power",
    seriesName : 'Power',
    valueName : 'W',
    areaColor : 'rgba(218, 206, 137, 0.692)',
    lineColor : '#f3ff50da',
    itemColor : "rgba(251, 255, 0, 1)",
  };
  chartHeartRateOptions : CustomChartOptions = {
    yAxisName : "Heart rate",
    seriesName : 'Heart rate',
    valueName :'BPM',
    areaColor : 'rgba(255, 0, 0, 0.56)',
    lineColor : '#ff7f50',
    itemColor :"rgba(255, 0, 0, 1)"
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
    if (parameter === 'speed') {
      console.log(parameter);
    } else {
      console.log(parameter);
    }
  }
  openSetLimitDialog(parameter: string) {
    if (parameter === 'speed') {
      console.log(parameter);
    } else {
      console.log(parameter);
    }
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
