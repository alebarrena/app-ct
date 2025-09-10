import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {IonHeader,IonTitle,IonButton,IonContent,IonToolbar,IonButtons,IonIcon,IonItem,IonModal} from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';

@Component({
  selector: 'app-photo-dialog',
  imports:[IonButton,IonIcon,IonButtons,IonHeader,IonTitle,IonContent,IonToolbar,IonItem,IonModal,TranslationPipe],
  templateUrl: './photo-dialog.component.html',
  styleUrls: ['./photo-dialog.component.scss'],
  standalone:true
})
export class PhotoDialogComponent  implements OnInit {

  constructor(private dialogRef:MatDialogRef<PhotoDialogComponent>) { }

  ngOnInit() {}
  camara(){
    this.dialogRef.close("CAMERA");
  }
  galeria(){
    this.dialogRef.close("GALLERY");
  }
}
