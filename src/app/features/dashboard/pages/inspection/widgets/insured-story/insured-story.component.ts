import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonTextarea, IonProgressBar,IonFab,IonFabButton, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';

import { IonButton, IonIcon } from '@ionic/angular/standalone';
import {
  GenericResponse,
  RecordingData,
  VoiceRecorder,
} from 'capacitor-voice-recorder';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/widgets/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-insured-story',
  templateUrl: './insured-story.component.html',
  styleUrls: ['./insured-story.component.scss'],
  imports: [CommonModule, IonTextarea, IonIcon, IonButton, IonProgressBar,IonFab,IonFabButton,IonLabel,IonSelect,IonSelectOption,FormsModule,TranslationPipe,ReactiveFormsModule],
  standalone: true,
})
export class InsuredStoryComponent implements OnInit {
  @Input("id") id:any;
  @Input("formGroup") formGroup:any;
  @Output("onUpdated") onUpdated:any = new EventEmitter();
  audioRecorded: any;
  recording = false;
  playing = false;
  audioRunning = 0;
  audioTotal = 0;
  audioRef: HTMLAudioElement = new Audio();
  options:any = []
  playlist:any = [];
  constructor(private storage: StorageService, private dialog:MatDialog,
    private route: ActivatedRoute) {
    this.route.paramMap.subscribe(  (data: any) => {
      this.id = data.get('id')?.toString();
      this.init();
    });
  }
  async init(){
    var d = await this.storage.select(`SELECT * FROM inspections_media_files WHERE inspection_id = '${this.id}';`)
    this.playlist = d.map((item)=>({...item,play:false}));
    var d = await this.storage.select(`SELECT * FROM causas;`)
    this.options = d;
    if(isNaN(parseInt(this.formGroup.value.causa))){
      var selectedOption = this.options.filter((it:any)=>it.causa.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase() == this.formGroup.value.causa.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase());
      if(selectedOption.length>0){
        this.formGroup.controls.causa.setValue(selectedOption[0].id_causa)
      }
      else{
        this.formGroup.controls.causa.setValue("")
      }
    }
    else{
      var selectedOption = this.options.filter((item:any)=>item.id_causa ==parseInt(this.formGroup.value.causa) );//.filter((item:any)=>item.item_id == parseInt(this.formGroup.value.causa)).toUpperCase();
      if(selectedOption.length>0){
        this.formGroup.controls.causa.setValue(selectedOption[0].id_causa)
      }
      else{
        this.formGroup.controls.causa.setValue("")
      }
    }
  }
  ngOnInit() {}
  record() {
    VoiceRecorder.canDeviceVoiceRecord().then((result: GenericResponse) => {
      this.recording = false;
      VoiceRecorder.hasAudioRecordingPermission().then(
        async (result: GenericResponse) => {
          if (result.value) {
            var s = await VoiceRecorder.getCurrentStatus();
            if (s.status == 'NONE') {
              this.recording = true;
              VoiceRecorder.startRecording()
                .then((result: GenericResponse) => console.log(result.value))
                .catch((error) => console.log(error));
            } else {
              this.recording = false;
              VoiceRecorder.stopRecording()
                .then( async (result: RecordingData) => {
                  const base64Sound = result.value.recordDataBase64;
                  const mimeType = result.value.mimeType;
                  this.audioRecorded = `data:${mimeType};base64,${base64Sound}`;
                  var filename = `AUD-${this.playlist.length}-${Date.now()}.webm`;
                  await this.storage.run(`DELETE FROM inspections_media_files WHERE inspection_id = '${this.id}'`)
                  await this.storage.insert("inspections_media_files",{inspection_id:this.id,filename:filename,mime_type:mimeType,base64:base64Sound})
                  this.init();
                })
                .catch((error) => console.log(error));
            }
          } else {
            VoiceRecorder.requestAudioRecordingPermission().then(
              (result: GenericResponse) => console.log(result.value)
            );
          }
        }
      );
    });
  }

  play(index:any) {
    var audio = this.playlist[index];
    if(audio.play){
      this.playlist[index].play = false;
      this.audioRef.pause();
    }
    else{
      this.playlist[index].play =true;
      this.audioRef = new Audio(`data:${audio.mime_type};base64,${audio.base64}`);
      this.audioRef.onloadedmetadata = () => {
        this.audioTotal = this.audioRef.duration;
      };
      this.audioRef.oncanplaythrough = () => {
        this.audioRef.play();
      };
      this.audioRunning = 0;
      this.audioRef.ontimeupdate = () => {
        this.audioTotal = this.audioRef.duration;
        // Obtener el tiempo actual en segundos
        const currentTime = this.audioRef.currentTime;
        if (this.audioTotal > 0) {
          this.audioRunning = currentTime / this.audioTotal;
          console.log(`Tiempo actual: ${this.audioRunning}`);
        }
      };
      this.audioRef.load();
      this.playing = true;
    }
  }
  async trash(index:number) {
    var dialogRef = this.dialog.open(ConfirmDialogComponent,{data:{title:"Eliminar audio",title_tag:"delete_audio",message:"¿Deseas eliminar el relato grabado?",message_tag:"delete_medssage_dialog"}})
    dialogRef.afterClosed().subscribe(async (action:any)=>{
      if(action == true){
        var id = this.playlist[index].id;
        this.playing = false;
        this.audioRunning = 0;
        this.audioRecorded = null;
        var d = await this.storage.run(`DELETE FROM inspections_media_files WHERE id = ${id}`)
        this.init();
      }
    })
  }
}
