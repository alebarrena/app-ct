import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { LoginPage } from 'src/app/features/auth/pages/login/login.page';
import { CommonModule } from '@angular/common';
import {
  IonSpinner,
  IonContent,
  IonButton,
  IonToast,
  IonTitle,
  IonFooter,
  IonToolbar,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { LogoComponent } from '../logo/logo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { of, switchMap } from 'rxjs';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { TranslationService } from 'src/app/helpers/translation/translation.service';
import { ConectionService } from 'src/app/helpers/conection/conection.service';
import { LoginDialogComponent } from 'src/app/features/dashboard/dialogs/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    IonProgressBar,
    IonContent,
    IonSpinner,
    CommonModule,
    LoginPage,
    IonSpinner,
    LogoComponent,
    IonButton,
    IonToast,
    IonTitle,
    IonFooter,
    IonToolbar,
    TranslationPipe,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  loading: boolean = true;
  user = false;
  isLogin = true;
  onboard = false;
  access = true;
  progress = 0;
  token?: any;
  loaded: boolean = false;
  package_lang: boolean = false;
  lang: any = '';
  @Output('onInit') onInit = new EventEmitter();
  constructor(
    private authService: AuthService,
    private onbooardService: OnboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private connection: ConectionService,
    private storage: StorageService,
    private translationService: TranslationService,
    private dialog:MatDialog
  ) {}
  async check() {
    if (
      !window.location.href.split('/').includes('onboard') &&
      !this.onbooardService.checkOnboard()
    ) {
      this.router.navigateByUrl('/onboard');
      //this.loading = false;
    } else {
    }
  }
  async update(data: any) {
    console.log('ACTUALIZAR LENGUAJE');
    var causas = JSON.parse(data.data.causas);
    var materialidad = JSON.parse(data.data.materialidad);
    var materiales = JSON.parse(data.data.material);
    var seguridad = JSON.parse(data.data.seguridad);
    var traducciones = JSON.parse(data.data.traducciones);

    var aseguradoras = JSON.parse(data.data.aseguradoras);
    var documentos = JSON.parse(data.data.documentos);

    await this.storage.run('DELETE FROM aseguradoras;');
    await this.storage.run('DELETE FROM causas;');
    await this.storage.run('DELETE FROM documentos;');
    await this.storage.run('DELETE FROM materiales;');
    await this.storage.run('DELETE FROM materialidades;');
    await this.storage.run('DELETE FROM seguridades;');
    await this.storage.run('DELETE FROM translates;');
    this.progress = 0;
    var total =
      traducciones.length +
      materialidad.length +
      seguridad.length +
      causas.length +
      aseguradoras.length +
      documentos.length +
      materiales.length;
    console.log({
      traducciones,
      materialidad,
      seguridad,
      causas,
      aseguradoras,
      documentos,
    });
    for (var i = 0; i < traducciones.length; i++) {
      await this.storage.insert('translates', {
        tag: traducciones[i].identificador,
        translation: traducciones[i].valor,
      });
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < seguridad.length; i++) {
      await this.storage.insert('seguridades', seguridad[i]);
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < materialidad.length; i++) {
      await this.storage.insert('materialidades', materialidad[i]);
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < causas.length; i++) {
      await this.storage.insert('causas', causas[i]);
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < documentos.length; i++) {
      await this.storage.insert('documentos', {
        id_documento: documentos[i].id,
        id_idioma: documentos[i].id_idioma,
        documento: documentos[i].documento,
      });
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < aseguradoras.length; i++) {
      await this.storage.insert('aseguradoras', aseguradoras[i]);
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    for (var i = 0; i < materiales.length; i++) {
      await this.storage.insert('materiales', materiales[i]);
      this.progress += 1 / total;
      //console.log(this.progress);
    }
    this.progress = 1;
    this.package_lang = false;
    await this.translationService.get();
    this.loaded = true;
  }
  async getLanguage() {
    // Si el usuario esta logeado
    if (this.authService.isLoggedIn()) {
      // Buscar en la configuracion
      var d = await this.storage.select(
        `SELECT * FROM settings WHERE key ='LANGUAGE';`
      );
      if (d.length > 0) {
        this.lang = d[0].value;
      } else {
        this.lang = window.navigator.language.split('-')[0];
        await this.storage.insert('settings', {
          key: 'LANGUAGE',
          value: this.lang,
        });
      }
    } else {
      // Buscar en la definicion del lenguaje del telefono
      this.lang = window.navigator.language.split('-')[0];
      var d = await this.storage.select(
        `SELECT * FROM settings WHERE key ='LANGUAGE';`
      );
      if (d.length == 0) {
        await this.storage.insert('settings', {
          key: 'LANGUAGE',
          value: this.lang,
        });
      } else {
        await this.storage.update('settings', "key = 'LANGUAGE' ", {
          key: 'LANGUAGE',
          value: this.lang,
        });
      }
    }
    // Verificar traducciones
    var d = await this.storage.select('SELECT * FROM translates;');
    //console.log('LANG', d);
    if (d.length == 0) {
      // Si en lenguaje no esta cargado
      // Obtener las etiquetas
      
      this.connection.isOnline$.subscribe(async (connection) => {
        if (connection) {
          this.onbooardService.langs().subscribe(
            async (response) => {
              console.log("connection")
              this.package_lang = true;
              var langs = JSON.parse(response.data.langs);
              var dl = await this.storage.select(
                "SELECT * FROM settings WHERE key = 'LANGUAGE';"
              );
              await this.storage.insert('settings', {
                key: 'LANGUAGES',
                value: response.data.langs,
              });
              this.lang = dl[0].value;
              var defaultLang = langs.filter((item: any) =>
                item.codigo.includes(dl[0].value)
              )[0];
              console.log(langs, dl[0].value, defaultLang);
              //await this.storage.insert("settings",{key:"LANGUAGE_VERSION",value:1});
              this.onbooardService
                .langPackage(defaultLang.id_idioma)
                .subscribe(async (data) => {
                  await this.update(data);
                  this.onInit.emit(true);
                  this.loading = false;
                  //this.router.navigateByUrl('/access')
                });
            },
            (error) => {
              console.log(error);
              this.onInit.emit(true);
              this.loading = false;
            }
          );
        } else {
          this.onInit.emit(true);
          this.loading = false;
        }
      });
    } else {
      this.onInit.emit(true);
      await this.translationService.get();
      this.loading = false;
      this.loaded = true;
    }
  }
  async init() {
    //await this.storage.select('DELETE FROM translates;');
    /*var d = await this.storage.select('SELECT * FROM translates;');
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
            this.check();
            this.package_lang = false;
            //this.loading = false;
          });
      });
    }
    else{
      console.log("CARGAR")
      this.check();
      this.package_lang = false;
      this.loading = false;
    }*/
    /*stry {
      this.storage.listen().subscribe(data => { 
        //console.log(data)         
      });
      await this.storage.run("DELETE FROM inspections;");
      await this.storage.insert("inspections",{causa:""});
      var d = await this.storage.select("SELECT * FROM inspections;");
      console.log(d);
      this.loading = false
    } catch(err) {
      throw new Error(`Error: ${err}`);
    }*/
    this.authService.authChange$.subscribe((state) => {
      //console.log(state);
    });
  }
  ngOnInit(): void {
    this.router.events.subscribe(async (val) => {
      if (val instanceof NavigationStart) {
        if (val.url.split('/').includes('access') || val.url == '/') {
          this.loading = true;
        }
        if (this.translationService.getData() == null) {
          this.loading = true;
          await this.getLanguage();
        }
        if (!this.onbooardService.checkOnboard()) {
          if (val.url != '/onboard') {
            this.router.navigateByUrl('/onboard');
          }
        } else {
          if (!this.authService.isLoggedIn()) {
            this.loading = false;
            if (val.url != '/login') {
              this.router.navigateByUrl('/login');
            }
          }
        }
      }
    });
  }
  toggle() {
    this.loading = !this.loading;
  }
  reload() {
    window.location.reload();
  }
}
