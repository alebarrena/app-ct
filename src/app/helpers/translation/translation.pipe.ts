import { Pipe, PipeTransform } from '@angular/core';
import ES from './langs/es';
import { StorageService } from '../database/storage/storage.service';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translation',
  standalone: true
})
export class TranslationPipe implements PipeTransform {
  constructor(private translationService:TranslationService){
  }
  transform(value: string, ...args: any[]): any {
    const propiedades = value.toLowerCase().split('.');
    // Iterar sobre las partes de la propiedad para acceder a cada nivel
    //this.storageService.getCurrentLang();
    var d  = this.translationService.getData();
    var ar = (d!=null)?d:[];
    if(ar.length>0){
      var l  = (ar.filter((item:any)=>item.tag == args[0]));
      if(l.length>0){
        if(args[1]!=null){
          let template =l[0].translation;
          let data = args[1];
          for (let key in data) {
              template = template.replace(new RegExp(`${key}`, 'g'), data[key]);
          }
          return template;
        }
         return (l[0].translation);
      }
    }
    let valor:any = ES;
    return valor[args[0]]!=null?valor[args[0]]:value;
  }

}
