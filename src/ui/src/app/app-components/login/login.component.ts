import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as url from "url-join";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";

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

  loginForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.session = params["session"];
    });

    this.createForm();
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      email_address: ["", [Validators.email, Validators.required]],
      password: ["", Validators.required]
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

  login() {
    if (this.loginForm.dirty && this.loginForm.valid) {
      alert("login");
    }
  }
}
