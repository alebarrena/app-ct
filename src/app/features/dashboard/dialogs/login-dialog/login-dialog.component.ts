import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { LogoComponent } from 'src/app/widgets/logo/logo.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
  standalone: true,
  imports: [IonList, 
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
export class LoginDialogComponent  implements OnInit {

  error = false;
  loading = false;
  password_hidden = true;
  formAuth = new FormGroup({
    username: new FormControl("",[Validators.required]),
    password: new FormControl("",[Validators.required]),
  });
  constructor(private authService:AuthService,private router:Router,private storage:StorageService,private onbooardService:OnboardService,private dashboardService:DashboardService) {
    
  }

  ngOnInit() {
    this.authService.authChange$.subscribe( (data) => {
      if(data){
      }
    });
  }
  async onSubmit(event:Event){
    this.loading = true;
    this.authService.login(this.formAuth.value).subscribe(async (result)=>{
      this.loading = false;
      if(result.status==200){
        this.authService.setToken(result.data.token);
        this.authService.setUserId(result.data.userId);
        this.authService.setUserName(result.data.username);
        //this.router.navigate(['/'],{replaceUrl:true})
        //window.location.href = "/";
        window.location.reload();
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
