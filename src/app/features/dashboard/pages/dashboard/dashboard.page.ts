import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonGrid,IonRow,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { LogoComponent } from 'src/app/widgets/logo/logo.component';


import { Router, RouterModule } from '@angular/router';
import { Inspection } from 'src/app/models/inspection/inspection';
import { Profile } from 'src/app/models/profile/profile';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { from, lastValueFrom, of, switchMap } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ConectionService } from 'src/app/helpers/conection/conection.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from '@capacitor/dialog';
import { TranslationService } from 'src/app/helpers/translation/translation.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../../dialogs/login-dialog/login-dialog.component';
import { ViewWillEnter } from '@ionic/angular';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonItem,
    IonList,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonMenuButton,
    IonMenu,
    TranslationPipe,
    LogoComponent,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonGrid,
    IonRow,RouterModule,LoginDialogComponent
  ],
})
export class DashboardPage implements OnInit,ViewWillEnter {
  list:Inspection[] = [];
  finished:Inspection[] = [];
  loading:boolean = false;
  login:boolean = false;
  profile?:Profile = {
    nomInspector:"",
  };
  current_date: Date = new Date(Date.now());
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private storage: StorageService,
    private connection:ConectionService,
    private router:Router,
    private onbooardService:OnboardService,
    private alertController:AlertController,
    private translationService:TranslationService,
    private dialog:MatDialog
  ) {}
  ionViewWillEnter(): void {
    this.init();
    this.authService.profileChange$.subscribe(async (data) => {
      if(data){
        this.profile = await this.authService.getProfile();
      }
    });
  }

  ngOnInit() {
    /*try {
      this.storage.inspectionState().pipe(
        switchMap(res => {
          if (res) {
            return this.storage.fetchInspections();
          } else {
            return of([]); // Return an empty array when res is false
          }
        })
      ).subscribe(data => {
        this.list = data; // Update the user list when the data changes
      });
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }*/
  }
  async refresh(){
    var d = await this.storage.select("SELECT * FROM inspecciones"); 
    this.list = d;
    if(this.list.length>0){                                                                                                                                                                                                                                                                                                                                                                       
      this.authService.setProfile({
        nomInspector:this.list[0].nomInspector, 
        emailInspector:this.list[0].emailInspector,
        rutInspector:this.list[0].rutInspector,
        telInspector:this.list[0].telInspector,
        codInspector:this.list[0].codInspector
      });
      this.onbooardService.langs().subscribe(async (response) => {
        var s = JSON.parse(response.data.langs)
        var k = (s.filter((item:any)=>item.nombre_idioma == this.list[0].pais ));
        var dk = await this.storage.select(`SELECT * FROM settings WHERE key ='LANGUAGE';`);
        if(dk[0].value!=k[0].codigo){
          await this.storage.update('settings', "key = 'LANGUAGE' ",{ key: 'LANGUAGE', value: k[0].codigo, });
          var d = await this.storage.run("DELETE FROM translates");
          window.location.href = "/"
        } 
      });
    }

  }
  async init(){
    this.login = true;
    var dl = await this.storage.select("SELECT * FROM inspecciones"); 
    this.list = dl;
   var d = this.connection.isOnline$.subscribe(async (connection) => {
     if (connection) {
      console.log("CON CONEXION")
      try {
        this.loading = true;
        // Verificar conexion con el servidor
        try{
          var ping = (await (this.dashboardService.ping()));
          if(ping){
            var result = (await lastValueFrom(this.dashboardService.inspectionList()));
            for (var i = 0; i < result.data.list.length; i++) {
              var item = result.data.list[i];
              console.log(item);
              var d = await this.storage.select(`SELECT id FROM inspecciones WHERE cod_inspeccion = '${item.cod_inspeccion}'`);
              if (d.length == 0) {
                await this.storage.insert("inspecciones", item);
              }
            }
          }
          var dl = await this.storage.select("SELECT * FROM inspecciones"); 
          this.list = dl.filter((item)=>!item.completed);
          this.finished = dl.filter((item)=>item.completed);

          if(this.list.length>0){
            this.authService.setProfile({
              nomInspector:this.list[0].nomInspector, 
              emailInspector:this.list[0].emailInspector,
              rutInspector:this.list[0].rutInspector,
              telInspector:this.list[0].telInspector,
              codInspector:this.list[0].codInspector
            });
          }
          this.loading = false;
        }
        catch(e){
          this.login = false;
          /*dialogRef.afterClosed().subscribe((result)=>{
            if(result){
              this.init();
            }
          })*/
          /*let alert = await this.alertController.create({
            header:(new TranslationPipe(this.translationService)).transform("Error",'ho_error'),
            subHeader:"",
            message:(new TranslationPipe(this.translationService)).transform("Credenciales expiradas",'ho_error_message'),
            buttons:[(new TranslationPipe(this.translationService)).transform("Aceptar",'ho_error_aceptar')]
          });
          alert.present();
          await this.authService.logout();
          window.location.href="/"*/
        }
      }
      catch (e) {
       console.log(e)
       console.log("ERROR CON CONEXION")
      }
     }
     else {
      console.log("SIN CONEXION")
      //this.refresh();
     }
   })
    /*this.dashboardService.inspectionList().subscribe(async (result)=>{
      this.storage.updateInspections(result.data.list)
      if(this.list.length>0){
        this.authService.setProfile({
          nomInspector:this.list[0].nomInspector, 
          emailInspector:this.list[0].emailInspector,
          rutInspector:this.list[0].rutInspector,
          telInspector:this.list[0].telInspector,
          codInspector:this.list[0].codInspector
        });
      }
    })*/
  }
  relogin(){
    this.dialog.open(LoginDialogComponent)
  }
}
