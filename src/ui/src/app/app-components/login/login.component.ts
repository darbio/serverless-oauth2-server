import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import * as url from "url-join";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  alerts = [
    {
      type: "danger",
      msg: `Invalid username or password`,
      timeout: 5000
    }
  ];

  providers = [
    {
      id: "google",
      icon: "google",
      buttonText: "Sign in using Google"
    }
    // {
    //   id: "facebook",
    //   icon: "facebook-f",
    //   buttonText: "Sign in using Facebook"
    // }
  ];

  session: string;
  serverUrl = "http://localhost:3000/";

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.session = params["session"];
    });
  }

  private getUrlForProvider(provider: { id: string }) {
    return url(
      this.serverUrl,
      "providers",
      provider.id,
      `?session=${this.session}`
    );
  }

  login() {}
}
