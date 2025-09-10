import { from, map, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';

interface GetParams {
    auth?: boolean;
    params?: any;
    headers?: any;
    cache?: boolean;
    observe?: string;
  }
  interface PostParams {
    auth?: boolean;
    data?: any;
    headers?: any;
    cache?: boolean;
    observe?: string | null;
  }
  interface DataResponse {
    code?: number;
    message?: string;
    data?: any;
  }

export class Api {
    constructor() {
    
    }
    static authCheck(response:any){
      return map((data:any)=>data);
    }
    static _headers(auth?: boolean, headers?: any) {
      var heads: any = {
        accept: 'application/json, text/plain, */*',
        'Access-Control-Allow-Origin':"*",
        ...headers,
      };
      if (auth) {
        var token = localStorage.getItem('auth-token');
        heads = { ...heads, authorization: token };
      }
      return heads;
    }
    ping() {
      const options:HttpOptions = {
        url: environment.api+"/health/status",
      };
      return (new Promise((resolve,reject)=>{
        CapacitorHttp.get(options).then((response)=>{
          resolve(true)
        }).catch((error)=>{
          resolve(false)
        }).finally(()=>{
        })
      }))
      //return this.http.get(url, { headers: h , observe:"response" });
    }
    get(path: string, { auth, params, headers, cache }: GetParams) {
      var _params =
        params != null
          ? Object.keys(params)
              .map((item) => [item, params[item].toString()].join('='))
              .join('&')
          : '';
      var url = environment.api + path;
      var h = Api._headers(auth, headers);
      const options:HttpOptions = {
        url: url,
        headers: h,
        params:params,
      };
      return from(CapacitorHttp.get(options))
      //return this.http.get(url, { headers: h , observe:"response" });
    }
    post(
      path: string,
      { auth, data, headers, cache = false }: PostParams
    ):Observable<HttpResponse>{
      var h = Api._headers(auth, headers);
      var form: any;
      if (h['content-type'] == 'multipart/form-data') {
        form = new FormData();
        for (var i in Object.keys(data)) {
          var key = Object.keys(data)[i];
          form.append(key, data[key]);
        }
      } else {
        form = data;
      }
      let url = environment.api + path;
      const options:HttpOptions = {
        url: url,
        headers: h,
        data:(form),
      };
      return from(CapacitorHttp.post(options));
      //return this.http.post(url, form, { headers: h, observe:"response" });
    }
    put(
      path: string,
      { auth, data, headers, cache = false }: PostParams
    ):Observable<HttpResponse>{
      var h = Api._headers(auth, headers);
      var form: any;
      if (h['content-type'] == 'multipart/form-data') {
        form = new FormData();
        for (var i in Object.keys(data)) {
          var key = Object.keys(data)[i];
          form.append(key, data[key]);
        }
      } else {
        form = data;
      }
      let url = environment.api + path;
      const options = {
        url: url,
        headers: { 'X-Fake-Header': 'Fake-Value' },
        params: { size: 'XL' },
      };
      return from(CapacitorHttp.put(options));
      //return this.http.put(url, form, { headers: h, observe:"response" });
    }
    static async upload() {}
}
