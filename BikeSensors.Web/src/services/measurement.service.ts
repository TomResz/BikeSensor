import { Injectable } from '@angular/core';
import { PowerData } from '../components/chart/chart.component';

@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  public getData(key: string): PowerData[] {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  setData(key: string, data: PowerData[]): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
}
