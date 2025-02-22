import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
@Injectable({
  providedIn: 'root',
})
export class SignalrService implements OnDestroy {
  private hubConnection: HubConnection;

  private powerSubject = new BehaviorSubject<number | null>(null);
  private heartRateSubject = new BehaviorSubject<number | null>(null);

  public heartRate$ = this.heartRateSubject.asObservable();
  public power$ = this.powerSubject.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/sensors')
      .build();
  }
  
  ngOnDestroy(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('Connection stopped');
      }).catch((err) => {
        console.log('Error while stopping connection: ' + err);
      });
    }
  }

  public startConnection = () => {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => {
        console.log('Error while starting connection: ' + err);
      });
  };

  public addMessageListener = () => {
    this.hubConnection.on('ReceivePower', (power: number) => {
      this.powerSubject.next(power);
    });
  };

  public addHeartRateListener = () => {
    this.hubConnection.on('ReceiveHeartRate', (heartRate: number) => {
      this.heartRateSubject.next(heartRate);
    })
  }

  public handleDisconnects = () => {
    this.hubConnection.onclose(() => {
      console.log('Connection lost. Attempting to reconnect...');
      setTimeout(() => this.startConnection(), 3000);
    });
  };
}
