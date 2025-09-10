import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Api } from 'src/app/helpers/api/api';
import { LoginRequest } from 'src/app/helpers/api/requests/login-request';
import { IProfile } from 'src/app/models/profile/profile';

const AUTH_LOGIN_URL ="/auth/login";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn = false;
  constructor() {
  }
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkLocalStorage());
  private isProfileInSubject = new BehaviorSubject<boolean>(this.checkLocalProfile());

  authChange$ = this.isLoggedInSubject.asObservable();
  profileChange$ = this.isProfileInSubject.asObservable();

  private checkLocalStorage(): boolean {
    return localStorage.getItem("auth-token")!=null;
  }
  private checkLocalProfile(): boolean {
    return localStorage.getItem("profile")!=null;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(credentials:LoginRequest):Observable<HttpResponse> {
    return new Api().post(AUTH_LOGIN_URL,{headers:{"Content-Type":"application/json"},data:JSON.stringify({"UserName":credentials.username,"PassWord":credentials.password})});
  }
  async setProfile(data:any){
    localStorage.setItem('profile',JSON.stringify(data));
    this.isProfileInSubject.next(true);
  }
  async setToken(token:string) {
    localStorage.setItem('auth-token',token);
    this.isLoggedInSubject.next(true);
  } 
  async setUserId(token:string) {
    localStorage.setItem('user-id',token);
    this.isLoggedInSubject.next(true);
  } 
  async setUserName(token:string) {
    localStorage.setItem('username',token);
    this.isLoggedInSubject.next(true);
  } 
  getProfile():IProfile {
    return JSON.parse(localStorage.getItem('profile')!);
  } 
  logout(){
    localStorage.removeItem("auth-token")
    //localStorage.removeItem("user-id")
    localStorage.removeItem("username")
    localStorage.removeItem("onboard-see")
    localStorage.removeItem("profile")
    this.isLoggedInSubject.next(false);
  }

}
