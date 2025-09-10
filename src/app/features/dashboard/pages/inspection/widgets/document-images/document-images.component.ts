import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { IonButton } from '@ionic/angular/standalone';
import { IonThumbnail } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-document-images',
  templateUrl: './document-images.component.html',
  styleUrls: ['./document-images.component.scss'],
  imports: [CommonModule, IonButton, IonThumbnail],
  standalone: true,
})
export class DocumentImagesComponent implements OnInit {
  images: any = [];
  imagesFachada: any = [];
  groups: any = [];
  fachadaGroups: any = [];
  imagesGroups: any = [];
  imagesFachadaGroups: any = [];
  id: any = '';
  constructor(
    private storageService: StorageService,
    private activateRoute: ActivatedRoute,
    private toastController:ToastController
  ) {}

  ngOnInit() {
    this.activateRoute.params.subscribe((data: any) => {
      this.id = data.id;
      this.init();
    });
  }
  async init() {
    var d2 = await this.storageService.select(
      `SELECT id, inspection_id,filename, mime_type, status,selected,thumbnail_media FROM inspections_media_files WHERE inspection_id = '${this.id}' AND filename LIKE 'IMG-%'`
    );
    var d1 = d2.filter((item) => item.filename.includes('Fachada'));
    var d = d2.filter((item) => !item.filename.includes('Fachada'));

    this.images = d.map((item: any) => {
      var it = item;
      it.tag = item.filename.split('IMG-')[1].split('_')[0];
      return it;
    });

    this.imagesFachada = d1.map((item: any) => {
      var it = item;
      it.tag = item.filename.split('IMG-')[1].split('_')[0];
      return it;
    });

    this.groups = this.images.reduce((acc: any, item: any) => {
      (acc[item.tag] = acc[item.tag] || []).push(item);
      return acc;
    }, {});

    this.fachadaGroups = this.imagesFachada.reduce((acc: any, item: any) => {
      (acc[item.tag] = acc[item.tag] || []).push(item);
      return acc;
    }, {});
    this.imagesGroups = Object.keys(this.groups);
    this.imagesFachadaGroups = Object.keys(this.fachadaGroups);
  }
  getTitle(str: any) {
    return `${str.split('-')[0]}`;//${parseInt(str.split('-')[1]) + 1}
  }
  async selectImage(item: any) {
    if (item.selected == 0) {
      if(item.tag.includes("Fachada")){
      var d = await this.storageService.select(
        `SELECT COUNT(*) as total FROM inspections_media_files WHERE inspection_id = '${
          item.inspection_id
        }' AND selected = 1 AND filename LIKE '%${item.tag.split('-')[0]}%'`
      );
      }
      else{
      var d = await this.storageService.select(
        `SELECT COUNT(*) as total FROM inspections_media_files WHERE inspection_id = '${
          item.inspection_id
        }' AND selected = 1 AND filename LIKE '%${item.tag}%'`
      );
      }
      if (d[0].total >= 3) {
    const toast = await this.toastController.create({
      message: "Solo se permiten 3 por seccion",
      position: 'bottom',
      duration: 1000,
      cssClass: 'toast-danger',
    });
    toast.present();
      } else {
        await this.storageService.run(
          `UPDATE inspections_media_files SET selected = ${
            item.selected == 0 ? 1 : 0
          } WHERE id = ${item.id}`
        );
      }
    } else {
      await this.storageService.run(
        `UPDATE inspections_media_files SET selected = ${
          item.selected == 0 ? 1 : 0
        } WHERE id = ${item.id}`
      );
    }
    this.init();
  }
}
