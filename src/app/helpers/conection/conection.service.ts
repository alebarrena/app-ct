import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from '../database/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConectionService  {
  private isOnlineSource = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSource.asObservable();

  constructor(private storageService:StorageService){
    window.addEventListener('online', () => {
      this.isOnlineSource.next(true);
      this.onConnect();
    });
    window.addEventListener('offline', () => {
      this.isOnlineSource.next(false);
      this.onDisconnect();
    });
  }

  onConnect() {
    console.log('Conectado a internet');
    console.log("Sincronizar inspecciones")
  }

  onDisconnect() {
    console.log('Sin conexión a internet');
  }
}