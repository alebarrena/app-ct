export interface IPolicy{
     cobertura?:string;
     monto_asegurado?:string;
     monto_deducible?:string;
} 

export class Policy implements IPolicy {
    cobertura?: string;
    monto_asegurado?:string;
    monto_deducible?:string;
}
