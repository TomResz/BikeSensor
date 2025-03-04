import { Injectable } from '@angular/core';
import { ChartData } from '../components/chart/chart.component';

@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  // TO DO
  // Connect it to the backend
  public getData(key: string): ChartData[] {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  setData(key: string, data: ChartData[]): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
}
