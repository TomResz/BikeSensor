import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs';

@Component({
  selector: 'app-heartbeat',
  imports: [],
  standalone: true,
  templateUrl: './heartbeat.component.html',
  styleUrl: './heartbeat.component.css',
})
export class HeartbeatComponent implements OnInit {
  @Input() heartbeart: number = 120;
  fontSize : number = 60;
  
  constructor(private fontSizeObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.fontSizeObserver
      .observe([
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
      });

      
  }
}
