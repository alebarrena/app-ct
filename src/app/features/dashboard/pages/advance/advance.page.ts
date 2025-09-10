import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonTextarea,IonInput,IonIcon,IonRow,IonCol } from '@ionic/angular/standalone';
import { alertCircleOutline, alertCircleSharp, chevronBackOutline, chevronForwardOutline, documentOutline, documentTextOutline, folderOpenOutline, gitMergeOutline, homeOutline, newspaperOutline, personOutline, refreshOutline, removeCircleSharp, searchOutline, settingsOutline, trashOutline } from 'ionicons/icons';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';

@Component({
  selector: 'app-advance',
  templateUrl: './advance.page.html',
  styleUrls: ['./advance.page.scss'],
  standalone: true,
  imports: [IonContent, TranslationPipe, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,ReactiveFormsModule,IonButton,IonTextarea,IonInput,IonIcon,IonRow,IonCol]
})
export class AdvancePage implements OnInit {
  id:string = "";
  constructor() { }

  ngOnInit() {
  }
  back(){}
  goTo(page:string){}
}
