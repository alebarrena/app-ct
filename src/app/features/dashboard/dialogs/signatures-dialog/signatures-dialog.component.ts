import { CommonModule } from '@angular/common';
import { Component, Input, OnInit,AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonTextarea, IonProgressBar,IonFab,IonFabButton, IonLabel, IonSelect, IonSelectOption,IonIcon,IonButton,IonModal,IonHeader,IonToolbar,IonTitle,IonButtons,IonContent } from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
import { Platform, ToastController } from '@ionic/angular';
//import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';

@Component({
  selector: 'app-signatures-dialog',
  templateUrl: './signatures-dialog.component.html',
  styleUrls: ['./signatures-dialog.component.scss'],
  imports: [CommonModule, IonTextarea, IonIcon, IonButton, IonProgressBar,IonFab,IonFabButton,IonLabel,IonSelect,IonSelectOption,FormsModule,TranslationPipe,ReactiveFormsModule,IonModal,IonHeader,IonToolbar,IonTitle,IonButtons,IonContent],
  standalone:true
})
export class SignaturesDialogComponent  implements OnInit, AfterViewInit {
  @Input('modal') modal:any;
  @ViewChild('imageCanvas', { static: false }) canvas: any;
  @Output('onSign') onSign:any = new EventEmitter();
  canvasElement: any;
  saveX?: number;
  saveY?: number;

  selectedColor = '#000';

  drawing = false;
  lineWidth = 5;
//, private base64ToGallery: Base64ToGallery
  constructor(private plt: Platform, private toastCtrl: ToastController) {}
  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // Set the Canvas Element and its size
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 450;
    console.log(this.plt.width());
  }

  startDrawing(ev:any) {
    this.drawing = true;
    var canvasPosition = this.canvasElement.getBoundingClientRect();

    this.saveX = ev.pageX - canvasPosition.x;
    this.saveY = ev.pageY - canvasPosition.y;
  }

  endDrawing() {
    this.drawing = false;
  }

  setBackground() {
    var background = new Image();
    background.src = './assets/code.webp';
    let ctx = this.canvasElement.getContext('2d');

    background.onload = () => {
      ctx.drawImage(background,0,0, this.canvasElement.width, this.canvasElement.height);
    }
  }
  moved(ev:any) {
    if (!this.drawing) return;
    var canvasPosition = this.canvasElement.getBoundingClientRect();
    let ctx = this.canvasElement.getContext('2d');
  
    var x = ev.pageX | ev.touches[0].clientX;
    var y = ev.pageX | ev.touches[0].clientY;

    let currentX = x - canvasPosition.x;
    let currentY = y - canvasPosition.y;
  

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = this.lineWidth;
  
    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
  
    ctx.stroke();
  
    this.saveX = currentX;
    this.saveY = currentY;
  }
  
  exportCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL();
    this.onSign.emit(dataUrl);
    this.modal.dismiss();
    // Clear the current canvas
    /*let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  
    if (this.plt.is('cordova')) {
      const options: Base64ToGalleryOptions = { prefix: 'canvas_', mediaScanner:  true };
  
      this.base64ToGallery.base64ToGallery(dataUrl, options).then(
        async res => {
          const toast = await this.toastCtrl.create({
            message: 'Image saved to camera roll.',
            duration: 2000
          });
          toast.present();
        },
        err => console.log('Error saving image to gallery ', err)
      );
    } else {
      // Fallback for Desktop
      var data = dataUrl.split(',')[1];
      let blob = this.b64toBlob(data, 'image.webp');
  
      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'canvasimage.webp';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }*/
  }
  
  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
  b64toBlob(b64Data:any, contentType:any) {
    contentType = contentType || '';
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
  
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
  
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      var byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}
