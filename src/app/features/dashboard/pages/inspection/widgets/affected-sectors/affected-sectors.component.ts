import { Component, Input, OnInit } from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonCheckbox,
  IonItem,
  IonLabel, IonIcon, IonCard, IonButton } from '@ionic/angular/standalone';
import { IncrementalComponent } from '../../../../../../widgets/incremental/incremental.component';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/helpers/database/storage/storage.service';
import { ActivatedRoute } from '@angular/router';
import { TranslationPipe } from 'src/app/helpers/translation/translation.pipe';
`2`
@Component({
  selector: 'app-affected-sectors',
  templateUrl: './affected-sectors.component.html',
  styleUrls: ['./affected-sectors.component.scss'],
  standalone: true,
  imports: [IonButton, IonCard, IonIcon, 
    CommonModule,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonCheckbox,
    IncrementalComponent,
    IncrementalComponent,IonCard,FormsModule,ReactiveFormsModule,TranslationPipe
  ],
})
export class AffectedSectorsComponent implements OnInit {
  @Input('formArray') formArray?:any;
  @Input('completed') completed?: any;
  id:any;
  main_sectors:any =[];
  secondary_sectors:any =[];
  visible_count = true;
  constructor(private storage:StorageService,private route:ActivatedRoute) {}
  ngOnInit() {
    this.route.paramMap.subscribe(  (data: any) => {
      this.id = data.get('id')?.toString();
      this.init();
    });
    this.main_sectors = [
      {icon:"bed-outline",label:'Habitación',tag:"se_habitacion"},
      {icon:"woman-outline",label:'Baños',tag:"se_baños"},
      {icon:"restaurant-outline",label:'Cocina',tag:"se_cocina"},
      {icon:"tv-outline",label:'Living',tag:"se_living"},
      {icon:"dining-table",label:'Comedor',tag:"se_comedor"},
      {icon:"logia",label:'Logia',tag:"se_logia"},
      {icon:"pasillo",label:'Pasillo',tag:"se_pasillo"},
    ];
    this.secondary_sectors = [
      {icon:"barbecue",label:'Quincho',tag:"se_quincho"},
      {icon:"game-controller-outline",label:'Sala de estar',tag:"se_sala"},
      {icon:"box",label:'Bodega',tag:"se_bodega"},
      {icon:"terrace",label:'Terraza',tag:"se_terraza"},
      {icon:"garage",label:'Garage',tag:"se_garage"},
      {icon:"otros",label:'Otros',tag:"se_otros"},
    ];
  }
  async init(){
    var d = await this.storage.select(`SELECT * FROM inspections_danos WHERE inspection_id = '${this.id}'`);
    
    this.main_sectors = this.main_sectors.map((item:any)=>{ 
      var k = d.filter((it)=>it.nombre == item.label)
      if(k.length>0){
        item = {...item, value:k.length}
      }
      return item;
    });
    
    this.secondary_sectors = this.secondary_sectors.map((item:any)=>{ 
      var k = d.filter((it)=>it.nombre == item.label)
      if(k.length>0){
        item = {...item, value:k.length}
      }
      return item;
    });
    console.log(this.main_sectors, this.secondary_sectors)
  }
  
  intval(s:any){
    if(s=='') return 0;
    return parseInt(s);
  }
  async handleMainUpdated(event:any,item:any){
    var d = await this.storage.select(`SELECT COUNT(id) AS count FROM inspections_danos WHERE inspection_id = '${this.id}' AND nombre = '${item.label}'`)
    if(d[0].count>parseInt(event)){
      if(!this.completed) await this.storage.run(`DELETE FROM inspections_danos WHERE id = ( SELECT MAX(id) FROM inspections_danos WHERE inspection_id = '${this.id}' AND nombre = '${item.label}' );`) 
    }
    if(d[0].count<parseInt(event)){
      if(!this.completed) await this.storage.insert("inspections_danos",{ inspection_id: this.id, key:d[0].count,nombre:item.label, })
    }
    /*
    for(var i=0;i<event;i++){
      await this.storage.insert("inspections_danos",{ inspection_id: this.id, nombre:item.label, })
    }*/
    var d = await this.storage.select("SELECT * FROM inspections_danos")
    item.value = event;
    this.visible_count = false;
    setTimeout(()=>{
      this.visible_count = true;
    },0)
    this.formArray.patchValue([])
    for(var i=0;i<d.length;i++){
      this.formArray.push(new FormGroup({
        id: new FormControl(""),
        key: new FormControl(""),
        nombre: new FormControl( '', []),
        items: new FormArray([],[]),
        alto: new FormControl("",[]),
        ancho: new FormControl("",[]),
        largo: new FormControl("", []),
        dscto_pv: new FormControl("",[]),
        descripcion: new FormControl("",[]),
      }));
    }
  }
  async handleSecondaryUpdated(event:any,item:any){
    if(!this.completed) await this.storage.run(`DELETE FROM inspections_danos WHERE nombre = '${item.label}'`) 
    for(var i=0;i<event;i++){
      if(!this.completed) await this.storage.insert("inspections_danos",{ inspection_id: this.id, nombre:item.label, })
    }
    var d = await this.storage.select("SELECT * FROM inspections_danos")
    item.value = event;
    this.visible_count = false;
    setTimeout(()=>{
      this.visible_count = true;
    },0)
    console.log(d)
  }
}
