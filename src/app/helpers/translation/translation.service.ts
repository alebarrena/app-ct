import { Injectable } from '@angular/core';
import { StorageService } from '../database/storage/storage.service';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private data:any = null
  private dataLoaded = false;
  constructor(private storageService:StorageService) { }
  getData(){
    return this.data;
  }
  get(){
    if(this.dataLoaded){
      return of(this.data);
    }
    else{
      return this.storageService.select("SELECT * FROM translates;").then(
       data => {
        this.data = data;
        this.dataLoaded = true;
        }
      )
    }
  }
}
