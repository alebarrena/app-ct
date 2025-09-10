import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonList,
  IonInput,
  IonIcon,
  IonButton,
  IonLabel,
  IonCard,
  IonCol,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonRow,
  IonText,IonSpinner
} from '@ionic/angular/standalone';
import { LogoComponent } from 'src/app/widgets/logo/logo.component';

import { AlertController } from '@ionic/angular';
import { defineCustomElements } from '@ionic/core/loader';

import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { DashboardService } from 'src/app/features/dashboard/services/dashboard.service';
import { environment } from 'src/environments/environment';


defineCustomElements();

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonRow,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    LogoComponent,
    IonItem,
    IonList,
    IonInput,
    IonIcon,
    IonButton,
    IonLabel,
    IonCard,
    IonCol,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    TranslationPipe,
    ReactiveFormsModule,
    FormsModule,IonSpinner
  ],
})
export class LoginPage implements OnInit {
  error = false;
  loading = false;
  password_hidden = true;
  version = "";
  formAuth = new FormGroup({
    username: new FormControl("",[Validators.required]),
    password: new FormControl("",[Validators.required]),
  });
  constructor(private authService:AuthService,private router:Router,private alertController:AlertController,private storage:StorageService,private onbooardService:OnboardService,private dashboardService:DashboardService) {
    
  }

  ngOnInit() {
    this.version = environment.version;
    this.authService.authChange$.subscribe( (data) => {
      if(data){
      }
    });
  }
  async onSubmit(event:Event){
    this.loading = true;
    this.authService.login(this.formAuth.value).subscribe(async (result)=>{



      var user_id = await localStorage.getItem("user-id")
      if(user_id!=result.data.userId){
        await this.storage.run('DELETE FROM inspecciones;');
        await this.storage.run('DELETE FROM inspecciones_cabecera;');
        await this.storage.run('DELETE FROM inspecciones_contenidos;');
        await this.storage.run('DELETE FROM inspections_media_files;');
        await this.storage.run('DELETE FROM inspections_danos;');
        await this.storage.run('DELETE FROM inspecciones_danos_materialidad;');
        await this.storage.run('DELETE FROM inspecciones_terceros;');
        await this.storage.run('DELETE FROM inspecciones_terceros_sectores;');
        await this.storage.run('DELETE FROM inspecciones_habitantes;');
        await this.storage.run('DELETE FROM inspeccion_meta;');
      }




      this.loading = false;
      if(result.status==200){
        this.authService.setToken(result.data.token);
        this.authService.setUserId(result.data.userId);
        this.authService.setUserName(result.data.username);
        this.dashboardService.inspectionList().subscribe(async (result) => {
          console.log(result.data.list);
          if(result.data.list.length>0){
            this.onbooardService.langs().subscribe(async (response) => {
              var s = JSON.parse(response.data.langs)
              var k = (s.filter((item:any)=>item.nombre_idioma == result.data.list[0].pais ));
              var dk = await this.storage.select(`SELECT * FROM settings WHERE key ='LANGUAGE';`);
              if(dk[0].value!=k[0].codigo){
                await this.storage.update('settings', "key = 'LANGUAGE' ",{ key: 'LANGUAGE', value: k[0].codigo, });
                var d = await this.storage.run("DELETE FROM translates");
                window.location.href = "/"
              } 
              this.loading = false;
            });
          }
          else{
            const alert = await this.alertController.create({
              header: 'Mensaje',
              subHeader: 'Inicio de sesion correcto',
              message: 'No tienes asignado inspecciones',
              buttons: ['Aceptar'],
            });
        
            await alert.present();
          }
          //this.storage.updateInspections(result.data.list)
        });
        //this.router.navigate(['/'],{replaceUrl:true})
        //window.location.href = "/";
      }
      else{

        this.error = result.data.message;
      }
    },(error)=>{
    })
    
    /*.subscribe((response)=>{
      console.log(response)
    },(error)=>{
     // this.authService.setToken("AC");
    })*/
  }
}
