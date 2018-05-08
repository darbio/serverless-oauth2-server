import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ForgotPasswordComponent } from "./app-components/forgot-password/forgot-password.component";
import { LoginComponent } from "./app-components/login/login.component";
import { RegisterComponent } from "./app-components/register/register.component";
import { IndexComponent } from "./app-components/index/index.component";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: RegisterComponent
  },
  {
    path: "forgotten",
    component: ForgotPasswordComponent
  },
  {
    path: "",
    component: IndexComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {}
