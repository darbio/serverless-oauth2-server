import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppBootstrapModule } from "./app-bootstrap.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppBootstrapModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
