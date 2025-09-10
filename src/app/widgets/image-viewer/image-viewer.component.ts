import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonIcon, IonImg, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  standalone:true,
  imports:[CommonModule,IonImg,IonButton,IonIcon]
})
export class ImageViewerComponent  implements OnInit {
  @Input("image") image?:any;
  constructor(private modalCtrl: ModalController) { 
  }

  ngOnInit() {
    console.log(this.image)
  }
  close(){
    return this.modalCtrl.dismiss(null);
  }
}
