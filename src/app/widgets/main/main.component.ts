import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonCol,
  IonGrid,IonRow,IonRouterOutlet
} from '@ionic/angular/standalone';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone:true,
  imports:[IonTabs,IonTabBar,IonTabButton,IonIcon,IonLabel,IonContent,IonRouterOutlet,IonMenu,IonHeader,IonToolbar,IonTitle,IonMenuButton,TranslationPipe]
})
export class MainComponent  implements OnInit {
  @ViewChild('tabs', {static: true}) tabs?:IonTabs

  constructor(private router:Router,private onboardService:OnboardService) {

  }
  isActive(section:string){
    return window.location.href.includes(section);
  }
  ngOnInit() {
  }
  openProfile(){
    this.router.navigateByUrl("/profile");
  }
  openDashboard(){
    this.router.navigateByUrl("/dashboard");
  }
  openInspections(){
    this.router.navigateByUrl("/inspections");
  }
}
