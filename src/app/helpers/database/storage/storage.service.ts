import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable} from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { UpgradeStatements } from '../upgrade-statements';
import { SQLiteService } from '../sqlite.service';
import { DbnameVersionService } from '../dbname-version/dbname-version.service';
import { Inspection } from 'src/app/models/inspection/inspection';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private databaseName: string = "";
  private uUpdStmts: UpgradeStatements = new UpgradeStatements();
  private versionUpgrades;
  private loadToVersion;
  private db!: SQLiteDBConnection;
  /*
  public inspectionList: BehaviorSubject<Inspection[]> = new BehaviorSubject<Inspection[]>([]);
  private isInspectionReady: BehaviorSubject<boolean> = new BehaviorSubject(false);


  public languageList: BehaviorSubject<Inspection[]> = new BehaviorSubject<Inspection[]>([]);
  private isLangReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  */

  public dbResults: BehaviorSubject<any> = new BehaviorSubject<any>({});
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);




  constructor(private sqliteService: SQLiteService,
  private dbVerService: DbnameVersionService) {
    this.versionUpgrades = this.uUpdStmts.userUpgrades;
    this.loadToVersion = this.versionUpgrades[this.versionUpgrades.length-1].toVersion;
  }
  async initializeDatabase(dbName: string) {
    this.databaseName = dbName;
    try{
      console.log(this.loadToVersion)
      await this.sqliteService
      .addUpgradeStatement({ database: this.databaseName,upgrade: this.versionUpgrades});
    this.db = await this.sqliteService.openDatabase(this.databaseName,false,'no-encryption',this.loadToVersion,false);
    this.dbVerService.set(this.databaseName,this.loadToVersion);
    }
    catch(e){
      console.log(e)
    }

  }
  listen(){
    return this.status().pipe(switchMap((res) => {if (res) { return this.fetch();} else { return of([]); } }))
  }
  status(){
    return this.isDbReady.asObservable();
  }
  fetch(){
    return this.dbResults.asObservable();
  }
  async run(sql:string){
    var d  = await this.db.run(sql);
    this.dbResults.next({type:"run"});
    return d;
  }
  async select(sentence:string){
    const results: any[]= (await this.db.query(sentence)).values as any[];
    this.dbResults.next({type:"select",results});
    return results;
  }
  async insert(table:string,item:any){
    const sql = `INSERT INTO ${table} (`+Object.keys(item).join(",")+`) VALUES (`+Object.keys(item).map((it:any)=>"?").join(",")+`);`;
    var d  = await this.db.run(sql,Object.values(item));
    this.dbResults.next({type:"insert",result:d});
    return d;
  }
  async update(table:string,condition:any,item:any){
    const sql = `UPDATE ${table} SET ${Object.keys(item).map((it)=> it + " = ?").join(",")} WHERE ${condition};`;
    console.log(sql,Object.values(item))
    var d  = await this.db.run(sql,Object.values(item));
    this.dbResults.next({type:"update",result:d});
    return d;
  }


  // Inspecioens
  /*inspectionState() {
    return this.isInspectionReady.asObservable();
  }
  fetchInspections(): Observable<Inspection[]> {
    return this.inspectionList.asObservable();
  }
  async loadInspections() {
    const inspections: Inspection[]= (await this.db.query('SELECT * FROM inspections;')).values as Inspection[];
    this.inspectionList.next(inspections);
  }
  async getInspections() {
    await this.loadInspections();
    this.isInspectionReady.next(true);
  }
  async addInspection(item: any) {
    const sql = `INSERT INTO inspections (`+Object.keys(item).join(",")+`) VALUES (`+Object.keys(item).map((it:any)=>"?").join(",")+`);`;
    await this.db.run(sql,Object.values(item));
    await this.getInspections();
  }
  async getInspection(id:string){
    const inspections: Inspection[]= (await this.db.query('SELECT * FROM inspections WHERE cod_inspeccion = ?;',[id])).values as Inspection[];
    return (inspections.length==0)?null:inspections[0];
  }*/
  /*async updateInspectionById(id: string, active: number) {
    const sql = `UPDATE inspections SET active=${active} WHERE id=${id}`;
    await this.db.run(sql);
    await this.getInspections();
  }
  async deleteInspectionById(id: string) {
    const sql = `DELETE FROM inspections WHERE id=${id}`;
    await this.db.run(sql);
    await this.getInspections();
  }*/
  /*async updateInspections(list:any){      
    try{

      const sql = `DELETE FROM inspections`;
      await this.db.run(sql);
      for(var i=0;i<list.length;i++){
        await this.addInspection(list[i])
      }
      await this.getInspections();
    }
    catch(e:any){
    }
  }*/

  
}