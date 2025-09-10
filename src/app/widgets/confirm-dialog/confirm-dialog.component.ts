import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {IonButton,IonGrid,IonRow,IonCol} from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports:[IonButton,IonGrid,IonRow,IonCol,TranslationPipe],
  standalone:true
})
export class ConfirmDialogComponent  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data:any,private dialogRef:MatDialogRef<ConfirmDialogComponent>) { }

  ngOnInit() {}
  accept(){
    this.dialogRef.close(true);
  }
  decline(){
    this.dialogRef.close(false);
  }
}
