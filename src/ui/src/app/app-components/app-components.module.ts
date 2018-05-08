import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faGoogle, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { AlertModule } from "ngx-bootstrap/alert";

import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { IndexComponent } from "./index/index.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

library.add(faGoogle, faCoffee, faFacebookF);

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
    ReactiveFormsModule,
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
