# Charles Taylor App

## ⁠⁠Componentes Esenciales
### features
- auth
    - pages
        - access:
            Verifica el acceso de la aplicacion, si el usuario inicio sesion o ha
        - login
            Pagina de inicio de sesion
    - services
        - auth.srvice
            Servicios asociados al modulo de autenticacion
- dashboard
    - pages
        - advance (deprecated)
        - dashboard    
            Pagina principal o Home, en esta se verifica la conexion con el servidor y se obtiene las inspecciones, se sincroniza con la bsa
        - inspection
            Pagina de inspeccion, en ella se encuentra el formulario  de la inspeccion
        - inspections
            Pagina con la lista de inspecciones, en sus diferenes estados
            - widgets
                - affected-sectors
                - building-damage
                - building-type
                - content-damage
                - document-images
                - general-background
                - inspection-modules
                - insured-story
                - signatures
        - policies
            Pagina de polizas de la inspecccion
    - dialogs
        - delete-dialog
            Dialogo de eliminacion
        - login-dialog
            Dialogo para el login de vencimiento de token
        - material-dialog (deprecated)
        - signatures-dialog (deprecated)
    - services
        - dashboard.service
- onboard
    - page
        - onboard-page
        
    - services
        - onboard.service
- profile
    - pages
    - dialogs
    - services
### widgets
- confirm-dialog
- image-viewer
- incremental
- layout
- logo
- main
- page-layout
- photo-dialog


## ⁠Servicios
### helpers
- api
- calculator
- conection
- currency
- database
- date-validator
- pdf
- translation

## ⁠Directivas y Pipes
### directives
- phone-mask (deprecated)
- translation

## ⁠Estilos y Temas
- style.scss
- components.scss
- adjusts.scssa