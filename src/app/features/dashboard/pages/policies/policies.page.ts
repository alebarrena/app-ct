import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonButton,
  IonIcon,
  IonItem,
  IonList,
  IonLabel,
  IonInput,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
//import { Browser } from '@capacitor/browser';
//import { InAppBrowser } from '@capacitor/inappbrowser';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { OnboardService } from 'src/app/features/onboard/service/onboard.service';
import { DashboardService } from '../../services/dashboard.service';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { Inspection } from 'src/app/models/inspection/inspection';
import { of, switchMap } from 'rxjs';
import { LayoutComponent } from 'src/app/widgets/layout/layout.component';
import { PageLayoutComponent } from 'src/app/widgets/page-layout/page-layout.component';
import { Policy } from 'src/app/models/policy/policy';

@Component({
  selector: 'app-policies',
  templateUrl: './policies.page.html',
  styleUrls: ['./policies.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonIcon,
    IonButton,
    IonRow,
    IonGrid,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslationPipe,
    IonLabel,
    CommonModule,
    IonInput,
    RouterModule,
    IonFab,
    IonFabButton,
    PageLayoutComponent,
  ],
})
export class PoliciesPage implements OnInit {
  formSearch = new FormGroup({
    term: new FormControl('', []),
  });
  list: Policy[] = [];
  filteredList: Policy[] = [];
  status_filter = 'pendientes';
  type_filter = 'policies';
  usuario:any;
  current_date: Date = new Date(Date.now());
  constructor(
    private dashboardService: DashboardService,
    private storage: StorageService,
    private router: Router,
    private authService:AuthService,
    private activateRoute:ActivatedRoute
  ) {}

  ngOnInit() {
    this.init();
  }
  async init() {
    this.usuario = localStorage.getItem("username");
    if(window.location.hash == '#pending') this.status_filter = 'pendientes'
    if(window.location.hash == '#finished') this.status_filter = 'finalizadas'
    this.refresh();
  }
  onSubmit(event: any) {
    this.filteredList = this.list.filter((item) => {
      return true;
     /* return item.cod_inspeccion
        ?.toUpperCase()
        ?.includes(event.target.value.toUpperCase());*/
    });
  }
  back() {
    this.router.navigateByUrl('/');
  }
  async refresh() {
    this.activateRoute.params.subscribe(async (data:any)=>{
      console.log(data.id);
      var d = await this.storage.select(
        `SELECT * FROM inspecciones_cabecera WHERE cod_inspeccion = '${data.id!.toString()}'`
      );
      //var dk = await this.dashboardService.getPolizas();
      var nro_carpeta = (d[0].nro_carpeta);
      this.dashboardService.getPolizas(nro_carpeta).subscribe((data)=>{
        this.list = (data.data.list);
        this.filteredList = this.list;
      })
    })

  }
  toggleFilter(s: string) {
    this.status_filter = s;
    console.log(s);
    if (s == 'policies') {
     // this.filteredList = this.list.filter((item) => item.completed == 0);
    }
    if (s == 'cad') {
     // this.filteredList = this.list.filter((item) => item.completed == 1);
    }
  }
  selectType(s: string) {
    this.type_filter = s;
    this.filteredList = this.list;
  }
  async openPdf(item:any){
    window.open(item.deposito)
    /*await InAppBrowser.openInExternalBrowser({
        url: item.deposito
    });*/
    //await Browser.open({ url:  item.deposito });
  }
}
