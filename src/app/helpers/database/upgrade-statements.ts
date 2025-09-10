import { state } from "@angular/animations";

export class UpgradeStatements {
  userUpgrades = [
    {
      toVersion: 1,
      statements: [
        // --- >
        `CREATE TABLE IF NOT EXISTS settings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT,
            value TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS translates(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT,
            translation TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS inspecciones(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            causa TEXT,
            celInspector TEXT,
            celLiquidador TEXT,
            celularContratante  TEXT,
            celularsegurado TEXT,
            ciudad TEXT,
            codCompania TEXT,
            codInspector TEXT,
            cod_inspeccion TEXT,
            comuna TEXT,
            corredor TEXT,
            datos_siniestro TEXT,
            direccion_siniestro TEXT,
            emailContratante TEXT,
            emailCorredor TEXT,
            emailInspector TEXT,
            emailLiquidador TEXT,
            email_contacto TEXT,
            emailasegurado TEXT,
            fechaSiniestro TEXT,
            fonoContratante TEXT,
            fono_Contacto TEXT,
            fonosegurado TEXT,
            horaSiniestro TEXT,
            id_accion TEXT,
            id_tiposiniestro TEXT,
            lugar TEXT,
            nomAsegurado TEXT,
            nomCompania TEXT,
            nomContratante TEXT,
            nomInspector TEXT,
            nomLiquidador TEXT,
            nomTipoSiniestro TEXT,
            nombre_Contacto TEXT,
            nro_carpeta TEXT,
            numSiniestro TEXT,
            rutAsegurado TEXT,
            rutContratante TEXT,
            rutInspector TEXT,
            rut_Contacto TEXT,
            telInspector TEXT,
            telLiquidador TEXT,
            valor_moneda TEXT, 
            monto_Asegurado TEXT, 
            deducible TEXT, 
            moneda_Poliza TEXT, 
            active INTEGER DEFAULT 0,
            sync INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            updated_at TEXT,
            pais TEXT
          );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_cabecera(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nro_carpeta TEXT,
          cod_inspeccion TEXT,
          id_accion TEXT,
          fecha_inspeccion TEXT,
          ubicacion TEXT,
          destino TEXT,
          corredor TEXT,
          n_pisos TEXT,
          niveles TEXT,
          habitable TEXT,
          menores TEXT,
          contacto_nombre TEXT,
          contacto_rut TEXT,
          contacto_fono TEXT,
          contacto_mail TEXT,
          admin_mayor_domo TEXT,
          telefono_comunidad TEXT,
          email_comunidad TEXT,
          sw_terceros TEXT,
          observaciones TEXT,
          tipo_siniestro TEXT,
          nomTipoSiniestro TEXT,
          datos_siniestro TEXT,
          numSiniestro TEXT,
          direccion_siniestro TEXT,
          unidad_policial TEXT,
          numero_parte TEXT,
          causa TEXT,
          otra_causa TEXT,
          otros TEXT,
          fiscalia TEXT,
          bomberos TEXT,
          labora_policial TEXT,
          tiene_alarma TEXT,
          tipo_alarma TEXT,
          seguridadCamara TEXT,
          seguridadAlarmaFunciona TEXT,
          tipo_inmueble TEXT,
          antiguedad TEXT,
          superficie TEXT,
          nro_subterraneos TEXT,
          unidades_total TEXT,
          rejas_perimetral TEXT,
          pertenece_condomi TEXT,
          guardia_seguridad TEXT,
          reja_primer_piso TEXT,
          reja_segundo_piso TEXT,
          Contratante_Observaciones TEXT,
          Contratante_Hechos TEXT,
          Parte_Otros TEXT,
          Parte_Observaciones TEXT,
          tipo_zona TEXT, --
          Tipo_Inmueble1 TEXT,
          Tipo_Inmueble2 TEXT,
          sol_antecedentes_nomb TEXT,
          sol_antecedentes_val TEXT,
          latitud TEXT,
          longitud TEXT,
          habitantesFamilias TEXT,
          roboNombreDenunciante TEXT,
          roboRutDenunciante TEXT,
          roboNumeroConstancia TEXT,
          roboFechaConstancia TEXT,
          seguridadNombre TEXT,
          seguridadvalor TEXT,
          seguridadAlarmaNombre TEXT,
          seguridadAlarmaValor TEXT,
          seguridadProteccionesNombre TEXT,
          seguridadProteccionesValor TEXT,
          perimetrales_nomb TEXT,
          perimetrales_val TEXT,
          muros_interiores_nomb TEXT,
          muros_interiores_val TEXT,
          cubierta_tech_nomb TEXT,
          cubierta_tech_val TEXT,
          pav_interiores_nomb TEXT,
          pav_interiores_val TEXT,
          cielo_interiores_nomb TEXT,
          cielo_interiores_val TEXT,
          terminacion_int_nomb TEXT,
          terminacion_int_val TEXT,
          otras_inst_nomb TEXT,
          otras_inst_val TEXT,
          fechaSiniestro TEXT,
          entrevistadoNombre TEXT,
          entrevistadoRelacion TEXT,
          edificacionPisosEdificio TEXT,
          edificacionPisoDepto TEXT,
          edificacionHabitable TEXT,
          antecedentesRelacionHechos TEXT,
          antecedentesReporteAlarma TEXT,
          antecedentesDetalleRobados TEXT,
          antecedentesCotizacionRobados TEXT,
          antecedentesPresupuestoConstruccion TEXT,
          antecedetesDeclaracionJurada TEXT,
          otroSeguroExiste TEXT,
          otroSeguroCia TEXT,
          total_imagenes TEXT,
          total_documentos TEXT,
          asegurado_nombre TEXT,
          asegurado_email TEXT,
          asegurado_fono TEXT,
          asegurado_rut TEXT,
          asegurado_ciudad TEXT,
          asegurado_comuna TEXT,
          asegurado_aseguradora TEXT,
          inspector_nombre TEXT,
          inspector_email TEXT,
          inspector_fono TEXT,
          nomLiquidador TEXT,
          liquidador_email TEXT,
          liquidador_fono TEXT,

          relato_asegurado TEXT, ---
          sincronizado INTEGER DEFAULT 0,
          danos_contenido INTEGER DEFAULT 0,
          
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_contenidos(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          nombre TEXT,
          marca_modelo TEXT,
          cantidad INTEGER,
          ano_fab TEXT,
          fecha_adquisicion TEXT,
          adjunta_comprobante INTEGER DEFAULT 0
        );`,
        `CREATE TABLE IF NOT EXISTS inspections_media_files(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          filename TEXT,
          mime_type TEXT,
          base64 TEXT,
          status INT DEFAULT 0,
          selected INT DEFAULT 0,
          thumbnail_media TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspections_danos(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          sugeridos_enabled TEXT,
          key TEXT, -- 
          label TEXT, --
          nombre TEXT,
          alto TEXT,--
          ancho TEXT,--
          largo TEXT,--
          dscto_pv TEXT, -- 
          items TEXT,
					siniestrado TEXT,
					descripcion TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_danos_materialidad(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_dano_id INT,
          materialidad TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_terceros(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          nombre TEXT,  
          telefono TEXT,  
          correo TEXT,  
          rut TEXT,  
          direccion TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_terceros_sectores(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sector_id INTEGER,
          sectores TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspecciones_habitantes(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          nombre TEXT,  
          rut TEXT,  
          edad INTEGER
        );`,
        `CREATE TABLE IF NOT EXISTS causas(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          causa TEXT,
          id_causa INT
        );`,
        `CREATE TABLE IF NOT EXISTS materiales(
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          id_tipo_material  TEXT,
          tipo_material  TEXT,
          id_material  TEXT,
          material  TEXT,
          unidad  TEXT,
          precio_urbano  TEXT,
          precio_rural  TEXT,
          precio_especial  TEXT,
          sugerido  TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS materialidades(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_materialidad TEXT,
          id_tipo_materialidad TEXT,
          materialidad TEXT,
          campo TEXT,
          claveformulario TEXT,
          valorformulario TEXT,
          tipo_materialidad TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS seguridades(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_seguridad INT,
          id_tipo_seguridad TEXT,
          seguridad TEXT,
          campo TEXT,
          claveformulario TEXT,
          valorformulario TEXT,
          tipo_seguridad TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS aseguradoras(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_aseguradora INT,
          aseguradora TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS documentos(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          id_documento INT,
          id_idioma INT,
          documento TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspeccion_meta(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id INT,
          label TEXT,
          data TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspeccion_views(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id INT,
          module TEXT,
          viewed TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS inspeccion_expenses(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspection_id TEXT,
          cost TEXT,
          description TEXT,
          date TEXT
        );`,
      ],
    },
    {
      toVersion:2,
      statements:[
        'ALTER TABLE inspecciones_terceros ADD COLUMN observacion TEXT;',
      ]
    },
    {
      toVersion:3,
      statements:[
        'ALTER TABLE inspecciones_cabecera ADD COLUMN status TEXT DEFAULT "ACTIVE";'
      ]
    }
  ];
}
/*
cabecera
nro_carpeta
cod_inspeccion
id_accion
fecha_inspeccion
ubicacion
destino
n_pisos
contacto_nombre
contacto_rut
contacto_fono
contacto_mail
admin_mayor_domo
telefono_comunidad
email_comunidad
sw_terceros
observaciones
tipo_siniestro
unidad_policial
numero_parte
causa
otra_causa
otros
fiscalia
bomberos
labora_policial
tiene_alarma
tipo_alarma
seguridadCamara
seguridadAlarmaFunciona
tipo_inmueble
antiguedad
superficie
nro_subterraneos
unidades_total
rejas_perimetral
pertenece_condomi
guardia_seguridad
reja_primer_piso
reja_segundo_piso
Contratante_Observaciones
Contratante_Hechos
Parte_Otros
Parte_Observaciones
Tipo_Inmueble1
Tipo_Inmueble2
sol_antecedentes_nomb
sol_antecedentes_val
latitud
longitud
habitantesFamilias
roboNombreDenunciante
roboRutDenunciante
roboNumeroConstancia
roboFechaConstancia
seguridadNombre
seguridadvalor
seguridadAlarmaNombre
seguridadAlarmaValor
seguridadProteccionesNombre
seguridadProteccionesValor
perimetrales_nomb
perimetrales_val
muros_interiores_nomb
muros_interiores_val
cubierta_tech_nomb
cubierta_tech_val
pav_interiores_nomb
pav_interiores_val
cielo_interiores_nomb
cielo_interiores_val
terminacion_int_nomb
terminacion_int_val
otras_inst_nomb
otras_inst_val
generalFechaSiniestro
entrevistadoNombre
entrevistadoRelacion
edificacionPisosEdificio
edificacionPisoDepto
edificacionHabitable
antecedentesRelacionHechos
antecedentesReporteAlarma
antecedentesDetalleRobados
antecedentesCotizacionRobados
antecedentesPresupuestoConstruccion
antecedetesDeclaracionJurada
otroSeguroExiste
otroSeguroCia
total_imagenes
total_documentos
asegurado_nombre
asegurado_email
asegurado_fono
asegurado_rut
asegurado_ciudad
asegurado_comuna
asegurado_aseguradora
inspector_nombre
inspector_email
inspector_fono
liquidador_nombre
liquidador_email
liquidador_fono

*/
/*
Contenido 
[
{
nombre
marca_modelo
cantidad
ano_fab
fecha_adquisicion
adjunta_Comprobante
}
]
*/
/*
Danos
[
{
nombre
siniestrado
descripcion
Materialidad
- materialidad_
}
]
*/
/*
Terceros
[
{
nombre
rut
direccion
Sectores []
Terceros [
nombre rut direccion Sectores Terceros
]
}
]
*/
/*
Habitantes
[
{
nombre rut edad
}
]
*/
