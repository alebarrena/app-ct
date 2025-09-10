import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Api } from 'src/app/helpers/api/api';

@Injectable({
  providedIn: 'root'
})
export class OnboardService {

  constructor() { }
  private isOnboardedInSubject = new BehaviorSubject<boolean>(this.checkLocalStorage());

  checkOnboard$ = this.isOnboardedInSubject.asObservable();

  private checkLocalStorage(): boolean {
    return localStorage.getItem("onboard-see")!=null;
  }

  checkOnboard(): boolean {
    return this.isOnboardedInSubject.value;
  }
  init(){
    localStorage.setItem('onboard-see',"1");
    this.isOnboardedInSubject.next(true);
  }
  langOnboard(idioma:string){
    return new Api().get('/traducciones/onboard', { params:{idioma},auth: true });
  }
  langPackage(idioma:string){
    return new Api().get('/traducciones/package', { params:{idioma},auth: true });
  }
  langs(){
    return new Api().get('/traducciones', {  });
  }
}
