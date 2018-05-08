import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { AlertModule } from "ngx-bootstrap/alert";

import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { IndexComponent } from "./index/index.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

library.add(faGoogle, faCoffee);

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    IndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    AlertModule.forRoot()
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    IndexComponent
  ]
})
export class AppComponentsModule {}
