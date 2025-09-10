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
  IonGrid,
  IonRow,
  IonCard,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { LogoComponent } from 'src/app/widgets/logo/logo.component';

import { RouterModule } from '@angular/router';
import { Inspection } from 'src/app/models/inspection/inspection';
import { IProfile, Profile } from 'src/app/models/profile/profile';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { of, switchMap } from 'rxjs';
import { PageLayoutComponent } from 'src/app/widgets/page-layout/page-layout.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonCard,
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
    IonCard,
    IonRow,
    RouterModule,
    PageLayoutComponent,
  ],
})
export class ProfilePage implements OnInit {
  profile: IProfile = {
    nomInspector: '',
    codInspector: '',
    emailInspector: '',
    telInspector: '',
  };
  lang: string = '';
  constructor(
    private authService: AuthService,
    private storage: StorageService
  ) {}
  back() {}
  ngOnInit() {
    this.init();
  }
  async init() {
    var dp = this.authService.getProfile();
    if (dp == null) {
      var dd = await this.storage.select('SELECT * FROM inspecciones');
      if (dd.length > 0) {
        this.authService.setProfile({
          nomInspector: dd[0].nomInspector,
          emailInspector: dd[0].emailInspector,
          rutInspector: dd[0].rutInspector,
          telInspector: dd[0].telInspector,
          codInspector: dd[0].codInspector,
        });
        this.profile = dd[0];
      }
    } else {
      this.profile = dp;
    }
    var d = await this.storage.select(
      `SELECT * FROM settings WHERE key ='LANGUAGE';`
    );
    var dk = await this.storage.select(
      `SELECT * FROM settings WHERE key ='LANGUAGES';`
    );
    this.lang = d[0].value;
    var k = JSON.parse(dk[0].value);
    var ddd = k.filter((item: any) => item.codigo.includes(this.lang));
    this.lang = ddd[0].codigo + ' (' + ddd[0].nombre_idioma + ')';
  }
  async logout() {
    this.authService.logout();
    window.location.href = '/';
  }
}
