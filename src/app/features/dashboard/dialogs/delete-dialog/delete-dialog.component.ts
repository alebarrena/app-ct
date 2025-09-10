import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { IonButton} from '@ionic/angular/standalone'

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
  standalone:true,
  imports:[TranslationPipe,IonButton]
})
export class DeleteDialogComponent  implements OnInit {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data:any,private dialogRef:MatDialogRef<any>) { }

  ngOnInit() {}
  deleteItem(){
    this.dialogRef.close(true);
  }
  cancel(){
    this.dialogRef.close(false);
  }
}
