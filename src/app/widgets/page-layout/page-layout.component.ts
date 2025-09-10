import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {IonHeader,IonTitle,IonButton,IonContent,IonToolbar,IonButtons,IonIcon} from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  imports:[IonHeader,IonTitle,IonButton,IonToolbar,IonContent,IonButtons,IonIcon,TranslationPipe],
  standalone:true,
})
export class PageLayoutComponent  implements OnInit {
  @Input("title") title:any = "";
  constructor(private router:Router) { }

  ngOnInit() {}
  historyBack(){
   // var d  = window.location.href.replace("http://","").replace("https://","").split("/");
    history.back();
    //this.router.navigateByUrl("/"+d.join("/"))
  }
}
