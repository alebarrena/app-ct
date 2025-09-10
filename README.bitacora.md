# Ionic Bitacora


## Onboarding
ionic g page features/onboard/pages/onboard
ionic g service features/onboard/service/onboard

## Auth Pages
ionic g page features/auth/pages/login
ionic g page features/auth/pages/access
ionic g service features/auth/services/auth


## Dashboard Pages
ionic g page features/dashboard/pages/dashboard
ionic g page features/dashboard/pages/expenses
ionic g page features/dashboard/pages/inspections
ionic g page features/dashboard/pages/inspection
ionic g c features/dashboard/pages/inspection/widgets/inspection-modules
ionic g c features/dashboard/pages/inspection/widgets/general-background
ionic g c features/dashboard/pages/inspection/widgets/insured-story
ionic g c features/dashboard/pages/inspection/widgets/building-type
ionic g c features/dashboard/pages/inspection/widgets/affected-sectors
ionic g c features/dashboard/pages/inspection/widgets/content-damage
ionic g c features/dashboard/pages/inspection/widgets/building-damage
ionic g c features/dashboard/pages/inspection/widgets/document-images
ionic g c features/dashboard/pages/inspection/widgets/signatures
ionic g c features/dashboard/dialogs/signatures-dialog
ionic g c features/dashboard/dialogs/material-dialog
ionic g c features/dashboard/dialogs/login-dialog
ionic g c features/dashboard/dialogs/delete-dialog
ionic g c features/dashboard/dialogs/expense-dialog
ionic g page features/dashboard/pages/policies
ionic g page features/dashboard/pages/advance
ionic g service features/dashboard/services/dashboard


# Profile page
ionic g page features/profile/pages/profile
ionic g service features/profile/services/profile

## Helpers
ionic g class helpers/api/api
ionic g class helpers/api/requests/login-request
ionic g class helpers/api/responses/login-response
ionic g class helpers/pdf/pdf


ionic g service helpers/database/sqlite
ionic g service helpers/database/initialize-app
ionic g class helpers/database/upgrade-statements
ionic g class helpers/database/tables/inspections
ionic g class helpers/database/tables/tasks
ionic g service helpers/database/storage/storage
ionic g service helpers/database/dbname-version/dbname-version

ionic g service helpers/conection/conection

ionic g service helpers/translation/translation

ionic g class helpers/calculator/calculator

ionic g class helpers/date-validator/date-validator 

## Models
ionic g class models/user/user
ionic g class models/inspection/inspection
ionic g class models/profile/profile
ionic g class models/policy/policy


## Middleware
# ionic g guard guards/access

## Componentes
ionic g component widgets/main
ionic g component widgets/layout
ionic g component widgets/page-layout
ionic g component widgets/logo
ionic g component widgets/incremental
ionic g component widgets/image-viewer
ionic g component widgets/confirm-dialog
ionic g component widgets/photo-dialog

## Directivas
ionic generate directive directives/phone-mask/phone-mask
