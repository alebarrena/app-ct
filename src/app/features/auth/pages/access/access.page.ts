import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonProgressBar, IonSpinner, IonButton } from '@ionic/angular/standalone';
import { LogoComponent } from 'src/app/widgets/logo/logo.component';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { TranslationService } from 'src/app/helpers/translation/translation.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';

@Component({
  selector: 'app-access',
  templateUrl: './access.page.html',
  styleUrls: ['./access.page.scss'],
  standalone: true,
  imports: [IonButton, IonSpinner, IonProgressBar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,LogoComponent]
})
export class AccessPage implements OnInit {
  loading: boolean = false;
  user = false;
  isLogin = true;
  onboard = false;
  access = true;
  progress = 0;
  token?: any;
  package_lang: boolean = false;
  constructor(private router:Router,private storage:StorageService,private translationService:TranslationService,private onbooardService:OnboardService) { }
  async init(){
    var d = await this.storage.select('SELECT * FROM settings;');
    if (d.length == 0) {
      // Configuracionn por defecto
      await this.storage.insert('settings', {
        key: 'LANGUAGE',
        value: window.navigator.language.split('-')[0],
      });
    } else {
      console.log(d);
    }
    //await this.storage.select('DELETE FROM translates;');
    var d = await this.storage.select('SELECT * FROM translates;');
    if (d.length == 0) {
      console.log("BUSCAR")
      this.onbooardService.langs().subscribe(async (response) => {
        this.package_lang = true;
        var langs = JSON.parse(response.data.langs);
        var dl = await this.storage.select(
          "SELECT * FROM settings WHERE key = 'LANGUAGE' ;"
        );
        var defaultLang = langs.filter((item: any) =>
          item.codigo.includes(dl[0].value)
        )[0];
        //await this.storage.insert("settings",{key:"LANGUAGE_VERSION",value:defaultLang.version});
        this.onbooardService
          .langPackage(defaultLang.id_idioma)
          .subscribe(async (data) => {
            var dk = JSON.parse(data.data);
            this.progress = 0;
            for (var i = 0; i < dk.length; i++) {
              await this.storage.insert('translates', {
                tag: dk[i].identificador,
                translation: dk[i].valor,
              });
              this.progress += i / dk.length;
            }
            this.package_lang = false;
            this.loading = false;
          });
      });
    }
    else{
      console.log("CARGAR")
      await this.translationService.get()
      this.package_lang = false;
      this.loading = false;
    }
  }
  ngOnInit() {

  }

}
